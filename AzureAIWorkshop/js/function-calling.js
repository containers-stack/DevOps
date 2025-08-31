// Function Calling functionality with Azure OpenAI
// This file handles function calling to demonstrate how AI can call external functions

// Function calling conversation history
let FunctionCallConversationHistory = [
    {
        role: "system",
        content: "You are an AI assistant that can help users by calling functions when needed. You have access to a function that can get the current time in different cities."
    }
];

// Simplified timezone data for the demo function
const TIMEZONE_DATA = {
    "tokyo": "Asia/Tokyo",
    "san francisco": "America/Los_Angeles", 
    "new york": "America/New_York",
    "london": "Europe/London",
    "paris": "Europe/Paris",
    "sydney": "Australia/Sydney"
};

function initializeFunctionCall(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Add instruction message at start
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'bot-message');
    welcomeMessage.style.direction = 'ltr';
    welcomeMessage.innerHTML = `
        <strong>🔧 Function Calling Demo</strong><br>
        Ask me about the current time in different cities!<br>
        Try: "What time is it in Tokyo?" or "What's the time in Paris and New York?"
    `;
    chatMessages.appendChild(welcomeMessage);

    sendBtn.addEventListener('click', () => {
        handleFunctionCallMessage(chatMessages, chatInput);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFunctionCallMessage(chatMessages, chatInput);
        }
    });
}

function handleFunctionCallMessage(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Add user message to conversation history
    FunctionCallConversationHistory.push({
        role: "user",
        content: messageText
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

    // TODO: Implement Function Calling with Azure OpenAI
    // INSTRUCTIONS FOR STUDENTS:
    // 1. Create the payload JSON object with:
    //    - messages: FunctionCallConversationHistory
    //    - tools: Array with function definitions
    //      * type: "function"
    //      * function: { name, description, parameters }
    //    - tool_choice: "auto" (let model decide when to call functions)
    //    - temperature: 0.7
    //    - max_tokens: 800
    //    - stream: false (function calling works better without streaming)
    //
    // 2. Define the get_current_time function schema:
    //    - name: "get_current_time"
    //    - description: "Get the current time in a given location"
    //    - parameters: object with location property (string, required)
    //
    // 3. Make first API call to get function call decision
    // 4. If model wants to call function (response.tool_calls exists):
    //    - Parse function arguments from tool_calls
    //    - Execute the actual function (getCurrentTime)
    //    - Add function result to conversation history
    //    - Make second API call to get final response
    // 5. Display the final result to user
    //
    // Key difference from regular chat:
    // - Two API calls: first to decide function calling, second for final response
    // - Need to handle tool_calls in the response
    // - Need to execute actual functions and add results back to conversation
    // - Use getCommonHeaders('openAI') for proper authentication headers

    // TEMPORARY: Remove this placeholder after implementing function calling
    setTimeout(() => {
        hideThinking(chatMessages, thinkingDiv);
        const instructionMessage = document.createElement('div');
        instructionMessage.classList.add('message', 'bot-message');
        instructionMessage.style.direction = 'ltr';
        instructionMessage.innerHTML = `
            <strong>🎯 Your Task: Implement Function Calling</strong><br><br>
            
            <strong>📚 Documentation:</strong><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/function-calling" target="_blank">
                Azure OpenAI Function Calling Guide
            </a><br><br>
            
            <strong>📋 What makes Function Calling special:</strong><br>
            • AI can decide when to call external functions<br>
            • Two-step process: function decision + final response<br>
            • Functions extend AI capabilities with real-time data<br>
            • Perfect for current time, weather, calculations, etc.<br><br>
            
            <strong>🔧 Implementation Steps:</strong><br>
            1. Define function schema in tools array<br>
            2. Make first API call with tools parameter<br>
            3. Check if model wants to call function (tool_calls)<br>
            4. Execute the actual function with parsed arguments<br>
            5. Add function result to conversation<br>
            6. Make second API call for final response<br><br>
            
            <strong>✅ Expected Result:</strong><br>
            When complete, you should be able to:<br>
            • Ask "What time is it in Tokyo?"<br>
            • See AI call the get_current_time function<br>
            • Get accurate current time for different cities<br>
            • Handle multiple cities in one request<br><br>
            
            <strong>💡 Tips:</strong><br>
            • Use stream: false for function calling<br>
            • Check response.choices[0].message.tool_calls<br>
            • Parse JSON arguments with JSON.parse()<br>
            • Execute getCurrentTime() function provided below<br>
            • Add tool response back to messages array<br><br>
            
            <em>Remove the setTimeout placeholder code when you start implementing.</em>
        `;
        chatMessages.appendChild(instructionMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

// Helper function for students to use in their implementation
function getCurrentTime(location) {
    console.log(`getCurrentTime called with location: ${location}`);
    const locationLower = location.toLowerCase();
    
    // Check if we have timezone data for this location
    for (const [key, timezone] of Object.entries(TIMEZONE_DATA)) {
        if (locationLower.includes(key)) {
            console.log(`Timezone found for ${key}`);
            // Get current time in the specified timezone
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            
            return JSON.stringify({
                location: location,
                current_time: timeString,
                timezone: timezone
            });
        }
    }
    
    console.log(`No timezone data found for ${locationLower}`);
    return JSON.stringify({
        location: location, 
        current_time: "unknown",
        error: "Timezone not found. Supported cities: Tokyo, San Francisco, New York, London, Paris, Sydney"
    });
}
