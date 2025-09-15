/**
 * DTB Technologies Digital Museum - Analytics Collector
 * Tracks user interactions and collects analytics data
 */

import { AnalyticsSchema } from './statistics.js';

// Initialize Analytics state
let analyticsState = {
  sessionStartTime: null,
  currentPage: null,
  interactionEvents: [],
  visitorId: null,
  isTracking: false
};

/**
 * Initialize the analytics collector
 * Sets up event listeners and prepares for data collection
 */
function initAnalyticsCollector() {
  // Generate or retrieve a visitor ID
  analyticsState.visitorId = getOrCreateVisitorId();
  analyticsState.sessionStartTime = new Date();
  analyticsState.currentPage = window.location.pathname;
  analyticsState.isTracking = true;
  
  // Set up event listeners
  setupEventListeners();
  
  // Record page visit
  recordPageVisit(analyticsState.currentPage);
  
  // Set up session tracking
  trackSessionDuration();
  
  console.log('Analytics collector initialized', analyticsState);
}

/**
 * Get existing visitor ID from local storage or create a new one
 * @returns {string} Visitor ID
 */
function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('dtb_visitor_id');
  
  if (!visitorId) {
    // Create a simple UUID
    visitorId = 'v' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('dtb_visitor_id', visitorId);
  }
  
  return visitorId;
}

/**
 * Setup event listeners for various user interactions
 */
function setupEventListeners() {
  // Track page navigation
  window.addEventListener('popstate', () => {
    recordPageChange(window.location.pathname);
  });
  
  // Track project card clicks
  document.querySelectorAll('.exhibit').forEach(exhibit => {
    exhibit.addEventListener('click', (e) => {
      const projectTitle = exhibit.querySelector('h3').textContent;
      recordProjectView(projectTitle);
    });
  });
  
  // Track community interactions
  const chatInput = document.querySelector('.community-chat-input');
  if (chatInput) {
    chatInput.addEventListener('submit', (e) => {
      recordCommunityInteraction('message_sent');
    });
  }
  
  // Track when users view specific sections (intersection observer)
  setupSectionViewTracking();
}

/**
 * Track when users view specific sections using Intersection Observer
 */
function setupSectionViewTracking() {
  const sections = document.querySelectorAll('section, .exhibition-item, .timeline-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Record that this section was viewed
        const sectionId = entry.target.id || entry.target.dataset.section || 'unknown-section';
        recordSectionView(sectionId);
      }
    });
  }, { threshold: 0.5 }); // Trigger when at least 50% of the section is visible
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

/**
 * Record a page visit
 * @param {string} page - The page path that was visited
 */
function recordPageVisit(page) {
  const visitData = {
    page,
    timestamp: new Date().toISOString(),
    visitorId: analyticsState.visitorId,
    referrer: document.referrer
  };
  
  // In a real implementation, this would send data to a server or Firebase
  console.log('Page visit recorded', visitData);
  
  // Add to local analytics state
  analyticsState.interactionEvents.push({
    type: 'page_visit',
    data: visitData
  });
  
  // For now, simulate sending to a server
  simulateSendToServer('page_visit', visitData);
}

/**
 * Record a page change (for SPA navigation)
 * @param {string} newPage - The new page path
 */
function recordPageChange(newPage) {
  analyticsState.currentPage = newPage;
  recordPageVisit(newPage);
}

/**
 * Record a project view
 * @param {string} projectTitle - The title of the viewed project
 */
function recordProjectView(projectTitle) {
  const viewData = {
    projectTitle,
    timestamp: new Date().toISOString(),
    visitorId: analyticsState.visitorId,
    page: analyticsState.currentPage
  };
  
  // Add to local analytics state
  analyticsState.interactionEvents.push({
    type: 'project_view',
    data: viewData
  });
  
  console.log('Project view recorded', viewData);
  
  // Simulate sending to server
  simulateSendToServer('project_view', viewData);
}

/**
 * Record when a specific section is viewed
 * @param {string} sectionId - ID of the viewed section
 */
function recordSectionView(sectionId) {
  const viewData = {
    sectionId,
    timestamp: new Date().toISOString(),
    visitorId: analyticsState.visitorId,
    durationOnPage: (new Date() - analyticsState.sessionStartTime) / 1000
  };
  
  // Add to local analytics state
  analyticsState.interactionEvents.push({
    type: 'section_view',
    data: viewData
  });
  
  console.log('Section view recorded', viewData);
  
  // Simulate sending to server
  simulateSendToServer('section_view', viewData);
}

/**
 * Record a community interaction
 * @param {string} interactionType - Type of interaction ('message_sent', 'reaction', etc.)
 * @param {Object} details - Additional details about the interaction
 */
function recordCommunityInteraction(interactionType, details = {}) {
  const interactionData = {
    interactionType,
    timestamp: new Date().toISOString(),
    visitorId: analyticsState.visitorId,
    details
  };
  
  // Add to local analytics state
  analyticsState.interactionEvents.push({
    type: 'community_interaction',
    data: interactionData
  });
  
  console.log('Community interaction recorded', interactionData);
  
  // Simulate sending to server
  simulateSendToServer('community_interaction', interactionData);
}

/**
 * Track session duration
 */
function trackSessionDuration() {
  // Record session heartbeat every minute
  const heartbeatInterval = setInterval(() => {
    if (!analyticsState.isTracking) {
      clearInterval(heartbeatInterval);
      return;
    }
    
    const sessionDuration = (new Date() - analyticsState.sessionStartTime) / 1000;
    console.log(`Session duration: ${sessionDuration} seconds`);
    
    // Every 5 minutes, record a heartbeat
    if (sessionDuration % 300 < 60) { // Within the last minute of each 5-minute period
      const heartbeatData = {
        visitorId: analyticsState.visitorId,
        timestamp: new Date().toISOString(),
        sessionDuration,
        currentPage: analyticsState.currentPage
      };
      
      // Simulate sending to server
      simulateSendToServer('session_heartbeat', heartbeatData);
    }
  }, 60000); // Check every minute
  
  // Handle page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = (new Date() - analyticsState.sessionStartTime) / 1000;
    
    const sessionData = {
      visitorId: analyticsState.visitorId,
      timestamp: new Date().toISOString(),
      sessionDuration,
      interactionCount: analyticsState.interactionEvents.length
    };
    
    // Use sendBeacon to ensure the data is sent even as the page unloads
    if (navigator.sendBeacon) {
      // In a real implementation, use navigator.sendBeacon() to a real endpoint
      console.log('Session ended, data being sent via beacon', sessionData);
    } else {
      // Fallback for browsers that don't support sendBeacon
      simulateSendToServer('session_end', sessionData, true);
    }
    
    analyticsState.isTracking = false;
  });
}

/**
 * Simulate sending data to a server (placeholder for real implementation)
 * @param {string} eventType - Type of event
 * @param {Object} data - Event data
 * @param {boolean} synchronous - Whether to send synchronously (for beforeunload)
 */
function simulateSendToServer(eventType, data, synchronous = false) {
  // In a real implementation, this would use fetch() or navigator.sendBeacon()
  // to send the data to a real backend or Firebase
  
  console.log(`[ANALYTICS] ${eventType} data would be sent to server:`, data);
  
  if (synchronous) {
    // Simulate a synchronous request (would be a real XMLHttpRequest in production)
    console.log('[ANALYTICS] Synchronous send completed');
  } else {
    // Simulate an asynchronous request
    setTimeout(() => {
      console.log(`[ANALYTICS] ${eventType} data sent successfully`);
    }, 100);
  }
}

/**
 * Stop tracking analytics (e.g., if user opts out)
 */
function stopAnalyticsTracking() {
  analyticsState.isTracking = false;
  console.log('Analytics tracking stopped');
}

// Export the public API
export {
  initAnalyticsCollector,
  recordPageVisit,
  recordProjectView,
  recordSectionView,
  recordCommunityInteraction,
  stopAnalyticsTracking
};
