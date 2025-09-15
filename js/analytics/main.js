/**
 * DTB Technologies Digital Museum - Analytics Main Entry Point
 * Initializes and coordinates the analytics system
 */

import { initAnalyticsCollector } from './collector.js';
import { initVisualizer, cleanupVisualizer } from './visualizer.js';

/**
 * Initialize the entire analytics system
 * @param {Object} options - Configuration options
 */
function initAnalytics(options = {}) {
  // Default options
  const config = {
    enableCollection: true, // Whether to collect user data
    initialTimeframe: 'daily', // Initial chart timeframe
    updateInterval: 30000, // Real-time update interval (ms)
    ...options
  };
  
  console.log('Initializing DTB Analytics System', config);
  
  // Check if analytics has user consent (normally would check cookies/localStorage)
  if (hasAnalyticsConsent()) {
    // Start the data collector if enabled
    if (config.enableCollection) {
      initAnalyticsCollector();
    }
    
    // Initialize the visualizer for charts and counters
    initVisualizer(config.initialTimeframe);
    
    // Apply any custom update interval
    if (config.updateInterval !== 30000) {
      setCustomUpdateInterval(config.updateInterval);
    }
    
    // Setup cleanup handler
    setupCleanupHandler();
    
    console.log('DTB Analytics System initialized successfully');
    return true;
  } else {
    console.log('Analytics consent not given, system not initialized');
    showConsentPrompt();
    return false;
  }
}

/**
 * Check if the user has given consent for analytics
 * @returns {boolean} Whether consent has been given
 */
function hasAnalyticsConsent() {
  // In a production app, this would check cookies or localStorage
  // For our prototype, we'll assume consent is given
  return true;
}

/**
 * Show a consent prompt for analytics
 */
function showConsentPrompt() {
  // In a real app, this would show a GDPR-compliant cookie/tracking consent banner
  console.log('Would show analytics consent prompt here');
}

/**
 * Set a custom update interval for real-time data
 * @param {number} interval - Update interval in milliseconds
 */
function setCustomUpdateInterval(interval) {
  if (window.analyticsUpdateInterval) {
    clearInterval(window.analyticsUpdateInterval);
  }
  
  // This would re-initialize the real-time updates with a custom interval
  console.log(`Setting custom update interval: ${interval}ms`);
}

/**
 * Set up cleanup handler for when the user navigates away
 */
function setupCleanupHandler() {
  // Clean up resources when the page is unloaded
  window.addEventListener('beforeunload', () => {
    cleanupVisualizer();
  });
}

// Export the public API
export {
  initAnalytics
};
