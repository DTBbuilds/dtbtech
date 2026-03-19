/**
 * DTB Technologies Digital Museum - Feedback Widget
 * Provides a floating feedback button that can be embedded in any page
 */

import { FeedbackTypes } from './feedback-service.js';
import feedbackForm from './feedback-form.js';

/**
 * FeedbackWidget class
 * Creates and manages a floating feedback button
 */
class FeedbackWidget {
  constructor() {
    this.widgetElement = null;
    this.isExpanded = false;
    this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Initialize the widget
    this.init();
  }
  
  /**
   * Initialize the feedback widget
   */
  init() {
    // Create the widget if it doesn't exist
    if (!this.widgetElement) {
      this.createWidget();
    }
    
    console.log('Feedback widget initialized');
  }
  
  /**
   * Create the feedback widget element
   */
  createWidget() {
    // Create widget container
    this.widgetElement = document.createElement('div');
    this.widgetElement.className = 'fixed bottom-6 right-6 z-40';
    this.widgetElement.id = 'feedback-widget';
    
    // Create widget button
    this.widgetElement.innerHTML = `
      <div class="feedback-button-container relative">
        <button id="feedback-button" class="feedback-button w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        
        <div id="feedback-menu" class="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 p-2 hidden transform scale-95 opacity-0 transition-all duration-200">
          <div class="py-1 text-sm">
            <button class="feedback-option block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md transition-colors" data-type="experience">
              <i class="fas fa-star text-yellow-400 mr-2"></i> Rate Your Experience
            </button>
            <button class="feedback-option block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md transition-colors" data-type="suggestion">
              <i class="fas fa-lightbulb text-blue-400 mr-2"></i> Suggest an Idea
            </button>
            <button class="feedback-option block w-full text-left px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-md transition-colors" data-type="bug">
              <i class="fas fa-bug text-red-400 mr-2"></i> Report an Issue
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupEventListeners();
    
    // Add to document
    document.body.appendChild(this.widgetElement);
    
    // Add CSS for widget
    const style = document.createElement('style');
    style.textContent = `
      .feedback-button {
        transition: transform 0.3s, background-color 0.3s;
      }
      .feedback-button:hover {
        transform: scale(1.1);
      }
      .feedback-button.expanded {
        transform: rotate(45deg);
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Set up event listeners for the widget
   */
  setupEventListeners() {
    // Feedback button click
    const feedbackButton = this.widgetElement.querySelector('#feedback-button');
    if (feedbackButton) {
      feedbackButton.addEventListener('click', () => this.toggleMenu());
    }
    
    // Feedback option clicks
    const feedbackOptions = this.widgetElement.querySelectorAll('.feedback-option');
    feedbackOptions.forEach(option => {
      option.addEventListener('click', () => {
        const feedbackType = option.dataset.type;
        this.showFeedbackForm(feedbackType);
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isExpanded && !this.widgetElement.contains(e.target)) {
        this.closeMenu();
      }
    });
  }
  
  /**
   * Toggle the feedback menu
   */
  toggleMenu() {
    if (this.isExpanded) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  /**
   * Open the feedback menu
   */
  openMenu() {
    const feedbackButton = this.widgetElement.querySelector('#feedback-button');
    const feedbackMenu = this.widgetElement.querySelector('#feedback-menu');
    
    if (feedbackButton && feedbackMenu) {
      feedbackButton.classList.add('expanded');
      feedbackMenu.classList.remove('hidden');
      
      // Animate menu opening
      setTimeout(() => {
        feedbackMenu.classList.remove('scale-95', 'opacity-0');
        feedbackMenu.classList.add('scale-100', 'opacity-100');
      }, 10);
      
      this.isExpanded = true;
    }
  }
  
  /**
   * Close the feedback menu
   */
  closeMenu() {
    const feedbackButton = this.widgetElement.querySelector('#feedback-button');
    const feedbackMenu = this.widgetElement.querySelector('#feedback-menu');
    
    if (feedbackButton && feedbackMenu) {
      feedbackButton.classList.remove('expanded');
      feedbackMenu.classList.remove('scale-100', 'opacity-100');
      feedbackMenu.classList.add('scale-95', 'opacity-0');
      
      // Hide menu after animation
      setTimeout(() => {
        feedbackMenu.classList.add('hidden');
      }, 200);
      
      this.isExpanded = false;
    }
  }
  
  /**
   * Show the feedback form
   * @param {string} feedbackType - Type of feedback
   */
  showFeedbackForm(feedbackType) {
    // Close the menu
    this.closeMenu();
    
    // Determine feedback type
    let type = FeedbackTypes.EXPERIENCE;
    switch (feedbackType) {
      case 'suggestion':
        type = FeedbackTypes.SUGGESTION;
        break;
      case 'bug':
        type = FeedbackTypes.BUG;
        break;
    }
    
    // Determine context based on current page
    let itemId = null;
    let itemName = null;
    
    // Detect if we're on a specific page or viewing a specific exhibit
    if (this.currentPage.includes('exhibit') || this.currentPage.includes('project')) {
      // Try to find exhibit or project info
      const title = document.querySelector('h1')?.textContent || document.querySelector('h2')?.textContent;
      if (title) {
        itemId = this.currentPage;
        itemName = title;
        type = FeedbackTypes.EXHIBIT;
      }
    } else if (this.currentPage === 'welcome.html') {
      itemId = 'dashboard';
      itemName = 'Digital Museum Dashboard';
    } else if (this.currentPage.includes('3d-project-viewer.html')) {
      itemId = '3d-viewer';
      itemName = '3D Project Viewer';
    } else if (this.currentPage.includes('office-tour.html')) {
      itemId = 'office-tour';
      itemName = 'Virtual Office Tour';
    }
    
    // Show the feedback form
    feedbackForm.show(type, itemId, itemName);
  }
}

// Create singleton instance
const feedbackWidget = new FeedbackWidget();

// Export the feedback widget
export default feedbackWidget;
