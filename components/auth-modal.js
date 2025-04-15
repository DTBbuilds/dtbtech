// Auth Modal Component
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
                    <button class="close-modal absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>

                    <!-- Title -->
                    <h2 class="text-2xl font-bold text-white mb-6 modal-title">Sign In</h2>

                    <!-- Form -->
                    <form id="auth-form" class="space-y-4">
                        <!-- Name field (signup only) -->
                        <div class="name-field hidden">
                            <label for="name" class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input type="text" 
                                id="name"
                                name="name" 
                                autocomplete="name"
                                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" 
                                placeholder="Your name"
                                aria-label="Full name">
                        </div>

                        <!-- Email field -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" 
                                id="email"
                                name="email" 
                                autocomplete="email"
                                required 
                                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" 
                                placeholder="your@email.com"
                                aria-label="Email address">
                        </div>

                        <!-- Password field -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input type="password" 
                                id="password"
                                name="password" 
                                autocomplete="current-password"
                                required 
                                class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" 
                                placeholder="••••••••"
                                aria-label="Password">
                        </div>

                        <!-- Error message -->
                        <div class="error-message text-red-500 text-sm hidden" role="alert" aria-live="polite"></div>

                        <!-- Submit button -->
                        <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                            <span class="submit-text">Sign In</span>
                            <span class="loading-text hidden">
                                <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> 
                                <span>Please wait...</span>
                            </span>
                        </button>
                    </form>

                    <!-- Toggle auth mode -->
                    <p class="text-center mt-4 text-gray-400">
                        <span class="login-text">Don't have an account?</span>
                        <span class="signup-text hidden">Already have an account?</span>
                        <button class="toggle-auth text-blue-500 hover:text-blue-400 ml-1" type="button">
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
        document.body.addEventListener('click', (e) => {
            const loginBtn = e.target.closest('.login-btn');
            const signupBtn = e.target.closest('.signup-btn');
            
            if (loginBtn || signupBtn) {
                e.preventDefault();
                this.isLogin = !!loginBtn;
                this.updateModalState();
                modal.classList.remove('hidden');
                errorMessage.classList.add('hidden');
            }
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
            errorMessage.classList.add('hidden');
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(form);
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

        title.textContent = this.isLogin ? 'Sign In' : 'Sign Up';
        nameField.classList.toggle('hidden', this.isLogin);
        submitText.textContent = this.isLogin ? 'Sign In' : 'Sign Up';

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
                password: formData.get('password'),
                name: formData.get('name')
            };

            // Demo authentication using localStorage
            if (this.isLogin) {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === data.email && u.password === data.password);
                
                if (!user) {
                    throw new Error('Invalid email or password');
                }

                // Store auth state
                const userData = { 
                    email: user.email, 
                    name: user.name,
                    isAuthenticated: true,
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                // Registration
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                if (users.some(u => u.email === data.email)) {
                    throw new Error('Email already registered');
                }

                if (!data.name) {
                    throw new Error('Name is required');
                }

                users.push(data);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Store auth state for new user
                const userData = { 
                    email: data.email, 
                    name: data.name,
                    isAuthenticated: true,
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }

            // Success! Update UI
            this.querySelector('#auth-modal').classList.add('hidden');
            form.reset();

            // Set login flag and trigger auth state change event
            sessionStorage.setItem('justLoggedIn', 'true');
            document.dispatchEvent(new Event('authStateChanged'));

            // Redirect to dashboard welcome page
            window.location.href = './dashboard/welcome.html';

        } catch (error) {
            errorMessage.textContent = error.message || 'An error occurred. Please try again.';
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
