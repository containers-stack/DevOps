import streamlit as st
import json
import os
from functools import wraps
from dotenv import load_dotenv
import uuid
from datetime import datetime
from azure.data.tables import TableServiceClient, TableEntity
import streamlit.components.v1 as components
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from openai import AzureOpenAI
from azure.ai.projects.models import BingGroundingTool

# Load environment variables from .env file
load_dotenv()

# Load user credentials from JSON file
def load_users():
    with open('users.json') as f:
        data = json.load(f)
    return data['USERS']

users = load_users()

st.set_page_config(
    page_title="AI4Content",
    page_icon="📝",
    layout="wide",
)
# Basic authentication
def check_password():
    def password_auth():
        st.sidebar.title("Authentication")
        username = st.sidebar.text_input("Username")
        password = st.sidebar.text_input("Password", type="password")
        if st.sidebar.button("Login"):
            for user in users:
                if username == user['username'] and password == user['password']:
                    st.session_state['authenticated'] = True
                    st.session_state['username'] = username
                    st.rerun()
            st.sidebar.error("Incorrect username or password")
            return False

    if 'authenticated' not in st.session_state:
        st.session_state['authenticated'] = False

    if not st.session_state['authenticated']:
        password_auth()
        return False
    else:
        return True

def require_auth(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if check_password():
            return func(*args, **kwargs)
        else:
            st.stop()
    return wrapper

def generate_post(topic, description, language):
    project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=os.getenv("PROJECT_CONNECTION_STRING"))

    bing_connection = project_client.connections.get(
    connection_name="motibinglab"
    )
    
    conn_id = bing_connection.id

    # Initialize agent bing tool and add the connection id
    bing = BingGroundingTool(connection_id=conn_id)

    instructions=""""
                Generate a professional LinkedIn post in <REPLACE_LANGUGE> based on the latest news about a user-specified topic
                You will get the latest news about the topic from Bing Search and generate a professional LinkedIn post in <REPLACE_LANGUGE> based on the news.
                
                # Examples

                ### Input:  
                - **Topic**: GitHub Advanced Security
                - **Audience**: professionals and tech experts  
                - **Tone**: professional  
                - **Language**: Hebrew
                                
                🚀 עדכון מ-GitHub: שינויים ב-GitHub Advanced Security

                🔒 החל מה-1 באפריל 2025, GitHub מפרידה את Advanced Security לשני מוצרים נפרדים, כדי להציע פתרונות ממוקדים יותר:

                🔹 GitHub Secret Protection – סריקה לזיהוי ומניעת דליפות סודיות בזמן אמת.
                🔹 GitHub Code Security – איתור ותיקון פגיעויות בקוד לפני שלב הייצור.

                🔍 מה זה כולל?
                הגנה מפני דליפות סודיות – זיהוי ומניעה לפני שהן הופכות לבעיה.
                סריקות מבוססות AI – איתור אוטומטי עם מינימום אזעקות שווא.
                התראות בזמן אמת – אפשרות להגיב מהר לכל חשיפה.
                Copilot Autofix – תיקונים אוטומטיים לקוד ולבקשות שילוב.
                💰 תמחור וגמישות בתשלום:

                GitHub Secret Protection – 19$ לחודש למשתמש פעיל.
                GitHub Code Security – 30$ לחודש למשתמש פעיל.
                ניתן גם לרכוש דרך מודל חיוב מבוסס צריכה.
                🔧 מה זה אומר עבורכם?
                אם אתם משתמשים ב-GitHub Advanced Security, השינוי הזה יאפשר לכם לבחור בדיוק את ההגנות שאתם צריכים.

                מה דעתכם על המהלך הזה? שתפו אותנו! 👇

                #GitHubAdvancedSecurity #CyberSecurity #GitHub #CodeSecurity #SecretProtection #DevOps                
                # Notes
                    - Hook Them in the First Line
                    Start with a bold statement, question, or surprising fact to grab attention. People scroll fast—make them stop!

                    - Keep It Short & Structured
                    Use short paragraphs, bullet points, or emojis (sparingly) to make your post easy to skim. Avoid big blocks of text.

                    - Add Value, Not Just Noise
                    Share insights, lessons, or actionable tips. Personal stories work well, but tie them to a professional takeaway.

                    - Encourage Engagement
                    End with a question or call to action (e.g., “Have you faced this challenge?”). Comments and shares boost visibility.

                    - Use a Natural, Authentic Tone
                    Write like you talk—don’t sound robotic. Professional doesn’t mean boring. If it feels forced, people will scroll past.
            """.replace("<REPLACE_LANGUGE>", language)
    
    print(f"Instructions: {instructions}")
    # Create agent with the bing tool and process assistant run
    with project_client:
        agent = project_client.agents.create_agent(
            model="gpt-4",
            name="bing-agent",
            instructions=instructions,
            tools=bing.definitions,
            headers={"x-ms-enable-preview": "true"}
        )

        # Create thread for communication
        thread = project_client.agents.create_thread()
        print(f"Created thread, ID: {thread.id}")

        # Create message to thread
        message = project_client.agents.create_message(
            thread_id=thread.id,
            role="user",
            content=description
        )
        
        # Create and process agent run in thread with tools
        run = project_client.agents.create_and_process_run(thread_id=thread.id, assistant_id=agent.id)
        print(f"Run finished with status: {run.status}")

        # Retrieve run step details to get Bing Search query link
        # To render the webpage, we recommend you replace the endpoint of Bing search query URLs with `www.bing.com` and your Bing search query URL would look like "https://www.bing.com/search?q={search query}"
        run_steps = project_client.agents.list_run_steps(run_id=run.id, thread_id=thread.id)
        run_steps_data = run_steps['data']
        print(f"Last run step detail: {run_steps_data}")

        if run.status == "failed":
            print(f"Run failed: {run.last_error}")

        # Delete the assistant when done
        project_client.agents.delete_agent(agent.id)
        print("Deleted agent")

        # Fetch and log all messages
        messages = project_client.agents.list_messages(thread_id=thread.id)
        print(f"Messages: {messages}")

        # create a table service client
        table_service = TableServiceClient.from_connection_string(os.getenv("AZURE_STORAGE_CONNECTION_STRING"))
        table_client = table_service.get_table_client("ai4posts")

        # create a unique row key
        row_key = str(uuid.uuid4())

        # create a table entity
        entity = {
            "PartitionKey": str(uuid.uuid4()),
            "RowKey": row_key,
            "Username": st.session_state['username'],
            "Topic": topic,
            "Description": description,
            "CreatedAt": datetime.now().isoformat(),
            "Content": messages.data[0].content[0].text.value,
            "Language": language
        }

        # upload the entity to the table
        table_client.create_entity(entity)

        return

def save_content(data):
    try:
        # Get Azure Storage connection string from environment variable
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string:
            st.error("Azure Storage connection string not found in environment variables.")
            return
        
        # Create a TableServiceClient
        table_service = TableServiceClient.from_connection_string(connection_string)
        table_client = table_service.get_table_client("ai4content")
        
        # Get a reference to the table (create if not exists)
        table_name = "ai4content"
        table_client = table_service.get_table_client(table_name)
        
        try:
            table_client.create_table()
        except:
            # Table might already exist
            pass
        
        current_time = datetime.now().isoformat()
        
        # Create a table entity
        entity = {
            'PartitionKey': str(uuid.uuid4()),
            'RowKey': str(uuid.uuid4()),
            'Username': st.session_state['username'],
            'Name': data['Name'],
            'Description': data['Description'],
            'CreatedAt': current_time,
            'Audiance': data['Audiance'],
            'Creative': data['Creative'],
            'Language': data['Language'],
            'Type': data['Type']

        }
        
        # Upload the entity to the table
        table_client.create_entity(entity)
        
        # Show success message
        st.success("Content saved successfully to Azure Table!")
    except Exception as e:
        st.error(f"Error saving to Azure: {str(e)}")

def get_all_posts():
    try:
        # Get Azure Storage connection string from environment variable
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string:
            st.error("Azure Storage connection string not found in environment variables.")
            return []
        
        # Create a TableServiceClient
        table_service = TableServiceClient.from_connection_string(connection_string)
        
        # Get a reference to the table (create if not exists)
        table_name = "ai4posts"
        table_client = table_service.get_table_client(table_name)
        
        try:
            table_client.create_table()
        except:
            # Table might already exist
            pass
        
        # Query all entities
        entities = table_client.list_entities()

        # filter by username
        entities = [entity for entity in entities if entity['Username'] == st.session_state['username']]
        
        # Convert entities to a list of dictionaries
        content_list = [entity for entity in entities]
        
        # Sort by CreatedAt in descending order
        content_list.sort(key=lambda x: x['CreatedAt'], reverse=True)
        
        return content_list
    except Exception as e:
        st.error(f"Error retrieving content from Azure: {str(e)}")
        return []

def get_all_content():
    try:
        # Get Azure Storage connection string from environment variable
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string:
            st.error("Azure Storage connection string not found in environment variables.")
            return []
        
        # Create a TableServiceClient
        table_service = TableServiceClient.from_connection_string(connection_string)
        
        # Get a reference to the table (create if not exists)
        table_name = "ai4content"
        table_client = table_service.get_table_client(table_name)
        
        try:
            table_client.create_table()
        except:
            # Table might already exist
            pass
        
        # Query all entities
        entities = table_client.list_entities()

        # filter by username
        entities = [entity for entity in entities if entity['Username'] == st.session_state['username']]
        
        # Convert entities to a list of dictionaries
        content_list = [entity for entity in entities]
        
        # Sort by CreatedAt in descending order
        content_list.sort(key=lambda x: x['CreatedAt'], reverse=True)
        
        return content_list
    except Exception as e:
        st.error(f"Error retrieving content from Azure: {str(e)}")
        return []

def delete_content(tablename, partition_key, row_key):
    try:
        # Get Azure Storage connection string from environment variable
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        if not connection_string:
            st.error("Azure Storage connection string not found in environment variables.")
            return
        
        # Create a TableServiceClient
        table_service = TableServiceClient.from_connection_string(connection_string)
        
        # Get a reference to the table
        table_client = table_service.get_table_client(tablename)
        
        # Delete the entity
        table_client.delete_entity(partition_key=partition_key, row_key=row_key)
        
        # Show success message
        st.success("Content deleted successfully from Azure Table!")
    except Exception as e:
        st.error(f"Error deleting content from Azure: {str(e)}")

@require_auth
def main():
    # Navigation sidebar
    st.sidebar.title("AI4Content - Content Generator")
    st.sidebar.write(f"👋 Welcome {st.session_state['username']} to AI4Content, a content generator tool powered by Azure AI. Use the tool to generate professional content for your blog posts, social media, emails, newsletters, and press releases.")
    page = st.sidebar.radio("Go to", ["Post","Content Builder"])
    st.sidebar.write("Connected as: " + st.session_state['username'])
    # Display the selected page
    if page == "Post":
        st.header("Post")

        entities = get_all_posts()

        # convert entities to a list of dictionaries
        posts_list = [entity for entity in entities if entity['Username'] == st.session_state['username']]

        # sort by CreatedAt in descending order
        posts_list.sort(key=lambda x: x['CreatedAt'], reverse=True)
        content_list = get_all_content()
        if st.button("Generate Posts"): 
            with st.spinner("Generating posts...", show_time=True):
                if content_list:
                    for content in content_list:
                        generate_post(content['Name'], content['Description'], content['Language'])
                    else:
                        st.write("No content found.")

        if posts_list:
            # Group posts by date
            grouped_posts = {}
            for post in posts_list:
                date = datetime.fromisoformat(post['CreatedAt']).strftime('%Y-%m-%d')
                if date not in grouped_posts:
                    grouped_posts[date] = []
                grouped_posts[date].append(post)

            # Display posts grouped by date
            for date, posts in grouped_posts.items():
                with st.expander(f"Posts from {date}"):
                    for post in posts:
                        if post['Language'] == "Hebrew":
                            st.write("---")
                            st.write(f"<div style='text-align: right; direction: rtl;'><b>נושא:</b> {post['Topic']}</div>", unsafe_allow_html=True)
                            st.write(f"<div style='text-align: right; direction: rtl;'><b>תיאור:</b> {post['Description']}</div>", unsafe_allow_html=True)
                            st.write(f"<div style='text-align: right; direction: rtl;'><b>נוצר בתאריך:</b> {datetime.fromisoformat(post['CreatedAt']).strftime('%Y-%m-%d %H:%M')}</div>", unsafe_allow_html=True)
                            
                            # Display the post content as markdown
                            st.markdown(f"<div style='text-align: right; direction: rtl;'>{post['Content']}</div>", unsafe_allow_html=True)
                            if st.button(f"Delete ({post['Topic']}-{post['PartitionKey']})"):
                                delete_content("ai4posts", post['PartitionKey'], post['RowKey'])
                                st.rerun()

                            st.write("---")
                        else:
                            st.write("---")
                            st.write(f"**Topic**: {post['Topic']}")
                            st.write(f"**Description**: {post['Description']}")
                            st.write(f"**Created At**: {datetime.fromisoformat(post['CreatedAt']).strftime('%Y-%m-%d %H:%M')}")
                            
                            # Display the post content as markdown
                            st.markdown(post['Content'])
                            if st.button(f"Delete ({post['Topic']}-{post['PartitionKey']})"):
                                delete_content("ai4posts", post['PartitionKey'], post['RowKey'])
                                st.rerun()

                            st.write("---")
        else:
            st.write("No posts found.")
   
    elif page == "Content Builder":
        st.header("Content Builder")
    
        with st.form(key='content_form'):
            name = st.text_input("Name", placeholder="Enter name of topic, for example: Azure AI, GitHub Copilot, Azure ARC, Fabric, etc.")
            audiance_option = st.selectbox(
                "Select a the content Audiance",
                ("Technical", "Marketing", "Sales")
            )
            creative_option = st.selectbox(
                "Select a the content Creative",
                ("Professional", "Casual", "Formal", "Funny")
            )

            language_option = st.selectbox(
                "Select a the content Language",
                ("English", "Hebrew")
            )

            content_type_option = st.selectbox(
                "Select a the content Type",
                ("LinkedIn Post","Newsletter")
            )

            col1, col2 = st.columns(2, gap="small")
            with col1:
                submit_button = st.form_submit_button(label='Save', type="primary")

            if submit_button:
                if name and audiance_option and creative_option:
                    content_data = {
                        "Name": name,
                        "Language": language_option,
                        "Type": content_type_option,
                        "Audiance": audiance_option,
                        "Creative": creative_option,
                        "Description": f"Content for {name} with Audiance: {audiance_option} and Creative: {creative_option}"
                        
                    }
                    save_content(content_data)
                    st.rerun()
                else:
                    st.error("Name and Description cannot be empty.")
        st.write("---")
        # Display all content in a table with delete option
        content_list = get_all_content()
        if content_list:
            for content in content_list:
                st.write(f"**Name**: {content['Name']}")
                st.write(f"**Description**: {content['Description']}")
                st.write(f"**Created At**: {datetime.fromisoformat(content['CreatedAt']).strftime('%Y-%m-%d %H:%M')}")
                st.write(f"**Audiance**: {content['Audiance']}")
                st.write(f"**Creative**: {content['Creative']}")
                st.write(f"**Language**: {content['Language']}")
                st.write(f"**Type**: {content['Type']}")
                if st.button(f"Delete {content['Name']}-{content['PartitionKey']}"):
                    delete_content("ai4content", content['PartitionKey'], content['RowKey'])
                    st.rerun()
                st.write("---")
        else:
            st.write("No content found.")

if __name__ == "__main__":
    main()