// Authentication guard
class AuthGuard {
    constructor() {
        this.boundUpdateUI = this.updateUI.bind(this);
        this.boundCheckAuth = this.checkAuth.bind(this);
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.boundUpdateUI);
            document.addEventListener('DOMContentLoaded', this.boundCheckAuth);
        } else {
            this.updateUI();
            this.checkAuth();
        }
        window.addEventListener('storage', this.boundUpdateUI);
    }

    destroy() {
        document.removeEventListener('DOMContentLoaded', this.boundUpdateUI);
        document.removeEventListener('DOMContentLoaded', this.boundCheckAuth);
        window.removeEventListener('storage', this.boundUpdateUI);
    }

    updateUI() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const authButtons = document.querySelectorAll('[data-auth-button]');
        const userInfo = document.querySelectorAll('[data-user-info]');
        
        authButtons.forEach(button => {
            if (button.dataset.authButton === 'login' || button.dataset.authButton === 'signup') {
                button.style.display = user ? 'none' : 'block';
            }
            if (button.dataset.authButton === 'logout') {
                button.style.display = user ? 'block' : 'none';
                button.onclick = () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login.html';
                };
            }
        });

        userInfo.forEach(element => {
            if (user) {
                element.textContent = user.username;
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const publicPaths = ['/auth/login.html', '/auth/signup.html'];
        const currentPath = window.location.pathname;

        if (!token && !publicPaths.includes(currentPath)) {
            window.location.href = '/auth/login.html';
        } else if (token && publicPaths.includes(currentPath)) {
            window.location.href = '/index.html';
        }
    }
}

// Initialize auth guard
const authGuard = new AuthGuard();
