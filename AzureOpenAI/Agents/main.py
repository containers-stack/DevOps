import os
import streamlit as st
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import CodeInterpreterTool, BingGroundingTool
from azure.identity import DefaultAzureCredential
from pathlib import Path
import dotenv

# Load environment variables
dotenv.load_dotenv()

st.title("Azure OpenAI Agent Search")
query = st.text_input("Enter search query:")

if st.button("Search") and query:
    try:
        # Create client and get Bing connection
        project_client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(), conn_str=os.environ["PROJECT_CONNECTION_STRING"]
        )
        bing_connection = project_client.connections.get(
            connection_name=os.environ["BING_CONNECTION_NAME"]
        )
        conn_id = bing_connection.id
        # Initialize Bing tool
        bing = BingGroundingTool(connection_id=conn_id)
        
        # Create an agent (using Bing tool) with custom instructions
        search_agent = project_client.agents.create_agent(
            model="gpt-4o-2",
            name="search-agent",
            instructions="""You are a helpful assistant that can search for information about a stock market. you will be getting a stock symbol as input and you need
                            to provide the stock market information and the stock market price. for example, if the user asks for information about the stock market of
                            Apple Inc. you need to provide the stock market information and the stock market price of Apple Inc. and the graph of the stock market price for last 5 days""",
            tools=bing.definitions,
            headers={"x-ms-enable-preview": "true"}
        )
        print(f"Created agent, agent ID: {search_agent.id}")
        
        # Create a thread for the conversation
        thread = project_client.agents.create_thread()
        print(f"Created thread, thread ID: {thread.id}")
        
        # Create a message using the user's search query
        message = project_client.agents.create_message(
            thread_id=thread.id,
            role="user",
            content=query
        )
        print(f"Created message, ID: {message.id}")
        
        # Process the run with the created agent
        run = project_client.agents.create_and_process_run(thread_id=thread.id, assistant_id=search_agent.id)
        print(f"Run finished with status: {run.status}")
        
        # Retrieve run step details
        run_steps = project_client.agents.list_run_steps(run_id=run.id, thread_id=thread.id)
        print("Run steps details:", run_steps)
        
        if run.status == "failed":
            st.error(f"Run failed: {run.last_error}")
        
        # List all messages from the thread
        messages = project_client.agents.list_messages(thread_id=thread.id)
        st.write("Messages:", messages.text_messages[0].text.value)
        
        # Delete agent once done
        project_client.agents.delete_agent(search_agent.id)
        print("Deleted agent")

        # start code interpreter tool
        code_interpreter = CodeInterpreterTool()

        # The CodeInterpreterTool needs to be included in creation of the agent
        agent = project_client.agents.create_agent(
            model="gpt-4o-mini",
            name="my-agent",
            instructions="You are helpful agent",
            tools=code_interpreter.definitions,
            tool_resources=code_interpreter.resources,
        )
        print(f"Created agent, agent ID: {agent.id}")

            # Create a thread
        thread = project_client.agents.create_thread()
        print(f"Created thread, thread ID: {thread.id}")

        # Create a message
        message = project_client.agents.create_message(
            thread_id=thread.id,
            role="user",
            content=f"Could you please create a bar chart for the operating profit using the following data and provide the file to me? {messages.text_messages[0].text.value}"
        )
        print(f"Created message, message ID: {message.id}")

        # Run the agent
        run = project_client.agents.create_and_process_run(thread_id=thread.id, assistant_id=agent.id)
        print(f"Run finished with status: {run.status}")

        if run.status == "failed":
            # Check if you got "Rate limit is exceeded.", then you want to get more quota
            print(f"Run failed: {run.last_error}")

        # Get messages from the thread
        messages = project_client.agents.list_messages(thread_id=thread.id)
        print(f"Messages: {messages}")

        # Get the last message from the sender
        last_msg = messages.get_last_text_message_by_role("assistant")
        if last_msg:
            print(f"Last Message: {last_msg.text.value}")

        # Generate an image file for the bar chart
        for image_content in messages.image_contents:
            print(f"Image File ID: {image_content.image_file.file_id}")
            file_name = f"{image_content.image_file.file_id}_image_file.png"
            project_client.agents.save_file(file_id=image_content.image_file.file_id, file_name=file_name)
            print(f"Saved image file to: {Path.cwd() / file_name}")

        # Print the file path(s) from the messages
        for file_path_annotation in messages.file_path_annotations:
            print(f"File Paths:")
            print(f"Type: {file_path_annotation.type}")
            print(f"Text: {file_path_annotation.text}")
            print(f"File ID: {file_path_annotation.file_path.file_id}")
            print(f"Start Index: {file_path_annotation.start_index}")
            print(f"End Index: {file_path_annotation.end_index}")
            project_client.agents.save_file(file_id=file_path_annotation.file_path.file_id, file_name=Path(file_path_annotation.text).name)

        # Delete the agent once done
        project_client.agents.delete_agent(agent.id)
        print("Deleted agent")

        # add image to streamlit
        st.image("https://u.osu.edu/duska.7/files/2017/04/stock-market-3-21gyd1b-300x225.jpg")
        
    except Exception as e:
        st.error(str(e))