// Admin Panel Management
class AdminManager {
    constructor() {
        this.subjects = [];
        this.materials = [];
        this.currentTab = 'materials';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.loadDashboardStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Add subject form
        document.getElementById('addSubjectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubject();
        });

        // Add material form
        document.getElementById('addMaterialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMaterial();
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load data for the selected tab
        this.loadTabData(tabName);
    }

    showAdminPanel() {
        // Show dashboard by default
        this.switchTab('dashboard');
        this.loadDashboardStats();
        this.loadAdminChats();
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardStats();
                this.loadAdminChats();
                break;
            case 'materials':
                this.loadMaterials();
                break;
            case 'subjects':
                this.loadSubjects();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    async loadDashboardStats() {
        try {
            // Update stats cards
            document.getElementById('totalMaterials').textContent = this.materials.length;
            document.getElementById('totalSubjects').textContent = this.subjects.length;
            
            // Load user count
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            document.getElementById('totalUsers').textContent = Object.keys(users).length;
            
            // Load chat count
            const chatsSnapshot = await database.ref('chats').once('value');
            const chats = chatsSnapshot.val() || {};
            document.getElementById('activeChats').textContent = Object.keys(chats).length;
            
            // Load recent activity
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    async loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        
        try {
            // Combine recent materials and subjects
            const recentItems = [
                ...this.materials.slice(-5).map(item => ({
                    type: 'material',
                    title: item.title,
                    time: item.createdAt,
                    icon: 'fas fa-file'
                })),
                ...this.subjects.slice(-5).map(item => ({
                    type: 'subject',
                    title: item.name,
                    time: item.createdAt,
                    icon: 'fas fa-book'
                }))
            ].sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 10);
            
            if (recentItems.length === 0) {
                activityContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <h3>No Recent Activity</h3>
                        <p>Recent additions will appear here.</p>
                    </div>
                `;
                return;
            }
            
            activityContainer.innerHTML = recentItems.map(item => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${this.escapeHtml(item.title)}</h4>
                        <p>Added ${item.type} • ${this.formatTime(item.time)}</p>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Activity</h3>
                    <p>Unable to load recent activity.</p>
                </div>
            `;
        }
    }

    async loadData() {
        await this.loadSubjects();
        await this.loadMaterials();
        this.populateSubjectDropdown();
    }

    async loadSubjects() {
        try {
            const snapshot = await database.ref('subjects').once('value');
            const subjectsData = snapshot.val() || {};
            
            this.subjects = Object.entries(subjectsData).map(([id, subject]) => ({
                id,
                ...subject
            }));
            
            this.displaySubjects();
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    async loadMaterials() {
        try {
            const snapshot = await database.ref('materials').once('value');
            const materialsData = snapshot.val() || {};
            
            this.materials = Object.entries(materialsData).map(([id, material]) => ({
                id,
                ...material
            }));
            
            this.displayMaterials();
        } catch (error) {
            console.error('Error loading materials:', error);
        }
    }

    populateSubjectDropdown() {
        const dropdown = document.getElementById('materialSubject');
        dropdown.innerHTML = '<option value="">Select Subject</option>';
        
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            dropdown.appendChild(option);
        });
    }

    async addSubject() {
        const name = document.getElementById('subjectName').value.trim();
        const description = document.getElementById('subjectDescription').value.trim();
        
        if (!name || !description) {
            authManager.showError('Please fill in all fields');
            return;
        }

        if (!authManager.isUserAdmin()) {
            authManager.showError('Admin access required');
            return;
        }

        authManager.showLoading(true);

        try {
            const subjectData = {
                name,
                description,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: authManager.getCurrentUser().uid
            };

            await database.ref('subjects').push(subjectData);
            
            authManager.showSuccess('Subject added successfully!');
            document.getElementById('addSubjectForm').reset();
            
            await this.loadSubjects();
            this.populateSubjectDropdown();
            
        } catch (error) {
            console.error('Error adding subject:', error);
            authManager.showError('Failed to add subject');
        } finally {
            authManager.showLoading(false);
        }
    }

    async addMaterial() {
        const subjectId = document.getElementById('materialSubject').value;
        const title = document.getElementById('materialTitle').value.trim();
        const url = document.getElementById('materialUrl').value.trim();
        const type = document.getElementById('materialType').value;
        
        if (!subjectId || !title || !url || !type) {
            authManager.showError('Please fill in all fields');
            return;
        }

        if (!authManager.isUserAdmin()) {
            authManager.showError('Admin access required');
            return;
        }

        // Validate URL format (should be GitHub link)
        if (!this.isValidGitHubUrl(url)) {
            authManager.showError('Please provide a valid GitHub URL');
            return;
        }

        authManager.showLoading(true);

        try {
            const materialData = {
                title,
                url,
                type,
                subjectId,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: authManager.getCurrentUser().uid
            };

            await database.ref('materials').push(materialData);
            
            authManager.showSuccess('Material added successfully!');
            document.getElementById('addMaterialForm').reset();
            
            await this.loadMaterials();
            
        } catch (error) {
            console.error('Error adding material:', error);
            authManager.showError('Failed to add material');
        } finally {
            authManager.showLoading(false);
        }
    }

    displaySubjects() {
        const subjectsList = document.getElementById('subjectsList');
        if (!subjectsList) return;

        if (this.subjects.length === 0) {
            subjectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Subjects Added</h3>
                    <p>Start by adding your first subject above.</p>
                </div>
            `;
            return;
        }

        subjectsList.innerHTML = this.subjects.map(subject => `
            <div class="material-item">
                <div class="material-item-header">
                    <span class="material-type-badge">Subject</span>
                </div>
                <div class="material-item-content">
                    <div class="material-info">
                        <h4>${this.escapeHtml(subject.name)}</h4>
                        <p><i class="fas fa-align-left"></i> ${this.escapeHtml(subject.description)}</p>
                        <p><i class="fas fa-clock"></i> Created ${this.formatTime(subject.createdAt)}</p>
                    </div>
                    <div class="material-actions">
                        <button class="action-btn edit-btn" onclick="adminManager.editSubject('${subject.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="adminManager.deleteSubject('${subject.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayMaterials() {
        const materialsList = document.getElementById('materialsList');
        if (!materialsList) return;

        if (this.materials.length === 0) {
            materialsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Materials Added</h3>
                    <p>Start by adding your first study material above.</p>
                </div>
            `;
            return;
        }

        materialsList.innerHTML = this.materials.map(material => {
            const subject = this.subjects.find(s => s.id === material.subjectId);
            const subjectName = subject ? subject.name : 'Unknown Subject';
            
            return `
                <div class="material-item">
                    <div class="material-item-header">
                        <span class="material-type-badge">${this.escapeHtml(material.type.toUpperCase())}</span>
                    </div>
                    <div class="material-item-content">
                        <div class="material-info">
                            <h4>${this.escapeHtml(material.title)}</h4>
                            <p><i class="fas fa-book"></i> Subject: ${this.escapeHtml(subjectName)}</p>
                            <p><i class="fas fa-link"></i> <a href="${material.url}" target="_blank">View File</a></p>
                            <p><i class="fas fa-clock"></i> Added ${this.formatTime(material.createdAt)}</p>
                        </div>
                        <div class="material-actions">
                            <button class="action-btn view-btn" onclick="window.open('${material.url}', '_blank')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="action-btn edit-btn" onclick="adminManager.editMaterial('${material.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" onclick="adminManager.deleteMaterial('${material.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async editMaterial(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;

        // For now, we'll use prompts. In a production app, you'd use a proper modal
        const newTitle = prompt('Enter new title:', material.title);
        if (newTitle === null) return; // User cancelled

        const newUrl = prompt('Enter new URL:', material.url);
        if (newUrl === null) return;

        if (!newTitle.trim() || !newUrl.trim()) {
            authManager.showError('Title and URL cannot be empty');
            return;
        }

        if (!this.isValidGitHubUrl(newUrl)) {
            authManager.showError('Please provide a valid GitHub URL');
            return;
        }

        authManager.showLoading(true);

        try {
            const updates = {
                title: newTitle.trim(),
                url: newUrl.trim(),
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                updatedBy: authManager.getCurrentUser().uid
            };

            await database.ref(`materials/${materialId}`).update(updates);
            
            authManager.showSuccess('Material updated successfully!');
            await this.loadMaterials();
            
        } catch (error) {
            console.error('Error updating material:', error);
            authManager.showError('Failed to update material');
        } finally {
            authManager.showLoading(false);
        }
    }

    async deleteMaterial(materialId) {
        if (!confirm('Are you sure you want to delete this material?')) {
            return;
        }

        if (!authManager.isUserAdmin()) {
            authManager.showError('Admin access required');
            return;
        }

        authManager.showLoading(true);

        try {
            await database.ref(`materials/${materialId}`).remove();
            
            authManager.showSuccess('Material deleted successfully!');
            await this.loadMaterials();
            
        } catch (error) {
            console.error('Error deleting material:', error);
            authManager.showError('Failed to delete material');
        } finally {
            authManager.showLoading(false);
        }
    }

    async loadAdminChats() {
        if (!authManager.isUserAdmin()) return;

        const adminChatList = document.getElementById('adminChatList');
        if (!adminChatList) return;

        try {
            // Show loading state
            adminChatList.innerHTML = this.getLoadingHTML();
            
            const chats = await chatManager.getAdminChats();
            
            if (chats.length === 0) {
                adminChatList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>No Active Chats</h3>
                        <p>Chat sessions will appear here when users start conversations.</p>
                    </div>
                `;
                return;
            }

            adminChatList.innerHTML = chats.map(chat => {
                const isActive = chat.userActive?.status === 'online';
                const lastMessageTime = chat.lastMessage?.timestamp ? 
                    this.formatTime(chat.lastMessage.timestamp) : 
                    'No messages';
                
                return `
                    <div class="chat-item" onclick="adminManager.openAdminChat('${chat.id}')">
                        <div class="chat-item-header">
                            <span class="chat-status ${isActive ? 'status-active' : 'status-inactive'}">
                                <i class="fas fa-circle"></i>
                                ${isActive ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <div class="chat-item-content">
                            <h4><i class="fas fa-user"></i> ${this.escapeHtml(chat.userName || chat.userEmail)}</h4>
                            <p><i class="fas fa-comment"></i> ${this.escapeHtml(chat.lastMessage?.text || 'No messages yet')}</p>
                            <p><i class="fas fa-clock"></i> Last activity: ${lastMessageTime}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error loading admin chats:', error);
            adminChatList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Chats</h3>
                    <p>Unable to load chat sessions. Please try again.</p>
                </div>
            `;
        }
    }

    async loadUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        try {
            // Show loading state
            usersList.innerHTML = this.getLoadingHTML();
            
            const usersSnapshot = await database.ref('users').once('value');
            const usersData = usersSnapshot.val() || {};
            
            const users = Object.entries(usersData).map(([id, user]) => ({
                id,
                ...user
            }));
            
            if (users.length === 0) {
                usersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No Users Found</h3>
                        <p>Registered users will appear here.</p>
                    </div>
                `;
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="material-item">
                    <div class="material-item-header">
                        <span class="material-type-badge ${user.isAdmin ? 'admin' : 'user'}">
                            ${user.isAdmin ? 'Admin' : 'User'}
                        </span>
                    </div>
                    <div class="material-item-content">
                        <div class="material-info">
                            <h4>${this.escapeHtml(user.username || user.email)}</h4>
                            <p><i class="fas fa-envelope"></i> ${this.escapeHtml(user.email)}</p>
                            <p><i class="fas fa-calendar"></i> Joined ${this.formatTime(user.createdAt)}</p>
                            <p><i class="fas fa-shield-alt"></i> Role: ${user.isAdmin ? 'Administrator' : 'Student'}</p>
                        </div>
                        <div class="material-actions">
                            ${!user.isAdmin ? `
                                <button class="action-btn edit-btn" onclick="adminManager.toggleUserRole('${user.id}', true)">
                                    <i class="fas fa-user-shield"></i> Make Admin
                                </button>
                            ` : `
                                <button class="action-btn delete-btn" onclick="adminManager.toggleUserRole('${user.id}', false)">
                                    <i class="fas fa-user"></i> Remove Admin
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading users:', error);
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Users</h3>
                    <p>Unable to load user list. Please try again.</p>
                </div>
            `;
        }
    }

    getLoadingHTML() {
        return Array(3).fill(0).map(() => `
            <div class="loading-card">
                <div class="loading-skeleton skeleton-circle"></div>
                <div style="flex: 1;">
                    <div class="loading-skeleton skeleton-title"></div>
                    <div class="loading-skeleton skeleton-text"></div>
                </div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 2592000000) return `${Math.floor(diff / 86400000)} days ago`;
        
        return date.toLocaleDateString();
    }

    async toggleUserRole(userId, makeAdmin) {
        if (!authManager.isUserAdmin()) {
            authManager.showError('Admin access required');
            return;
        }

        const action = makeAdmin ? 'promote to admin' : 'remove admin privileges';
        if (!confirm(`Are you sure you want to ${action} for this user?`)) {
            return;
        }

        authManager.showLoading(true);

        try {
            await database.ref(`users/${userId}/isAdmin`).set(makeAdmin);
            authManager.showSuccess(`User ${makeAdmin ? 'promoted to admin' : 'admin privileges removed'} successfully!`);
            this.loadUsers(); // Refresh the users list
        } catch (error) {
            console.error('Error updating user role:', error);
            authManager.showError('Failed to update user role');
        } finally {
            authManager.showLoading(false);
        }
    }

    async editSubject(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const newName = prompt('Enter new subject name:', subject.name);
        if (newName === null) return;

        const newDescription = prompt('Enter new description:', subject.description);
        if (newDescription === null) return;

        if (!newName.trim() || !newDescription.trim()) {
            authManager.showError('Name and description cannot be empty');
            return;
        }

        authManager.showLoading(true);

        try {
            const updates = {
                name: newName.trim(),
                description: newDescription.trim(),
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                updatedBy: authManager.getCurrentUser().uid
            };

            await database.ref(`subjects/${subjectId}`).update(updates);
            
            authManager.showSuccess('Subject updated successfully!');
            await this.loadSubjects();
            this.displaySubjects();
            this.populateSubjectDropdown();
            
        } catch (error) {
            console.error('Error updating subject:', error);
            authManager.showError('Failed to update subject');
        } finally {
            authManager.showLoading(false);
        }
    }

    async deleteSubject(subjectId) {
        if (!confirm('Are you sure you want to delete this subject? This will also delete all associated materials.')) {
            return;
        }

        if (!authManager.isUserAdmin()) {
            authManager.showError('Admin access required');
            return;
        }

        authManager.showLoading(true);

        try {
            // Delete associated materials first
            const materialsToDelete = this.materials.filter(m => m.subjectId === subjectId);
            for (const material of materialsToDelete) {
                await database.ref(`materials/${material.id}`).remove();
            }

            // Delete the subject
            await database.ref(`subjects/${subjectId}`).remove();
            
            authManager.showSuccess('Subject and associated materials deleted successfully!');
            await this.loadData();
            this.displaySubjects();
            this.populateSubjectDropdown();
            
        } catch (error) {
            console.error('Error deleting subject:', error);
            authManager.showError('Failed to delete subject');
        } finally {
            authManager.showLoading(false);
        }
    }

    async openAdminChat(chatId) {
        if (!authManager.isUserAdmin()) return;

        try {
            const messages = await chatManager.getChatMessages(chatId);
            
            // Get user info for this chat
            const userId = chatId.replace('chat_', '');
            const userInfo = await authManager.getUserData(userId);
            const userName = userInfo?.username || userInfo?.email || 'Unknown User';
            
            // Create a proper admin chat interface
            const chatWindow = document.createElement('div');
            chatWindow.className = 'admin-chat-window';
            chatWindow.innerHTML = `
                <div class="admin-chat-header">
                    <h3><i class="fas fa-comments"></i> Chat with ${this.escapeHtml(userName)}</h3>
                    <button class="close-admin-chat" onclick="adminManager.closeAdminChat()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="admin-chat-messages" id="adminChatMessages-${chatId}">
                    ${messages.map(msg => `
                        <div class="admin-message ${msg.type}">
                            <div class="message-content">
                                <strong>${msg.type === 'admin' ? 'Admin' : (msg.senderUsername || userName)}:</strong>
                                ${this.escapeHtml(msg.text)}
                            </div>
                            <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                            ${authManager.isUserAdmin() ? `
                                <button class="delete-message-btn" onclick="adminManager.deleteMessage('${chatId}', '${msg.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="admin-chat-input">
                    <input type="text" id="adminMessageInput-${chatId}" placeholder="Type your reply..." maxlength="500">
                    <button onclick="adminManager.sendAdminReply('${chatId}')" class="send-admin-message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            `;

            // Remove existing chat windows
            document.querySelectorAll('.admin-chat-window').forEach(w => w.remove());
            
            // Add to page
            document.body.appendChild(chatWindow);
            
            // Focus on input
            document.getElementById(`adminMessageInput-${chatId}`).focus();
            
            // Add enter key listener
            document.getElementById(`adminMessageInput-${chatId}`).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAdminReply(chatId);
                }
            });
            
            // Start real-time message listener for this chat
            this.startAdminChatListener(chatId);
            
        } catch (error) {
            console.error('Error opening admin chat:', error);
            authManager.showError('Failed to load chat details');
        }
    }

    startAdminChatListener(chatId) {
        // Stop any existing listener for this chat
        if (this.currentAdminChatListener) {
            this.currentAdminChatListener.off();
        }

        // Listen for new messages in real-time
        this.currentAdminChatListener = database.ref(`chats/${chatId}/messages`).on('child_added', async (snapshot) => {
            const message = snapshot.val();
            const messageId = snapshot.key;
            
            // Check if this message is already displayed
            const messagesContainer = document.getElementById(`adminChatMessages-${chatId}`);
            if (messagesContainer && !messagesContainer.querySelector(`[data-message-id="${messageId}"]`)) {
                // Get user info for display
                const userId = chatId.replace('chat_', '');
                const userInfo = await authManager.getUserData(userId);
                const userName = userInfo?.username || userInfo?.email || 'Unknown User';
                
                // Add the new message to the display
                const messageDiv = document.createElement('div');
                messageDiv.className = `admin-message ${message.type}`;
                messageDiv.setAttribute('data-message-id', messageId);
                messageDiv.innerHTML = `
                    <div class="message-content">
                        <strong>${message.type === 'admin' ? 'Admin' : (message.senderUsername || userName)}:</strong>
                        ${this.escapeHtml(message.text)}
                    </div>
                    <div class="message-time">${this.formatTime(message.timestamp)}</div>
                    ${authManager.isUserAdmin() ? `
                        <button class="delete-message-btn" onclick="adminManager.deleteMessage('${chatId}', '${messageId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                `;
                
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });
    }

    stopAdminChatListener() {
        if (this.currentAdminChatListener) {
            this.currentAdminChatListener.off();
            this.currentAdminChatListener = null;
        }
    }

    closeAdminChat() {
        // Stop the message listener
        this.stopAdminChatListener();
        
        // Remove the chat window
        document.querySelectorAll('.admin-chat-window').forEach(w => w.remove());
    }

    async sendAdminReply(chatId) {
        const input = document.getElementById(`adminMessageInput-${chatId}`);
        const messageText = input.value.trim();
        
        if (!messageText) return;

        try {
            const success = await chatManager.sendAdminMessage(chatId, messageText);
            if (success) {
                input.value = '';
                // Don't refresh - real-time listener will handle new messages
                authManager.showSuccess('Message sent successfully!');
            } else {
                authManager.showError('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending admin reply:', error);
            authManager.showError('Failed to send message');
        }
    }

    async refreshAdminChatMessages(chatId) {
        try {
            const messages = await chatManager.getChatMessages(chatId);
            const messagesContainer = document.getElementById(`adminChatMessages-${chatId}`);
            
            if (messagesContainer) {
                messagesContainer.innerHTML = messages.map(msg => `
                    <div class="admin-message ${msg.type}">
                        <div class="message-content">
                            <strong>${msg.type === 'admin' ? 'Admin' : 'User'}:</strong>
                            ${this.escapeHtml(msg.text)}
                        </div>
                        <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                        ${authManager.isUserAdmin() ? `
                            <button class="delete-message-btn" onclick="adminManager.deleteMessage('${chatId}', '${msg.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                `).join('');
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error refreshing chat messages:', error);
        }
    }

    async deleteMessage(chatId, messageId) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const success = await chatManager.deleteMessage(chatId, messageId);
            if (success) {
                this.refreshAdminChatMessages(chatId);
                authManager.showSuccess('Message deleted successfully!');
            } else {
                authManager.showError('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            authManager.showError('Failed to delete message');
        }
    }

    isValidGitHubUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'github.com' || 
                   urlObj.hostname === 'raw.githubusercontent.com';
        } catch (error) {
            return false;
        }
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

    // Public methods for main.js to use
    getSubjects() {
        return this.subjects;
    }

    getMaterials() {
        return this.materials;
    }

    getMaterialsBySubject(subjectId) {
        return this.materials.filter(material => material.subjectId === subjectId);
    }
}

// Initialize admin manager
const adminManager = new AdminManager();

// Export for use in other files
window.adminManager = adminManager;
