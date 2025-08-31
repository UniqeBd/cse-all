// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateUI();
            if (user) {
                this.checkAdminStatus();
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Profile button
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfile();
        });

        // Login button
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Admin panel button
        document.getElementById('adminPanelBtn').addEventListener('click', () => {
            this.showModal('adminModal');
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signup();
        });

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Modal controls
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('signupModal');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('signupModal');
            this.showModal('loginModal');
        });

        // Close modal events
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading(true);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.hideModal('loginModal');
            this.showSuccess('Successfully logged in!');
            this.clearForms();
        } catch (error) {
            console.error('Login error:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.showLoading(false);
        }
    }

    async signup() {
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        this.showLoading(true);

        try {
            // Check if username already exists
            const usernameSnapshot = await database.ref('usernames').child(username.toLowerCase()).once('value');
            if (usernameSnapshot.exists()) {
                this.showError('Username already taken. Please choose another one.');
                this.showLoading(false);
                return;
            }

            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Initialize user data in database
            await database.ref(`users/${userCredential.user.uid}`).set({
                username: username,
                email: email,
                bio: '',
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                isAdmin: false,
                messagesCount: 0
            });

            // Reserve the username
            await database.ref(`usernames/${username.toLowerCase()}`).set(userCredential.user.uid);

            this.hideModal('signupModal');
            this.showSuccess('Account created successfully!');
            this.clearForms();
        } catch (error) {
            console.error('Signup error:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.showLoading(false);
        }
    }

    async logout() {
        try {
            await auth.signOut();
            
            // Close admin panel if open
            const adminModal = document.getElementById('adminModal');
            if (adminModal) {
                adminModal.style.display = 'none';
            }
            
            // Stop admin chat listeners
            if (window.adminManager) {
                adminManager.stopAdminChatListener();
            }
            
            this.showSuccess('Successfully logged out!');
            
            // Clear chat when logging out
            if (window.chatManager) {
                window.chatManager.clearUserChat();
            }
            
            // Update UI to show main content
            if (window.app) {
                setTimeout(() => {
                    window.app.updateUIBasedOnAuth();
                }, 100);
            }
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Error logging out');
        }
    }

    async checkAdminStatus() {
        if (!this.currentUser) return;

        try {
            const snapshot = await database.ref(`users/${this.currentUser.uid}/isAdmin`).once('value');
            this.isAdmin = snapshot.val() === true;
            this.updateAdminUI();
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        const chatToggle = document.getElementById('chatToggle');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            profileBtn.style.display = 'inline-block';
            chatToggle.style.display = 'flex';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            profileBtn.style.display = 'none';
            chatToggle.style.display = 'none';
            this.isAdmin = false;
        }

        this.updateAdminUI();
    }

    updateAdminUI() {
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        const adminElements = document.querySelectorAll('.admin-only');

        if (this.isAdmin) {
            adminPanelBtn.style.display = 'inline-block';
            adminElements.forEach(el => el.style.display = 'block');
        } else {
            adminPanelBtn.style.display = 'none';
            adminElements.forEach(el => el.style.display = 'none');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    clearForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        document.getElementById('profileForm').reset();
    }

    showError(message) {
        // Create or update error message
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        // Create or update success message
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'error' ? 'background: #dc3545;' : 'background: #28a745;'}
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'flex' : 'none';
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account already exists with this email address',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    // Utility methods for other modules
    getCurrentUser() {
        return this.currentUser;
    }

    isUserAdmin() {
        return this.isAdmin;
    }

    isUserLoggedIn() {
        return !!this.currentUser;
    }

    async showProfile() {
        if (!this.currentUser) return;

        try {
            // Load user data from database
            const snapshot = await database.ref(`users/${this.currentUser.uid}`).once('value');
            const userData = snapshot.val();

            if (userData) {
                document.getElementById('profileUsername').value = userData.username || '';
                document.getElementById('profileEmail').value = userData.email || '';
                document.getElementById('profileBio').value = userData.bio || '';

                // Update profile avatar with first letter of username
                const avatarEl = document.getElementById('profileAvatar');
                if (userData.username) {
                    avatarEl.textContent = userData.username.charAt(0).toUpperCase();
                }

                // Calculate days since joined
                if (userData.createdAt) {
                    const joinDate = new Date(userData.createdAt);
                    const now = new Date();
                    const daysSinceJoined = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
                    document.getElementById('userJoinDate').textContent = daysSinceJoined;
                }

                // Update messages count
                document.getElementById('userMessagesCount').textContent = userData.messagesCount || 0;
            }

            this.showModal('profileModal');
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile');
        }
    }

    async updateProfile() {
        if (!this.currentUser) return;

        const username = document.getElementById('profileUsername').value.trim();
        const bio = document.getElementById('profileBio').value.trim();

        if (!username) {
            this.showError('Username is required');
            return;
        }

        if (username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return;
        }

        this.showLoading(true);

        try {
            // Get current user data to check if username changed
            const currentSnapshot = await database.ref(`users/${this.currentUser.uid}`).once('value');
            const currentData = currentSnapshot.val();

            // Check if username changed and if new username is available
            if (currentData.username !== username) {
                const usernameSnapshot = await database.ref('usernames').child(username.toLowerCase()).once('value');
                if (usernameSnapshot.exists()) {
                    this.showError('Username already taken. Please choose another one.');
                    this.showLoading(false);
                    return;
                }

                // Remove old username reservation
                if (currentData.username) {
                    await database.ref(`usernames/${currentData.username.toLowerCase()}`).remove();
                }

                // Reserve new username
                await database.ref(`usernames/${username.toLowerCase()}`).set(this.currentUser.uid);
            }

            // Update user profile
            await database.ref(`users/${this.currentUser.uid}`).update({
                username: username,
                bio: bio,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });

            this.hideModal('profileModal');
            this.showSuccess('Profile updated successfully!');

        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile');
        } finally {
            this.showLoading(false);
        }
    }

    async getUserData(userId) {
        try {
            const snapshot = await database.ref(`users/${userId}`).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other files
window.authManager = authManager;
