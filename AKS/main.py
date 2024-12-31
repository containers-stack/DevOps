import os
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential
from time import sleep

def main():
    keyvault_url = os.getenv('KEYVAULT_URL', 'https://kv-azureaii290368682131.vault.azure.net/')
    secret_name = os.getenv('SECRET_NAME', 'demo')

    client = SecretClient(vault_url=keyvault_url, credential=DefaultAzureCredential())
    secret = client.get_secret(secret_name)

    print(f"Secret: {secret.name} = {secret.value}")

if __name__ == '__main__':
    while True:
        try:
            main()
            print("Sleeping for 5 seconds...")
            sleep(5)
        except Exception as e:
            print(f"Error: {e}")