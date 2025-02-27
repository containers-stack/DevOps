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
            instructions="""You are a helpful assistant that can search for stock trading for a given company for last 5 years.""", 
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

        
    except Exception as e:
        st.error(str(e))