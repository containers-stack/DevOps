# Azure AI Foundry Agent Service Challenge

## Overview
This challenge introduces you to Azure AI Foundry's advanced Agent Service, which allows you to create sophisticated AI agents that can use tools, maintain conversation context, and execute complex multi-step tasks.

## What You'll Learn
- **Agent Creation**: How to create and configure AI agents with custom instructions
- **Thread Management**: Persistent conversation sessions that maintain context
- **Tool Integration**: How agents can use code interpreters and custom functions
- **Run Management**: Understanding how agents process and execute tasks
- **Advanced AI Patterns**: Multi-step reasoning and tool orchestration

## Key Concepts

### 🤖 Agents vs. Regular Chat
| Regular Chat | Azure AI Foundry Agents |
|-------------|-------------------------|
| Stateless conversations | Persistent threads with memory |
| Direct API calls | Multi-step run execution |
| Limited capabilities | Tool integration (code, functions, files) |
| Simple request/response | Complex task orchestration |

### 🧵 Core Components

**Agent**: Your custom AI assistant with specific instructions and capabilities
```json
{
  "instructions": "You are a math tutor who shows work step-by-step",
  "name": "Math Assistant", 
  "tools": [{"type": "code_interpreter"}],
  "model": "gpt-4o-mini"
}
```

**Thread**: A conversation session that persists across interactions
```json
{
  "id": "thread_abc123",
  "created_at": 1693363200,
  "metadata": {}
}
```

**Message**: Individual messages within a thread (user or assistant)
```json
{
  "role": "user",
  "content": "Solve 2x² + 5x - 3 = 0"
}
```

**Run**: Activation of the agent to process messages and generate responses
```json
{
  "assistant_id": "asst_abc123",
  "thread_id": "thread_abc123", 
  "status": "completed"
}
```

## Implementation Challenge

### Step 1: Configure Agent Service
Update your `js/config.js` file with Azure AI Foundry credentials:

```javascript
agents: {
    endpoint: "https://your-ai-service.services.ai.azure.com/api/projects/your-project-name",
    accessToken: "your-entra-id-token", // From: az account get-access-token --resource 'https://ai.azure.com'
    apiVersion: "2025-05-01",
    defaultModel: "gpt-4o-mini"
}
```

### Step 2: Create an Agent
Implement the `createNewAgent` function in `js/agent.js`:

```javascript
async function createNewAgent(agentName, instructions, statusElement, chatMessages) {
    // TODO: Your implementation here
    
    // 1. Validate configuration
    const configValidation = validateService('agents');
    if (!configValidation.isValid) {
        throw new Error(`Configuration Error: ${configValidation.issues.join(', ')}`);
    }
    
    // 2. Define agent payload
    const agentPayload = {
        instructions: instructions,
        name: agentName,
        tools: [
            {"type": "code_interpreter"},
            {
                "type": "function",
                "function": {
                    "name": "solve_math_equation",
                    "description": "Solve mathematical equations step by step",
                    "parameters": {
                        "type": "object", 
                        "properties": {
                            "equation": {
                                "type": "string",
                                "description": "The equation to solve"
                            }
                        },
                        "required": ["equation"]
                    }
                }
            }
        ],
        model: AzureConfig.agents.defaultModel
    };
    
    // 3. Create agent via API
    const agentResponse = await fetch(
        `${AzureConfig.agents.endpoint}/assistants?api-version=${AzureConfig.agents.apiVersion}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agentPayload)
        }
    );
    
    // 4. Handle response and create thread
    // 5. Update UI with success/error status
}
```

### Step 3: Handle Agent Messages
Implement the complete message handling flow:

```javascript
async function handleAgentMessage(chatMessages, chatInput) {
    const messageText = chatInput.value.trim();
    
    // TODO: Implement the 5-step process:
    
    // Step 1: Add user message to thread
    const messagePayload = {
        role: "user",
        content: messageText
    };
    
    const messageResponse = await fetch(
        `${AzureConfig.agents.endpoint}/threads/${currentThread.id}/messages?api-version=${AzureConfig.agents.apiVersion}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        }
    );
    
    // Step 2: Create and start a run
    const runPayload = {
        assistant_id: currentAgent.id
    };
    
    const runResponse = await fetch(
        `${AzureConfig.agents.endpoint}/threads/${currentThread.id}/runs?api-version=${AzureConfig.agents.apiVersion}`,
        {
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(runPayload)
        }
    );
    
    // Step 3: Poll run status until completion
    const run = await runResponse.json();
    const completedRun = await pollRunStatus(currentThread.id, run.id);
    
    // Step 4: Retrieve messages from thread
    const messagesResponse = await fetch(
        `${AzureConfig.agents.endpoint}/threads/${currentThread.id}/messages?api-version=${AzureConfig.agents.apiVersion}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AzureConfig.agents.accessToken}`
            }
        }
    );
    
    // Step 5: Display agent response
}
```

### Step 4: Implement Run Polling
Create the polling function to monitor agent execution:

```javascript
async function pollRunStatus(threadId, runId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(
            `${AzureConfig.agents.endpoint}/threads/${threadId}/runs/${runId}?api-version=${AzureConfig.agents.apiVersion}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AzureConfig.agents.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const runData = await response.json();
        
        if (runData.status === 'completed') {
            return runData;
        } else if (runData.status === 'failed') {
            throw new Error(`Run failed: ${runData.last_error?.message}`);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Run polling timeout');
}
```

## Prerequisites
Before implementing this challenge, ensure you have:

1. **Azure AI Foundry Project**: Set up with proper permissions
2. **Entra ID Authentication**: Valid access token with correct scope
3. **RBAC Permissions**: 
   - `agents/*/read` - Read agent configurations
   - `agents/*/action` - Execute agent runs  
   - `agents/*/delete` - Manage agents
4. **Model Deployments**: Access to GPT-4 or GPT-4o models

### Getting Your Access Token
```bash
# Login to Azure
az login

# Get access token for AI Foundry
az account get-access-token --resource 'https://ai.azure.com' | jq -r .accessToken
```

## API Endpoints Reference

### Create Agent
```http
POST {endpoint}/assistants?api-version=2025-05-01
Authorization: Bearer {token}
Content-Type: application/json

{
    "instructions": "You are a helpful assistant",
    "name": "My Agent",
    "tools": [{"type": "code_interpreter"}],
    "model": "gpt-4o-mini"
}
```

### Create Thread  
```http
POST {endpoint}/threads?api-version=2025-05-01
Authorization: Bearer {token}
Content-Type: application/json

{}
```

### Add Message to Thread
```http
POST {endpoint}/threads/{thread_id}/messages?api-version=2025-05-01
Authorization: Bearer {token}
Content-Type: application/json

{
    "role": "user",
    "content": "Hello, can you help me?"
}
```

### Create Run
```http
POST {endpoint}/threads/{thread_id}/runs?api-version=2025-05-01
Authorization: Bearer {token}
Content-Type: application/json

{
    "assistant_id": "{assistant_id}"
}
```

### Check Run Status
```http
GET {endpoint}/threads/{thread_id}/runs/{run_id}?api-version=2025-05-01
Authorization: Bearer {token}
```

### Get Thread Messages
```http
GET {endpoint}/threads/{thread_id}/messages?api-version=2025-05-01
Authorization: Bearer {token}
```

## Available Tools

### Code Interpreter
Agents can write and execute Python code:
```json
{"type": "code_interpreter"}
```

**Capabilities:**
- Mathematical calculations
- Data analysis and visualization
- File processing
- Scientific computing with numpy, pandas, matplotlib

### Custom Functions
Define your own tools for agents to use:
```json
{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name"
                }
            },
            "required": ["location"]
        }
    }
}
```

## Testing Your Implementation

### Test Cases to Try

1. **Basic Math Problem**
   ```
   "Solve the equation: 2x² + 5x - 3 = 0"
   ```
   Expected: Step-by-step solution using quadratic formula

2. **Code Generation**
   ```
   "Write Python code to calculate the first 10 prime numbers"
   ```
   Expected: Working Python code with execution results

3. **Data Analysis**
   ```
   "Analyze this dataset and create a visualization: [1,4,2,8,5,7,3,9,6]"
   ```
   Expected: Statistical analysis with matplotlib chart

4. **Multi-step Problem**
   ```
   "Calculate the compound interest for $1000 at 5% annually for 10 years, then plot the growth"
   ```
   Expected: Calculation + visualization using code interpreter

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your access token is not expired
- Ensure proper resource scope: `https://ai.azure.com`
- Check RBAC permissions on the project

**Agent Creation Fails**
- Verify your endpoint URL format
- Check model deployment availability  
- Ensure valid JSON payload structure

**Run Status Issues**
- Implement proper polling with delays
- Handle all run status states (queued, in_progress, completed, failed)
- Set reasonable timeout limits

**Tool Execution Problems** 
- Verify tool definitions match expected schema
- Check function parameter types and requirements
- Monitor run steps for detailed tool usage

### Debug Tips

1. **Enable Console Logging**
   ```javascript
   console.log('Agent payload:', agentPayload);
   console.log('Run status:', runData);
   ```

2. **Check Network Tab**
   - Monitor API request/response details
   - Verify correct headers and payloads
   - Look for HTTP status codes

3. **Handle Errors Gracefully**
   ```javascript
   try {
       // Agent operations
   } catch (error) {
       console.error('Agent error:', error);
       // Show user-friendly error message
   }
   ```

## Advanced Features

### File Attachments
Agents can process uploaded files:
```javascript
// Add file to message
const messagePayload = {
    role: "user", 
    content: "Analyze this spreadsheet",
    file_ids: ["file_abc123"]
};
```

### Function Calling
When agents need external data:
```javascript
// Handle function calls in runs
if (run.status === 'requires_action') {
    const tool_calls = run.required_action.submit_tool_outputs.tool_calls;
    // Process function calls and submit outputs
}
```

### Streaming Responses
For real-time agent output:
```javascript
const runPayload = {
    assistant_id: currentAgent.id,
    stream: true
};
```

## Learning Objectives Checklist

After completing this challenge, you should be able to:

- [ ] **Create Agents**: Set up agents with custom instructions and tools
- [ ] **Manage Threads**: Create persistent conversation sessions  
- [ ] **Handle Runs**: Start agent execution and monitor progress
- [ ] **Use Tools**: Integrate code interpreter and custom functions
- [ ] **Error Handling**: Properly handle API errors and edge cases
- [ ] **Advanced Patterns**: Build complex multi-step agent workflows

## Next Steps

1. **Experiment with Different Tools**: Try file upload, web browsing
2. **Custom Function Integration**: Build domain-specific tools
3. **Multi-Agent Workflows**: Create agent collaboration patterns
4. **Production Deployment**: Scale agent services for real applications

## Additional Resources

- [Azure AI Foundry Agent Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/agents)
- [Agent API Reference](https://learn.microsoft.com/en-us/rest/api/aiservices/agents)
- [Best Practices Guide](https://learn.microsoft.com/en-us/azure/ai-studio/concepts/agents)
- [Tool Integration Examples](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/ai/ai-agents)

---

**Ready to build the future of AI assistance?** Start implementing your Azure AI Foundry Agent and unlock the power of tool-augmented AI conversations! 🚀🤖
