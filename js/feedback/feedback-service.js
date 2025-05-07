/**
 * DTB Technologies Digital Museum - Feedback Service
 * Handles feedback collection, storage, and retrieval
 */

import authService from '../auth/auth-service.js';

// Feedback types
const FeedbackTypes = {
  PROJECT: 'project',
  EXHIBIT: 'exhibit',
  EXPERIENCE: 'experience',
  FEATURE: 'feature',
  SUGGESTION: 'suggestion',
  BUG: 'bug'
};

// Feedback emotion types
const FeedbackEmotions = {
  VERY_SATISFIED: 5,
  SATISFIED: 4,
  NEUTRAL: 3,
  DISSATISFIED: 2,
  VERY_DISSATISFIED: 1
};

/**
 * Feedback service class
 * Manages feedback collection and retrieval
 */
class FeedbackService {
  constructor() {
    this.feedbackItems = [];
    
    // Load stored feedback on initialization
    this.loadFeedback();
  }
  
  /**
   * Load feedback from storage
   */
  loadFeedback() {
    // In a real app, this would load from a database
    // For our demo, we'll load from localStorage
    try {
      const storedFeedback = localStorage.getItem('dtb_feedback');
      if (storedFeedback) {
        this.feedbackItems = JSON.parse(storedFeedback);
      }
    } catch (error) {
      console.error('Error loading feedback from storage:', error);
      this.feedbackItems = [];
    }
    
    console.log(`Loaded ${this.feedbackItems.length} feedback items`);
  }
  
  /**
   * Save feedback to storage
   */
  saveFeedback() {
    // In a real app, this would save to a database
    // For our demo, we'll save to localStorage
    try {
      localStorage.setItem('dtb_feedback', JSON.stringify(this.feedbackItems));
    } catch (error) {
      console.error('Error saving feedback to storage:', error);
    }
  }
  
  /**
   * Submit a new feedback item
   * @param {Object} feedback - Feedback data object
   * @returns {Promise<Object>} The submitted feedback item with ID
   */
  async submitFeedback(feedback) {
    // Validate feedback
    if (!feedback.type || !feedback.emotionRating) {
      return Promise.reject(new Error('Feedback type and emotion rating are required'));
    }
    
    // Get current user info
    const currentUser = authService.getCurrentUser();
    
    // Create the feedback item
    const feedbackItem = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: feedback.type,
      itemId: feedback.itemId || null,
      itemName: feedback.itemName || null,
      emotionRating: feedback.emotionRating,
      comment: feedback.comment || '',
      category: feedback.category || null,
      screenshot: feedback.screenshot || null,
      createdAt: new Date().toISOString(),
      user: currentUser ? {
        id: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        email: currentUser.email,
        avatar: currentUser.photoURL || null
      } : {
        id: null,
        displayName: 'Anonymous Visitor',
        email: null,
        avatar: null
      },
      status: 'pending', // pending, reviewed, addressed, closed
      adminNotes: '',
      response: null,
      tags: feedback.tags || [],
      browser: navigator.userAgent,
      device: this.getDeviceType()
    };
    
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Add to local collection
        this.feedbackItems.push(feedbackItem);
        
        // Save to storage
        this.saveFeedback();
        
        console.log('Feedback submitted successfully:', feedbackItem);
        resolve(feedbackItem);
      }, 500); // Simulate network delay
    });
  }
  
  /**
   * Get feedback for a specific item
   * @param {string} itemId - ID of the item to get feedback for
   * @param {string} type - Type of feedback to retrieve
   * @returns {Array} Feedback items for the specified item
   */
  getFeedbackForItem(itemId, type = null) {
    if (!itemId) return [];
    
    return this.feedbackItems.filter(item => {
      if (item.itemId !== itemId) return false;
      if (type && item.type !== type) return false;
      return true;
    });
  }
  
  /**
   * Get all feedback
   * @param {Object} filters - Optional filters to apply
   * @returns {Array} Filtered feedback items
   */
  getAllFeedback(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return this.feedbackItems;
    }
    
    return this.feedbackItems.filter(item => {
      // Filter by type
      if (filters.type && item.type !== filters.type) return false;
      
      // Filter by rating
      if (filters.minRating && item.emotionRating < filters.minRating) return false;
      if (filters.maxRating && item.emotionRating > filters.maxRating) return false;
      
      // Filter by status
      if (filters.status && item.status !== filters.status) return false;
      
      // Filter by date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const itemDate = new Date(item.createdAt);
        if (itemDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const itemDate = new Date(item.createdAt);
        if (itemDate > endDate) return false;
      }
      
      // Filter by search text
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase();
        const matchesSearch = 
          (item.comment && item.comment.toLowerCase().includes(searchText)) ||
          (item.itemName && item.itemName.toLowerCase().includes(searchText)) ||
          (item.user.displayName && item.user.displayName.toLowerCase().includes(searchText));
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }
  
  /**
   * Update feedback status
   * @param {string} feedbackId - ID of the feedback to update
   * @param {string} status - New status
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise<Object>} Updated feedback item
   */
  async updateFeedbackStatus(feedbackId, status, adminNotes = null) {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      const feedbackIndex = this.feedbackItems.findIndex(item => item.id === feedbackId);
      
      if (feedbackIndex === -1) {
        reject(new Error('Feedback not found'));
        return;
      }
      
      setTimeout(() => {
        // Update the feedback item
        this.feedbackItems[feedbackIndex].status = status;
        
        if (adminNotes !== null) {
          this.feedbackItems[feedbackIndex].adminNotes = adminNotes;
        }
        
        // Save to storage
        this.saveFeedback();
        
        console.log('Feedback status updated:', this.feedbackItems[feedbackIndex]);
        resolve(this.feedbackItems[feedbackIndex]);
      }, 300); // Simulate network delay
    });
  }
  
  /**
   * Add a response to feedback
   * @param {string} feedbackId - ID of the feedback to respond to
   * @param {string} responseText - Response text
   * @param {string} respondentName - Name of the respondent
   * @returns {Promise<Object>} Updated feedback item
   */
  async addFeedbackResponse(feedbackId, responseText, respondentName = 'DTB Team') {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      const feedbackIndex = this.feedbackItems.findIndex(item => item.id === feedbackId);
      
      if (feedbackIndex === -1) {
        reject(new Error('Feedback not found'));
        return;
      }
      
      setTimeout(() => {
        // Add the response
        this.feedbackItems[feedbackIndex].response = {
          text: responseText,
          respondent: respondentName,
          createdAt: new Date().toISOString()
        };
        
        // Update status to reflect the response
        this.feedbackItems[feedbackIndex].status = 'addressed';
        
        // Save to storage
        this.saveFeedback();
        
        console.log('Added response to feedback:', this.feedbackItems[feedbackIndex]);
        resolve(this.feedbackItems[feedbackIndex]);
      }, 300); // Simulate network delay
    });
  }
  
  /**
   * Get feedback statistics
   * @returns {Object} Feedback statistics
   */
  getFeedbackStats() {
    const stats = {
      total: this.feedbackItems.length,
      byType: {},
      byRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byStatus: {},
      averageRating: 0,
      recentItems: []
    };
    
    // No items, return empty stats
    if (stats.total === 0) return stats;
    
    // Calculate stats
    let ratingSum = 0;
    
    this.feedbackItems.forEach(item => {
      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      
      // Count by rating
      stats.byRating[item.emotionRating] = (stats.byRating[item.emotionRating] || 0) + 1;
      ratingSum += item.emotionRating;
      
      // Count by status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    });
    
    // Calculate average rating
    stats.averageRating = ratingSum / stats.total;
    
    // Get recent items (up to 5)
    stats.recentItems = [...this.feedbackItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    return stats;
  }
  
  /**
   * Perform sentiment analysis on feedback text
   * @param {string} text - Feedback text to analyze
   * @returns {Object} Sentiment analysis result
   */
  analyzeSentiment(text) {
    // In a real app, this would use a proper NLP service like Azure Text Analytics or Google NL API
    // For our demo, we'll use a very basic implementation
    
    if (!text || text.trim().length === 0) {
      return { score: 0, sentiment: 'neutral', confidence: 0 };
    }
    
    const text_lower = text.toLowerCase();
    
    // Very basic keyword matching for demo purposes
    const positiveKeywords = ['great', 'good', 'awesome', 'excellent', 'love', 'like', 'helpful', 'easy', 'impressed', 'amazing'];
    const negativeKeywords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'difficult', 'confusing', 'disappointed', 'issue', 'problem'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Count positive/negative keywords
    positiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text_lower.match(regex);
      if (matches) positiveScore += matches.length;
    });
    
    negativeKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text_lower.match(regex);
      if (matches) negativeScore += matches.length;
    });
    
    // Calculate overall sentiment score (-1 to 1)
    const totalKeywords = positiveScore + negativeScore;
    let sentimentScore = 0;
    let confidence = 0;
    
    if (totalKeywords > 0) {
      sentimentScore = (positiveScore - negativeScore) / totalKeywords;
      confidence = Math.min(totalKeywords / 5, 1); // Max confidence at 5+ keywords
    }
    
    // Determine sentiment category
    let sentiment = 'neutral';
    if (sentimentScore >= 0.5) sentiment = 'positive';
    else if (sentimentScore <= -0.5) sentiment = 'negative';
    else if (sentimentScore > 0) sentiment = 'somewhat positive';
    else if (sentimentScore < 0) sentiment = 'somewhat negative';
    
    return {
      score: sentimentScore,
      sentiment,
      confidence
    };
  }
  
  /**
   * Get the current device type
   * @returns {string} Device type
   */
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Export feedback data as CSV
   * @returns {string} CSV data
   */
  exportAsCSV() {
    if (this.feedbackItems.length === 0) {
      return 'No feedback data to export';
    }
    
    // Define columns
    const columns = [
      'ID', 'Type', 'Item', 'Rating', 'Comment', 'Created At', 
      'User', 'Status', 'Admin Notes', 'Response'
    ];
    
    // Create CSV header
    let csv = columns.join(',') + '\n';
    
    // Add rows
    this.feedbackItems.forEach(item => {
      const row = [
        item.id,
        item.type,
        item.itemName || '-',
        item.emotionRating,
        `"${(item.comment || '').replace(/"/g, '""')}"`, // Escape quotes
        item.createdAt,
        item.user.displayName,
        item.status,
        `"${(item.adminNotes || '').replace(/"/g, '""')}"`, // Escape quotes
        item.response ? `"${item.response.text.replace(/"/g, '""')}"` : '-' // Escape quotes
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }
}

// Create singleton instance
const feedbackService = new FeedbackService();

// Export the service and constants
export { feedbackService, FeedbackTypes, FeedbackEmotions };
