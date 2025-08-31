# Predicted Outputs Challenge

## Overview
Predicted outputs is a feature that can improve model response latency for chat completions when minimal changes are needed to a larger body of text. If most of the expected response is already known, predicted outputs can significantly reduce response time by indicating to the model what content is already known.

## Learning Objectives
- Understand when and how to use predicted outputs effectively
- Learn the trade-offs between response speed and token costs
- Implement predicted outputs for code refactoring scenarios
- Analyze prediction performance metrics
- Optimize for different types of content modifications

## What are Predicted Outputs?
Predicted outputs allow you to:
- **Reduce latency** for requests where most content is predictable
- **Speed up code editing** tasks like autocomplete and refactoring
- **Improve user experience** in real-time editing scenarios
- **Balance performance** against potential increased costs

The feature works by passing the expected similar content to the `prediction` parameter, helping the model generate responses faster.

## When to Use Predicted Outputs

### Ideal Scenarios ✅
- **Code refactoring** with small changes
- **Autocomplete** functionality
- **Error detection** and correction
- **Template modifications** with minor edits
- **Content editing** where >50% remains unchanged

### Less Suitable Scenarios ❌
- **Creative writing** with unpredictable content
- **Complex transformations** requiring major changes
- **Function calling** (not supported)
- **Audio/image** processing (text-only feature)
- **Streaming** responses (works better without streaming)

## Implementation Requirements

### 1. API Version
- Requires API version `2025-01-01-preview` or later
- Available in most regions (except South East Asia currently)

### 2. Model Support
Supported models include:
- `gpt-4o-mini` (2024-07-18)
- `gpt-4o` (2024-08-06, 2024-11-20)
- `gpt-4.1` (2025-04-14)
- `gpt-4.1-mini` (2025-04-14)
- `gpt-4.1-nano` (2025-04-14)

### 3. Request Structure
```javascript
const payload = {
    messages: [
        { role: "user", content: "Your instruction" },
        { role: "user", content: "Original content to modify" }
    ],
    prediction: {
        type: "content",
        content: "Expected similar content (usually same as original)"
    },
    temperature: 0.1, // Lower for better prediction accuracy
    stream: false
};
```

### 4. Unsupported Features
When using predicted outputs, these features are **not available**:
- Tools/Function calling
- Audio models/inputs/outputs
- `n` values higher than 1
- `logprobs`
- `presence_penalty` > 0
- `frequency_penalty` > 0
- `max_completion_tokens`

## Key Implementation Steps

### Step 1: Structure Messages Array
```javascript
const messages = [
    {
        role: "user",
        content: "Replace 'FizzBuzz' with 'MSFTBuzz'. Respond only with code."
    },
    {
        role: "user",
        content: originalCode
    }
];
```

### Step 2: Add Prediction Parameter
```javascript
const prediction = {
    type: "content",
    content: originalCode // Same content as in messages
};
```

### Step 3: Configure for Optimal Performance
```javascript
const payload = {
    messages,
    prediction,
    temperature: 0.1, // Lower = more predictable
    max_tokens: 800,
    stream: false // Better for predicted outputs
};
```

### Step 4: Analyze Prediction Metrics
```javascript
const usage = response.usage;
const details = usage.completion_tokens_details;
const acceptedTokens = details.accepted_prediction_tokens;
const rejectedTokens = details.rejected_prediction_tokens;
const acceptanceRate = (acceptedTokens / (acceptedTokens + rejectedTokens)) * 100;
```

## Understanding Token Metrics

### Response Usage Object
```json
{
  "usage": {
    "completion_tokens": 77,
    "prompt_tokens": 124,
    "total_tokens": 201,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 6,
      "rejected_prediction_tokens": 4,
      "audio_tokens": 0,
      "reasoning_tokens": 0
    }
  }
}
```

### Key Metrics to Monitor
- **Accepted Prediction Tokens**: Help reduce latency ✅
- **Rejected Prediction Tokens**: Cost same as new tokens ⚠️
- **Acceptance Rate**: `accepted / (accepted + rejected) * 100`
- **Efficiency**: Higher acceptance rate = better performance

### Cost Considerations
- **Accepted tokens**: Improve speed, reduce cost
- **Rejected tokens**: Same cost as generating new tokens
- **Net effect**: Could increase or decrease total cost
- **Optimization**: Monitor acceptance rates for cost efficiency

## Performance Optimization Tips

### Temperature Settings
- **0.1-0.3**: Best for predictable code changes
- **0.4-0.6**: Good for structured content edits
- **0.7+**: May reduce prediction accuracy

### Content Prediction Accuracy
- **Exact matches**: Highest acceptance rates
- **Minor changes**: Good acceptance rates
- **Major rewrites**: Lower acceptance rates
- **Creative content**: Unpredictable acceptance

### Request Structure
- Keep instructions clear and specific
- Use consistent formatting in predictions
- Match content structure between messages and predictions
- Test different instruction phrasings

## Common Use Cases

### Code Refactoring
```javascript
// Original code in both message and prediction
const originalCode = `function add(a, b) { return a + b; }`;

// Instruction
"Rename function 'add' to 'sum'"

// Result: Fast response with high acceptance rate
```

### Template Modifications
```javascript
// Original template
const template = `<div class="container">...</div>`;

// Instruction  
"Change class 'container' to 'wrapper'"

// Result: Efficient prediction for small changes
```

### Error Corrections
```javascript
// Code with error
const buggyCode = `for(let i=0; i<10; i++); { console.log(i); }`;

// Instruction
"Fix the semicolon error in the for loop"

// Result: Quick correction with good prediction
```

## Testing Strategies

### Good Prediction Scenarios
Test with these types of changes:
- Variable/function name changes
- String value replacements
- Class/ID attribute updates
- Simple value modifications
- Comment additions/removals

### Expected Results
- **High acceptance** (>70%): Simple replacements
- **Medium acceptance** (40-70%): Structural changes
- **Low acceptance** (<40%): Complex transformations

### Performance Benchmarking
1. Measure response time with and without predictions
2. Calculate cost per request including rejected tokens
3. Monitor acceptance rates across different change types
4. Test with various temperature settings

## Debugging Guide

### Low Acceptance Rates
**Possible causes:**
- Temperature too high
- Predictions don't match actual changes needed
- Content too different from prediction
- Complex transformations requested

**Solutions:**
- Lower temperature (0.1-0.2)
- More precise instructions
- Better alignment between prediction and expected output
- Break complex changes into smaller steps

### Increased Latency
**Possible causes:**
- High rejection rates
- Large prediction content
- Network/service issues

**Solutions:**
- Monitor acceptance rates
- Optimize prediction content size
- Use for appropriate scenarios only

### Cost Increases
**Monitor these metrics:**
- Total tokens per request
- Rejection rate trends
- Cost per successful edit
- Performance vs. cost ratio

## Advanced Concepts

### Prediction Strategies
1. **Exact Copy**: Use identical content (best for small changes)
2. **Template Base**: Use similar structure (good for format changes)
3. **Partial Content**: Use most relevant sections only

### Multi-Step Predictions
For complex changes:
1. Break into smaller, predictable steps
2. Use results from previous step as next prediction
3. Chain predictions for complex transformations

### Content Type Optimization
- **Code**: Higher acceptance for syntax-preserving changes
- **JSON**: Good for value updates, poor for structure changes
- **Text**: Variable results depending on change type
- **HTML**: Efficient for attribute/class modifications

## Assessment Criteria

### Basic Implementation (60%)
- ✅ Correct API call structure with prediction parameter
- ✅ Proper message array formatting
- ✅ Basic error handling
- ✅ Display of modified content

### Performance Analysis (80%)
- ✅ Token usage metrics display
- ✅ Acceptance rate calculations
- ✅ Response time measurements
- ✅ Performance interpretation

### Optimization & Understanding (100%)
- ✅ Temperature optimization for different scenarios
- ✅ Cost vs. performance analysis
- ✅ Appropriate use case identification
- ✅ Advanced debugging and troubleshooting

## Resources
- [Azure OpenAI Predicted Outputs Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/predicted-outputs)
- [OpenAI Predicted Outputs Guide](https://platform.openai.com/docs/guides/predicted-outputs)
- [Performance Optimization Best Practices](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/performance)

## Next Steps
After completing this challenge:
1. Experiment with different content types and change complexity
2. Build real-time editing interfaces using predicted outputs
3. Create performance benchmarking tools
4. Integrate with code editors for autocomplete functionality
5. Develop cost optimization strategies for production use
