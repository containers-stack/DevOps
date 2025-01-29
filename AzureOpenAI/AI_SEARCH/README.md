# Azure Function - Call Center Topic Extraction

## Overview
This Azure Function processes call center conversation transcripts stored as blobs, extracts key topics using Azure OpenAI, and stores the results in MongoDB for further analysis.

## Features
- **Blob Storage Trigger:** Automatically processes new transcripts from Azure Blob Storage.
- **Azure OpenAI Integration:** Uses GPT-based analysis to extract key topics from conversations.
- **MongoDB Storage:** Saves extracted topics along with metadata for further insights.

## Prerequisites
Before deploying the function, ensure you have:
- An **Azure Subscription**
- An **Azure Functions App** configured
- **Azure Blob Storage** with the required container
- **Azure OpenAI Service** with an available model deployment
- **MongoDB Database** for storing extracted topics

## Environment Variables
Configure the following environment variables in your Azure Function:

| Variable Name          | Description                                      | Example Value |
|------------------------|--------------------------------------------------|--------------|
| `ENDPOINT_URL`        | Azure OpenAI endpoint URL                        | `https://your-openai-endpoint.openai.azure.com/` |
| `DEPLOYMENT_NAME`     | OpenAI model deployment name                     | `gpt-4o-mini` |
| `AZURE_OPENAI_API_KEY`| API key for Azure OpenAI                         | `your-api-key` |
| `MONGO_URI`           | MongoDB connection string                        | `mongodb://localhost:27017/` |

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/call-center-topic-extraction.git
   cd call-center-topic-extraction
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Set up your environment variables as described above.
4. Deploy the function to Azure:
   ```sh
   func azure functionapp publish <YOUR_FUNCTION_APP_NAME>
   ```

## Function Logic
1. **Trigger:** The function is triggered by new blobs uploaded to the `calls` container.
2. **Processing:**
   - Reads the conversation transcript from the blob.
   - Sends the transcript to Azure OpenAI for topic extraction.
   - Parses and refines the extracted topics.
3. **Storage:**
   - Saves the topics along with call metadata in MongoDB.

## Example Input & Output
### Example Conversation (Input):
```
Agent: Hello, how can I assist you today?
Customer: I can’t log into my business account. I keep getting a "Password incorrect" error.
Agent: Let’s reset your password. You will receive a reset link via email.
Customer: Okay, I got the email and reset my password, but I still can't log in.
Agent: Try again in a few minutes. If the issue persists, open a ticket with our technical team.
```

### Extracted Topics (Output JSON):
```json
{
  "topics": [
    "Login issues",
    "Password reset not working",
    "Technical support escalation"
  ],
  "call_id": "123456",
  "call_date": "22/12/2024",
  "call_time": "19:24:40",
  "call_duration": "60"
}
```

## Error Handling
- **MongoDB Errors:** Logs database connection failures and document insert failures.
- **Azure OpenAI Errors:** Logs issues related to API requests and responses.
- **Blob Processing Errors:** Logs invalid or unreadable blobs.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, reach out to [your-email@example.com](mailto:your-email@example.com).