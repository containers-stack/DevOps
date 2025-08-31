// Chat functionality with Azure OpenAI - SOLUTION
// This file contains the complete implementation for instructor reference

// Chat conversation history
let ChatConversationHistory = [
    {
        role: "system",
        content: [
            {
                type: "text",
                text: "You are an AI assistant that helps people find information."
            }
        ]
    }
];

function initializeChat(chatMessages, chatInput, sendBtn, chatInputContainer) {
    sendBtn.addEventListener('click', () => {
        handleChatMessage(chatMessages, chatInput);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatMessage(chatMessages, chatInput);
        }
    });
}

function handleChatMessage(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Add user message to conversation history
    ChatConversationHistory.push({
        role: "user",
        content: [
            {
                type: "text",
                text: messageText
            }
        ]
    });

    // Display user message
    addMessage(chatMessages, messageText, true);
    chatInput.value = '';

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);

    // Validate configuration before making API call
    const configValidation = validateService('openAI');
    if (!configValidation.isValid) {
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Configuration Error: ${configValidation.issues.join(', ')}`, false);
        return;
    }

    // SOLUTION: Complete Azure OpenAI implementation
    
    // Step 1: Prepare payload for Azure OpenAI
    const payload = JSON.stringify({
        messages: ChatConversationHistory,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 800,
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
