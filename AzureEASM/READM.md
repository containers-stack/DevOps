# Azure EASM Asset Summary Fetcher

This script fetches an asset summary from Azure External Attack Surface Management (EASM) using Azure AD client credentials for authentication.

## Prerequisites

- Python 3.x
- `requests` library
- `json` library
- Environment variables set for Azure credentials and resource details

## Environment Variables

Ensure the following environment variables are set:

- `AZURE_CLIENT_ID`: Your Azure AD application client ID
- `AZURE_CLIENT_SECRET`: Your Azure AD application client secret
- `AZURE_TENANT_ID`: Your Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
- `AZURE_RESOURCE_GROUP`: Your Azure resource group name
- `AZURE_WORKSPACE_NAME`: Your Azure workspace name

## Installation

1. Clone the repository or download the script.
2. Install the required Python libraries:
    ```sh
    pip install requests
    ```

## Usage

Run the script to fetch the asset summary:

```sh
python main.py