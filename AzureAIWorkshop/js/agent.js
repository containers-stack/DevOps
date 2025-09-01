// Azure AI Foundry Agent Service functionality
// This file handles advanced AI agents with tools, threads, and multi-step conversations

// Agent conversation state
let AgentConversationHistory = [];
let currentAgent = null;
let currentThread = null;
let isAgentRunning = false;

function initializeAgent(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Add instruction message at start
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'bot-message');
    welcomeMessage.style.direction = 'ltr';
    welcomeMessage.innerHTML = `
        <strong>🤖 Azure AI Foundry Agent Service</strong><br>
        Create and interact with advanced AI agents that can use tools and handle complex tasks!<br>
        <br>
        <strong>✨ What makes Agents special:</strong><br>
        • <strong>Persistent Threads:</strong> Maintain conversation context across sessions<br>
        • <strong>Code Interpreter:</strong> Agents can write and execute Python code<br>
        • <strong>Custom Functions:</strong> Integrate your own tools and APIs<br>
        • <strong>Multi-step Reasoning:</strong> Agents plan and execute complex tasks<br>
        • <strong>File Handling:</strong> Process and analyze uploaded files<br>
        <br>
        <strong>🛠️ Available Tools in this demo:</strong><br>
        • Code Interpreter for calculations and data analysis<br>
        • Custom math solver function<br>
        • File processing capabilities<br>
        <br>
        <strong>How it works:</strong><br>
        1. First, we'll create an Agent with specific instructions<br>
        2. Create a Thread for our conversation<br>
        3. Add messages and run the agent<br>
        4. Agent can use tools to provide better responses!
    `;
    chatMessages.appendChild(welcomeMessage);

    // Add agent configuration panel
    const agentPanel = document.createElement('div');
    agentPanel.style.cssText = 'margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0078d4;';
    
    agentPanel.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
            <label style="font-weight: bold;">Agent Name:</label>
            <input type="text" id="agentName" placeholder="My Assistant" style="flex: 1; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
            <button id="createAgentBtn" style="padding: 5px 15px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">Create Agent</button>
        </div>
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Agent Instructions:</label>
            <textarea id="agentInstructions" placeholder="You are a helpful assistant that can solve math problems and write code." 
                      style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ddd; resize: vertical; min-height: 60px;"></textarea>
        </div>
        <div id="agentStatus" style="padding: 8px; background: #e9ecef; border-radius: 4px; font-size: 0.9em;">
            <strong>Status:</strong> <span id="statusText">No agent created</span>
        </div>
    `;
    
    chatMessages.appendChild(agentPanel);

    // Add event listeners for agent creation
    const createAgentBtn = document.getElementById('createAgentBtn');
    const agentNameInput = document.getElementById('agentName');
    const agentInstructionsInput = document.getElementById('agentInstructions');
    const statusText = document.getElementById('statusText');

    // Set default values
    agentNameInput.value = "Math & Code Assistant";
    agentInstructionsInput.value = "You are a helpful assistant specialized in mathematics and programming. You can solve equations, analyze data, write code, and explain complex concepts step by step. Always show your work when solving problems.";

    createAgentBtn.addEventListener('click', async () => {
        await createNewAgent(agentNameInput.value, agentInstructionsInput.value, statusText, chatMessages);
    });

    // Modify the send button to use agent functionality
    sendBtn.textContent = 'Send to Agent';
    sendBtn.addEventListener('click', () => {
        if (!currentAgent) {
            addMessage(chatMessages, 'Please create an agent first by clicking "Create Agent" above.', false);
            return;
        }
        handleAgentMessage(chatMessages, chatInput);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!currentAgent) {
                addMessage(chatMessages, 'Please create an agent first by clicking "Create Agent" above.', false);
                return;
            }
            handleAgentMessage(chatMessages, chatInput);
        }
    });

    // Add suggested prompts
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.style.cssText = 'margin: 15px 0; padding: 10px; background: #e8f4f8; border-radius: 8px;';
    suggestionsDiv.innerHTML = `
        <strong>💡 Try these example prompts:</strong><br>
        <div style="margin-top: 8px;">
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Solve the equation: 2x² + 5x - 3 = 0
            </button>
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Write Python code to calculate fibonacci sequence
            </button>
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Analyze this data: [10, 25, 30, 45, 60, 75]
            </button>
        </div>
    `;
    chatMessages.appendChild(suggestionsDiv);

    // Add click handlers for suggestion buttons
    suggestionsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            chatInput.value = e.target.textContent.trim();
            if (currentAgent) {
                handleAgentMessage(chatMessages, chatInput);
            }
        }
    });
}

async function createNewAgent(agentName, instructions, statusText, chatMessages) {
    statusText.textContent = "Creating agent...";
    
    try {
        // TODO: Implement Azure AI Foundry Agent Creation
        // INSTRUCTIONS FOR STUDENTS:
        // 1. Create the agent payload with:
        //    - model: AzureConfig.agents.defaultModel
        //    - name: agentName
        //    - instructions: instructions
        //    - tools: [{"type": "code_interpreter"}]
        //
        // 2. Make POST request to: {endpoint}/agents
        //    - Use Authorization header with Bearer token
        //    - Content-Type: application/json
        //
        // 3. Store the agent ID and create a thread
        // 4. Update status and enable messaging
        
        // TEMPORARY: Simulate agent creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful agent creation
        currentAgent = {
            id: "asst_" + Math.random().toString(36).substring(7),
            name: agentName,
            instructions: instructions,
            tools: [{"type": "code_interpreter"}]
        };
        
        // Simulate thread creation
        currentThread = {
            id: "thread_" + Math.random().toString(36).substring(7),
            created_at: Date.now()
        };
        
        statusText.innerHTML = `✅ Agent "${agentName}" created successfully!<br>
                               <small>Agent ID: ${currentAgent.id}</small><br>
                               <small>Thread ID: ${currentThread.id}</small>`;
        
        // Add success message to chat
        const successMessage = document.createElement('div');
        successMessage.classList.add('message', 'bot-message');
        successMessage.style.background = '#d4edda';
        successMessage.style.borderLeft = '4px solid #28a745';
        successMessage.innerHTML = `
            <strong>🎉 Agent Ready!</strong><br>
            Your AI agent "<strong>${agentName}</strong>" has been created and is ready to help!<br><br>
            <strong>Agent Capabilities:</strong><br>
            • Code Interpreter: Can write and execute Python code<br>
            • Mathematical Problem Solving<br>
            • Data Analysis and Visualization<br>
            • File Processing<br><br>
            <strong>Instructions:</strong> ${instructions}<br><br>
            Try asking the agent to:<br>
            • "Solve this equation: x² + 5x - 6 = 0"<br>
            • "Write Python code to calculate fibonacci numbers"<br>
            • "Create a graph of y = x² for x from -10 to 10"<br>
            • "Analyze this data and find the average"
        `;
        chatMessages.appendChild(successMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        statusText.textContent = "❌ Failed to create agent";
        console.error('Agent creation failed:', error);
        
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'bot-message');
        errorMessage.style.background = '#f8d7da';
        errorMessage.style.borderLeft = '4px solid #dc3545';
        errorMessage.innerHTML = `
            <strong>❌ Agent Creation Failed</strong><br>
            ${error.message}<br><br>
            <strong>Troubleshooting:</strong><br>
            • Check your Azure AI Foundry configuration<br>
            • Ensure your access token is valid<br>
            • Verify the endpoint URL is correct<br>
            • Make sure you have proper permissions
        `;
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function handleAgentMessage(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Display user message
    addMessage(chatMessages, messageText, true);
    chatInput.value = '';

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);

    try {
        // TODO: Implement Agent Message Handling
        // INSTRUCTIONS FOR STUDENTS:
        // 1. Add user message to thread: POST /threads/{thread_id}/messages
        // 2. Create and start a run: POST /threads/{thread_id}/runs
        // 3. Poll run status: GET /threads/{thread_id}/runs/{run_id}
        // 4. When complete, retrieve messages: GET /threads/{thread_id}/messages
        // 5. Display agent response and any tool usage
        //
        // Key concepts:
        // - Threads maintain conversation context
        // - Runs activate the agent to process messages
        // - Agents can call tools during runs
        // - Run steps show detailed tool usage

        // TEMPORARY: Simulate agent processing
        setTimeout(async () => {
            hideThinking(chatMessages, thinkingDiv);
            
            // Simulate agent response with tool usage
            const hasCodeRequest = messageText.toLowerCase().includes('code') || 
                                 messageText.toLowerCase().includes('python') || 
                                 messageText.toLowerCase().includes('program');
            
            const hasMathRequest = messageText.toLowerCase().includes('solve') || 
                                 messageText.toLowerCase().includes('equation') || 
                                 messageText.toLowerCase().includes('calculate');

            let agentResponse = "";
            let toolsUsed = [];

            if (hasCodeRequest) {
                toolsUsed.push("Code Interpreter");
                agentResponse = "I'll help you with that coding task! Let me write and execute some Python code for you.\\n\\n```python\\n# Example code execution\\nimport numpy as np\\n\\ndef fibonacci(n):\\n    if n <= 1:\\n        return n\\n    else:\\n        return fibonacci(n-1) + fibonacci(n-2)\\n\\n# Generate first 10 fibonacci numbers\\nfib_sequence = [fibonacci(i) for i in range(10)]\\nprint('First 10 Fibonacci numbers:', fib_sequence)\\n```\\n\\n**Output:**\\nFirst 10 Fibonacci numbers: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\\n\\nThe code has been executed successfully! The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding numbers.";

            } else if (hasMathRequest) {
                toolsUsed.push("Math Solver Function");
                agentResponse = "I'll solve this mathematical equation step by step using my math solver tool.\\n\\n**🔧 Tool Called:** solve_math_equation\\n**Input:** " + messageText + "\\n\\n**Step-by-step solution:**\\n1. First, I'll identify the type of equation\\n2. Apply the appropriate mathematical method\\n3. Show each step of the calculation\\n4. Verify the solution\\n\\n**Result:** Based on the equation analysis, here's the detailed solution with all intermediate steps shown.\\n\\n*Note: This is a simulated response. In the real implementation, the agent would actually call the math solver function.*";

            } else {
                agentResponse = "I understand your request: " + messageText + "\\n\\nAs an AI agent with access to various tools, I can help you with:\\n• **Mathematical calculations** (using my math solver function)\\n• **Code writing and execution** (using the code interpreter)\\n• **Data analysis and visualization**\\n• **Step-by-step problem solving**\\n\\nCould you please specify if you'd like me to write code, solve a math problem, or help with something else? I'm ready to use my tools to provide the best assistance!";
            }

            // Display agent response
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('message', 'bot-message');
            responseDiv.innerHTML = `
                <strong>🤖 Agent Response:</strong><br>
                <div style="margin: 10px 0; white-space: pre-wrap;">${agentResponse}</div>
                ${toolsUsed.length > 0 ? `
                <div style="margin-top: 10px; padding: 8px; background: #e8f4f8; border-radius: 4px; font-size: 0.9em;">
                    <strong>🛠️ Tools Used:</strong> ${toolsUsed.join(', ')}
                </div>` : ''}
            `;
            chatMessages.appendChild(responseDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Add to conversation history
            AgentConversationHistory.push({
                role: 'user',
                content: messageText
            });
            AgentConversationHistory.push({
                role: 'assistant',
                content: agentResponse,
                tools_used: toolsUsed
            });

        }, 3000); // Simulate processing time

    } catch (error) {
        console.error('Agent message error:', error);
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Error: ${error.message}`, false);
    }
}