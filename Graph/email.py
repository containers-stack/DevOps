import requests
from msal import ConfidentialClientApplication

# Azure AD and Microsoft Graph API details
TENANT_ID = "<YOUR_TENANT_ID>"
CLIENT_ID = "<YOUR_CLIENT_ID>"
CLIENT_SECRET = "<YOUR_CLIENT_SECRET>"
GRAPH_API_ENDPOINT = "https://graph.microsoft.com/v1.0"
USER_ID = "<YOUR_USER_ID>"

# Authenticate with MSAL to get an access token
def get_access_token():
    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"Could not obtain access token: {result.get('error_description')}")

# Get emails from the specified folder
def get_emails_from_folder(access_token, user_id, folder_name="Inbox"):
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get the folder ID of the specified folder
    folder_response = requests.get(
        f"{GRAPH_API_ENDPOINT}/users/{user_id}/mailFolders",
        headers=headers,
    )
    folder_response.raise_for_status()
    folders = folder_response.json().get("value", [])
    
    # Find the folder ID for the specified folder name
    folder_id = next((folder["id"] for folder in folders if folder["displayName"].lower() == folder_name.lower()), None)
    if not folder_id:
        raise Exception(f"Folder '{folder_name}' not found.")
    
    # Get emails from the folder
    email_response = requests.get(
        f"{GRAPH_API_ENDPOINT}/users/{user_id}/mailFolders/{folder_id}/messages",
        headers=headers,
    )
    email_response.raise_for_status()
    return email_response.json().get("value", [])

if __name__ == "__main__":
    try:
        token = get_access_token()
        emails = get_emails_from_folder(token, USER_ID, "Inbox")
        for email in emails:
            print(f"Subject: {email.get('subject')}")
            print(f"From: {email.get('from', {}).get('emailAddress', {}).get('address')}")
            print(f"Received: {email.get('receivedDateTime')}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")
