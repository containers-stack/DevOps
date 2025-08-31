// SOLUTION: Vision Chat functionality with Azure OpenAI
// This is the complete implementation for instructor reference

// Vision chat conversation history
let VisionChatConversationHistory = [
    {
        role: "system",
        content: "You are a helpful AI assistant with vision capabilities. You can analyze images and provide detailed descriptions, answer questions about what you see, and help users understand visual content."
    }
];

function initializeVisionChat(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Add instruction message at start
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'bot-message');
    welcomeMessage.style.direction = 'ltr';
    welcomeMessage.innerHTML = `
        <strong>👁️ Vision Chat Demo</strong><br>
        Upload an image and ask questions about what you see!<br>
        <br>
        <strong>Try these examples:</strong><br>
        • "Describe this image in detail"<br>
        • "What objects can you see in this picture?"<br>
        • "What colors are prominent in this image?"<br>
        • "Can you read any text in this image?"<br>
        <br>
        <strong>How it works:</strong><br>
        1. Click "Choose Image" to upload a picture<br>
        2. Ask questions about the image<br>
        3. See how AI vision models understand visual content!
    `;
    chatMessages.appendChild(welcomeMessage);

    // Add image upload interface
    const uploadContainer = document.createElement('div');
    uploadContainer.style.cssText = 'margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;';
    
    const uploadLabel = document.createElement('label');
    uploadLabel.textContent = 'Upload an image: ';
    uploadLabel.style.fontWeight = 'bold';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.cssText = 'margin-left: 10px; padding: 5px;';
    
    const imagePreview = document.createElement('img');
    imagePreview.style.cssText = 'max-width: 300px; max-height: 200px; margin: 10px 0; display: none; border-radius: 5px; border: 2px solid #ddd;';
    
    const detailSelector = document.createElement('select');
    detailSelector.style.cssText = 'margin-left: 10px; padding: 5px; border-radius: 3px;';
    detailSelector.innerHTML = `
        <option value="auto">Auto Detail</option>
        <option value="low">Low Detail (faster, fewer tokens)</option>
        <option value="high">High Detail (slower, more tokens)</option>
    `;
    
    const detailLabel = document.createElement('label');
    detailLabel.textContent = 'Image Detail: ';
    detailLabel.style.cssText = 'margin-left: 20px; font-weight: bold;';
    
    uploadContainer.appendChild(uploadLabel);
    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(detailLabel);
    uploadContainer.appendChild(detailSelector);
    uploadContainer.appendChild(document.createElement('br'));
    uploadContainer.appendChild(imagePreview);
    
    chatMessages.appendChild(uploadContainer);

    // Store current image data
    let currentImageData = null;

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImageData = e.target.result;
                imagePreview.src = currentImageData;
                imagePreview.style.display = 'block';
                
                const imageMessage = document.createElement('div');
                imageMessage.classList.add('message', 'bot-message');
                imageMessage.innerHTML = `
                    <strong>Image uploaded successfully!</strong><br>
                    <em>Now you can ask questions about this image.</em>
                `;
                chatMessages.appendChild(imageMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            };
            reader.readAsDataURL(file);
        }
    });

    sendBtn.addEventListener('click', () => {
        if (!currentImageData) {
            addMessage(chatMessages, 'Please upload an image first.', false);
            return;
        }
        handleVisionChatMessage(chatMessages, chatInput, currentImageData, detailSelector.value);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!currentImageData) {
                addMessage(chatMessages, 'Please upload an image first.', false);
                return;
            }
            handleVisionChatMessage(chatMessages, chatInput, currentImageData, detailSelector.value);
        }
    });
}

async function handleVisionChatMessage(chatMessages, chatInput, imageData, detailLevel) {
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;

    // Add user message to conversation history
    VisionChatConversationHistory.push({
        role: "user",
        content: [
            {
                type: "text",
                text: messageText
            },
            {
                type: "image_url",
                image_url: {
                    url: imageData,
                    detail: detailLevel
                }
            }
        ]
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
        // Step 1: Create the payload for vision chat
        const payload = {
            messages: VisionChatConversationHistory,
            max_tokens: 500, // Important: Always set max_tokens for vision models
            temperature: 0.7,
            stream: false
        };

        console.log("Making vision chat API call with payload:", payload);

        // Step 2: Make the API call (same endpoint as regular chat)
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
        console.log("Vision chat response:", data);

        // Step 3: Process and display the response
        hideThinking(chatMessages, thinkingDiv);

        const responseMessage = data.choices[0].message;
        
        // Add AI response to conversation history
        VisionChatConversationHistory.push(responseMessage);

        // Display the AI's analysis
        const analysisMessage = document.createElement('div');
        analysisMessage.classList.add('message', 'bot-message');
        analysisMessage.innerHTML = `
            <strong>🤖 AI Vision Analysis:</strong><br>
            ${responseMessage.content}
        `;
        chatMessages.appendChild(analysisMessage);

        // Step 4: Display token usage information (optional - remove if not needed)
        // const usage = data.usage;
        // const tokenMessage = document.createElement('div');
        // tokenMessage.classList.add('message', 'bot-message');
        // tokenMessage.style.background = '#e8f4f8';
        // tokenMessage.innerHTML = `
        //     <strong>📊 Token Usage:</strong><br>
        //     <strong>Prompt Tokens:</strong> ${usage.prompt_tokens} (includes image processing)<br>
        //     <strong>Completion Tokens:</strong> ${usage.completion_tokens}<br>
        //     <strong>Total Tokens:</strong> ${usage.total_tokens}<br>
        //     <br>
        //     <em>💡 Vision models process images as tokens. Higher detail levels use more tokens but provide better analysis.</em>
        // `;
        // chatMessages.appendChild(tokenMessage);

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Vision chat error:', error);
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Error: ${error.message}`, false);
    }
}
