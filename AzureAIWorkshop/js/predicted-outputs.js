// Predicted Outputs functionality with Azure OpenAI
// This file handles predicted outputs to demonstrate how to improve response latency

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
            <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; color: #000000;"><code>${selectedCode}</code></pre>
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

function handlePredictedOutputsMessage(chatMessages, chatInput, selectedCode) {
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

    // TODO: Implement Predicted Outputs with Azure OpenAI
    // INSTRUCTIONS FOR STUDENTS:
    // 1. Create the payload JSON object with:
    //    - messages: Array with user instruction and the code
    //    - prediction: Object with type "content" and the original code
    //    - temperature: 0.1 (lower for more predictable outputs)
    //    - max_tokens: 800
    //    - stream: false (predicted outputs work better without streaming)
    //
    // 2. Structure the messages array:
    //    - First message: role "user", content: user's instruction
    //    - Second message: role "user", content: the selected code
    //
    // 3. Add prediction parameter:
    //    - type: "content"
    //    - content: selectedCode (the same code from messages)
    //
    // 4. Make API call to Azure OpenAI using getCommonHeaders('openAI')
    // 5. Display the response and show token usage information
    //
    // Key concepts:
    // - Predicted outputs reduce latency when most response is known
    // - The prediction parameter contains the expected similar content
    // - Check usage.completion_tokens_details for accepted/rejected prediction tokens
    // - Lower temperature helps with prediction accuracy

    // TEMPORARY: Remove this placeholder after implementing predicted outputs
    setTimeout(() => {
        hideThinking(chatMessages, thinkingDiv);
        const instructionMessage = document.createElement('div');
        instructionMessage.classList.add('message', 'bot-message');
        instructionMessage.style.direction = 'ltr';
        instructionMessage.innerHTML = `
            <strong>🎯 Your Task: Implement Azure OpenAI Predicted Outputs</strong><br><br>
            
            <strong>📚 Documentation:</strong><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/predicted-outputs" target="_blank">
                Azure OpenAI Predicted Outputs Guide
            </a><br><br>
            
            <strong>📋 What makes Predicted Outputs special:</strong><br>
            • Reduces latency when most response content is predictable<br>
            • Perfect for code refactoring with minimal changes<br>
            • Works best with autocomplete, error detection, editing<br>
            • Balances speed improvement vs token costs<br><br>
            
            <strong>🔧 Implementation Steps:</strong><br>
            1. Create messages array with instruction + original code<br>
            2. Add prediction parameter with same code content<br>
            3. Set lower temperature for better prediction accuracy<br>
            4. Make API call and display response<br>
            5. Show token usage including accepted/rejected predictions<br><br>
            
            <strong>✅ Expected Result:</strong><br>
            When complete, you should be able to:<br>
            • Make small changes to code examples quickly<br>
            • See faster response times for predictable edits<br>
            • View prediction token acceptance rates<br>
            • Understand cost vs performance trade-offs<br><br>
            
            <strong>💡 Tips:</strong><br>
            • Use prediction.type: "content" and prediction.content: originalCode<br>
            • Lower temperature (0.1-0.3) improves prediction accuracy<br>
            • Check completion_tokens_details for prediction metrics<br>
            • Best for scenarios where >50% of response is unchanged<br><br>
            
            <strong>⚠️ Important Notes:</strong><br>
            • Rejected prediction tokens cost the same as new tokens<br>
            • Large percentage of rejections may increase latency<br>
            • Not compatible with function calling or streaming<br>
            • Currently text-only (no audio/images)<br><br>
            
            <em>Remove the setTimeout placeholder code when you start implementing.</em>
        `;
        chatMessages.appendChild(instructionMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}
