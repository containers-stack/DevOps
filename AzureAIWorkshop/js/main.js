// Main application controller
// This file manages the sidebar navigation and common HTML functionality

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
});

function initializeSidebar() {
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.sidebar ul li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const contentArea = document.getElementById('content-area');
            const responseArea = document.getElementById('response-area');
            
            if (responseArea) {
                responseArea.style.display = 'none';
            }
            
            contentArea.innerHTML = `<h2>You selected: ${item.textContent}</h2>`;

            // Create chat container
            const chatContainer = createChatContainer();
            contentArea.appendChild(chatContainer);

            // Initialize specific service based on selection
            const serviceName = item.textContent.toLowerCase();
            initializeService(serviceName, chatContainer);
        });
    });
}

function createChatContainer() {
    const chatContainer = document.createElement('div');
    chatContainer.classList.add('chat-container');

    const chatMessages = document.createElement('div');
    chatMessages.classList.add('chat-messages');
    chatContainer.appendChild(chatMessages);

    const chatInputContainer = document.createElement('div');
    chatInputContainer.classList.add('chat-input-container');

    const chatInput = document.createElement('input');
    chatInput.classList.add('chat-input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your message...';
    chatInputContainer.appendChild(chatInput);

    const sendBtn = document.createElement('button');
    sendBtn.classList.add('send-btn');
    sendBtn.textContent = 'Send';
    chatInputContainer.appendChild(sendBtn);

    chatContainer.appendChild(chatInputContainer);

    return chatContainer;
}

function initializeService(serviceName, chatContainer) {
    const chatMessages = chatContainer.querySelector('.chat-messages');
    const chatInput = chatContainer.querySelector('.chat-input');
    const sendBtn = chatContainer.querySelector('.send-btn');
    const chatInputContainer = chatContainer.querySelector('.chat-input-container');

    switch(serviceName) {
        case 'chat':
            if (typeof initializeChat === 'function') {
                initializeChat(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Chat', chatMessages);
            }
            break;
        case 'rag':
            if (typeof initializeRAG === 'function') {
                initializeRAG(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('RAG', chatMessages);
            }
            break;
        case 'function calling':
            if (typeof initializeFunctionCall === 'function') {
                initializeFunctionCall(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Function Calling', chatMessages);
            }
            break;
        case 'predicted outputs':
            if (typeof initializePredictedOutputs === 'function') {
                initializePredictedOutputs(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Predicted Outputs', chatMessages);
            }
            break;
        case 'vision':
            if (typeof initializeVisionChat === 'function') {
                initializeVisionChat(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Vision Chat', chatMessages);
            }
            break;
        case 'dalle':
            if (typeof initializeDalle === 'function') {
                initializeDalle(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('DALL-E', chatMessages);
            }
            break;
        case 'voice':
            if (typeof initializeVoice === 'function') {
                initializeVoice(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Voice', chatMessages);
            }
            break;
        case 'ocr':
            if (typeof initializeOCR === 'function') {
                initializeOCR(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('OCR', chatMessages);
            }
            break;
        case 'content understanding':
            if (typeof initializeContentUnderstanding === 'function') {
                initializeContentUnderstanding(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Content Understanding', chatMessages);
            }
            break;
        case 'agent':
            if (typeof initializeAgent === 'function') {
                initializeAgent(chatMessages, chatInput, sendBtn, chatInputContainer);
            } else {
                showModuleNotLoaded('Agent', chatMessages);
            }
            break;
        default:
            console.log('Service not implemented yet:', serviceName);
    }
}

function showModuleNotLoaded(moduleName, chatMessages) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');
    messageDiv.innerHTML = `
        <strong>${moduleName} Module</strong><br>
        To use this feature, please include the corresponding JavaScript file:<br>
        <code>&lt;script src="js/${moduleName.toLowerCase().replace(' ', '-')}.js"&gt;&lt;/script&gt;</code>
    `;
    chatMessages.appendChild(messageDiv);
}

// Utility functions
function addMessage(chatMessages, message, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = `${isUser ? 'User' : 'Bot'}: ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showThinking(chatMessages) {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'bot-message', 'thinking');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    thinkingDiv.appendChild(spinner);
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return thinkingDiv;
}

function hideThinking(chatMessages, thinkingDiv) {
    if (thinkingDiv && chatMessages.contains(thinkingDiv)) {
        chatMessages.removeChild(thinkingDiv);
    }
}
