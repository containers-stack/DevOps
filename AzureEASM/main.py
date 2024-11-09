import requests
import json
import os

# Environment variables
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID")
AZURE_RESOURCE_GROUP = os.getenv("AZURE_RESOURCE_GROUP")
AZURE_WORKSPACE_NAME = os.getenv("AZURE_WORKSPACE_NAME")

def getAccessToken():
    """
    Obtain an access token from Azure AD using client credentials.
    
    Returns:
        str: Access token.
    """
    reqUrl = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token"
    headersList = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {
        "scope": "https://easm.defender.microsoft.com/.default",
        "grant_type": "client_credentials",
        "client_id": AZURE_CLIENT_ID,
        "client_secret": AZURE_CLIENT_SECRET
    }
    response = requests.request("POST", reqUrl, data=payload, headers=headersList)
    return response.json()["access_token"]

def getassets():
    """
    Fetch asset summary from Azure EASM.
    """
    access_token = getAccessToken()
    
    reqUrl = f"https://eastus.easm.defender.microsoft.com/subscriptions/{AZURE_SUBSCRIPTION_ID}/resourceGroups/{AZURE_RESOURCE_GROUP}/workspaces/{AZURE_WORKSPACE_NAME}/reports/assets:getSummary?api-version=2024-03-01-preview"

    headersList = {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json" 
    }

    payload = json.dumps({
        "metricCategories": [
            "priority_high_severity",
            "priority_medium_severity",
            "priority_low_severity"
        ],
        "orderBy": "createdAt desc"
    })

    response = requests.request("POST", reqUrl, data=payload, headers=headersList)

    print(response.text)

if __name__ == "__main__":
    getassets()