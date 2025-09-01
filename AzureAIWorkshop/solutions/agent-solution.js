// SOLUTION: Azure AI Foundry Agent Service functionality
// This is the complete implementation for instructor reference

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
        <strong>🤖 Azure AI Foundry Agent Service - SOLUTION</strong><br>
        This is the complete working implementation of Azure AI Foundry Agents!<br>
        <br>
        <strong>✨ Features implemented:</strong><br>
        • <strong>Real Agent Creation:</strong> Creates actual agents via Azure API<br>
        • <strong>Thread Management:</strong> Persistent conversation threads<br>
        • <strong>Tool Integration:</strong> Code interpreter and custom functions<br>
        • <strong>Run Polling:</strong> Monitors agent execution status<br>
        • <strong>Error Handling:</strong> Comprehensive error management<br>
        <br>
        <strong>🛠️ Available Tools:</strong><br>
        • Code Interpreter for Python execution<br>
        • Custom math solver function<br>
        • File processing capabilities<br>
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
    agentNameInput.value = "Advanced Math & Code Assistant";
    agentInstructionsInput.value = "You are an advanced AI assistant specialized in mathematics and programming. You can solve complex equations, analyze data, write and execute code, create visualizations, and explain concepts step by step. Always show your work and reasoning.";

    createAgentBtn.addEventListener('click', async () => {
        await createNewAgentSolution(agentNameInput.value, agentInstructionsInput.value, statusText, chatMessages);
    });

    // Modify the send button to use agent functionality
    sendBtn.textContent = 'Send to Agent';
    sendBtn.addEventListener('click', () => {
        if (!currentAgent) {
            addMessage(chatMessages, 'Please create an agent first by clicking "Create Agent" above.', false);
            return;
        }
        handleAgentMessageSolution(chatMessages, chatInput);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!currentAgent) {
                addMessage(chatMessages, 'Please create an agent first by clicking "Create Agent" above.', false);
                return;
            }
            handleAgentMessageSolution(chatMessages, chatInput);
        }
    });

    // Add suggested prompts
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.style.cssText = 'margin: 15px 0; padding: 10px; background: #e8f4f8; border-radius: 8px;';
    suggestionsDiv.innerHTML = `
        <strong>💡 Try these advanced prompts:</strong><br>
        <div style="margin-top: 8px;">
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Solve and plot: y = 2x² - 4x + 1
            </button>
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Create a Monte Carlo simulation for π
            </button>
            <button class="suggestion-btn" style="margin: 2px; padding: 5px 10px; background: #0078d4; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85em;">
                Analyze dataset: sales trends for Q1-Q4
            </button>
        </div>
    `;
    chatMessages.appendChild(suggestionsDiv);

    // Add click handlers for suggestion buttons
    suggestionsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-btn')) {
            chatInput.value = e.target.textContent.trim();
            if (currentAgent) {
                handleAgentMessageSolution(chatMessages, chatInput);
            }
        }
    });
}

async function createNewAgentSolution(agentName, instructions, statusElement, chatMessages) {
    statusElement.textContent = 'Creating agent...';
    
    try {
        // Validate Azure AI Foundry configuration
        if (!AzureConfig.agents || !AzureConfig.agents.endpoint || !AzureConfig.agents.accessToken) {
            throw new Error('Azure AI Foundry Agent Service not configured properly');
        }

        // Step 1: Create the agent
        const agentPayload = {
            instructions: instructions,
            name: agentName,
            tools: [
                {"type": "code_interpreter"},
                {
                    "type": "function",
                    "function": {
                        "name": "solve_math_equation",
                        "description": "Solve mathematical equations step by step with detailed explanations",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "equation": {
                                    "type": "string",
                                    "description": "The mathematical equation to solve (e.g., '2x^2 + 5x - 3 = 0')"
                                },
                                "show_steps": {
                                    "type": "boolean",
                                    "description": "Whether to show step-by-step solution",
                                    "default": true
                                }
                            },
                            "required": ["equation"]
                        }
                    }
                }
            ],
            model: AzureConfig.agents.defaultModel || "gpt-4o-mini"
        };

        console.log('Creating agent with payload:', agentPayload);

        const agentResponse = await fetch(`${AzureConfig.agents.endpoint}/assistants?api-version=${AzureConfig.agents.apiVersion}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agentPayload)
        });

        if (!agentResponse.ok) {
            const error = await agentResponse.text();
            throw new Error(`Agent creation failed: ${agentResponse.status} - ${error}`);
        }

        currentAgent = await agentResponse.json();
        console.log('Agent created successfully:', currentAgent);

        // Step 2: Create a thread for conversations
        const threadResponse = await fetch(`${AzureConfig.agents.endpoint}/threads?api-version=${AzureConfig.agents.apiVersion}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: '{}'
        });

        if (!threadResponse.ok) {
            const error = await threadResponse.text();
            throw new Error(`Thread creation failed: ${threadResponse.status} - ${error}`);
        }

        currentThread = await threadResponse.json();
        console.log('Thread created successfully:', currentThread);

        statusElement.innerHTML = `
            ✅ Agent created successfully!<br>
            <small>Agent ID: ${currentAgent.id}<br>
            Thread ID: ${currentThread.id}</small>
        `;

        // Add success message to chat
        const successMessage = document.createElement('div');
        successMessage.classList.add('message', 'bot-message');
        successMessage.innerHTML = `
            <strong>🎉 Agent "${agentName}" is live!</strong><br>
            <br>
            <strong>🔧 Real Agent Configuration:</strong><br>
            • <strong>ID:</strong> ${currentAgent.id}<br>
            • <strong>Model:</strong> ${currentAgent.model}<br>
            • <strong>Tools:</strong> ${currentAgent.tools.map(t => t.type).join(', ')}<br>
            • <strong>Thread:</strong> ${currentThread.id}<br>
            <br>
            <em>🚀 This is a real Azure AI Foundry agent - ready for advanced interactions!</em>
        `;
        chatMessages.appendChild(successMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        statusElement.textContent = `❌ Error: ${error.message}`;
        console.error('Agent creation error:', error);
        
        // Show detailed error message
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'bot-message');
        errorMessage.style.background = '#ffe6e6';
        errorMessage.innerHTML = `
            <strong>❌ Agent Creation Failed</strong><br>
            <strong>Error:</strong> ${error.message}<br>
            <br>
            <strong>🔧 Configuration Requirements:</strong><br>
            • Valid Azure AI Foundry endpoint<br>
            • Valid Entra ID access token<br>
            • Proper RBAC permissions<br>
            <br>
            <em>Check the browser console for detailed error information.</em>
        `;
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

async function handleAgentMessageSolution(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Display user message
    addMessage(chatMessages, messageText, true);
    chatInput.value = '';

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);

    try {
        // Step 1: Add user message to thread
        const messagePayload = {
            role: "user",
            content: messageText
        };

        console.log('Adding message to thread:', messagePayload);

        const messageResponse = await fetch(`${AzureConfig.agents.endpoint}/threads/${currentThread.id}/messages?api-version=${AzureConfig.agents.apiVersion}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        });

        if (!messageResponse.ok) {
            const error = await messageResponse.text();
            throw new Error(`Failed to add message: ${messageResponse.status} - ${error}`);
        }

        // Step 2: Create and start a run
        const runPayload = {
            assistant_id: currentAgent.id
        };

        console.log('Starting run with payload:', runPayload);

        const runResponse = await fetch(`${AzureConfig.agents.endpoint}/threads/${currentThread.id}/runs?api-version=${AzureConfig.agents.apiVersion}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(runPayload)
        });

        if (!runResponse.ok) {
            const error = await runResponse.text();
            throw new Error(`Failed to start run: ${runResponse.status} - ${error}`);
        }

        const run = await runResponse.json();
        console.log('Run started:', run);

        // Step 3: Poll run status until completion
        const completedRun = await pollRunStatusSolution(currentThread.id, run.id);
        console.log('Run completed:', completedRun);

        // Step 4: Retrieve all messages from the thread
        const messagesResponse = await fetch(`${AzureConfig.agents.endpoint}/threads/${currentThread.id}/messages?api-version=${AzureConfig.agents.apiVersion}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`
            }
        });

        if (!messagesResponse.ok) {
            const error = await messagesResponse.text();
            throw new Error(`Failed to retrieve messages: ${messagesResponse.status} - ${error}`);
        }

        const messages = await messagesResponse.json();
        console.log('Messages retrieved:', messages);

        hideThinking(chatMessages, thinkingDiv);

        // Find the latest assistant message
        const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
        if (assistantMessages.length > 0) {
            const latestMessage = assistantMessages[0]; // Messages are returned in reverse chronological order
            
            // Display the agent's response
            const responseDiv = document.createElement('div');
            responseDiv.classList.add('message', 'bot-message');
            
            let responseContent = '';
            latestMessage.content.forEach(contentItem => {
                if (contentItem.type === 'text') {
                    responseContent += contentItem.text.value;
                }
            });

            responseDiv.innerHTML = `
                <strong>🤖 Agent Response:</strong><br>
                <div style="margin: 10px 0; white-space: pre-wrap;">${responseContent}</div>
                <div style="margin-top: 10px; padding: 8px; background: #e8f4f8; border-radius: 4px; font-size: 0.9em;">
                    <strong>📊 Run Info:</strong> Status: ${completedRun.status} | Tools: ${completedRun.tools?.length || 0} | Duration: ${((completedRun.completed_at - completedRun.created_at) / 1000).toFixed(2)}s
                </div>
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
                content: responseContent,
                run_info: completedRun
            });
        } else {
            throw new Error('No assistant response found');
        }

    } catch (error) {
        console.error('Agent message error:', error);
        hideThinking(chatMessages, thinkingDiv);
        
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'bot-message');
        errorMessage.style.background = '#ffe6e6';
        errorMessage.innerHTML = `
            <strong>❌ Error:</strong> ${error.message}<br>
            <em>Check the browser console for detailed information.</em>
        `;
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Helper function to poll run status until completion
async function pollRunStatusSolution(threadId, runId, maxAttempts = 60) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(`${AzureConfig.agents.endpoint}/threads/${threadId}/runs/${runId}?api-version=${AzureConfig.agents.apiVersion}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get run status: ${response.status}`);
            }

            const runData = await response.json();
            console.log(`Run status check ${attempt + 1}:`, runData.status);
            
            if (runData.status === 'completed') {
                return runData;
            } else if (runData.status === 'failed') {
                throw new Error(`Run failed: ${runData.last_error?.message || 'Unknown error'}`);
            } else if (runData.status === 'expired') {
                throw new Error('Run expired - took too long to complete');
            } else if (runData.status === 'cancelled') {
                throw new Error('Run was cancelled');
            }

            // Wait before next poll (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(1.2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
        } catch (error) {
            console.error(`Run polling attempt ${attempt + 1} failed:`, error);
            if (attempt === maxAttempts - 1) {
                throw new Error(`Run polling failed after ${maxAttempts} attempts: ${error.message}`);
            }
        }
    }
    
    throw new Error(`Run polling timeout after ${maxAttempts} attempts`);
}
