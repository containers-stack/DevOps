# Function Calling Challenge - Instructor Guide

## Overview
The Function Calling challenge teaches students how to integrate Azure OpenAI with external functions, enabling AI models to interact with real-time data and external systems. This is one of the most powerful features of modern AI systems.

## Learning Objectives
Students will learn:
- How AI models can decide when to call external functions
- The two-step process of function calling with Azure OpenAI
- How to define proper function schemas
- How to handle function arguments and responses
- How to integrate function results back into conversations

## Challenge Structure

### Files Provided to Students
- `js/function-calling.js` - Challenge template with TODO comments
- `docs/function-calling-challenge.md` - Comprehensive documentation
- HTML structure for the Function Calling interface

### Solution Files for Instructors
- `solutions/function-calling-solution.js` - Complete working implementation

## Key Concepts to Emphasize

### 1. Function Calling is Not Function Execution
- The AI model **generates** function call instructions
- Your code **executes** the actual functions
- The AI **decides when** functions are needed based on context

### 2. Two-Step Process
1. **First API Call**: Send user message + function definitions → Model decides if functions are needed
2. **Second API Call**: Send conversation + function results → Model generates final response

### 3. Function Schema Design
The function schema must be precise:
```javascript
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
                }
            },
            required: ["location"]
        }
    }
}
```

## Implementation Steps for Students

### Step 1: Define Function Tools Array
Students need to create a properly structured tools array with function definitions.

**Common mistakes to watch for:**
- Missing required parameters
- Unclear function descriptions
- Incorrect JSON schema structure

### Step 2: First API Call with Tools Parameter
The payload should include:
- `messages`: Conversation history
- `tools`: Function definitions array
- `tool_choice`: "auto" (let model decide)
- `stream`: false (better for function calling)

**Common mistakes:**
- Forgetting to include tools parameter
- Using streaming with function calling
- Incorrect tool_choice format

### Step 3: Parse and Execute Functions
Students must:
- Check if `response.tool_calls` exists
- Parse function arguments with `JSON.parse()`
- Execute the actual function
- Add results to conversation history

**Common mistakes:**
- Not checking for tool_calls existence
- JSON parsing errors
- Incorrect conversation history format
- Missing tool_call_id in response

### Step 4: Second API Call for Final Response
Make another API call with:
- Updated conversation history
- Function results included
- No tools parameter needed

## Testing Scenarios

### Basic Single Function Call
- Input: "What time is it in Tokyo?"
- Expected: Model calls get_current_time with location="Tokyo"
- Result: Returns current time in Tokyo timezone

### Parallel Function Calling
- Input: "What's the time in Paris and New York?"
- Expected: Model makes multiple function calls
- Result: Returns times for both cities

### No Function Call Needed
- Input: "Hello, how are you?"
- Expected: Model responds normally without function calls
- Result: Regular conversational response

### Unsupported Location
- Input: "What time is it on Mars?"
- Expected: Function returns error message
- Result: Model incorporates error into helpful response

## Debugging Tips for Students

### Console Logging Strategy
Encourage students to add these logs:
```javascript
console.log("Model's response:", responseMessage);
console.log("Tool calls:", responseMessage.tool_calls);
console.log("Function arguments:", functionArgs);
console.log("Function result:", functionResult);
```

### Common Error Messages and Solutions

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| "tool_calls is undefined" | Model didn't decide to call function | Check function description clarity |
| "JSON.parse error" | Malformed function arguments | Validate API response structure |
| "Missing tool_call_id" | Incorrect conversation history format | Follow exact response structure |
| "Second API call fails" | Invalid message format | Verify conversation history format |

## Advanced Discussion Points

### When to Use Function Calling
- Real-time data needs (time, weather, stocks)
- Database queries
- External API integration
- Mathematical calculations
- System operations

### Limitations to Discuss
- Function descriptions limited to 1024 characters
- Model decisions aren't always perfect
- Function execution is synchronous
- Error handling complexity

### Security Considerations
- Validate all function arguments
- Implement proper error handling
- Never execute untrusted code
- Consider rate limiting for external APIs

## Extension Activities

### For Advanced Students
1. **Add More Functions**: Weather, calculator, database queries
2. **Parallel Function Calling**: Handle multiple simultaneous functions
3. **Error Handling**: Robust error handling and validation
4. **External APIs**: Integrate with real external services
5. **Function Chaining**: Use results from one function to call another

### Integration Ideas
- Combine with RAG for data-driven function calling
- Add voice integration for speech-to-function calling
- Create agent-like behavior with multiple specialized functions

## Assessment Rubric

### Basic Requirements (60%)
- ✅ Correct function schema definition
- ✅ First API call with tools parameter
- ✅ Function argument parsing
- ✅ Basic function execution

### Intermediate Features (80%)
- ✅ Proper conversation history management
- ✅ Second API call for final response
- ✅ Error handling for invalid inputs
- ✅ Support for multiple cities

### Advanced Implementation (100%)
- ✅ Robust error handling
- ✅ Clear logging and debugging
- ✅ Code organization and comments
- ✅ Handle edge cases gracefully

## Common Student Questions

### Q: "Why do we need two API calls?"
A: The first call determines IF and WHICH functions to call. The second call incorporates the function results to generate a natural language response.

### Q: "Can the model call multiple functions at once?"
A: Yes! Modern models support parallel function calling. Multiple tool_calls can be returned in a single response.

### Q: "What if the model doesn't call the function?"
A: This can happen if the function description doesn't match the user's intent, or if the model thinks it can answer without external data.

### Q: "Can functions call other functions?"
A: Not directly in a single API call, but you can implement function chaining by making additional API calls based on function results.

## Troubleshooting Guide

### If Function Calling Doesn't Work
1. Check function description clarity
2. Verify JSON schema structure
3. Ensure required parameters are marked correctly
4. Test with explicit function-calling prompts

### If Parsing Fails
1. Log the raw function arguments
2. Check for extra whitespace or formatting issues
3. Validate JSON structure with online validators
4. Handle parsing errors gracefully

### If Second API Call Fails
1. Verify conversation history format
2. Check tool_call_id presence
3. Ensure role and content fields are correct
4. Remove tools parameter from second call

## Resources for Students
- [Azure OpenAI Function Calling Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/function-calling)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [JSON Schema Reference](https://json-schema.org/)
- [Workshop Documentation](docs/function-calling-challenge.md)

## Timeline Recommendation
- **Introduction**: 10 minutes (concept explanation)
- **Implementation**: 45 minutes (guided coding)
- **Testing**: 15 minutes (verification and debugging)
- **Discussion**: 15 minutes (questions and extensions)
- **Total**: 85 minutes
