/**
 * DTB Technologies Digital Museum - Feedback Initialization
 * Initializes the feedback collection system in the dashboard
 */

import feedbackWidget from './feedback-widget.js';
import { feedbackService } from './feedback-service.js';

/**
 * Initialize the feedback collection system
 * @param {Object} options - Configuration options
 */
export function initFeedbackSystem(options = {}) {
  // Default options
  const config = {
    enableWidget: true,  // Whether to show the floating feedback button
    enableContextFeedback: true, // Whether to add feedback buttons to projects/exhibits
    allowAnonymous: true, // Whether to allow anonymous feedback
    ...options
  };
  
  // Initialize feedback widget if enabled
  if (config.enableWidget) {
    // Widget is automatically initialized when imported
    console.log('Feedback widget enabled');
  }
  
  // Add feedback buttons to projects/exhibits if enabled
  if (config.enableContextFeedback) {
    addFeedbackButtonsToExhibits();
  }
  
  console.log('Feedback system initialized');
}

/**
 * Add feedback buttons to project/exhibit cards
 */
function addFeedbackButtonsToExhibits() {
  // Find all project cards and exhibits
  const exhibits = document.querySelectorAll('.exhibit, .project-card');
  
  exhibits.forEach(exhibit => {
    // Skip if already has a feedback button
    if (exhibit.querySelector('.feedback-btn')) return;
    
    // Get project ID and name
    const projectId = exhibit.dataset.projectId;
    const projectName = exhibit.querySelector('h3')?.textContent || 'Project';
    
    if (!projectId) return;
    
    // Create controls container if it doesn't exist
    let controlsContainer = exhibit.querySelector('.exhibit-controls');
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'exhibit-controls absolute bottom-2 right-2 flex space-x-1';
      exhibit.style.position = 'relative';
      exhibit.appendChild(controlsContainer);
    }
    
    // Create feedback button
    const feedbackBtn = document.createElement('button');
    feedbackBtn.className = 'feedback-btn p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-gray-300 hover:text-white';
    feedbackBtn.title = 'Provide feedback';
    feedbackBtn.innerHTML = '<i class="fas fa-comment"></i>';
    
    // Add click event
    feedbackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Import feedback form dynamically
      import('./feedback-form.js').then(module => {
        const feedbackForm = module.default;
        feedbackForm.show('project', projectId, projectName);
      }).catch(error => {
        console.error('Error loading feedback form:', error);
      });
    });
    
    // Add to controls container
    controlsContainer.appendChild(feedbackBtn);
  });
}

/**
 * Get feedback statistics for dashboard display
 * @returns {Object} Feedback statistics
 */
export function getFeedbackStats() {
  return feedbackService.getFeedbackStats();
}

// Export default initialization function
export default initFeedbackSystem;
