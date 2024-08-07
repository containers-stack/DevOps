from dotenv import load_dotenv
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace
from fastapi import FastAPI
import uvicorn
from logging import INFO, getLogger
from opentelemetry.sdk.resources import Resource
import logging
import requests
import time


# Load environment variables from the .env file
load_dotenv()

# Configure Azure Monitor
configure_azure_monitor(
    # Set logger_name to the name of the logger you want to capture logging telemetry with
    logger_name="users-service-logger",
    resource=Resource.create({
        "service.name": "live_metrics_service",
        "service.instance.id": "qp_instance_id",
    }),
    enable_live_metrics=True,
)

# Logging calls with this logger will be tracked
logger = getLogger("users-service-logger")
logger.setLevel(INFO)

tracer = trace.get_tracer(__name__)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/log-info")
def info():
    logger.info("info log")
    return {"message": "This is an info log"}

@app.get("/log-warning")
def warning():
    logger.warning("warning log")
    return {"message": "This is a warning log"}

@app.get("/log-error")
def error():
    logger.error("error log")
    try:
        val = 1 / 0
        print(val)
    except ZeroDivisionError:
        logger.exception("Error: Division by zero")
        return {"message": "This is an error log"}

@app.get("/send-metrics")
def metrics():
    i = 0
    while i < 5:
        with tracer.start_as_current_span("parent"):
            logger.warning("sending request")
            response = requests.get("https://azure.microsoft.com/", timeout=5)
            try:
                val = 1 / 0
                print(val)
            except ZeroDivisionError:
                logger.error("Error: Division by zero", stack_info=True, exc_info=True)
        time.sleep(2)
    return {"message": "This is an info log"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    