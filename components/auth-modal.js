// Auth Modal Component
import { apiUrl, baseUrl } from '../config.js';

class AuthModal extends HTMLElement {
    constructor() {
        super();
        this.isLogin = true;
        this.innerHTML = this.render();
        this.setupEventListeners();
    }

    render() {
        return `
            <div id="auth-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
                <div class="bg-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-800 relative">
                    <!-- Close Button -->
                    <button class="close-modal absolute top-4 right-4 text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>

                    <!-- Title -->
                    <h2 class="text-2xl font-bold text-white mb-6 modal-title">Sign In</h2>

                    <!-- Form -->
                    <form id="auth-form" class="space-y-4">
                        <!-- Name field (signup only) -->
                        <div class="name-field hidden">
                            <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input type="text" name="name" class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" placeholder="Your name">
                        </div>

                        <!-- Email field -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" name="email" required class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" placeholder="your@email.com">
                        </div>

                        <!-- Password field -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input type="password" name="password" required class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" placeholder="••••••••">
                        </div>

                        <!-- Error message -->
                        <div class="error-message text-red-500 text-sm hidden"></div>

                        <!-- Submit button -->
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            <span class="submit-text">Sign In</span>
                            <span class="loading-text hidden">
                                <i class="fas fa-spinner fa-spin"></i> Please wait...
                            </span>
                        </button>
                    </form>

                    <!-- Toggle auth mode -->
                    <p class="text-center mt-4 text-gray-400">
                        <span class="login-text">Don't have an account?</span>
                        <span class="signup-text hidden">Already have an account?</span>
                        <button class="toggle-auth text-blue-500 hover:text-blue-400 ml-1">
                            <span class="login-text">Sign Up</span>
                            <span class="signup-text hidden">Sign In</span>
                        </button>
                    </p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const modal = this.querySelector('#auth-modal');
        const form = this.querySelector('#auth-form');
        const closeBtn = this.querySelector('.close-modal');
        const toggleBtn = this.querySelector('.toggle-auth');
        const errorMessage = this.querySelector('.error-message');

        // Show modal when login/signup buttons are clicked
        document.querySelectorAll('.login-btn, .signup-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.isLogin = btn.classList.contains('login-btn');
                this.updateModalState();
                modal.classList.remove('hidden');
            });
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            form.reset();
            errorMessage.classList.add('hidden');
        });

        // Toggle between login and signup
        toggleBtn.addEventListener('click', () => {
            this.isLogin = !this.isLogin;
            this.updateModalState();
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.handleSubmit(form);
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                form.reset();
                errorMessage.classList.add('hidden');
            }
        });
    }

    updateModalState() {
        const title = this.querySelector('.modal-title');
        const nameField = this.querySelector('.name-field');
        const submitText = this.querySelector('.submit-text');
        const loginTexts = this.querySelectorAll('.login-text');
        const signupTexts = this.querySelectorAll('.signup-text');
        const errorMessage = this.querySelector('.error-message');

        title.textContent = this.isLogin ? 'Sign In' : 'Sign Up';
        nameField.classList.toggle('hidden', this.isLogin);
        submitText.textContent = this.isLogin ? 'Sign In' : 'Sign Up';
        errorMessage.classList.add('hidden');

        loginTexts.forEach(el => el.classList.toggle('hidden', !this.isLogin));
        signupTexts.forEach(el => el.classList.toggle('hidden', this.isLogin));
    }

    async handleSubmit(form) {
        const errorMessage = this.querySelector('.error-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingText = submitBtn.querySelector('.loading-text');

        try {
            // Show loading state
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            if (!this.isLogin) {
                data.name = formData.get('name');
            }

            const endpoint = this.isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Authentication failed');
            }

            // Store auth token and user data
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Update UI
            this.querySelector('#auth-modal').classList.add('hidden');
            form.reset();

            // Trigger auth state check
            document.dispatchEvent(new Event('authStateChanged'));

            // Redirect to dashboard if needed
            if (window.location.pathname === '/') {
                window.location.href = '/dashboard/welcome.html';
            } else {
                window.location.reload();
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            submitText.classList.remove('hidden');
            loadingText.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
}

customElements.define('auth-modal', AuthModal);
