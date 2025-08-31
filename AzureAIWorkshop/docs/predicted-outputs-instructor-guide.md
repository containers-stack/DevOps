# Predicted Outputs Challenge - Instructor Guide

## Overview
The Predicted Outputs challenge introduces students to Azure OpenAI's latest performance optimization feature. This hands-on exercise demonstrates how to reduce response latency for scenarios where most of the expected response content is already known, particularly valuable for code editing and refactoring tasks.

## Learning Objectives
Students will learn to:
- Understand the performance benefits and cost trade-offs of predicted outputs
- Implement the prediction parameter correctly in API requests
- Analyze prediction acceptance rates and optimize for better performance
- Identify appropriate use cases for predicted outputs
- Debug and optimize prediction performance

## Challenge Structure

### Files Provided to Students
- `js/predicted-outputs.js` - Challenge template with comprehensive TODO instructions
- `docs/predicted-outputs-challenge.md` - Detailed documentation and concepts
- Interactive code example selector with preset scenarios

### Solution Files for Instructors
- `solutions/predicted-outputs-solution.js` - Complete working implementation with metrics

## Key Concepts to Emphasize

### 1. Performance vs. Cost Trade-off
This is the most important concept students must understand:
- **Accepted prediction tokens** → Faster responses, potential cost savings
- **Rejected prediction tokens** → Same cost as new tokens, possible latency increase
- **Net effect** → Could increase or decrease total cost depending on acceptance rate

### 2. When to Use Predicted Outputs
**Ideal scenarios:**
- Code refactoring with minor changes (variable names, string values)
- Autocomplete and real-time editing features
- Template modifications with small updates
- Error correction and syntax fixes

**Poor fit scenarios:**
- Creative writing or unpredictable content generation
- Major structural changes or complete rewrites
- Function calling or audio processing (not supported)
- Scenarios with high uncertainty about output structure

### 3. The Prediction Parameter Structure
Students must understand this exact format:
```javascript
prediction: {
    type: "content",
    content: originalCode // Usually identical to the content being modified
}
```

## Implementation Guidance

### Step 1: Message Array Structure
Guide students to structure messages correctly:
```javascript
messages: [
    {
        role: "user",
        content: "Clear, specific instruction about the change"
    },
    {
        role: "user", 
        content: "The original content to be modified"
    }
]
```

**Common mistakes:**
- Putting instruction and content in single message
- Using system role for instructions
- Unclear or overly complex instructions

### Step 2: Prediction Parameter Setup
Emphasize that prediction content should typically match the original content:
```javascript
prediction: {
    type: "content",
    content: selectedCode // Same as in the second message
}
```

**Teaching tip:** Explain that the prediction is what the model "expects" the response to look like, which is usually very similar to the original.

### Step 3: Optimization Parameters
Teach students these settings for better prediction performance:
- `temperature: 0.1` - Lower temperature improves prediction accuracy
- `stream: false` - Predicted outputs work better without streaming
- `max_tokens: 800` - Reasonable limit for code modifications

### Step 4: Metrics Analysis
Students should analyze these key metrics:
```javascript
const acceptedTokens = completionDetails.accepted_prediction_tokens;
const rejectedTokens = completionDetails.rejected_prediction_tokens;
const acceptanceRate = (acceptedTokens / (acceptedTokens + rejectedTokens)) * 100;
```

## Testing Scenarios and Expected Outcomes

### High Success Rate Scenarios (>70% acceptance)
1. **Simple string replacement**: "Change FizzBuzz to MSFTBuzz"
   - Expected: 80-90% acceptance rate
   - Fast response time

2. **Variable name changes**: "Rename variable 'operation' to 'op'"
   - Expected: 70-85% acceptance rate
   - Good performance improvement

### Medium Success Rate Scenarios (40-70% acceptance)
1. **Logic modifications**: "Change the condition from % 3 to % 4"
   - Expected: 50-70% acceptance rate
   - Moderate performance gain

2. **Structure changes**: "Add error handling to the function"
   - Expected: 40-60% acceptance rate
   - Variable performance benefit

### Low Success Rate Scenarios (<40% acceptance)
1. **Complete rewrites**: "Convert this to use async/await"
   - Expected: 20-40% acceptance rate
   - May increase latency and cost

2. **Creative additions**: "Add detailed comments explaining each step"
   - Expected: 10-30% acceptance rate
   - Likely performance penalty

## Common Student Questions and Answers

### Q: "Why are my prediction tokens being rejected?"
**A:** Common causes:
- Temperature too high (try 0.1-0.2)
- Instruction too vague or complex
- Requested changes too different from prediction
- Model deciding different approach is better

### Q: "When does this actually improve performance?"
**A:** Best performance when:
- Acceptance rate >70%
- Simple, predictable changes
- Large amount of unchanged content
- Clear, specific instructions

### Q: "Can I use this with function calling?"
**A:** No, predicted outputs cannot be combined with:
- Function calling/tools
- Audio inputs/outputs  
- Streaming responses
- Multiple completion choices (n>1)

### Q: "How do I optimize for cost?"
**A:** Monitor these metrics:
- Acceptance rate (higher = better cost efficiency)
- Total tokens per request
- Response time improvements
- Use only for appropriate scenarios

## Debugging Common Issues

### Issue 1: Low Acceptance Rates
**Symptoms:** <40% accepted_prediction_tokens
**Diagnosis steps:**
1. Check temperature (should be 0.1-0.3)
2. Review instruction clarity
3. Ensure prediction matches expected output format
4. Verify change complexity is appropriate

**Solutions:**
- Lower temperature
- Simplify instructions
- Use more specific, targeted changes
- Break complex changes into steps

### Issue 2: Increased Response Time
**Symptoms:** Slower responses than without predictions
**Diagnosis steps:**
1. Check rejection rate (high rejections = slower)
2. Verify prediction content size
3. Monitor total token usage

**Solutions:**
- Optimize for higher acceptance rates
- Reduce prediction content size
- Use only for appropriate scenarios

### Issue 3: API Errors
**Common errors:**
- `prediction parameter not supported` → Check API version (needs 2025-01-01-preview+)
- `model not supported` → Verify model supports predicted outputs
- `incompatible parameters` → Check for unsupported feature combinations

## Assessment Rubric

### Basic Implementation (60%)
- ✅ Correct API request structure with prediction parameter
- ✅ Proper messages array formatting with instruction + content
- ✅ Basic response handling and display
- ✅ Error handling for API failures

### Performance Analysis (80%)
- ✅ Token usage metrics extraction and display
- ✅ Acceptance rate calculations and interpretation
- ✅ Response time measurements
- ✅ Understanding of cost implications

### Advanced Understanding (100%)
- ✅ Temperature optimization for different scenarios
- ✅ Appropriate use case identification
- ✅ Performance vs. cost trade-off analysis
- ✅ Debugging skills for low acceptance rates
- ✅ Strategic application of predicted outputs

## Demonstration Flow

### Opening (10 minutes)
1. Explain the concept and motivation
2. Show the performance benefits demo
3. Discuss cost vs. speed trade-offs
4. Preview the interactive examples

### Hands-on Implementation (45 minutes)
1. **Simple replacement** (15 min): FizzBuzz → MSFTBuzz
2. **Function modification** (15 min): Calculator operation names
3. **Data structure updates** (15 min): Todo list status changes

### Analysis and Discussion (20 minutes)
1. Review acceptance rates across different scenarios
2. Discuss when to use vs. avoid predicted outputs
3. Explore cost optimization strategies
4. Q&A and troubleshooting

### Advanced Extensions (10 minutes)
1. Temperature optimization experiments
2. Complex change scenarios
3. Real-world application ideas

## Extension Activities

### For Advanced Students
1. **Performance benchmarking**: Create tools to measure latency improvements
2. **Cost analysis**: Build calculators for cost vs. performance trade-offs
3. **Real-time integration**: Implement in code editor-like interface
4. **A/B testing**: Compare with and without predicted outputs
5. **Content type optimization**: Test different content types and change patterns

### Integration Ideas
- Combine with code generation for autocomplete features
- Build real-time collaboration tools
- Create AI-assisted code refactoring utilities
- Develop template customization systems

## Troubleshooting Guide

### Student Code Not Working
1. **Check API version**: Must be 2025-01-01-preview or later
2. **Verify model support**: Ensure using supported model version
3. **Validate payload structure**: Check prediction parameter format
4. **Review error messages**: Common issues with unsupported feature combinations

### Poor Performance Results
1. **Monitor acceptance rates**: Should be >50% for good performance
2. **Check temperature settings**: Lower values often work better
3. **Review instruction clarity**: Vague instructions lead to poor predictions
4. **Assess change complexity**: Simple changes work better

### Cost Concerns
1. **Track token usage trends**: Monitor rejected prediction tokens
2. **Calculate ROI**: Compare performance gains vs. cost increases
3. **Optimize scenarios**: Use only where acceptance rates are high
4. **Set usage limits**: Prevent runaway costs during experimentation

## Resources for Students
- [Azure OpenAI Predicted Outputs Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/predicted-outputs)
- [Performance Optimization Guide](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/performance)
- [API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
- [Workshop Documentation](docs/predicted-outputs-challenge.md)

## Timeline Recommendation
- **Concept Introduction**: 10 minutes
- **Implementation**: 45 minutes
- **Testing & Analysis**: 20 minutes
- **Discussion & Q&A**: 15 minutes
- **Advanced Exploration**: 10 minutes
- **Total**: 100 minutes

This challenge provides excellent hands-on experience with cutting-edge AI optimization techniques while teaching important cost-performance analysis skills!
