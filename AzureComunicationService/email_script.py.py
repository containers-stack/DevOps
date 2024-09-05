from azure.communication.email import EmailClient
def main():
    try:
        connection_string = "<AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING>"
        client = EmailClient.from_connection_string(connection_string)

        message = {
            "senderAddress": "moti@u-btech.com",
            "recipients":  {
                "to": [
                    {
                        "address": "moti@u-btech.com"
                    }
                    ],
            },
            "content": {
                "subject": "Test Email",
                "plainText": "Hello world via email.",
            }
        }

        poller = client.begin_send(message)
        result = poller.result()

    except Exception as ex:
        print(ex)
main()
