/**
 * DTB Technologies Digital Museum - Authentication Modal
 * Provides login and registration UI components
 */

import authService from './auth-service.js';

/**
 * AuthModal class
 * Creates and manages the authentication modal UI
 */
class AuthModal {
  constructor() {
    this.modalElement = null;
    this.currentView = 'login'; // 'login', 'register', 'reset-password'
    this.onAuthSuccess = null;
  }
  
  /**
   * Show the authentication modal
   * @param {string} initialView - Initial view to show ('login', 'register', 'reset-password')
   * @param {Function} onSuccess - Callback function called after successful authentication
   */
  show(initialView = 'login', onSuccess = null) {
    this.currentView = initialView;
    this.onAuthSuccess = onSuccess;
    
    // Create the modal if it doesn't exist
    if (!this.modalElement) {
      this.createModal();
    }
    
    // Update the view
    this.updateView();
    
    // Show the modal
    this.modalElement.classList.remove('hidden');
    setTimeout(() => {
      this.modalElement.classList.add('opacity-100');
      this.modalElement.querySelector('.modal-container').classList.add('translate-y-0');
    }, 10);
    
    // Focus the first input
    setTimeout(() => {
      const firstInput = this.modalElement.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 300);
  }
  
  /**
   * Hide the authentication modal
   */
  hide() {
    if (!this.modalElement) return;
    
    this.modalElement.classList.remove('opacity-100');
    this.modalElement.querySelector('.modal-container').classList.remove('translate-y-0');
    
    setTimeout(() => {
      this.modalElement.classList.add('hidden');
    }, 300);
  }
  
  /**
   * Create the modal element
   */
  createModal() {
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm opacity-0 transition-opacity duration-300 hidden';
    
    // Create modal structure
    this.modalElement.innerHTML = `
      <div class="modal-container bg-slate-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl transform -translate-y-8 transition-transform duration-300">
        <div class="modal-header relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div class="relative p-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-white modal-title">Sign In</h2>
              <button class="modal-close text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-body p-6 pt-2">
          <!-- Content will be filled dynamically -->
        </div>
      </div>
    `;
    
    // Add event listener to close button
    this.modalElement.querySelector('.modal-close').addEventListener('click', () => {
      this.hide();
    });
    
    // Add event listener to close when clicking outside
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.hide();
      }
    });
    
    // Add to document
    document.body.appendChild(this.modalElement);
  }
  
  /**
   * Update the modal view based on currentView
   */
  updateView() {
    if (!this.modalElement) return;
    
    const titleElement = this.modalElement.querySelector('.modal-title');
    const bodyElement = this.modalElement.querySelector('.modal-body');
    
    switch (this.currentView) {
      case 'login':
        titleElement.textContent = 'Sign In';
        bodyElement.innerHTML = this.getLoginHTML();
        this.setupLoginEvents();
        break;
      case 'register':
        titleElement.textContent = 'Create Account';
        bodyElement.innerHTML = this.getRegisterHTML();
        this.setupRegisterEvents();
        break;
      case 'reset-password':
        titleElement.textContent = 'Reset Password';
        bodyElement.innerHTML = this.getResetPasswordHTML();
        this.setupResetPasswordEvents();
        break;
    }
  }
  
  /**
   * Get the HTML for the login view
   * @returns {string} HTML string
   */
  getLoginHTML() {
    return `
      <form id="login-form" class="space-y-4">
        <div class="form-group">
          <label for="login-email" class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input type="email" id="login-email" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        
        <div class="form-group">
          <label for="login-password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input type="password" id="login-password" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        
        <div class="text-right">
          <button type="button" id="forgot-password-btn" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</button>
        </div>
        
        <div id="login-error" class="text-red-500 text-sm hidden"></div>
        
        <button type="submit" id="login-submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
          <span>Sign In</span>
          <div id="login-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
        
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-slate-800 text-gray-400">Or continue with</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <button type="button" id="google-signin" class="py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.416,1.478-1.58,2.669-3.061,3.177 c-1.074,0.369-2.236,0.341-3.291-0.082c-1.056-0.422-1.921-1.184-2.455-2.177c-0.53-0.985-0.666-2.137-0.388-3.219 c0.28-1.083,0.95-2.019,1.896-2.642c0.997-0.654,2.212-0.863,3.365-0.589c1.152,0.273,2.135,0.992,2.764,1.997l2.943-2.638 c-1.139-1.795-2.973-3.057-5.12-3.525C11.776,4.026,9.549,4.513,7.873,5.929C6.134,7.399,5.086,9.452,5.003,11.642 c-0.083,2.19,0.795,4.312,2.442,5.93c1.626,1.597,3.805,2.503,6.013,2.503c1.162,0,2.31-0.214,3.403-0.634 c1.599-0.618,2.948-1.701,3.906-3.133c1.186-1.773,1.471-3.857,1.471-5.157v-1H14.454C13.4,12.151,12.545,13.006,12.545,12.151z" fill="currentColor"></path>
            </svg>
            Google
          </button>
          <button type="button" id="github-signin" class="py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.743.084-.728.084-.728 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.577C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
        
        <div class="text-center mt-4">
          <p class="text-gray-400 text-sm">
            Don't have an account? 
            <button type="button" id="show-register" class="text-blue-400 hover:text-blue-300 transition-colors">Sign up</button>
          </p>
        </div>
      </form>
    `;
  }
  
  /**
   * Get the HTML for the register view
   * @returns {string} HTML string
   */
  getRegisterHTML() {
    return `
      <form id="register-form" class="space-y-4">
        <div class="form-group">
          <label for="register-name" class="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input type="text" id="register-name" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        
        <div class="form-group">
          <label for="register-email" class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input type="email" id="register-email" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        
        <div class="form-group">
          <label for="register-password" class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input type="password" id="register-password" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <p class="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
        </div>
        
        <div id="register-error" class="text-red-500 text-sm hidden"></div>
        
        <button type="submit" id="register-submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
          <span>Create Account</span>
          <div id="register-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
        
        <div class="text-center mt-4">
          <p class="text-gray-400 text-sm">
            Already have an account? 
            <button type="button" id="show-login" class="text-blue-400 hover:text-blue-300 transition-colors">Sign in</button>
          </p>
        </div>
      </form>
    `;
  }
  
  /**
   * Get the HTML for the reset password view
   * @returns {string} HTML string
   */
  getResetPasswordHTML() {
    return `
      <form id="reset-password-form" class="space-y-4">
        <p class="text-gray-300 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
        
        <div class="form-group">
          <label for="reset-email" class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input type="email" id="reset-email" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        
        <div id="reset-error" class="text-red-500 text-sm hidden"></div>
        <div id="reset-success" class="text-green-500 text-sm hidden"></div>
        
        <button type="submit" id="reset-submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
          <span>Send Reset Link</span>
          <div id="reset-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
        
        <div class="text-center mt-4">
          <button type="button" id="back-to-login" class="text-blue-400 hover:text-blue-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </button>
        </div>
      </form>
    `;
  }
  
  /**
   * Set up event listeners for login view
   */
  setupLoginEvents() {
    // Show register view
    const showRegisterBtn = document.getElementById('show-register');
    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', () => {
        this.currentView = 'register';
        this.updateView();
      });
    }
    
    // Show forgot password view
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', () => {
        this.currentView = 'reset-password';
        this.updateView();
      });
    }
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
    
    // Handle Google sign in
    const googleSignInBtn = document.getElementById('google-signin');
    if (googleSignInBtn) {
      googleSignInBtn.addEventListener('click', () => {
        this.handleGoogleSignIn();
      });
    }
    
    // Handle GitHub sign in
    const githubSignInBtn = document.getElementById('github-signin');
    if (githubSignInBtn) {
      githubSignInBtn.addEventListener('click', () => {
        this.handleGitHubSignIn();
      });
    }
  }
  
  /**
   * Set up event listeners for register view
   */
  setupRegisterEvents() {
    // Show login view
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        this.currentView = 'login';
        this.updateView();
      });
    }
    
    // Handle register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }
  
  /**
   * Set up event listeners for reset password view
   */
  setupResetPasswordEvents() {
    // Back to login
    const backToLoginBtn = document.getElementById('back-to-login');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        this.currentView = 'login';
        this.updateView();
      });
    }
    
    // Handle reset password form submission
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleResetPassword();
      });
    }
  }
  
  /**
   * Handle login form submission
   */
  async handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorElement = document.getElementById('login-error');
    const submitButton = document.getElementById('login-submit');
    const spinner = document.getElementById('login-spinner');
    
    if (!emailInput || !passwordInput || !errorElement || !submitButton || !spinner) {
      return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Show loading state
    submitButton.disabled = true;
    spinner.classList.remove('hidden');
    errorElement.classList.add('hidden');
    
    try {
      // Attempt to sign in
      const user = await authService.signInWithEmailAndPassword(email, password);
      
      // Success
      console.log('Logged in successfully:', user);
      
      // Hide the modal
      this.hide();
      
      // Call success callback if provided
      if (typeof this.onAuthSuccess === 'function') {
        this.onAuthSuccess(user);
      }
    } catch (error) {
      // Show error
      errorElement.textContent = error.message || 'Failed to sign in. Please check your credentials.';
      errorElement.classList.remove('hidden');
      
      console.error('Login error:', error);
    } finally {
      // Reset loading state
      submitButton.disabled = false;
      spinner.classList.add('hidden');
    }
  }
  
  /**
   * Handle Google sign in
   */
  async handleGoogleSignIn() {
    try {
      const user = await authService.signInWithGoogle();
      
      // Success
      console.log('Logged in with Google successfully:', user);
      
      // Hide the modal
      this.hide();
      
      // Call success callback if provided
      if (typeof this.onAuthSuccess === 'function') {
        this.onAuthSuccess(user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // Show error in the login form
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.textContent = 'Google sign in failed. Please try again.';
        errorElement.classList.remove('hidden');
      }
    }
  }
  
  /**
   * Handle GitHub sign in
   */
  async handleGitHubSignIn() {
    try {
      const user = await authService.signInWithGitHub();
      
      // Success
      console.log('Logged in with GitHub successfully:', user);
      
      // Hide the modal
      this.hide();
      
      // Call success callback if provided
      if (typeof this.onAuthSuccess === 'function') {
        this.onAuthSuccess(user);
      }
    } catch (error) {
      console.error('GitHub sign in error:', error);
      
      // Show error in the login form
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.textContent = 'GitHub sign in failed. Please try again.';
        errorElement.classList.remove('hidden');
      }
    }
  }
  
  /**
   * Handle register form submission
   */
  async handleRegister() {
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const errorElement = document.getElementById('register-error');
    const submitButton = document.getElementById('register-submit');
    const spinner = document.getElementById('register-spinner');
    
    if (!nameInput || !emailInput || !passwordInput || !errorElement || !submitButton || !spinner) {
      return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Show loading state
    submitButton.disabled = true;
    spinner.classList.remove('hidden');
    errorElement.classList.add('hidden');
    
    try {
      // Attempt to create account
      const user = await authService.createUserWithEmailAndPassword(email, password, name);
      
      // Success
      console.log('Account created successfully:', user);
      
      // Hide the modal
      this.hide();
      
      // Call success callback if provided
      if (typeof this.onAuthSuccess === 'function') {
        this.onAuthSuccess(user);
      }
    } catch (error) {
      // Show error
      errorElement.textContent = error.message || 'Failed to create account. Please try again.';
      errorElement.classList.remove('hidden');
      
      console.error('Registration error:', error);
    } finally {
      // Reset loading state
      submitButton.disabled = false;
      spinner.classList.add('hidden');
    }
  }
  
  /**
   * Handle reset password form submission
   */
  async handleResetPassword() {
    const emailInput = document.getElementById('reset-email');
    const errorElement = document.getElementById('reset-error');
    const successElement = document.getElementById('reset-success');
    const submitButton = document.getElementById('reset-submit');
    const spinner = document.getElementById('reset-spinner');
    
    if (!emailInput || !errorElement || !successElement || !submitButton || !spinner) {
      return;
    }
    
    const email = emailInput.value.trim();
    
    // Show loading state
    submitButton.disabled = true;
    spinner.classList.remove('hidden');
    errorElement.classList.add('hidden');
    successElement.classList.add('hidden');
    
    try {
      // Attempt to send reset email
      await authService.resetPassword(email);
      
      // Success
      successElement.textContent = `Password reset link sent to ${email}. Please check your inbox.`;
      successElement.classList.remove('hidden');
      
      // Clear the form
      emailInput.value = '';
      
      console.log('Password reset email sent');
    } catch (error) {
      // Show error
      errorElement.textContent = error.message || 'Failed to send reset email. Please try again.';
      errorElement.classList.remove('hidden');
      
      console.error('Password reset error:', error);
    } finally {
      // Reset loading state
      submitButton.disabled = false;
      spinner.classList.add('hidden');
    }
  }
}

// Create singleton instance
const authModal = new AuthModal();

// Export the auth modal
export default authModal;
