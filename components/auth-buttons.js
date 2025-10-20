// Auth Buttons Component
import authModal from './auth-modal.js';

class AuthButtons extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isLoggedIn = false;
        this.username = '';
        this.render();
    }

    static get observedAttributes() {
        return ['logged-in', 'username'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'logged-in') {
            this.isLoggedIn = newValue === 'true';
            this.render();
        } else if (name === 'username') {
            this.username = newValue;
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
                .auth-button {
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.5rem 1.25rem;
                    position: relative;
                    overflow: hidden;
                }
                .auth-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    transition: 0.5s;
                }
                .auth-button:hover::before {
                    left: 100%;
                }
                .login-btn {
                    background: transparent;
                    color: #e5e7eb;
                    border: 1px solid rgba(229, 231, 235, 0.2);
                }
                .login-btn:hover {
                    border-color: rgba(229, 231, 235, 0.4);
                    background: rgba(255, 255, 255, 0.05);
                }
                .signup-btn {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
                }
                .signup-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px -1px rgba(59, 130, 246, 0.3);
                }
                .signup-btn:active {
                    transform: translateY(0);
                }
                .user-menu {
                    position: relative;
                }
                .user-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(229, 231, 235, 0.2);
                    border-radius: 0.5rem;
                    color: #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .user-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .user-avatar {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: #1f2937;
                    border: 1px solid rgba(229, 231, 235, 0.1);
                    border-radius: 0.5rem;
                    padding: 0.5rem;
                    min-width: 12rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transform-origin: top right;
                    transform: scale(0.95);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                }
                .dropdown-menu.active {
                    transform: scale(1);
                    opacity: 1;
                    visibility: visible;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    color: #e5e7eb;
                    text-decoration: none;
                    border-radius: 0.375rem;
                    transition: all 0.2s ease;
                }
                .menu-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .menu-item.danger {
                    color: #ef4444;
                }
                .menu-item.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                @media (max-width: 640px) {
                    :host {
                        width: 100%;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .auth-button {
                        width: 100%;
                        padding: 0.625rem 1rem;
                        text-align: center;
                    }
                    .user-button {
                        width: 100%;
                        justify-content: center;
                    }
                    .dropdown-menu {
                        width: 100%;
                        position: static;
                        margin-top: 0.5rem;
                    }
                }
            </style>
            ${this.isLoggedIn ? `
                <div class="user-menu">
                    <button class="user-button" id="userMenuBtn">
                        <div class="user-avatar">${this.username.charAt(0).toUpperCase()}</div>
                        <span>${this.username}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="dropdown-menu" id="userMenu">
                        <a href="/dashboard" class="menu-item">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Dashboard
                        </a>
                        <a href="/profile" class="menu-item">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Profile
                        </a>
                        <button class="menu-item danger" id="logoutBtn">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            ` : `
                <button class="auth-button login-btn" id="loginBtn">
                    Sign In
                </button>
                <button class="auth-button signup-btn" id="signupBtn">
                    Get Started
                </button>
            `}
        `;

        if (!this.isLoggedIn) {
            this.shadowRoot.getElementById('loginBtn').addEventListener('click', () => {
                authModal.open('login');
            });

            this.shadowRoot.getElementById('signupBtn').addEventListener('click', () => {
                authModal.open('signup');
            });
        } else {
            const userMenuBtn = this.shadowRoot.getElementById('userMenuBtn');
            const userMenu = this.shadowRoot.getElementById('userMenu');
            const logoutBtn = this.shadowRoot.getElementById('logoutBtn');

            userMenuBtn.addEventListener('click', () => {
                userMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!this.shadowRoot.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });

            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.setAttribute('logged-in', 'false');
                this.setAttribute('username', '');
                window.location.reload();
            });
        }
    }

    disconnectedCallback() {
        const loginBtn = this.shadowRoot.getElementById('loginBtn');
        const signupBtn = this.shadowRoot.getElementById('signupBtn');
        const logoutBtn = this.shadowRoot.getElementById('logoutBtn');
        
        if (loginBtn) loginBtn.removeEventListener('click');
        if (signupBtn) signupBtn.removeEventListener('click');
        if (logoutBtn) logoutBtn.removeEventListener('click');
        
        document.removeEventListener('click');
    }
}

customElements.define('auth-buttons', AuthButtons);
