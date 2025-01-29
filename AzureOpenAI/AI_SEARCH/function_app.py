import azure.functions as func
import logging
import os
from openai import AzureOpenAI  
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Load environment variables
endpoint = os.getenv("ENDPOINT_URL", "<YOUR_AZURE_OPENAI_ENDPOINT_URL>")
deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")
subscription_key = os.getenv("AZURE_OPENAI_API_KEY", "<YOUR_AZURE_OPENAI_API_KEY>")
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

# Initialize Azure OpenAI Service client with key-based authentication    
client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=subscription_key,
    api_version="2024-05-01-preview",
)

# Initialize MongoDB client
mongo_client = MongoClient(mongo_uri)
db = mongo_client["partner-poc"]
collection = db["insights"]

app = func.FunctionApp()

@app.blob_trigger(arg_name="myblob", path="calls",
                  connection="pocpartnercalls_STORAGE")
def blob_trigger(myblob: func.InputStream):
    logging.info(f"Python blob trigger function processed blob"
                 f"Name: {myblob.name}"
                 f"Blob Size: {myblob.length} bytes")

    SYSTEM_PROMPT = """
        Analyze the given call center conversation and extract the main topics discussed.
        - Focus on identifying the key topics or subjects mentioned in the conversation.
          A topic corresponds to a distinct subject of discussion or concern raised during the interaction.  
        - Do not interpret emotional tone, intent, or irrelevant information unless directly related to the topic.
        - Provide the result in a concise, high-level manner, avoiding overly detailed or fragmented topics
          (e.g., "payment issue" instead of "credit card declined on June 5th, 2022").

        # Steps
        1. Read and analyze the entire conversation, identifying major themes or subjects of discussion.
        2. Deduplicate similar topics (if they are phrased differently but refer to the same subject).
        3. Include only high-level topics relevant to the primary discussions in the conversation.

        # Output Format
        A JSON array of strings. Each string represents a distinct topic discussed.

        # Example
        **Input (Transcript):**
        תמלול דמי (סוכן לא שירותי):
            סוכן: כן, איך אני יכול לעזור לך?

            לקוח: שלום, אני לא מצליח להיכנס לחשבון העסקי שלי. המערכת מציגה הודעת שגיאה "סיסמה לא תקינה".

            סוכן: טוב, תן לי את שם המשתמש שלך.

            לקוח: כן, זה john.doe@example.com.

            סוכן: [הסוכן בודק במערכת] יש לך חשבון פעיל. אולי הסיסמה שלך לא נכונה. אתה בטוח שנכנסת עם הסיסמה הנכונה?

            לקוח: כן, אני בטוח! ניסיתי כבר כמה פעמים וזה לא עובד.

            סוכן: טוב, מה לעשות. תנסה לאפס סיסמה. תקבל מייל, תלחץ על הקישור שם.

            לקוח: אוקי, קיבלתי את המייל. אני לוחץ על הקישור ומאפס את הסיסמה. אני מקווה שזה יפתור את הבעיה.

            סוכן: אם זה לא עובד, אז באמת אין לי הרבה מה לעשות. תנסה שוב. זה לא מסובך.

            לקוח: אני נכנס עכשיו עם הסיסמה החדשה... עדיין לא עובד! אני מקבל שוב את הודעת השגיאה "סיסמה לא תקינה".

            סוכן: תראה, אין לי זמן לבזבז. תנסה להיכנס אחרי כמה דקות. אם זה עדיין לא עובד, תשלח טיקט לצוות הטכני.

            לקוח: לא יכול להיות שזה פשוט ככה! למה אני לא יכול להיכנס עכשיו?

            סוכן: מה אתה רוצה שאני אעשה? אני לא מתכנת. רק עוקב אחרי ההוראות. תמתין קצת ותראה אם זה מתעדכן.

            לקוח: אני לא יכול לחכות! יש לי עבודה דחופה. זה פשוט לא בסדר.

            סוכן: תשמע, זה לא תלוי בי. תדבר עם הצוות הטכני אם זה כל כך חשוב לך.

            לקוח: זה לא יכול להיות! לא יכול להיות שאין פתרון מיידי!

            סוכן: לא יודע מה להגיד לך. אני לא יכול לפתור את הבעיה שלך. אתה יכול לשלוח טיקט לצוות טכני אם זה כל כך דחוף לך. אני לא יכול לעזור יותר מזה.

            לקוח: זה פשוט מעצבן. אני לא מרוצה מהשירות.

            סוכן: זה מה יש. ביי.

        **Output (Topics) in Hebrew:**
        [
        "Login issues",
        "Password reset email not received",
        "Payment processing issue"
        ]
        """

    try:
        blobal_content = myblob.read().decode('utf-8')

        chat_prompt = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": blobal_content
            }
        ]

        completion = client.chat.completions.create(
            model=deployment,
            messages=chat_prompt,
            max_tokens=1000,
            temperature=0.1,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
            stream=False
        )

        topics = completion.choices[0].message.content
        logging.info(f"The key topics discussed in the conversation are: {topics}")

        call_topics = {
            "topics": topics,
            "call_id": "123456",
            "call_date": "22/12/2024",
            "call_time": "19:24:40",
            "call_duration": "60"
        }

        # Save to MongoDB
        collection.insert_one(call_topics)
        logging.info("Call topics successfully saved to MongoDB.")


        ### CAll azure openai with ai search 
        completion = client.chat.completions.create(  
        model=deployment,  
        messages=[
        {
            "role": "user",
            "content": "מה הייתה הבעיה של הלקוח ?"
        },
        {
            "role": "assistant",
            "content": "הבעיה של הלקוח הייתה שהוא לא הצליח להיכנס לחשבון העסקי שלו, והמערכת הציגה לו הודעת שגיאה של \"סיסמה"
        }
    ],  
        past_messages=10,
        max_tokens=800,  
        temperature=0.7,  
        top_p=0.95,  
        frequency_penalty=0,  
        presence_penalty=0,  
        stop=None,  
        extra_body={  
            "data_sources": [  
                {  
                    "type": "azure_search",  
                    "parameters": {  
                        "endpoint": os.environ["AZURE_AI_SEARCH_ENDPOINT"],  
                        "index_name": os.environ["AZURE_AI_SEARCH_INDEX"],  
                        "authentication": {  
                            "type": "system_assigned_managed_identity"  
                        }  
                    }  
                }  
            ]  
        }  
    )

    except PyMongoError as e:
        logging.error(f"MongoDB error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")





