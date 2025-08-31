// SOLUTION: Function Calling functionality with Azure OpenAI
// This is the complete implementation for instructor reference

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

async function handleFunctionCallMessage(chatMessages, chatInput) {
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

    try {
        // Step 1: Define the function/tool schema
        const tools = [
            {
                type: "function",
                function: {
                    name: "get_current_time",
                    description: "Get the current time in a given location",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "The city name, e.g. San Francisco",
                            },
                        },
                        required: ["location"],
                    },
                }
            }
        ];

        // Step 2: Create the payload for the first API call
        const payload = {
            messages: FunctionCallConversationHistory,
            tools: tools,
            tool_choice: "auto", // Let the model decide when to use functions
            temperature: 0.7,
            max_tokens: 800,
            stream: false // Function calling works better without streaming
        };

        // Step 3: Make the first API call
        const response = await fetch(`${AzureConfig.openAI.endpoint}/openai/deployments/${AzureConfig.openAI.deploymentName}/chat/completions?api-version=${AzureConfig.openAI.apiVersion}`, {
            method: 'POST',
            headers: getCommonHeaders('openAI'),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API call failed: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const responseMessage = data.choices[0].message;

        // Step 4: Add the assistant's response to conversation history
        FunctionCallConversationHistory.push(responseMessage);

        console.log("Model's response:", responseMessage);

        // Step 5: Check if the model wants to call any functions
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            // Handle each function call
            for (const toolCall of responseMessage.tool_calls) {
                if (toolCall.function.name === "get_current_time") {
                    console.log(`Function call requested: ${toolCall.function.name}`);
                    
                    // Parse the function arguments
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    console.log("Function arguments:", functionArgs);
                    
                    // Execute the actual function
                    const functionResult = getCurrentTime(functionArgs.location);
                    
                    // Add the function result to conversation history
                    FunctionCallConversationHistory.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: "get_current_time",
                        content: functionResult,
                    });
                }
            }

            // Step 6: Make a second API call to get the final response
            const finalPayload = {
                messages: FunctionCallConversationHistory,
                temperature: 0.7,
                max_tokens: 800
            };

            const finalResponse = await fetch(`${AzureConfig.openAI.endpoint}/openai/deployments/${AzureConfig.openAI.deploymentName}/chat/completions?api-version=${AzureConfig.openAI.apiVersion}`, {
                method: 'POST',
                headers: getCommonHeaders('openAI'),
                body: JSON.stringify(finalPayload)
            });

            if (!finalResponse.ok) {
                const error = await finalResponse.text();
                throw new Error(`Final API call failed: ${finalResponse.status} - ${error}`);
            }

            const finalData = await finalResponse.json();
            const finalMessage = finalData.choices[0].message;

            // Add final response to conversation history
            FunctionCallConversationHistory.push(finalMessage);

            // Hide thinking and display the final response
            hideThinking(chatMessages, thinkingDiv);
            addMessage(chatMessages, finalMessage.content, false);

        } else {
            // No function calls were made, display the regular response
            console.log("No tool calls were made by the model");
            hideThinking(chatMessages, thinkingDiv);
            addMessage(chatMessages, responseMessage.content || "No response from the model.", false);
        }

    } catch (error) {
        console.error('Function calling error:', error);
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Error: ${error.message}`, false);
    }
}

// Helper function that students will use in their implementation
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
