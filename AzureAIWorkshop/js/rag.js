// RAG functionality with Azure Search + OpenAI
// This file handles Retrieval-Augmented Generation using Azure Search and OpenAI

// RAG conversation history
let RagConversationHistory = [
    {
        role: "system",
        content: "You are an AI assistant designed to help ISSTA customers by providing clear, accurate, and helpful information about their cancellation policy"
    }
];

function initializeRAG(chatMessages, chatInput, sendBtn, chatInputContainer) {
    sendBtn.addEventListener('click', () => {
        handleRAGMessage(chatMessages, chatInput);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleRAGMessage(chatMessages, chatInput);
        }
    });
}

function handleRAGMessage(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Validate configuration before making API call
    const configValidation = validateConfig(['openAI', 'search']);
    if (!configValidation.isValid) {
        addMessage(chatMessages, `Configuration Error: ${configValidation.issues.join(', ')}`, false);
        return;
    }

    // Add user message to RAG conversation history
    RagConversationHistory.push({
        role: "user",
        content: messageText
    });

    // Display user message
    addMessage(chatMessages, messageText, true);
    chatInput.value = '';

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);

    // TODO: Implement Azure OpenAI RAG (Retrieval-Augmented Generation) API call
    // INSTRUCTIONS FOR STUDENTS:
    // 1. Create the payload JSON object with:
    //    - data_sources: Array with one Azure Search data source
    //      * type: "azure_search"
    //      * parameters:
    //        - endpoint: AzureConfig.search.endpoint
    //        - index_name: AzureConfig.search.indexName
    //        - semantic_configuration: "default"
    //        - query_type: "simple"
    //        - fields_mapping: {} (empty object)
    //        - in_scope: true
    //        - role_information: system message for the assistant
    //        - filter: null
    //        - strictness: 3
    //        - top_n_documents: 5
    //        - authentication: { type: "api_key", key: AzureConfig.search.apiKey }
    //    - messages: RagConversationHistory
    //    - temperature: 0.7
    //    - top_p: 0.95
    //    - max_tokens: 800
    //    - stop: null
    //    - stream: true
    //
    // 2. Build the endpoint URL using:
    //    - AzureConfig.openAI.endpoint
    //    - AzureConfig.openAI.deploymentName
    //    - AzureConfig.openAI.apiVersion
    //    Format: {endpoint}openai/deployments/{deploymentName}/chat/completions?api-version={apiVersion}
    //
    // 3. Make a fetch request with:
    //    - method: "POST"
    //    - headers: getCommonHeaders('openAI')
    //    - body: JSON.stringify(payload)
    //
    // 4. Handle the streaming response (same as chat):
    //    - Get reader from response.body.getReader()
    //    - Create decoder: new TextDecoder()
    //    - Create bot message div and append to chatMessages
    //    - Read chunks in a loop
    //    - Parse each line that starts with "data: "
    //    - Extract content from data.choices[0].delta.content
    //    - Append to bot message div
    //    - Handle errors and hide thinking animation
    
    // TEMPORARY: Remove this placeholder after implementing the RAG API call
    setTimeout(() => {
        hideThinking(chatMessages, thinkingDiv);
        const instructionMessage = document.createElement('div');
        instructionMessage.classList.add('message', 'bot-message');
        instructionMessage.style.direction = 'ltr';
        instructionMessage.innerHTML = `
            <strong>🎯 Your Task: Implement RAG (Retrieval-Augmented Generation)</strong><br><br>
            
            <strong>📚 Documentation:</strong><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/openai/use-your-data-quickstart?tabs=keyless%2Ctypescript-keyless%2Cpython-new&pivots=rest-api" target="_blank">
                Azure OpenAI Use Your Data Quickstart (REST API)
            </a><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/use-your-data" target="_blank">
                Azure OpenAI with Your Data Concepts
            </a><br>
            <a href="https://learn.microsoft.com/en-us/azure/search/search-get-started-rest" target="_blank">
                Azure AI Search REST API
            </a><br><br>
            
            <strong>📋 What makes RAG different from Chat:</strong><br>
            • Uses Azure Search to find relevant documents<br>
            • Includes data_sources in the payload<br>
            • Combines search results with AI generation<br>
            • Provides more accurate, context-aware answers<br><br>
            
            <strong>🔧 Key Implementation Details:</strong><br>
            • Configure Azure Search data source parameters<br>
            • Set authentication for search service<br>
            • Define search behavior (strictness, top documents)<br>
            • Same streaming response handling as chat<br><br>
            
            <strong>✅ Expected Result:</strong><br>
            When complete, you should be able to:<br>
            • Ask questions about your indexed documents<br>
            • Get AI responses based on search results<br>
            • See more accurate, document-grounded answers<br>
            • Have citations/references to source documents<br><br>
            
            <strong>💡 Tips:</strong><br>
            • Make sure both OpenAI and Search services are configured<br>
            • The payload structure is more complex than basic chat<br>
            • Test with questions related to your indexed content<br>
            • Check browser network tab for API call details<br><br>
            
            <em>Remove the setTimeout placeholder code when you start implementing.</em>
        `;
        chatMessages.appendChild(instructionMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}
