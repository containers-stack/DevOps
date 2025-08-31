// Vision Chat functionality with Azure OpenAI
// This file handles vision-enabled chat to analyze images with AI

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

function handleVisionChatMessage(chatMessages, chatInput, imageData, detailLevel) {
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

    // TODO: Implement Vision Chat with Azure OpenAI
    // INSTRUCTIONS FOR STUDENTS:
    // 1. Create the payload JSON object with:
    //    - messages: VisionChatConversationHistory (includes text and image)
    //    - max_tokens: 500 (important for vision models!)
    //    - temperature: 0.7
    //    - stream: false (for simplicity)
    //
    // 2. Understanding the message structure:
    //    - role: "user"
    //    - content: Array with text and image_url objects
    //    - image_url contains url (base64 data) and detail level
    //
    // 3. Make API call to Azure OpenAI vision endpoint
    //    - Same chat/completions endpoint as regular chat
    //    - Vision models automatically detect image content
    //
    // 4. Handle the response and display the AI's analysis
    // 5. Add AI response back to conversation history for context
    //
    // Key concepts:
    // - Vision models can analyze images and answer questions
    // - Detail levels: "low" (faster), "high" (detailed), "auto" (automatic)
    // - Images count toward token usage (especially with "high" detail)
    // - max_tokens is crucial - without it, responses may be cut off

    // TEMPORARY: Remove this placeholder after implementing vision chat
    setTimeout(() => {
        hideThinking(chatMessages, thinkingDiv);
        const instructionMessage = document.createElement('div');
        instructionMessage.classList.add('message', 'bot-message');
        instructionMessage.style.direction = 'ltr';
        instructionMessage.innerHTML = `
            <strong>🎯 Your Task: Implement Azure OpenAI Vision Chat</strong><br><br>
            
            <strong>📚 Documentation:</strong><br>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/gpt-with-vision" target="_blank">
                Azure OpenAI Vision Chat Guide
            </a><br><br>
            
            <strong>📋 What makes Vision Chat special:</strong><br>
            • AI can analyze and describe images in detail<br>
            • Supports questions about visual content<br>
            • Can read text within images (OCR capabilities)<br>
            • Understands objects, scenes, colors, and more<br><br>
            
            <strong>🔧 Implementation Steps:</strong><br>
            1. Use VisionChatConversationHistory for messages<br>
            2. Set max_tokens: 500 (required for vision models)<br>
            3. Make API call to same chat/completions endpoint<br>
            4. Display AI's image analysis response<br>
            5. Add response to conversation for context<br><br>
            
            <strong>✅ Expected Result:</strong><br>
            When complete, you should be able to:<br>
            • Upload images and get detailed descriptions<br>
            • Ask specific questions about image content<br>
            • See AI identify objects, colors, text, and scenes<br>
            • Have contextual conversations about images<br><br>
            
            <strong>💡 Tips:</strong><br>
            • Always set max_tokens for vision models (default may cut off)<br>
            • "high" detail uses more tokens but gives better analysis<br>
            • Images are sent as base64 data URLs<br>
            • Same endpoint as regular chat - vision is auto-detected<br><br>
            
            <strong>📝 Message Structure:</strong><br>
            • content: [{ type: "text", text: "question" }, { type: "image_url", image_url: { url: "data:...", detail: "auto" } }]<br>
            • AI automatically processes both text and image<br><br>
            
            <strong>⚠️ Important Notes:</strong><br>
            • Requires vision-enabled model (gpt-4o, gpt-4-turbo, etc.)<br>
            • Images count toward token limits<br>
            • 10 image limit per request<br>
            • Supported formats: PNG, JPEG, GIF, WebP<br><br>
            
            <em>Remove the setTimeout placeholder code when you start implementing.</em>
        `;
        chatMessages.appendChild(instructionMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}
