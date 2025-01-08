import streamlit as st
from msal import ConfidentialClientApplication


CLIENT_SECRET = "<YOUR_CLIENT_SECRET>"
CLIENT_ID = "<YOUR_CLIENT_ID>"

AUTHORITY = "https://<REPLACE_WITH_YOUR_DOMAIN>.ciamlogin.com/<REPLACE_WITH_YOUR_DOMAIN>.onmicrosoft.com"

REDIRECT_URI = "http://localhost:8501"
SCOPE = []

# Initialize the MSAL confidential client
app = ConfidentialClientApplication(
    CLIENT_ID,
    authority=AUTHORITY,
    client_credential=CLIENT_SECRET
)

# Function to get the sign-in URL
def get_sign_in_url():
    return app.get_authorization_request_url(SCOPE, redirect_uri=REDIRECT_URI, response_type="id_token", prompt="login", nonce="byWrkFpPFs")

# Function to acquire a token using the authorization code
def acquire_token_by_authorization_code(auth_code):
    result = app.acquire_token_by_authorization_code(auth_code, scopes=SCOPE, redirect_uri=REDIRECT_URI)
    print("result", result)
    return result

# Streamlit app
st.title("Azure Entra ID Sign-In")

# Display sign-in link
sign_in_url = get_sign_in_url()
if st.button("Sign in to Azure"):
    st.write(f"[Click here to sign in]({sign_in_url})")

# Handle the redirect with the authorization code
auth_code = st.query_params.get("code")
if auth_code:
    token_response = acquire_token_by_authorization_code(auth_code[0])
    if "access_token" in token_response:
        st.success("Signed in successfully!")
        st.write(token_response)
    else:
        st.error("Failed to sign in.")

