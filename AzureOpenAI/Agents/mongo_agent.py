import os
import streamlit as st
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import CodeInterpreterTool, BingGroundingTool
from azure.identity import DefaultAzureCredential
from openai import AzureOpenAI  
from pathlib import Path
import dotenv
import pymongo

# Load environment variables
dotenv.load_dotenv()

endpoint = os.getenv("ENDPOINT_URL", "")  
deployment = os.getenv("DEPLOYMENT_NAME", "")  
subscription_key = os.getenv("AZURE_OPENAI_API_KEY", "")  

st.title("Azure OpenAI Mongo Agent Search")
query = st.text_input("Enter search query:")

# Create an instance of the CodeInterpreterTool
code_interpreter = CodeInterpreterTool()


CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
DB_NAME = os.getenv("DB_NAME")
client = pymongo.MongoClient(CONNECTION_STRING)
db = client[DB_NAME]
ms_invoice_collection = db["invoices"]

try:
    COLLECTION_SCHEMA = ms_invoice_collection.find_one()
except Exception as e:
    st.write("Error: ", e)


if st.button("Search") and query:
    try:
        st.spinner(text="In progress...")

        # Create client and get Bing connection
        project_client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(), conn_str=os.environ["PROJECT_CONNECTION_STRING"]
        )
        
        # The CodeInterpreterTool needs to be included in creation of the agent
        mongo_agent = project_client.agents.create_agent(
            model="gpt-4o-2",
            name="mongo-agent",
            instructions=f"""
            You are a helpful assistant that can convert a user's search query into a pymongo query
            to search for a document in the {ms_invoice_collection} collection.\n
            The collection schema is as follows:
            {COLLECTION_SCHEMA}\n
            The db connection string is: {CONNECTION_STRING}\n
            please create a main.py file with the relevant code to search for the document in the collection based on the user's search query. 
            Importent! do not include in your response any explanation or instruction like the one above, only the code.\n
            Also, add in the end of the code function to save the result in a ./result.json file\n
            """,
            tools=code_interpreter.definitions,
            tool_resources=code_interpreter.resources,
        )

        print(f"Created agent, agent ID: {mongo_agent.id}")
        
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
        mongo_run = project_client.agents.create_and_process_run(thread_id=thread.id, assistant_id=mongo_agent.id)
        print(f"Run finished with status: {mongo_run.status}")
        
        # Retrieve run step details
        run_steps = project_client.agents.list_run_steps(run_id=mongo_run.id, thread_id=thread.id)
        print("Run steps details:", run_steps)
        
        messages = project_client.agents.list_messages(thread_id=thread.id)
        print(f"Messages: {messages}")
        
        if mongo_run.status == "failed":
            st.error(f"Run failed: {mongo_run.last_error}")

        # Save the code to a file
        code = messages.text_messages[0].text.value
        code = code.replace("```python", "").replace("```", "")
        code_path = Path("main.py")
        code_path.write_text(code)

        file_path = code_path.resolve()

        # run the main.py file and wait for the result
        os.system(f"python3.10 {file_path._str}")
        
        # get the result from the result.json file
        with open("result.json", "r") as f:
            result = f.read()
        
        # Delete agent once done
        project_client.agents.delete_agent(mongo_agent.id)
        print("Deleted agent")

        endpoint = os.getenv("ENDPOINT_URL", "")  
        deployment = os.getenv("DEPLOYMENT_NAME", "")  
        subscription_key = os.getenv("AZURE_OPENAI_API_KEY", "REPLACE_WITH_YOUR_KEY_VALUE_HERE")  
        
        # delete the files
        os.remove("main.py")
        os.remove("result.json")

        print("Called Azure OpenAI API")

        client = AzureOpenAI(  
            azure_endpoint=endpoint,  
            api_key=subscription_key,  
            api_version="2024-05-01-preview",
        )

        print("Created AzureOpenAI client")
        #Prepare the chat prompt 
        chat_prompt = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Provide a user-friendly summary of the provided query and structured data, making the output concise yet easy to understand.\n\n# Steps:\n\n1. **Interpret User Query:** Parse the initial query provided by the user to understand what information they are seeking.\n2. **Process JSON Results:** Extract and summarize the key information from the structured JSON data relevant to the query.\n3. **Present Information:** Format the results in a clear, human-readable manner, avoiding technical jargon where unnecessary. Order the output logically (e.g., by customer name, highest consumption, or other relevant metrics).\n4. **Highlight Insights:** Include any relevant additional context or anomalies, such as customers not found in the database or marked as \"not to charge.\"\n\n# Output Format\n\nThe output should follow this format:\n\n1. **Query Interpretation:** A human-readable description of the user's query.\n2. **Data Summary:** A neatly formatted list summarizing key details for each customer.\n   - Customer Name\n   - Total Consumption (if applicable)\n   - Additional flags/comments when relevant (e.g., \"Not to charge\" or \"Customer not found\").\n3. **Insights/Notes:** Additional notes or contextual information (e.g., discrepancies, unusual patterns, data anomalies).\n\n## Markdown Format\n\nUse the following structure:\n\n---\n\n### Query:\n[Provide a plain-text interpretation of the user's query.]\n\n### Results:\n[Summarized and formatted results.]\n- **Customer Name:** [Name]\n  - **Consumption:** [Value, format]\n  - **Subscription ID:** [ID if relevant]\n  - **Additional Comments:** [Optional]\n\n(Repeat for other customers)\n\n### Notes:\n[Optional: Additional insights or edge case explanations.]\n\n# Example  \n\n## Query:\n\"Best Azure customers with the highest consumption for last month.\"\n\n## Results:\n- **Customer Name:** GAL-D  \n  - **Product Name:** Azure Plan  \n  - **Subscription ID:** 9909293c-352c-44cc-d3c6-8410f61c096d  \n  - **Additional Comments:** Azure subscription not found in the database.\n  \n- **Customer Name:** demo-moti100  \n  - **Product Name:** Azure Plan  \n  - **Subscription ID:** 701ef234-f74d-4293-cdb2-fad3299c9f6d  \n  - **Additional Comments:** Customer set as not to charge.\n\n- **Customer Name:** Peres Hospital Be’er Sheva  \n  - **Product Name:** Azure Plan  \n  - **Subscription ID:** 46b958af-dd7b-42c9-d491-4bfcc33cde91  \n  - **Additional Comments:** Customer set as not to charge.\n\n### Notes:  \nSome customers are flagged as \"not to charge\" or \"not found in the database,\" which may need further investigation."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"User query: {query}, result: {result}"
                    }
                ]
            }
        ] 

        with st.sidebar:
            st.json(result)


        print("Created chat prompt")
        completion = client.chat.completions.create(  
            model=deployment,
            messages=chat_prompt,
            max_tokens=800,  
            temperature=0.7,  
            top_p=0.95,  
            frequency_penalty=0,  
            presence_penalty=0,
            stop=None,  
            stream=False
        )

        completion_result = completion.choices[0].message.content

        st.write(completion_result)



        
    except Exception as e:
        st.error(str(e))