import os
import logging
from logging import getLogger
from time import sleep
from dotenv import load_dotenv
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
import time

load_dotenv()
env_name = os.getenv("ENV_NAME")

configure_azure_monitor()

logger = getLogger(__name__)
tracer = trace.get_tracer(__name__)

i = 0
while True:
    logger.setLevel("INFO")
    logger.info("Uncorrelated info log", extra={"env_name": env_name, "service_name": "demo-main"})
    logger.warning("Uncorrelated warning log" , extra={"env_name": env_name})
    logger.error("Uncorrelated error log", extra={"env_name": env_name})
    
    # start sleep 1 second
    time.sleep(1)

    i += 1
    print(f"i: {i}")

