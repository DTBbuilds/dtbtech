/**
 * DTB Technologies Digital Museum - Dashboard Authentication Integration
 * Integrates authentication and personalization features into the dashboard
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
  
  // Add favorite buttons to projects
  addFavoriteButtonsToProjects();
  
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
      : 'Welcome to DTB Technologies Digital Museum';
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
  
  // Update favorites section if it exists
  updateFavoritesSection(user);
  
  // Update recently viewed section if it exists
  updateRecentlyViewedSection(user);
}

/**
 * Update the favorites section with user's favorite projects
 * @param {Object} user - Current user, if available
 */
function updateFavoritesSection(user = authService.getCurrentUser()) {
  const favoritesContainer = document.getElementById('favorites-container');
  if (!favoritesContainer) return;
  
  if (!user) {
    favoritesContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400">Favorites are available when you are signed in.</p>
      </div>
    `;
    return;
  }
  
  // Get favorite projects
  const favoriteProjects = profileManager.getFavoriteProjects();
  
  if (favoriteProjects.length === 0) {
    // No favorites yet
    favoritesContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400">You haven't added any favorites yet</p>
      </div>
    `;
    return;
  }
  
  // Render favorite projects
  // In a real implementation, you would fetch project details from a database
  // For now, we'll use some hardcoded examples based on projectId
  
  let favoritesHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
  
  favoriteProjects.forEach(projectId => {
    // Get project details (mock data based on ID)
    const project = getMockProjectDetails(projectId);
    
    favoritesHTML += `
      <div class="project-card bg-slate-800/70 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300">
        <img src="${project.thumbnailUrl}" alt="${project.name}" class="w-full h-32 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-medium text-white mb-2">${project.name}</h3>
          <p class="text-sm text-gray-300 mb-4 line-clamp-2">${project.description}</p>
          <div class="flex justify-between items-center">
            <a href="${project.url}" class="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              View Project <i class="fas fa-arrow-right ml-1"></i>
            </a>
            <div id="favorite-container-${projectId}"></div>
          </div>
        </div>
      </div>
    `;
  });
  
  favoritesHTML += '</div>';
  favoritesContainer.innerHTML = favoritesHTML;
  
  // Add favorite buttons to each project
  favoriteProjects.forEach(projectId => {
    // Get project details
    const project = getMockProjectDetails(projectId);
    
    // Create favorite button
    userProfile.createFavoriteButton(projectId, `favorite-container-${projectId}`, project);
  });
}

/**
 * Update the recently viewed section with user's recent activity
 * @param {Object} user - Current user, if available
 */
function updateRecentlyViewedSection(user = authService.getCurrentUser()) {
  const recentlyViewedContainer = document.getElementById('recently-viewed-container');
  if (!recentlyViewedContainer) return;
  
  if (!user) {
    recentlyViewedContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400">No recent activity</p>
      </div>
    `;
    return;
  }
  
  // Get recently viewed items
  const recentlyViewed = profileManager.getRecentlyViewed();
  
  if (recentlyViewed.length === 0) {
    // No recent activity
    recentlyViewedContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400">No recent activity</p>
      </div>
    `;
    return;
  }
  
  // Render recently viewed items
  let recentHTML = '<div class="space-y-4">';
  
  recentlyViewed.forEach(item => {
    // Format the view date
    const viewDate = new Date(item.viewedAt);
    const formattedDate = viewDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    recentHTML += `
      <div class="flex items-center space-x-4 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors">
        <div class="flex-shrink-0">
          <img src="${item.thumbnailUrl || '../assets/project-placeholder.jpg'}" alt="${item.name}" class="h-12 w-12 rounded object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-white truncate">${item.name}</h4>
          <p class="text-xs text-gray-400 truncate">${item.description || ''}</p>
          <p class="text-xs text-gray-500 mt-1">${formattedDate}</p>
        </div>
        <div>
          <a href="${item.url}" class="text-blue-400 hover:text-blue-300 transition-colors">
            <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
      </div>
    `;
  });
  
  recentHTML += '</div>';
  recentlyViewedContainer.innerHTML = recentHTML;
}

/**
 * Add favorite buttons to project cards
 */
function addFavoriteButtonsToProjects() {
  // Find all project cards with a favorite-container
  const projectCards = document.querySelectorAll('.project-card, .exhibit');
  
  projectCards.forEach(card => {
    // Check if this card has a project ID data attribute
    const projectId = card.dataset.projectId;
    if (!projectId) return;
    
    // Find or create a favorite container
    let favoriteContainer = card.querySelector('.favorite-container');
    if (!favoriteContainer) {
      favoriteContainer = document.createElement('div');
      favoriteContainer.className = 'favorite-container absolute top-2 right-2';
      favoriteContainer.id = `favorite-container-${projectId}`;
      card.appendChild(favoriteContainer);
    }
    
    // Get project details
    const name = card.querySelector('h3')?.textContent || 'Project';
    const description = card.querySelector('p')?.textContent || '';
    const thumbnailUrl = card.querySelector('img')?.src || '';
    
    // Create the favorite button
    userProfile.createFavoriteButton(projectId, favoriteContainer.id, {
      name,
      description,
      thumbnailUrl
    });
    
    // Record project view when card is clicked
    card.addEventListener('click', (e) => {
      // Don't record if the favorite button was clicked
      if (e.target.closest('.favorite-btn') || e.target.closest('.favorite-container')) {
        return;
      }
      
      userProfile.recordProjectView(projectId, {
        name,
        description,
        thumbnailUrl,
        url: card.querySelector('a')?.href || window.location.href
      });
    });
  });
}

/**
 * Get mock project details based on project ID
 * In a real app, this would fetch from a database
 * @param {string} projectId - ID of the project
 * @returns {Object} Project details
 */
function getMockProjectDetails(projectId) {
  const mockProjects = {
    'dtbtech': {
      name: 'DTB Technologies Main Site',
      description: 'The primary corporate website showcasing our services and capabilities.',
      thumbnailUrl: '../assets/thumbnails/dtbtech-thumb.jpg',
      url: '#dtbtech'
    },
    'lnb-store': {
      name: 'Linda\'s Nut Butter Store',
      description: 'E-commerce platform for artisanal nut butter products with secure checkout.',
      thumbnailUrl: '../assets/thumbnails/lnb-thumb.jpg',
      url: '#lnb-store'
    },
    'mopatience': {
      name: 'MOPATIENCE ORGANIZATION',
      description: 'Non-profit platform with donation capabilities and volunteer management.',
      thumbnailUrl: '../assets/thumbnails/mopatience-thumb.jpg',
      url: '#mopatience'
    },
    'netmanage': {
      name: 'NetManage Pro',
      description: 'Network management system with monitoring and diagnostics capabilities.',
      thumbnailUrl: '../assets/thumbnails/netmanage-thumb.jpg',
      url: '#netmanage'
    },
    'securepay': {
      name: 'SecurePay Mobile',
      description: 'Mobile banking application with integrated M-PESA transactions and financial analytics.',
      thumbnailUrl: '../assets/thumbnails/securepay-thumb.jpg',
      url: '#securepay'
    }
  };
  
  return mockProjects[projectId] || {
    name: projectId,
    description: 'Project description',
    thumbnailUrl: '../assets/project-placeholder.jpg',
    url: `#project-${projectId}`
  };
}

// Export default initialization function
export default initDashboardAuth;
