// RAG functionality with Azure Search + OpenAI - SOLUTION
// This file contains the complete implementation for instructor reference

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

    // SOLUTION: Complete RAG implementation
    
    // Step 1: Prepare RAG payload with Azure Search integration
    const payload = JSON.stringify({
        data_sources: [
            {
                type: "azure_search",
                parameters: {
                    endpoint: AzureConfig.search.endpoint,
                    index_name: AzureConfig.search.indexName,
                    semantic_configuration: AzureConfig.search.semantic_configuration,
                    query_type: AzureConfig.search.queryType,
                    fields_mapping: {},
                    in_scope: true,
                    filter: null,
                    strictness: 3,
                    top_n_documents: 5,
                    authentication: {
                        type: "api_key",
                        key: AzureConfig.search.apiKey
                    },
                    embedding_dependency: {
                        type: "deployment_name",
                        deployment_name: AzureConfig.search.embeddingDeploymentName
                    }
                }
            }
        ],
        messages: RagConversationHistory,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 800,
        stop: null,
        stream: true
    });

    // Step 2: Build the endpoint URL
    const endpoint = `${AzureConfig.openAI.endpoint}openai/deployments/${AzureConfig.openAI.deploymentName}/chat/completions?api-version=${AzureConfig.openAI.apiVersion}`;

    // Step 3: Make the fetch request
    fetch(endpoint, {
        method: "POST",
        headers: getCommonHeaders('openAI'),
        body: payload
    })
    .then(response => {
        // Step 4: Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        chatMessages.appendChild(botMessageDiv);

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    hideThinking(chatMessages, thinkingDiv);
                    return;
                }
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const jsonString = line.replace(/^data: /, '');
                            const data = JSON.parse(jsonString);
                            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                                botMessageDiv.textContent += data.choices[0].delta.content;
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
                readStream();
            });
        }

        readStream();
    })
    .catch(error => {
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Sorry, there was an error processing your request. ${error}`, false);
    });
}
