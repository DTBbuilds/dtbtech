/**
 * DTB Technologies Digital Museum - Feedback Form
 * Creates and manages the feedback collection UI
 */

import { feedbackService, FeedbackTypes, FeedbackEmotions } from './feedback-service.js';
import authService from '../auth/auth-service.js';

/**
 * FeedbackForm class
 * Creates and manages the feedback collection form UI
 */
class FeedbackForm {
  constructor() {
    this.formElement = null;
    this.currentType = FeedbackTypes.EXPERIENCE;
    this.currentItemId = null;
    this.currentItemName = null;
    this.screenshot = null;
    this.onSubmitCallback = null;
    this.isSubmitting = false;
  }
  
  /**
   * Show the feedback form modal
   * @param {string} type - Type of feedback (project, exhibit, experience, etc)
   * @param {string} itemId - ID of the item being rated (optional)
   * @param {string} itemName - Name of the item being rated (optional)
   * @param {Function} onSubmit - Callback function called after successful submission
   */
  show(type = FeedbackTypes.EXPERIENCE, itemId = null, itemName = null, onSubmit = null) {
    this.currentType = type;
    this.currentItemId = itemId;
    this.currentItemName = itemName;
    this.onSubmitCallback = onSubmit;
    
    // Create the form if it doesn't exist
    if (!this.formElement) {
      this.createForm();
    }
    
    // Update the form title and fields based on feedback type
    this.updateFormForType();
    
    // Show the form
    this.formElement.classList.remove('hidden');
    setTimeout(() => {
      this.formElement.classList.add('opacity-100');
      this.formElement.querySelector('.modal-container').classList.add('translate-y-0');
    }, 10);
  }
  
  /**
   * Hide the feedback form modal
   */
  hide() {
    if (!this.formElement) return;
    
    this.formElement.classList.remove('opacity-100');
    this.formElement.querySelector('.modal-container').classList.remove('translate-y-0');
    
    setTimeout(() => {
      this.formElement.classList.add('hidden');
      
      // Reset form when hidden
      this.resetForm();
    }, 300);
  }
  
  /**
   * Create the feedback form element
   */
  createForm() {
    // Create form container
    this.formElement = document.createElement('div');
    this.formElement.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm opacity-0 transition-opacity duration-300 hidden';
    this.formElement.id = 'feedback-form-modal';
    
    // Create form structure
    this.formElement.innerHTML = `
      <div class="modal-container bg-slate-800 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl transform -translate-y-8 transition-transform duration-300">
        <div class="modal-header relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div class="relative p-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-white modal-title">Share Your Feedback</h2>
              <button class="modal-close text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-body p-6 pt-2">
          <form id="feedback-form" class="space-y-4">
            <div id="feedback-context" class="text-gray-300 text-sm mb-4"></div>
            
            <div class="feedback-rating">
              <label class="block text-sm font-medium text-gray-300 mb-3">How would you rate your experience?</label>
              <div class="flex justify-between">
                <div class="reaction-option text-center cursor-pointer" data-rating="1">
                  <div class="text-4xl mb-1">😞</div>
                  <div class="text-xs text-gray-400">Very Dissatisfied</div>
                </div>
                <div class="reaction-option text-center cursor-pointer" data-rating="2">
                  <div class="text-4xl mb-1">😕</div>
                  <div class="text-xs text-gray-400">Dissatisfied</div>
                </div>
                <div class="reaction-option text-center cursor-pointer" data-rating="3">
                  <div class="text-4xl mb-1">😐</div>
                  <div class="text-xs text-gray-400">Neutral</div>
                </div>
                <div class="reaction-option text-center cursor-pointer" data-rating="4">
                  <div class="text-4xl mb-1">🙂</div>
                  <div class="text-xs text-gray-400">Satisfied</div>
                </div>
                <div class="reaction-option text-center cursor-pointer" data-rating="5">
                  <div class="text-4xl mb-1">😄</div>
                  <div class="text-xs text-gray-400">Very Satisfied</div>
                </div>
              </div>
              <input type="hidden" id="feedback-rating" name="feedback-rating" value="">
            </div>
            
            <div class="form-group">
              <label for="feedback-comment" class="block text-sm font-medium text-gray-300 mb-1">Additional Comments</label>
              <textarea id="feedback-comment" name="feedback-comment" rows="4" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Share your thoughts, suggestions, or feedback..."></textarea>
            </div>
            
            <div id="feedback-category-container" class="form-group hidden">
              <label for="feedback-category" class="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select id="feedback-category" name="feedback-category" class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select a category</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="content">Content</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="flex items-center space-x-2">
              <button type="button" id="capture-screenshot-btn" class="inline-flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Attach Screenshot
              </button>
              <div id="screenshot-preview" class="hidden">
                <div class="flex items-center text-xs text-gray-300">
                  <span class="mr-2">Screenshot attached</span>
                  <button type="button" id="remove-screenshot-btn" class="text-gray-400 hover:text-red-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div id="feedback-error" class="text-red-500 text-sm hidden"></div>
            <div id="feedback-success" class="text-green-500 text-sm hidden"></div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" id="cancel-feedback-btn" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" id="submit-feedback-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
                <span>Submit Feedback</span>
                <div id="feedback-spinner" class="hidden ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupEventListeners();
    
    // Add to document
    document.body.appendChild(this.formElement);
    
    // Add CSS for selected rating
    const style = document.createElement('style');
    style.textContent = `
      .reaction-option {
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .reaction-option:hover {
        background-color: rgba(59, 130, 246, 0.1);
      }
      .reaction-option.selected {
        background-color: rgba(59, 130, 246, 0.2);
        transform: translateY(-4px);
      }
      .reaction-option.selected .text-xs {
        color: #93c5fd;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Set up event listeners for the form
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.formElement.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    // Cancel button
    const cancelBtn = this.formElement.querySelector('#cancel-feedback-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }
    
    // Rating options
    const ratingOptions = this.formElement.querySelectorAll('.reaction-option');
    ratingOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        ratingOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Update hidden rating input
        const ratingInput = this.formElement.querySelector('#feedback-rating');
        if (ratingInput) {
          ratingInput.value = option.dataset.rating;
        }
      });
    });
    
    // Capture screenshot button
    const captureScreenshotBtn = this.formElement.querySelector('#capture-screenshot-btn');
    if (captureScreenshotBtn) {
      captureScreenshotBtn.addEventListener('click', () => this.captureScreenshot());
    }
    
    // Remove screenshot button
    const removeScreenshotBtn = this.formElement.querySelector('#remove-screenshot-btn');
    if (removeScreenshotBtn) {
      removeScreenshotBtn.addEventListener('click', () => this.removeScreenshot());
    }
    
    // Form submission
    const form = this.formElement.querySelector('#feedback-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitFeedback();
      });
    }
    
    // Close when clicking outside
    this.formElement.addEventListener('click', (e) => {
      if (e.target === this.formElement) {
        this.hide();
      }
    });
  }
  
  /**
   * Update the form fields based on feedback type
   */
  updateFormForType() {
    const contextElement = this.formElement.querySelector('#feedback-context');
    const categoryContainer = this.formElement.querySelector('#feedback-category-container');
    const title = this.formElement.querySelector('.modal-title');
    
    // Update title based on feedback type
    switch (this.currentType) {
      case FeedbackTypes.PROJECT:
        title.textContent = 'Project Feedback';
        break;
      case FeedbackTypes.EXHIBIT:
        title.textContent = 'Exhibit Feedback';
        break;
      case FeedbackTypes.FEATURE:
        title.textContent = 'Feature Feedback';
        break;
      case FeedbackTypes.BUG:
        title.textContent = 'Report an Issue';
        break;
      case FeedbackTypes.SUGGESTION:
        title.textContent = 'Suggestion';
        break;
      default:
        title.textContent = 'Share Your Feedback';
    }
    
    // Show context information if we have an item name
    if (contextElement) {
      if (this.currentItemName) {
        contextElement.textContent = `You're providing feedback for: ${this.currentItemName}`;
        contextElement.classList.remove('hidden');
      } else {
        contextElement.classList.add('hidden');
      }
    }
    
    // Show category field for certain feedback types
    if (categoryContainer) {
      if (this.currentType === FeedbackTypes.SUGGESTION || this.currentType === FeedbackTypes.BUG) {
        categoryContainer.classList.remove('hidden');
      } else {
        categoryContainer.classList.add('hidden');
      }
    }
  }
  
  /**
   * Reset the form to default state
   */
  resetForm() {
    // Reset rating
    const ratingOptions = this.formElement.querySelectorAll('.reaction-option');
    ratingOptions.forEach(opt => opt.classList.remove('selected'));
    
    const ratingInput = this.formElement.querySelector('#feedback-rating');
    if (ratingInput) ratingInput.value = '';
    
    // Reset comment
    const commentInput = this.formElement.querySelector('#feedback-comment');
    if (commentInput) commentInput.value = '';
    
    // Reset category
    const categoryInput = this.formElement.querySelector('#feedback-category');
    if (categoryInput) categoryInput.value = '';
    
    // Reset screenshot
    this.removeScreenshot();
    
    // Hide error and success messages
    const errorElement = this.formElement.querySelector('#feedback-error');
    if (errorElement) errorElement.classList.add('hidden');
    
    const successElement = this.formElement.querySelector('#feedback-success');
    if (successElement) successElement.classList.add('hidden');
    
    // Reset submit button
    const submitButton = this.formElement.querySelector('#submit-feedback-btn');
    const spinner = this.formElement.querySelector('#feedback-spinner');
    if (submitButton) submitButton.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    
    // Reset state variables
    this.currentType = FeedbackTypes.EXPERIENCE;
    this.currentItemId = null;
    this.currentItemName = null;
    this.screenshot = null;
    this.onSubmitCallback = null;
    this.isSubmitting = false;
  }
  
  /**
   * Capture a screenshot of the current page
   */
  captureScreenshot() {
    try {
      // In a real implementation, you would use html2canvas or similar library
      // For this demo, we'll simulate a screenshot with a placeholder
      this.screenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJegQVHdwAAAABJRU5ErkJggg==';
      
      // Show screenshot preview
      const previewElement = this.formElement.querySelector('#screenshot-preview');
      if (previewElement) {
        previewElement.classList.remove('hidden');
      }
      
      // Hide capture button
      const captureBtn = this.formElement.querySelector('#capture-screenshot-btn');
      if (captureBtn) {
        captureBtn.classList.add('hidden');
      }
      
      console.log('Screenshot captured');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      
      // Show error
      const errorElement = this.formElement.querySelector('#feedback-error');
      if (errorElement) {
        errorElement.textContent = 'Failed to capture screenshot. Please try again.';
        errorElement.classList.remove('hidden');
      }
    }
  }
  
  /**
   * Remove the captured screenshot
   */
  removeScreenshot() {
    this.screenshot = null;
    
    // Hide screenshot preview
    const previewElement = this.formElement.querySelector('#screenshot-preview');
    if (previewElement) {
      previewElement.classList.add('hidden');
    }
    
    // Show capture button
    const captureBtn = this.formElement.querySelector('#capture-screenshot-btn');
    if (captureBtn) {
      captureBtn.classList.remove('hidden');
    }
  }
  
  /**
   * Submit the feedback
   */
  async submitFeedback() {
    if (this.isSubmitting) return;
    
    // Get form values
    const ratingInput = this.formElement.querySelector('#feedback-rating');
    const commentInput = this.formElement.querySelector('#feedback-comment');
    const categoryInput = this.formElement.querySelector('#feedback-category');
    const errorElement = this.formElement.querySelector('#feedback-error');
    const successElement = this.formElement.querySelector('#feedback-success');
    const submitButton = this.formElement.querySelector('#submit-feedback-btn');
    const spinner = this.formElement.querySelector('#feedback-spinner');
    
    if (!ratingInput || !commentInput || !errorElement || !successElement || !submitButton || !spinner) {
      console.error('Missing form elements');
      return;
    }
    
    const rating = ratingInput.value;
    const comment = commentInput.value.trim();
    const category = categoryInput?.value || null;
    
    // Validate input
    if (!rating) {
      errorElement.textContent = 'Please select a rating';
      errorElement.classList.remove('hidden');
      return;
    }
    
    // Hide error and success messages
    errorElement.classList.add('hidden');
    successElement.classList.add('hidden');
    
    // Show loading state
    this.isSubmitting = true;
    submitButton.disabled = true;
    spinner.classList.remove('hidden');
    
    try {
      // Prepare feedback data
      const feedbackData = {
        type: this.currentType,
        itemId: this.currentItemId,
        itemName: this.currentItemName,
        emotionRating: parseInt(rating),
        comment,
        category,
        screenshot: this.screenshot,
        tags: []
      };
      
      // Add tags based on feedback type and category
      if (this.currentType) {
        feedbackData.tags.push(this.currentType);
      }
      
      if (category) {
        feedbackData.tags.push(category);
      }
      
      // Analyze sentiment if there's a comment
      if (comment) {
        const sentimentResult = feedbackService.analyzeSentiment(comment);
        feedbackData.tags.push(`sentiment:${sentimentResult.sentiment}`);
        
        // Add sentiment tags with higher confidence
        if (sentimentResult.confidence > 0.5) {
          feedbackData.tags.push(sentimentResult.sentiment);
        }
      }
      
      // Submit feedback
      const result = await feedbackService.submitFeedback(feedbackData);
      
      // Success
      successElement.textContent = 'Thank you for your feedback!';
      successElement.classList.remove('hidden');
      
      // Hide form after a delay
      setTimeout(() => {
        this.hide();
        
        // Call success callback if provided
        if (typeof this.onSubmitCallback === 'function') {
          this.onSubmitCallback(result);
        }
      }, 2000);
    } catch (error) {
      // Show error
      errorElement.textContent = error.message || 'Failed to submit feedback. Please try again.';
      errorElement.classList.remove('hidden');
      
      console.error('Feedback submission error:', error);
    } finally {
      // Reset loading state
      this.isSubmitting = false;
      submitButton.disabled = false;
      spinner.classList.add('hidden');
    }
  }
}

// Create singleton instance
const feedbackForm = new FeedbackForm();

// Export the feedback form
export default feedbackForm;
