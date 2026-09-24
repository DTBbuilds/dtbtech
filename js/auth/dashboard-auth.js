/**
 * DTB Technologies - Dashboard Authentication Integration
 * Mounts the user profile dropdown and applies signed-in preferences.
 * Used by dashboard/welcome.html and dashboard/feedback-admin.html.
 */

import authService from './auth-service.js';
import profileManager from './profile-manager.js';
import userProfile from './user-profile.js';

/**
 * Initialize authentication features in the dashboard
 */
export function initDashboardAuth() {
  // Create user profile dropdown in the header
  userProfile.createProfileDropdown('user-profile-container');

  // Update personalized content
  updatePersonalizedContent();

  // Listen for auth state changes to update personalized content
  authService.onAuthStateChanged(user => {
    updatePersonalizedContent(user);
  });

  // Apply preferences if user is signed in
  if (authService.isSignedIn()) {
    profileManager.applyUserPreferences();
  }

  console.log('Dashboard authentication initialized');
}

/**
 * Update personalized content in the dashboard
 * @param {Object} user - Current user, if available
 */
function updatePersonalizedContent(user = authService.getCurrentUser()) {
  // Update welcome message
  const welcomeMessageElement = document.querySelector('.welcome-message');
  if (welcomeMessageElement) {
    welcomeMessageElement.textContent = user
      ? profileManager.getPersonalizedGreeting()
      : 'Welcome to your DTB Technologies dashboard';
  }

  // Show/hide personalized sections
  const personalizedSections = document.querySelectorAll('.personalized-section');
  personalizedSections.forEach(section => {
    if (user) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
}

// Export default initialization function
export default initDashboardAuth;
