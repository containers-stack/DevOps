# Function Calling Challenge

## Overview
Function calling allows Azure OpenAI models to interact with external functions and APIs, extending their capabilities beyond text generation. The AI can decide when and how to call functions based on the conversation context.

## Learning Objectives
- Understand the concept of function calling with AI models
- Learn to define function schemas for AI models
- Implement the two-step function calling process
- Handle function arguments and responses
- Integrate function results back into conversations

## What is Function Calling?
Function calling enables AI models to:
- **Decide when** external functions are needed
- **Determine which** function to call
- **Extract arguments** from user input
- **Structure responses** based on function results

The model doesn't actually execute functions - it generates the call instructions, and your code executes them.

## The Function Calling Process

### Step 1: Define Function Schema
```javascript
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
```

### Step 2: First API Call (Function Decision)
```javascript
const payload = {
    messages: conversationHistory,
    tools: tools,
    tool_choice: "auto",
    stream: false
};
```

### Step 3: Handle Function Calls
```javascript
if (response.tool_calls) {
    for (const toolCall of response.tool_calls) {
        // Parse arguments
        const args = JSON.parse(toolCall.function.arguments);
        
        // Execute function
        const result = executeFunction(args);
        
        // Add to conversation
        conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: result
        });
    }
}
```

### Step 4: Second API Call (Final Response)
```javascript
// Make another API call with function results included
const finalResponse = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ messages: conversationHistory })
});
```

## Implementation Requirements

### 1. Function Schema Definition
Your function must include:
- **name**: Function identifier
- **description**: What the function does
- **parameters**: JSON schema defining inputs
- **required**: Array of required parameter names

### 2. API Request Configuration
- Set `tools` parameter with function definitions
- Use `tool_choice: "auto"` to let model decide
- Set `stream: false` for better function calling support
- Include conversation history in `messages`

### 3. Function Execution
- Parse function arguments with `JSON.parse()`
- Execute your actual function code
- Return results as JSON strings
- Handle errors gracefully

### 4. Response Integration
- Add function calls to conversation history
- Include `tool_call_id` for correlation
- Set `role: "tool"` for function responses
- Make second API call for final answer

## Key Differences from Regular Chat

| Aspect | Regular Chat | Function Calling |
|--------|-------------|------------------|
| API Calls | Single call | Two calls (decision + response) |
| Parameters | Basic payload | Includes `tools` array |
| Streaming | Can use streaming | Better without streaming |
| Response Handling | Direct display | Check for `tool_calls` first |
| Conversation Flow | Linear | Branched (may include function execution) |

## Common Use Cases
- **Real-time Data**: Current time, weather, stock prices
- **Calculations**: Math operations, conversions
- **External APIs**: Database queries, web services
- **System Operations**: File operations, system info
- **Custom Business Logic**: Domain-specific functions

## Tips for Success

### Function Design
- Keep function descriptions clear and specific
- Use descriptive parameter names
- Include examples in descriptions
- Mark required parameters correctly

### Error Handling
- Validate function arguments before execution
- Return meaningful error messages as JSON
- Handle API failures gracefully
- Provide fallback responses

### Testing Strategies
- Test with single function calls first
- Try multiple functions in one request
- Test edge cases and invalid inputs
- Verify conversation history tracking

## Debugging Function Calls

### Console Logging
Add these logs to track execution:
```javascript
console.log("Model's response:", responseMessage);
console.log("Function arguments:", functionArgs);
console.log("Function result:", functionResult);
```

### Common Issues
- **No tool_calls**: Check function description and user request alignment
- **JSON Parse Errors**: Validate function argument format
- **Missing tool_call_id**: Ensure proper response structure
- **Second API Call Fails**: Verify conversation history format

## Advanced Concepts

### Parallel Function Calling
Models can call multiple functions simultaneously:
```javascript
// User: "What time is it in Tokyo and Paris?"
// Model might generate multiple tool_calls in one response
```

### Function Chaining
Functions can be called in sequence:
```javascript
// Call function A, use result to call function B
```

### Conditional Function Calling
Use `tool_choice` parameter:
- `"auto"`: Model decides
- `"none"`: Force no function calls  
- `{"type": "function", "function": {"name": "specific_function"}}`: Force specific function

## Expected Output
When your implementation is complete, you should be able to:

1. **Ask for single city time**: "What time is it in Tokyo?"
   - Model decides to call function
   - Executes getCurrentTime("Tokyo")
   - Returns formatted time response

2. **Request multiple cities**: "What's the time in Paris and New York?"
   - Model may call function multiple times
   - Handles parallel function execution
   - Combines results into coherent response

3. **Handle unsupported cities**: "What time is it in Mars?"
   - Function returns error message
   - Model incorporates error into helpful response

4. **Mixed conversations**: Regular chat + time requests
   - Model only calls function when appropriate
   - Maintains conversation context

## Resources
- [Azure OpenAI Function Calling Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/function-calling)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [JSON Schema Reference](https://json-schema.org/understanding-json-schema/)

## Next Steps
Once you complete this challenge:
1. Try adding more functions (weather, calculator, etc.)
2. Experiment with parallel function calling
3. Build error handling for edge cases
4. Create more complex function schemas
5. Integrate with real external APIs
