// Common utility functions for all Azure AI Workshop modules
// This file contains shared functionality used across different modules

// Utility function to add a message to the chat
function addMessage(chatMessages, message, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = `${isUser ? 'User' : 'Bot'}: ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Utility function to show thinking/loading animation
function showThinking(chatMessages) {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'bot-message', 'thinking');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    spinner.innerHTML = '⏳'; // You can replace with CSS spinner
    thinkingDiv.appendChild(spinner);
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return thinkingDiv;
}

// Utility function to hide thinking animation
function hideThinking(chatMessages, thinkingDiv) {
    if (thinkingDiv && chatMessages.contains(thinkingDiv)) {
        chatMessages.removeChild(thinkingDiv);
    }
}

// Utility function to scroll chat to bottom
function scrollToBottom(chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility function to clear chat messages
function clearChat(chatMessages) {
    chatMessages.innerHTML = '';
}

// Utility function to validate Azure endpoint and key
function validateAzureConfig(endpoint, key) {
    if (!endpoint || endpoint.includes('<YOUR_ENDPOINT>')) {
        return { valid: false, message: 'Please configure your Azure endpoint' };
    }
    if (!key || key.includes('<YOUR_API_KEY>') || key.includes('<YOUR_SUBSCRIPTION_KEY>')) {
        return { valid: false, message: 'Please configure your Azure API key' };
    }
    return { valid: true };
}

// Utility function to handle common fetch errors
function handleFetchError(error, chatMessages, thinkingDiv = null) {
    if (thinkingDiv) {
        hideThinking(chatMessages, thinkingDiv);
    }
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and Azure endpoints.';
    } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please check your Azure API keys.';
    } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
    }
    
    addMessage(chatMessages, errorMessage, false);
    console.error('Detailed error:', error);
}

// Utility function to format JSON for display
function formatJSON(obj, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth) {
        return '[Object too deep]';
    }
    
    try {
        return JSON.stringify(obj, null, 2).substring(0, 1000) + 
               (JSON.stringify(obj).length > 1000 ? '...[truncated]' : '');
    } catch (e) {
        return '[Invalid JSON]';
    }
}

// Utility function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
