// Chat Management System
class ChatManager {
    constructor() {
        this.chatBox = document.getElementById('chatBox');
        this.chatToggle = document.getElementById('chatToggle');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendMessageBtn');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.contentArea = document.getElementById('contentArea');
        
        this.currentChatId = null;
        this.isOpen = false;
        this.messageListeners = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Chat toggle button
        this.chatToggle.addEventListener('click', () => {
            this.openChat();
        });

        // Close chat button
        this.closeChatBtn.addEventListener('click', () => {
            this.closeChat();
        });

        // Send message button
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Prevent chat box from closing when clicking inside
        this.chatBox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async openChat() {
        if (!authManager.isUserLoggedIn()) {
            authManager.showError('Please login to use chat');
            return;
        }

        this.isOpen = true;
        this.chatBox.classList.add('open');
        this.contentArea.classList.add('chat-open');
        
        // Initialize chat session
        await this.initializeChatSession();
        
        // Start listening for new messages
        this.startMessageListener();
        
        // Focus on input
        this.messageInput.focus();
    }

    closeChat() {
        this.isOpen = false;
        this.chatBox.classList.remove('open');
        this.contentArea.classList.remove('chat-open');
        
        // Clear user's chat messages when closing
        this.clearUserChat();
        
        // Stop listening for messages
        this.stopMessageListener();
    }

    async initializeChatSession() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        this.currentChatId = `chat_${user.uid}`;
        
        // Clear messages display (user won't see old messages)
        this.chatMessages.innerHTML = '';
        
        // Update user's last active time
        await database.ref(`chats/${this.currentChatId}/userActive`).set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: 'online'
        });
    }

    startMessageListener() {
        if (!this.currentChatId) return;

        // Listen for new messages sent after chat was opened
        const now = Date.now();
        const messagesRef = database.ref(`chats/${this.currentChatId}/messages`)
            .orderByChild('timestamp')
            .startAt(now);

        const listener = messagesRef.on('child_added', (snapshot) => {
            const message = snapshot.val();
            if (message && message.timestamp > now) {
                this.displayMessage(message, snapshot.key);
                this.markMessageAsSeen(snapshot.key);
            }
        });

        this.messageListeners.push({
            ref: messagesRef,
            listener: listener
        });
    }

    stopMessageListener() {
        this.messageListeners.forEach(({ ref, listener }) => {
            ref.off('child_added', listener);
        });
        this.messageListeners = [];
    }

    async sendMessage() {
        const messageText = this.messageInput.value.trim();
        if (!messageText || !this.currentChatId) return;

        const user = authManager.getCurrentUser();
        if (!user) return;

        // Get user data to include username
        const userData = await authManager.getUserData(user.uid);
        const username = userData?.username || 'Unknown User';

        const messageData = {
            text: messageText,
            senderId: user.uid,
            senderEmail: user.email,
            senderUsername: username,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            type: 'user',
            status: 'sent'
        };

        try {
            // Send message to database
            const messageRef = await database.ref(`chats/${this.currentChatId}/messages`).push(messageData);
            
            // Update chat metadata
            await database.ref(`chats/${this.currentChatId}/lastMessage`).set({
                text: messageText,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                senderId: user.uid,
                senderUsername: username
            });

            // Update user message count
            await database.ref(`users/${user.uid}/messagesCount`).transaction((count) => {
                return (count || 0) + 1;
            });

            // Clear input
            this.messageInput.value = '';
            
            // Don't display immediately - let the listener handle it to avoid duplicates

        } catch (error) {
            console.error('Error sending message:', error);
            authManager.showError('Failed to send message');
        }
    }

    displayMessage(message, messageId) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.dataset.messageId = messageId;

        const time = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        let statusIcon = '';
        if (message.type === 'user') {
            if (message.status === 'seen') {
                statusIcon = '<i class="fas fa-check-double status-seen"></i>';
            } else {
                statusIcon = '<i class="fas fa-check status-sent"></i>';
            }
        }

        // Show username for admin messages
        const messageHeader = message.type === 'admin' ? 
            `<div class="message-sender">Admin</div>` : '';

        messageElement.innerHTML = `
            ${messageHeader}
            <div class="message-text">${this.escapeHtml(message.text)}</div>
            <div class="message-time">
                ${time}
                <span class="message-status">${statusIcon}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    async markMessageAsSeen(messageId) {
        if (!this.currentChatId) return;

        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            // Mark message as seen if it's from admin
            const messageSnapshot = await database.ref(`chats/${this.currentChatId}/messages/${messageId}`).once('value');
            const message = messageSnapshot.val();
            
            if (message && message.type === 'admin') {
                await database.ref(`chats/${this.currentChatId}/messages/${messageId}/status`).set('seen');
            }
        } catch (error) {
            console.error('Error marking message as seen:', error);
        }
    }

    async clearUserChat() {
        if (!this.currentChatId) return;

        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            // Update user status to offline
            await database.ref(`chats/${this.currentChatId}/userActive`).set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                status: 'offline'
            });

            // Clear messages from user's view (but keep in database for admin)
            this.chatMessages.innerHTML = '';
            
        } catch (error) {
            console.error('Error clearing user chat:', error);
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Admin-specific methods
    async getAdminChats() {
        if (!authManager.isUserAdmin()) return [];

        try {
            const snapshot = await database.ref('chats').once('value');
            const chats = snapshot.val() || {};
            
            const chatList = [];
            for (const [chatId, chatData] of Object.entries(chats)) {
                if (chatData.lastMessage) {
                    const userId = chatId.replace('chat_', '');
                    const userInfo = await authManager.getUserData(userId);
                    
                    chatList.push({
                        id: chatId,
                        ...chatData,
                        userEmail: this.extractEmailFromChatId(chatId),
                        userName: userInfo?.username || userInfo?.email || 'Unknown User'
                    });
                }
            }
            
            return chatList.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
        } catch (error) {
            console.error('Error getting admin chats:', error);
            return [];
        }
    }

    async sendAdminMessage(chatId, messageText) {
        if (!authManager.isUserAdmin() || !messageText.trim()) return;

        const admin = authManager.getCurrentUser();
        if (!admin) return;

        const messageData = {
            text: messageText.trim(),
            senderId: admin.uid,
            senderEmail: admin.email,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            type: 'admin',
            status: 'sent'
        };

        try {
            await database.ref(`chats/${chatId}/messages`).push(messageData);
            
            await database.ref(`chats/${chatId}/lastMessage`).set({
                text: messageText.trim(),
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                senderId: admin.uid
            });

            return true;
        } catch (error) {
            console.error('Error sending admin message:', error);
            return false;
        }
    }

    async getChatMessages(chatId) {
        if (!authManager.isUserAdmin()) return [];

        try {
            const snapshot = await database.ref(`chats/${chatId}/messages`).once('value');
            const messages = snapshot.val() || {};
            
            return Object.entries(messages).map(([id, message]) => ({
                id,
                ...message
            })).sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error('Error getting chat messages:', error);
            return [];
        }
    }

    async deleteMessage(chatId, messageId) {
        if (!authManager.isUserAdmin()) return false;

        try {
            await database.ref(`chats/${chatId}/messages/${messageId}`).remove();
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    extractEmailFromChatId(chatId) {
        // Extract user ID from chat ID and get email from users table
        const userId = chatId.replace('chat_', '');
        // This would require a lookup to users table in a real implementation
        return `User ${userId.substring(0, 8)}...`;
    }

    // Utility method to check if user is in chat
    isUserInChat(chatId) {
        return this.currentChatId === chatId && this.isOpen;
    }
}

// Initialize chat manager
const chatManager = new ChatManager();

// Export for use in other files
window.chatManager = chatManager;
