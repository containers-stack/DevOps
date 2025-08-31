// Chat functionality with Azure OpenAI
// This file handles simple chat conversation with Azure OpenAI API

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

    // TODO: Implement Azure OpenAI API call
    // INSTRUCTIONS FOR STUDENTS:
    // 1. Create the payload JSON object with:
    //    - messages: ChatConversationHistory
    //    - temperature: 0.7
    //    - top_p: 0.95
    //    - max_tokens: 800
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
    // 4. Handle the streaming response:
    //    - Get reader from response.body.getReader()
    //    - Create decoder: new TextDecoder()
    //    - Create bot message div and append to chatMessages
    //    - Read chunks in a loop
    //    - Parse each line that starts with "data: "
    //    - Extract content from data.choices[0].delta.content
    //    - Append to bot message div
    //    - Don't forget to handle errors and hide thinking animation
    
    // TEMPORARY: Remove this placeholder after implementing the API call
    setTimeout(() => {
        hideThinking(chatMessages, thinkingDiv);
        const instructionMessage = document.createElement('div');
        instructionMessage.classList.add('message', 'bot-message');
        instructionMessage.style.direction = 'ltr';
        instructionMessage.innerHTML = `
            <strong>🎯 Your Task: Implement Azure OpenAI API Integration</strong><br><br>
            
            <strong>📚 Documentation:</strong><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-foundry/openai/chatgpt-quickstart?tabs=keyless%2Ctypescript-keyless%2Cpython-new%2Ccommand-line&pivots=rest-api" target="_blank">
                Azure OpenAI REST API Guide
            </a><br><br>
            
            <strong>📋 What you need to implement:</strong><br>
            • Create the payload with conversation history<br>
            • Build the correct endpoint URL<br>
            • Make a fetch request with proper headers<br>
            • Handle streaming response data<br>
            • Parse and display AI responses<br><br>
            
            <strong>✅ Expected Result:</strong><br>
            When complete, you should be able to:<br>
            • Type a message and see it appear in chat<br>
            • See the AI response streaming in real-time<br>
            • Have a continuous conversation with message history<br>
            • See proper error handling if something goes wrong<br><br>
            
            <strong>💡 Tips:</strong><br>
            • Follow the detailed comments in the code above<br>
            • Use browser dev tools to debug any issues<br>
            • Ask for help if you get stuck!<br><br>
            
            <em>Remove the setTimeout placeholder code when you start implementing.</em>
        `;
        chatMessages.appendChild(instructionMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}
