// SOLUTION: Predicted Outputs functionality with Azure OpenAI
// This is the complete implementation for instructor reference

// Predicted outputs conversation history
let PredictedOutputsConversationHistory = [
    {
        role: "system",
        content: "You are an AI assistant that helps with code refactoring and editing tasks. You should respond only with code unless specifically asked otherwise."
    }
];

// Sample code examples for different scenarios
const CODE_EXAMPLES = {
    fizzbuzz: `for number in range(1, 101):
    if number % 3 == 0 and number % 5 == 0:
        print("FizzBuzz")
    elif number % 3 == 0:
        print("Fizz")
    elif number % 5 == 0:
        print("Buzz")
    else:
        print(number)`,
    
    calculator: `function calculator(a, b, operation) {
    switch(operation) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            return b !== 0 ? a / b : 'Error: Division by zero';
        default:
            return 'Error: Unknown operation';
    }
}`,

    todolist: `const todoList = [
    { id: 1, task: "Buy groceries", completed: false },
    { id: 2, task: "Walk the dog", completed: true },
    { id: 3, task: "Write report", completed: false },
    { id: 4, task: "Call dentist", completed: false }
];`
};

function initializePredictedOutputs(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Add instruction message at start
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'bot-message');
    welcomeMessage.style.direction = 'ltr';
    welcomeMessage.innerHTML = `
        <strong>⚡ Predicted Outputs Demo</strong><br>
        This feature improves response latency when most of the expected response is known!<br>
        <br>
        <strong>Try these examples:</strong><br>
        • "Change FizzBuzz to MSFTBuzz in the code"<br>
        • "Replace 'add' with 'plus' in the calculator function"<br>
        • "Mark task with id 3 as completed in the todo list"<br>
        <br>
        <strong>How it works:</strong><br>
        1. Select a code example from the dropdown<br>
        2. Describe the small change you want<br>
        3. See how predicted outputs speed up the response!
    `;
    chatMessages.appendChild(welcomeMessage);

    // Add code example selector
    const selectorContainer = document.createElement('div');
    selectorContainer.style.cssText = 'margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;';
    
    const selectorLabel = document.createElement('label');
    selectorLabel.textContent = 'Choose a code example: ';
    selectorLabel.style.fontWeight = 'bold';
    
    const codeSelector = document.createElement('select');
    codeSelector.style.cssText = 'margin-left: 10px; padding: 5px; border-radius: 3px;';
    codeSelector.innerHTML = `
        <option value="">-- Select Code Example --</option>
        <option value="fizzbuzz">FizzBuzz (Python)</option>
        <option value="calculator">Calculator Function (JavaScript)</option>
        <option value="todolist">Todo List (JavaScript)</option>
    `;

    const showCodeBtn = document.createElement('button');
    showCodeBtn.textContent = 'Show Code';
    showCodeBtn.style.cssText = 'margin-left: 10px; padding: 5px 10px; background: #007acc; color: white; border: none; border-radius: 3px; cursor: pointer;';
    
    selectorContainer.appendChild(selectorLabel);
    selectorContainer.appendChild(codeSelector);
    selectorContainer.appendChild(showCodeBtn);
    
    // Insert the selector after the welcome message
    chatMessages.appendChild(selectorContainer);

    // Store reference to selected code
    let selectedCode = '';

    showCodeBtn.addEventListener('click', () => {
        const selectedExample = codeSelector.value;
        if (!selectedExample) {
            addMessage(chatMessages, 'Please select a code example first.', false);
            return;
        }

        selectedCode = CODE_EXAMPLES[selectedExample];
        const codeMessage = document.createElement('div');
        codeMessage.classList.add('message', 'bot-message');
        codeMessage.innerHTML = `
            <strong>Selected Code Example:</strong><br>
            <pre style="background: #000000ff; padding: 10px; border-radius: 5px; overflow-x: auto;"><code>${selectedCode}</code></pre>
            <em>Now describe a small change you want to make to this code.</em>
        `;
        chatMessages.appendChild(codeMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    sendBtn.addEventListener('click', () => {
        if (!selectedCode) {
            addMessage(chatMessages, 'Please select and show a code example first.', false);
            return;
        }
        handlePredictedOutputsMessage(chatMessages, chatInput, selectedCode);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!selectedCode) {
                addMessage(chatMessages, 'Please select and show a code example first.', false);
                return;
            }
            handlePredictedOutputsMessage(chatMessages, chatInput, selectedCode);
        }
    });
}

async function handlePredictedOutputsMessage(chatMessages, chatInput, selectedCode) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

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
        // Record start time for latency measurement
        const startTime = Date.now();

        // Step 1: Create the payload with predicted outputs
        const payload = {
            messages: [
                {
                    role: "user",
                    content: `${messageText}. Respond only with code, and with no markdown formatting.`
                },
                {
                    role: "user", 
                    content: selectedCode
                }
            ],
            prediction: {
                type: "content",
                content: selectedCode // The expected similar content
            },
            temperature: 0.1, // Lower temperature for better prediction accuracy
            max_tokens: 800,
            stream: false // Predicted outputs work better without streaming
        };

        console.log("Making predicted outputs API call with payload:", payload);

        // Step 2: Make the API call
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
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log("Full response:", data);

        // Step 3: Display the response
        hideThinking(chatMessages, thinkingDiv);

        const responseMessage = data.choices[0].message;
        
        // Display the modified code
        const codeMessage = document.createElement('div');
        codeMessage.classList.add('message', 'bot-message');
        codeMessage.innerHTML = `
            <strong>Modified Code:</strong><br>
            <pre style="background: #000000ff; padding: 10px; border-radius: 5px; overflow-x: auto;"><code>${responseMessage.content}</code></pre>
        `;
        chatMessages.appendChild(codeMessage);

        // Step 4: Display token usage and prediction statistics
        const usage = data.usage;
        const completionDetails = usage.completion_tokens_details || {};
        const acceptedTokens = completionDetails.accepted_prediction_tokens || 0;
        const rejectedTokens = completionDetails.rejected_prediction_tokens || 0;
        const totalPredictionTokens = acceptedTokens + rejectedTokens;
        const acceptanceRate = totalPredictionTokens > 0 ? ((acceptedTokens / totalPredictionTokens) * 100).toFixed(1) : '0';

        const statsMessage = document.createElement('div');
        statsMessage.classList.add('message', 'bot-message');
        statsMessage.style.background = '#e8f4f8';
        statsMessage.innerHTML = `
            <strong>📊 Performance Metrics:</strong><br>
            <strong>Response Time:</strong> ${responseTime}ms<br>
            <strong>Total Tokens:</strong> ${usage.total_tokens}<br>
            <strong>Prompt Tokens:</strong> ${usage.prompt_tokens}<br>
            <strong>Completion Tokens:</strong> ${usage.completion_tokens}<br>
            <br>
            <strong>🎯 Prediction Performance:</strong><br>
            <strong>Accepted Predictions:</strong> ${acceptedTokens} tokens<br>
            <strong>Rejected Predictions:</strong> ${rejectedTokens} tokens<br>
            <strong>Acceptance Rate:</strong> ${acceptanceRate}%<br>
            <br>
            ${acceptedTokens > rejectedTokens ? 
                '✅ <strong>Good prediction efficiency!</strong> More tokens were accepted than rejected.' :
                rejectedTokens > acceptedTokens ?
                '⚠️ <strong>Low prediction efficiency.</strong> Consider simpler changes for better prediction accuracy.' :
                'ℹ️ <strong>Moderate prediction efficiency.</strong> Try different types of edits to see varying results.'
            }
        `;
        chatMessages.appendChild(statsMessage);

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Predicted outputs error:', error);
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Error: ${error.message}`, false);
    }
}
