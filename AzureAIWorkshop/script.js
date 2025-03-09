document.querySelectorAll('.sidebar ul li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar ul li').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const contentArea = document.getElementById('content-area');
        contentArea.textContent = `You selected: ${item.textContent}`;
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        const chatContainer = document.getElementById('chat-container');
        chatContainer.classList.remove('hidden');
    });
});

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', () => {
    const messageText = chatInput.value.trim();
    if (messageText) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.textContent = messageText;
        chatMessages.appendChild(messageDiv);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show thinking animation
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('message', 'bot-message', 'thinking');
        thinkingDiv.textContent = 'Bot is thinking...';
        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Automatic bot reply
        setTimeout(() => {
            chatMessages.removeChild(thinkingDiv);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.classList.add('message', 'bot-message');
            botMessageDiv.textContent = `Bot: I received your message: "${messageText}"`;
            chatMessages.appendChild(botMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 5000); // 1 second delay for bot reply
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});
