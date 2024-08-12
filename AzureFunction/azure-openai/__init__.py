import logging
from azure.functions import HttpRequest, HttpResponse
import os
from openai import AzureOpenAI

endpoint = os.getenv("ENDPOINT_URL", "https://nimbusait.openai.azure.com/")
deployment = os.getenv("DEPLOYMENT_NAME", "nimbusait")

      
client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key="YOUR_API_KEY",
    api_version="2024-05-01-preview",
)

def main(req: HttpRequest) -> HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    completion = client.chat.completions.create(
        model=deployment,
        messages= [
        {
        "role": "system",
        "content": "You are a helpful assistant."
        },
        {
        "role": "user",
        "content": f"hello my name is {name}"
        }],
        max_tokens=800,
        temperature=0.7,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None,
        stream=False)
    
    print(completion.to_json())
    
    return HttpResponse(f"Hello, {completion.to_json()}. This HTTP triggered function executed successfully.")

