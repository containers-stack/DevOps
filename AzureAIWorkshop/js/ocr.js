// OCR functionality with Azure Document Intelligence
// This file handles image upload and text extraction from documents

function initializeOCR(chatMessages, chatInput, sendBtn, chatInputContainer) {
    // Hide default chat input for file upload interface
    chatInput.style.display = 'none';
    sendBtn.style.display = 'none';

    // Create file input (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    chatInputContainer.appendChild(fileInput);

    // Create upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.classList.add('upload-btn', 'center');
    uploadBtn.textContent = 'Upload File';
    chatInputContainer.appendChild(uploadBtn);

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        handleFileUpload(fileInput, chatMessages, chatInputContainer);
    });
}

function handleFileUpload(fileInput, chatMessages, chatInputContainer) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
        // Remove previous file preview if exists
        const previousFile = document.getElementById('file-ocr');
        if (previousFile) {
            chatMessages.removeChild(previousFile);
            const confirmBtn = document.querySelector('.confirm-btn');
            if (confirmBtn) {
                chatInputContainer.removeChild(confirmBtn);
            }
        }

        // Display image preview
        const img = document.createElement('img');
        img.id = 'file-ocr';
        img.src = reader.result;
        img.style.width = '50%';
        img.style.height = '50%';
        img.alt = 'Uploaded image for OCR';
        chatMessages.appendChild(img);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Create confirmation button
        const confirmBtn = document.createElement('button');
        confirmBtn.classList.add('confirm-btn', 'center');
        confirmBtn.textContent = 'Start Analysis';
        chatInputContainer.appendChild(confirmBtn);

        confirmBtn.addEventListener('click', () => {
            startOCRAnalysis(reader.result, img, confirmBtn, chatMessages);
        });
    };
}

function startOCRAnalysis(imageData, img, confirmBtn, chatMessages) {
    // Validate configuration before making API call
    const configValidation = validateService('documentIntelligence');
    if (!configValidation.isValid) {
        addMessage(chatMessages, `Configuration Error: ${configValidation.issues.join(', ')}`, false);
        return;
    }

    // Hide preview and button
    img.style.display = 'none';
    confirmBtn.style.display = 'none';

    // Show thinking animation
    const thinkingDiv = showThinking(chatMessages);

    // Prepare payload for Azure Document Intelligence
    const bodyContent = JSON.stringify({
        "base64Source": imageData.split(',')[1]
    });

    // Call Azure Document Intelligence API
    fetch('<YOUR_ENDPOINT>', {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>',
            'Content-Type': 'application/json'
        },
        body: bodyContent
    })
    .then(response => {
        const operationLocation = response.headers.get('operation-location');
        return pollForResults(operationLocation, chatMessages, thinkingDiv);
    })
    .catch(error => {
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Sorry, there was an error processing your request. ${error}`, false);
    });
}

function pollForResults(operationLocation, chatMessages, thinkingDiv) {
    // First check
    fetch(operationLocation, {
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        if (response.status === 'running') {
            // Wait and check again
            setTimeout(() => {
                fetch(operationLocation, {
                    method: 'GET',
                    headers: {
                        'Ocp-Apim-Subscription-Key': '<YOUR_SUBSCRIPTION_KEY>'
                    }
                })
                .then(response => response.json())
                .then(operationData => {
                    hideThinking(chatMessages, thinkingDiv);
                    
                    if (operationData.status === 'succeeded') {
                        displayOCRResults(operationData, chatMessages);
                    } else {
                        addMessage(chatMessages, 'OCR analysis failed. Please try again.', false);
                    }
                })
                .catch(error => {
                    hideThinking(chatMessages, thinkingDiv);
                    addMessage(chatMessages, `Error checking results: ${error}`, false);
                });
            }, 5000);
        } else if (response.status === 'succeeded') {
            hideThinking(chatMessages, thinkingDiv);
            displayOCRResults(response, chatMessages);
        }
    })
    .catch(error => {
        hideThinking(chatMessages, thinkingDiv);
        addMessage(chatMessages, `Error polling results: ${error}`, false);
    });
}

function displayOCRResults(results, chatMessages) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');
    botMessageDiv.innerHTML = `<strong>OCR Analysis Results:</strong><br>${JSON.stringify(results, null, 2)}`;
    chatMessages.appendChild(botMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
