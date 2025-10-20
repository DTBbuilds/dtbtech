/**
 * DTB Technologies Digital Museum - User Profile Component
 * Displays user information and manages profile settings
 */

import authService from './auth-service.js';
import profileManager from './profile-manager.js';

/**
 * UserProfile class
 * Creates and manages the user profile UI components
 */
class UserProfile {
  constructor() {
    this.currentUser = null;
    this.profileDropdownElement = null;
    this.profileMenuOpen = false;
    
    // Initialize event listeners
    this.init();
  }
  
  /**
   * Initialize the user profile component
   */
  init() {
    // Listen for authentication state changes
    authService.onAuthStateChanged(user => {
      this.currentUser = user;
      this.updateUI();
    });
    
    // Listen for profile changes
    profileManager.onProfileChanged(user => {
      this.currentUser = user;
      this.updateProfileInfo();
    });
    
    console.log('User profile component initialized');
  }
  
  /**
   * Create the user profile dropdown in the specified container
   * @param {string} containerId - ID of the container element
   */
  createProfileDropdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }
    
    // Create profile dropdown element
    this.profileDropdownElement = document.createElement('div');
    this.profileDropdownElement.className = 'profile-dropdown relative';
    
    // Set initial content
    this.updateUI();
    
    // Add to container
    container.appendChild(this.profileDropdownElement);
    
    // Add click event listener to document to close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.profileMenuOpen && this.profileDropdownElement && !this.profileDropdownElement.contains(e.target)) {
        this.closeProfileMenu();
      }
    });
  }
  
  /**
   * Update the UI based on authentication state
   */
  updateUI() {
    if (!this.profileDropdownElement) return;
    
    if (this.currentUser) {
      this.renderSignedInState();
    } else {
      this.renderSignedOutState();
    }
  }
  
  /**
   * Render the signed in state
   */
  renderSignedInState() {
    const greeting = profileManager.getPersonalizedGreeting();
    const photoURL = this.currentUser.photoURL || '../assets/avatars/default-avatar.png';
    const displayName = this.currentUser.displayName || 'User';
    
    this.profileDropdownElement.innerHTML = `
      <button id="profile-dropdown-btn" class="flex items-center space-x-2 focus:outline-none">
        <span class="hidden md:block text-right">
          <span class="block text-sm font-medium text-gray-200">${displayName}</span>
          <span class="block text-xs text-gray-400">${this.currentUser.role || 'Member'}</span>
        </span>
        <img src="${photoURL}" alt="${displayName}" class="h-8 w-8 rounded-full border border-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div id="profile-dropdown-menu" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 divide-y divide-slate-700 z-50 hidden">
        <div class="py-1 px-4">
          <div class="py-2">
            <p class="text-sm text-gray-300">${greeting}</p>
            <p class="text-xs text-gray-400">${this.currentUser.email}</p>
          </div>
        </div>
        
        <div class="py-1">
          <a href="../dashboard/profile.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
            <i class="fas fa-user-circle mr-2 text-gray-400"></i> Your Profile
          </a>
          <a href="../dashboard/favorites.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
            <i class="fas fa-heart mr-2 text-gray-400"></i> Favorites
          </a>
          <a href="../dashboard/history.html" class="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
            <i class="fas fa-history mr-2 text-gray-400"></i> Recently Viewed
          </a>
        </div>
        
        <div class="py-1">
          <button id="theme-toggle-btn" class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
            <i class="fas fa-moon mr-2 text-gray-400"></i> Dark Mode
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupProfileDropdownEvents();
  }
  
  /**
   * Render the signed out state
   */
  renderSignedOutState() {
    this.profileDropdownElement.innerHTML = '';
  }
  
  /**
   * Set up event listeners for the profile dropdown
   */
  setupProfileDropdownEvents() {
    // Toggle dropdown menu
    const dropdownBtn = document.getElementById('profile-dropdown-btn');
    if (dropdownBtn) {
      dropdownBtn.addEventListener('click', this.toggleProfileMenu.bind(this));
    }
    
    // Sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', this.handleSignOutClick.bind(this));
    }
    
    // Theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', this.handleThemeToggleClick.bind(this));
    }
  }
  
  /**
   * Toggle the profile dropdown menu
   */
  toggleProfileMenu() {
    const menu = document.getElementById('profile-dropdown-menu');
    if (!menu) return;
    
    if (this.profileMenuOpen) {
      this.closeProfileMenu();
    } else {
      menu.classList.remove('hidden');
      this.profileMenuOpen = true;
    }
  }
  
  /**
   * Close the profile dropdown menu
   */
  closeProfileMenu() {
    const menu = document.getElementById('profile-dropdown-menu');
    if (!menu) return;
    
    menu.classList.add('hidden');
    this.profileMenuOpen = false;
  }
  
  /**
   * Update the profile information in the UI
   */
  updateProfileInfo() {
    if (!this.profileDropdownElement || !this.currentUser) return;
    
    // Update profile picture
    const profileImg = this.profileDropdownElement.querySelector('img');
    if (profileImg) {
      profileImg.src = this.currentUser.photoURL || '../assets/avatars/default-avatar.png';
      profileImg.alt = this.currentUser.displayName || 'User';
    }
    
    // Update display name
    const nameEl = this.profileDropdownElement.querySelector('.block.text-sm.font-medium');
    if (nameEl) {
      nameEl.textContent = this.currentUser.displayName || 'User';
    }
    
    // Update role
    const roleEl = this.profileDropdownElement.querySelector('.block.text-xs');
    if (roleEl) {
      roleEl.textContent = this.currentUser.role || 'Member';
    }
    
    // Update greeting
    const greetingEl = this.profileDropdownElement.querySelector('.text-sm.text-gray-300');
    if (greetingEl) {
      greetingEl.textContent = profileManager.getPersonalizedGreeting();
    }
    
    // Update email
    const emailEl = this.profileDropdownElement.querySelector('.text-xs.text-gray-400');
    if (emailEl) {
      emailEl.textContent = this.currentUser.email;
    }
  }
  
  /**
   * Handle sign in button click
   */
  handleSignInClick() {
    // Import auth modal dynamically
    import('./auth-modal.js').then(module => {
      const authModal = module.default;
      authModal.show('login');
    }).catch(error => {
      console.error('Error loading auth modal:', error);
    });
  }
  
  /**
   * Handle sign out button click
   */
  async handleSignOutClick() {
    try {
      // Close the dropdown menu
      this.closeProfileMenu();
      
      // Sign out
      await authService.signOut();
      
      console.log('User signed out successfully');
      
      // Redirect to home page if specified
      // window.location.href = '../index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  
  /**
   * Handle theme toggle button click
   */
  async handleThemeToggleClick() {
    try {
      const newTheme = await profileManager.toggleTheme();
      
      // Update button text based on new theme
      const themeToggleBtn = document.getElementById('theme-toggle-btn');
      if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
          icon.className = newTheme === 'dark' ? 'fas fa-moon mr-2 text-gray-400' : 'fas fa-sun mr-2 text-gray-400';
        }
        
        themeToggleBtn.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
        // Restore the icon
        themeToggleBtn.prepend(icon);
      }
      
      console.log(`Theme switched to ${newTheme} mode`);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  }
  
  /**
   * Create a favorite button for a project
   * @param {string} projectId - ID of the project
   * @param {string} containerId - ID of the container element
   * @param {Object} projectDetails - Additional project details
   */
  createFavoriteButton(projectId, containerId, projectDetails = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }
    
    // Create favorite button element
    const favoriteBtn = document.createElement('button');
    favoriteBtn.id = `favorite-btn-${projectId}`;
    favoriteBtn.className = 'favorite-btn p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors';
    favoriteBtn.title = 'Add to favorites';
    
    // Set initial state
    this.updateFavoriteButton(favoriteBtn, projectId);
    
    // Add event listener
    favoriteBtn.addEventListener('click', () => {
      this.handleFavoriteToggle(projectId, projectDetails);
    });
    
    // Add to container
    container.appendChild(favoriteBtn);
  }
  
  /**
   * Update a favorite button's state
   * @param {HTMLElement} buttonElement - The button element
   * @param {string} projectId - ID of the project
   */
  updateFavoriteButton(buttonElement, projectId) {
    if (!buttonElement) {
      buttonElement = document.getElementById(`favorite-btn-${projectId}`);
    }
    
    if (!buttonElement) return;
    
    const isFavorited = profileManager.isProjectFavorited(projectId);
    
    // Update button appearance
    buttonElement.innerHTML = isFavorited 
      ? '<i class="fas fa-heart text-pink-500"></i>'
      : '<i class="far fa-heart text-gray-400"></i>';
    
    buttonElement.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
  }
  
  /**
   * Handle favorite button toggle
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   */
  async handleFavoriteToggle(projectId, projectDetails = {}) {
    if (!authService.isSignedIn()) {
      return;
    }
    
    try {
      // Toggle favorite status
      await profileManager.toggleFavoriteProject(projectId, projectDetails);
      
      // Update button
      this.updateFavoriteButton(null, projectId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }
  
  /**
   * Record a project view
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   */
  recordProjectView(projectId, projectDetails = {}) {
    // Record the view (even if not signed in)
    profileManager.recordProjectView(projectId, projectDetails)
      .catch(error => console.error('Error recording project view:', error));
  }
}

// Create singleton instance
const userProfile = new UserProfile();

// Export the user profile
export default userProfile;
