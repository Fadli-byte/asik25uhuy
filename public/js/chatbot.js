const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const closeBtn = document.getElementById('close-btn');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('chatbot-messages');

// Toggle chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    userInput.focus();
});

closeBtn.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
});

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Display user message
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Disable send button
    sendBtn.disabled = true;
    
    try {
        // Send to backend
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else if (data.error) {
            addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'bot');
        }
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage('Koneksi bermasalah. Silakan cek internet Anda.', 'bot');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messagePara = document.createElement('p');
    messagePara.textContent = text;
    
    messageDiv.appendChild(messagePara);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(typingContent);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return typingDiv;
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Close chatbot when clicking outside
document.addEventListener('click', (e) => {
    if (!chatbotContainer.contains(e.target) && !chatbotToggle.contains(e.target)) {
        chatbotContainer.classList.remove('active');
    }
});
