FastAPI Application with Azure Monitor Integration
# FastAPI Application with Azure Monitor Integration

This FastAPI application demonstrates logging and telemetry integration with Azure Monitor using OpenTelemetry.

## Features
- Logs different levels of messages (info, warning, error).
- Sends metrics to Azure Monitor.
- Handles exceptions and logs them.

## Requirements
- Python 3.7+
- FastAPI
- Uvicorn
- python-dotenv
- requests
- opentelemetry-api
- opentelemetry-sdk
- azure-monitor-opentelemetry

## Setup
1. Clone the repository:
    ```
    git clone <repository-url>
    ```

2. Create and activate a virtual environment:
    ```
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install the dependencies:
    ```
    pip install -r requirements.txt
    ```

4. Create a `.env` file and add your environment variables.

## Running the Application
1. Start the FastAPI application:
    ```
    uvicorn main:app --reload
    ```

2. Access the API:
    Open your browser and navigate to [http://localhost:8000](http://localhost:8000).

## API Endpoints
- GET /log-info: Logs an info message.
- GET /log-warning: Logs a warning message.
- GET /log-error: Logs an error message and handles a division by zero exception.
- GET /send-metrics: Sends metrics to Azure Monitor and handles a division by zero exception.

## Logging and Telemetry
- Azure Monitor: Configured to capture logging telemetry.
- OpenTelemetry: Used for tracing and metrics.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.