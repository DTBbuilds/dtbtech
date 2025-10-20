/**
 * DTB Technologies Digital Museum - Profile Manager
 * Manages user profiles, preferences, favorites, and personalization
 */

import authService from './auth-service.js';

/**
 * Profile Manager class
 * Handles user profiles, preferences, and personalization
 */
class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.userPreferences = null;
    this.favorites = { projects: [], exhibits: [] };
    this.recentlyViewed = [];
    this.profileListeners = [];
    
    // Initialize profile manager
    this.init();
  }
  
  /**
   * Initialize the profile manager
   */
  init() {
    // Listen to auth state changes
    authService.onAuthStateChanged(user => {
      this.currentUser = user;
      
      if (user) {
        // User is signed in, load preferences and favorites
        this.userPreferences = user.preferences || {};
        this.favorites = user.favorites || { projects: [], exhibits: [] };
        this.recentlyViewed = user.recentlyViewed || [];
      } else {
        // User is signed out, reset to defaults
        this.userPreferences = null;
        this.favorites = { projects: [], exhibits: [] };
        this.recentlyViewed = [];
      }
      
      // Notify profile listeners
      this.notifyProfileListeners();
      
      // Apply user preferences if signed in
      if (user) {
        this.applyUserPreferences();
      }
    });
    
    console.log('Profile manager initialized');
  }
  
  /**
   * Add a profile change listener
   * @param {Function} listener - Callback function that receives the user profile
   * @returns {Function} Function to remove the listener
   */
  onProfileChanged(listener) {
    if (typeof listener !== 'function') return () => {};
    
    // Add listener
    this.profileListeners.push(listener);
    
    // Call listener immediately with current state
    listener(this.currentUser);
    
    // Return function to remove listener
    return () => {
      this.profileListeners = this.profileListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all profile listeners of a change
   */
  notifyProfileListeners() {
    this.profileListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error in profile listener:', e);
      }
    });
  }
  
  /**
   * Apply user preferences to the UI
   */
  applyUserPreferences() {
    if (!this.userPreferences) return;
    
    // Apply theme preference
    if (this.userPreferences.theme) {
      document.documentElement.setAttribute('data-theme', this.userPreferences.theme);
      
      if (this.userPreferences.theme === 'light') {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
      }
    }
    
    // Apply other preferences as needed
    console.log('Applied user preferences:', this.userPreferences);
  }
  
  /**
   * Update user preferences
   * @param {Object} preferences - New preference settings
   * @returns {Promise<void>}
   */
  async updatePreferences(preferences) {
    if (!authService.isSignedIn()) {
      return Promise.reject(new Error('User must be signed in to update preferences'));
    }
    
    try {
      // Update preferences via auth service
      await authService.updatePreferences(preferences);
      
      // Update local preferences
      this.userPreferences = {
        ...this.userPreferences,
        ...preferences
      };
      
      // Apply the updated preferences
      this.applyUserPreferences();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating preferences:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Toggle theme between light and dark
   * @returns {Promise<string>} The new theme
   */
  async toggleTheme() {
    const currentTheme = this.userPreferences?.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    try {
      await this.updatePreferences({ theme: newTheme });
      return Promise.resolve(newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Add a project to favorites
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   * @returns {Promise<void>}
   */
  async addFavoriteProject(projectId, projectDetails = {}) {
    if (!authService.isSignedIn()) {
      return Promise.reject(new Error('User must be signed in to add favorites'));
    }
    
    try {
      // Add to favorites via auth service
      await authService.addFavoriteProject(projectId);
      
      // Update local favorites list
      this.favorites.projects = [...this.favorites.projects, projectId];
      
      // Show confirmation message
      this.showFavoriteConfirmation(projectDetails.name || projectId, true);
      
      // Notify listeners
      this.notifyProfileListeners();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding favorite:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Remove a project from favorites
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   * @returns {Promise<void>}
   */
  async removeFavoriteProject(projectId, projectDetails = {}) {
    if (!authService.isSignedIn()) {
      return Promise.reject(new Error('User must be signed in to remove favorites'));
    }
    
    try {
      // Remove from favorites via auth service
      await authService.removeFavoriteProject(projectId);
      
      // Update local favorites list
      this.favorites.projects = this.favorites.projects.filter(id => id !== projectId);
      
      // Show confirmation message
      this.showFavoriteConfirmation(projectDetails.name || projectId, false);
      
      // Notify listeners
      this.notifyProfileListeners();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing favorite:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Check if a project is in favorites
   * @param {string} projectId - ID of the project
   * @returns {boolean} True if the project is favorited
   */
  isProjectFavorited(projectId) {
    return this.favorites.projects.includes(projectId);
  }
  
  /**
   * Toggle favorite status for a project
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   * @returns {Promise<boolean>} Promise resolving to the new favorite status
   */
  async toggleFavoriteProject(projectId, projectDetails = {}) {
    const isFavorited = this.isProjectFavorited(projectId);
    
    try {
      if (isFavorited) {
        await this.removeFavoriteProject(projectId, projectDetails);
        return Promise.resolve(false);
      } else {
        await this.addFavoriteProject(projectId, projectDetails);
        return Promise.resolve(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Record a project view in recently viewed
   * @param {string} projectId - ID of the project
   * @param {Object} projectDetails - Additional project details
   * @returns {Promise<void>}
   */
  async recordProjectView(projectId, projectDetails = {}) {
    if (!authService.isSignedIn()) {
      // Don't reject, just silently return if not signed in
      return Promise.resolve();
    }
    
    const viewItem = {
      id: projectId,
      type: 'project',
      name: projectDetails.name || projectId,
      description: projectDetails.description || '',
      thumbnailUrl: projectDetails.thumbnailUrl || '',
      url: projectDetails.url || `#project-${projectId}`
    };
    
    try {
      await authService.addToRecentlyViewed(viewItem);
      
      // Update local recently viewed list
      // Filter out existing item with same ID
      const filtered = this.recentlyViewed.filter(item => item.id !== projectId);
      // Add new item at the beginning and limit to 10
      this.recentlyViewed = [viewItem, ...filtered].slice(0, 10);
      
      // Notify listeners
      this.notifyProfileListeners();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error recording project view:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Show a favorite confirmation message
   * @param {string} itemName - Name of the item favorited/unfavorited
   * @param {boolean} added - Whether item was added or removed
   */
  showFavoriteConfirmation(itemName, added) {
    // Create or get the notification element
    let notificationEl = document.getElementById('favorite-notification');
    
    if (!notificationEl) {
      notificationEl = document.createElement('div');
      notificationEl.id = 'favorite-notification';
      notificationEl.className = 'fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 flex items-center';
      document.body.appendChild(notificationEl);
    }
    
    // Set the message
    const icon = added ? 'fas fa-heart text-pink-500' : 'fas fa-heart-broken text-gray-400';
    const message = added ? `Added ${itemName} to favorites` : `Removed ${itemName} from favorites`;
    
    notificationEl.innerHTML = `
      <i class="${icon} mr-2"></i>
      <span>${message}</span>
    `;
    
    // Show the notification
    setTimeout(() => {
      notificationEl.classList.remove('translate-x-full');
    }, 10);
    
    // Hide after a delay
    setTimeout(() => {
      notificationEl.classList.add('translate-x-full');
    }, 3000);
  }
  
  /**
   * Get user's favorite projects
   * @returns {Array} Array of favorited project IDs
   */
  getFavoriteProjects() {
    return this.favorites.projects || [];
  }
  
  /**
   * Get user's recently viewed items
   * @returns {Array} Array of recently viewed items
   */
  getRecentlyViewed() {
    return this.recentlyViewed || [];
  }
  
  /**
   * Update user display name
   * @param {string} displayName - New display name
   * @returns {Promise<void>}
   */
  async updateDisplayName(displayName) {
    if (!authService.isSignedIn()) {
      return Promise.reject(new Error('User must be signed in to update profile'));
    }
    
    try {
      await authService.updateProfile({ displayName });
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating display name:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Update user photo URL
   * @param {string} photoURL - New photo URL
   * @returns {Promise<void>}
   */
  async updatePhotoURL(photoURL) {
    if (!authService.isSignedIn()) {
      return Promise.reject(new Error('User must be signed in to update profile'));
    }
    
    try {
      await authService.updateProfile({ photoURL });
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating photo URL:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Get a personalized greeting for the user
   * @returns {string} Personalized greeting message
   */
  getPersonalizedGreeting() {
    if (!this.currentUser) {
      return 'Welcome, Guest';
    }
    
    const name = this.currentUser.displayName || 'Member';
    
    // Get time of day for personalized greeting
    const hour = new Date().getHours();
    let greeting = 'Welcome';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting}, ${name}`;
  }
  
  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences object
   */
  async getPreferences() {
    if (!this.userPreferences) {
      return Promise.resolve({});
    }
    return Promise.resolve(this.userPreferences);
  }

  /**
   * Set theme preference and apply it
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  async setThemePreference(theme) {
    await this.updatePreferences({ theme });
    this.applyUserPreferences();
  }

  /**
   * Set layout preference and apply it
   * @param {string} layout - 'card', 'list', 'compact'
   */
  async setLayoutPreference(layout) {
    await this.updatePreferences({ layout });
    this.applyUserPreferences();
  }

  /**
   * Add to view history (for recommendations)
   * @param {string} itemId
   * @param {string} itemType
   */
  async addToViewHistory(itemId, itemType) {
    if (!this.currentUser) return;
    const history = this.recentlyViewed || [];
    history.unshift({ itemId, itemType, viewedAt: new Date().toISOString() });
    this.recentlyViewed = history.slice(0, 20); // Keep last 20
    await this.updatePreferences({ recentlyViewed: this.recentlyViewed });
  }

  /**
   * Get personalized recommendations (simple tag-based demo)
   * @param {number} limit
   * @returns {Array} Array of recommended project IDs
   */
  getRecommendations(limit = 5) {
    // For demo, recommend projects not yet viewed or favorited
    const viewedIds = (this.recentlyViewed || []).map(v => v.itemId);
    const favoriteIds = this.favorites.projects || [];
    // Replace with actual project IDs in production
    const allProjectIds = ['proj1', 'proj2', 'proj3', 'proj4', 'proj5', 'proj6'];
    const recommendations = allProjectIds.filter(id => !viewedIds.includes(id) && !favoriteIds.includes(id));
    return recommendations.slice(0, limit);
  }
}

// Create singleton instance
const profileManager = new ProfileManager();

// Export the profile manager
export default profileManager;
