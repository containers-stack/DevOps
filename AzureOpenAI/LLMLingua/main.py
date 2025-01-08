import streamlit as st
from llmlingua import PromptCompressor
import json
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the PromptCompressor
llm_lingua = PromptCompressor(
    model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank",
    use_llmlingua2=True,
    device_map="cpu"
)

# Streamlit app
st.title("Prompt Compressor")

instruction = "Write an agenda for the meeting."
question = "What should be included in the agenda for the meeting?"

# User input for the long prompt
prompt = st.text_area("Enter the long prompt:")

if st.button("Compress Prompt"):
    if prompt:
        logging.info("Compressing prompt")
        compressed_prompt = llm_lingua.compress_prompt(prompt, instruction, question, target_token=200)
        st.subheader("Compressed Prompt:")
        st.write(compressed_prompt)
        logging.info("Prompt compressed successfully")
    else:
        st.error("Please enter a prompt to compress.")
        logging.warning("No prompt entered for compression")