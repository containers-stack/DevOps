# Azure OpenAI Mongo Agent Search

This application uses Azure OpenAI and MongoDB to perform searches on a MongoDB collection based on a user's input query. It integrates with Azure AI Project Client to generate a MongoDB query and execute it on the selected collection, returning the results in a structured format.

## Requirements

- Python 3.10 or higher
- Streamlit
- Azure AI SDK
- OpenAI SDK for Azure
- MongoDB
- dotenv for loading environment variables

## Setup

1. Install the necessary dependencies:

    ```bash
    pip install streamlit azure-ai-projects openai pymongo dotenv
    ```

2. Create a `.env` file in the root directory with the following environment variables:

    ```
    ENDPOINT_URL=your_azure_openai_endpoint
    DEPLOYMENT_NAME=your_azure_deployment_name
    AZURE_OPENAI_API_KEY=your_azure_openai_api_key
    MONGO_CONNECTION_STRING=your_mongo_connection_string
    DB_NAME=your_database_name
    PROJECT_CONNECTION_STRING=your_project_connection_string
    ```

## Usage

1. Run the Streamlit application:

    ```bash
    streamlit run app.py
    ```

2. The app will prompt you to enter a search query. The application will:
    - Use Azure OpenAI to generate Python code for querying the MongoDB collection based on the provided query.
    - Execute the generated Python code and save the result in a `result.json` file.
    - Provide a summary of the results.

3. The app also uses Azure OpenAI to interpret the query and generate a user-friendly summary of the results.

## Functionality

- **MongoDB Search**: Converts the user’s search query into a MongoDB query and retrieves matching documents from a MongoDB collection.
- **Generated Python Code**: Saves the generated Python code into a `main.py` file, executes it, and saves the results in a `result.json` file.
- **Results Interpretation**: Uses Azure OpenAI to create a user-friendly summary of the query and result data.
- **Agent Management**: Uses Azure AI Project Client to create and delete agents and process the query through Azure OpenAI.

## Example

Given the query:

    "Best Azure customers with the highest consumption for last month."

The output will be a structured summary of the results, including customer names, subscription IDs, and additional flags or comments.

## Error Handling

If any errors occur during the search, generation, or processing stages, the application will display the error message.

## Files Created

- `main.py`: The Python code generated for searching the MongoDB collection.
- `result.json`: The file where the search result is saved.
  
These files are deleted after the process is completed.

## Notes

- Ensure that all environment variables are correctly set in the `.env` file before running the application.
- The `main.py` file is automatically generated and executed, and results are saved in the `result.json` file for further processing.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
