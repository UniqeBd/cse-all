// Main Application Logic
class App {
    constructor() {
        this.currentSubject = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSubjects();
        
        // Wait for auth to initialize
        setTimeout(() => {
            this.updateUIBasedOnAuth();
        }, 1000);
    }

    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navMenu?.classList.remove('active');
                hamburger?.classList.remove('active');
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    async loadSubjects() {
        try {
            // Load subjects from admin manager
            await new Promise(resolve => {
                const checkAdminManager = () => {
                    if (window.adminManager && window.adminManager.subjects) {
                        resolve();
                    } else {
                        setTimeout(checkAdminManager, 100);
                    }
                };
                checkAdminManager();
            });

            this.displaySubjects();
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showErrorMessage('Failed to load subjects');
        }
    }

    displaySubjects() {
        const subjectsGrid = document.getElementById('subjectsGrid');
        const subjects = adminManager.getSubjects();

        if (subjects.length === 0) {
            subjectsGrid.innerHTML = `
                <div class="no-subjects">
                    <h3>No subjects available yet</h3>
                    <p>Subjects will appear here once an admin adds them.</p>
                </div>
            `;
            return;
        }

        subjectsGrid.innerHTML = subjects.map(subject => `
            <div class="subject-card fade-in">
                <h3>${this.escapeHtml(subject.name)}</h3>
                <p>${this.escapeHtml(subject.description)}</p>
                <button class="learn-more-btn" onclick="app.showSubjectDetails('${subject.id}')">
                    Learn More
                </button>
            </div>
        `).join('');
    }

    showSubjectDetails(subjectId) {
        const subject = adminManager.getSubjects().find(s => s.id === subjectId);
        if (!subject) return;

        this.currentSubject = subject;
        const materials = adminManager.getMaterialsBySubject(subjectId);

        const subjectContent = document.getElementById('subjectContent');
        subjectContent.innerHTML = `
            <div class="subject-header">
                <h2>${this.escapeHtml(subject.name)}</h2>
                <p>${this.escapeHtml(subject.description)}</p>
            </div>
            
            <div class="materials-section">
                <h3>Study Materials</h3>
                ${materials.length > 0 ? this.renderMaterials(materials) : this.renderNoMaterials()}
            </div>
        `;

        // Show subject details section
        document.getElementById('subjectDetails').style.display = 'block';
        
        // Scroll to subject details
        document.getElementById('subjectDetails').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Adjust content area for chat if open
        this.adjustContentForChat();
    }

    renderMaterials(materials) {
        if (materials.length === 0) {
            return this.renderNoMaterials();
        }

        return `
            <div class="materials-grid">
                ${materials.map(material => `
                    <div class="material-card slide-up">
                        <h4>${this.escapeHtml(material.title)}</h4>
                        <span class="material-type">${this.escapeHtml(material.type.toUpperCase())}</span>
                        <p>Click below to view or download this material.</p>
                        <button class="view-material-btn" onclick="app.openMaterial('${material.url}')">
                            <i class="fas fa-external-link-alt"></i> View Material
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderNoMaterials() {
        return `
            <div class="no-materials">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h4>No materials available yet</h4>
                <p>Materials for this subject will appear here once an admin uploads them.</p>
            </div>
        `;
    }

    openMaterial(url) {
        // Open material in new tab
        window.open(url, '_blank');
    }

    hideSubjectDetails() {
        document.getElementById('subjectDetails').style.display = 'none';
        this.currentSubject = null;
        
        // Scroll back to subjects section
        document.getElementById('subjects').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    adjustContentForChat() {
        const chatBox = document.getElementById('chatBox');
        const contentArea = document.getElementById('contentArea');
        
        if (chatBox.classList.contains('open')) {
            // Adjust for desktop only
            if (window.innerWidth > 768) {
                contentArea.style.marginRight = '400px';
            }
        } else {
            contentArea.style.marginRight = '0';
        }
    }

    handleResize() {
        this.adjustContentForChat();
        
        // Close mobile menu on resize
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            hamburger?.classList.remove('active');
        }
    }

    updateUIBasedOnAuth() {
        // This method is called when auth state changes
        // Update any UI elements that depend on auth state
        const isLoggedIn = authManager.isUserLoggedIn();
        const isAdmin = authManager.isUserAdmin();

        // If admin is logged in, hide main content and show only admin panel
        if (isAdmin) {
            // Hide main website content
            const mainContent = document.querySelector('main');
            const heroSection = document.querySelector('.hero');
            const subjectsSection = document.querySelector('#subjects');
            const aboutSection = document.querySelector('#about');
            const contactSection = document.querySelector('#contact');
            
            if (mainContent) mainContent.style.display = 'none';
            if (heroSection) heroSection.style.display = 'none';
            if (subjectsSection) subjectsSection.style.display = 'none';
            if (aboutSection) aboutSection.style.display = 'none';
            if (contactSection) contactSection.style.display = 'none';
            
            // Show admin panel immediately
            document.getElementById('adminModal').style.display = 'flex';
            
            // Load admin data
            if (window.adminManager) {
                adminManager.showAdminPanel();
            }
        } else {
            // Show main website content for regular users
            const mainContent = document.querySelector('main');
            const heroSection = document.querySelector('.hero');
            const subjectsSection = document.querySelector('#subjects');
            const aboutSection = document.querySelector('#about');
            const contactSection = document.querySelector('#contact');
            
            if (mainContent) mainContent.style.display = 'block';
            if (heroSection) heroSection.style.display = 'block';
            if (subjectsSection) subjectsSection.style.display = 'block';
            if (aboutSection) aboutSection.style.display = 'block';
            if (contactSection) contactSection.style.display = 'block';
        }

        // Show/hide chat toggle based on login status (only for non-admin users)
        const chatToggle = document.getElementById('chatToggle');
        if (chatToggle) {
            chatToggle.style.display = (isLoggedIn && !isAdmin) ? 'flex' : 'none';
        }

        // Update navigation based on admin status
        this.updateAdminUI(isAdmin);
    }

    updateAdminUI(isAdmin) {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });
    }

    showErrorMessage(message) {
        authManager.showError(message);
    }

    showSuccessMessage(message) {
        authManager.showSuccess(message);
    }

    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Utility methods
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Method to refresh data (useful for admin actions)
    async refreshData() {
        await this.loadSubjects();
        if (this.currentSubject) {
            // Refresh current subject details
            this.showSubjectDetails(this.currentSubject.id);
        }
    }
}

// Global functions for HTML onclick events
window.scrollToSection = function(sectionId) {
    app.scrollToSection(sectionId);
};

window.hideSubjectDetails = function() {
    app.hideSubjectDetails();
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Listen for auth state changes to update UI
if (typeof window !== 'undefined') {
    window.addEventListener('authStateChanged', () => {
        if (window.app) {
            window.app.updateUIBasedOnAuth();
        }
    });
}

// Export app instance
window.app = window.app || {};

// Handle page visibility changes (for chat notifications)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
        console.log('Page hidden');
    } else {
        // Page is visible
        console.log('Page visible');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Back online');
    // Could show a notification or refresh data
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
    // Could show a notification about offline status
});

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', () => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});
