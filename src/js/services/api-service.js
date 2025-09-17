/**
 * API Service for DTB Technologies
 * Handles all API calls with proper fallbacks for frontend-only deployment
 */

class APIService {
  constructor() {
    this.isAnalyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.environment = import.meta.env.VITE_ENVIRONMENT || 'production';
    
    // Check if we're in frontend-only mode
    this.isFrontendOnly = !this.apiUrl || this.apiUrl.includes('your-backend-api');
    
    console.log('API Service initialized:', {
      analyticsEnabled: this.isAnalyticsEnabled,
      frontendOnly: this.isFrontendOnly,
      environment: this.environment
    });
  }

  /**
   * Send analytics data with proper fallback handling
   */
  async sendAnalytics(event, data) {
    // Skip if analytics disabled or frontend-only mode
    if (!this.isAnalyticsEnabled || this.isFrontendOnly) {
      if (this.environment === 'development') {
        console.log('Analytics (disabled):', { event, data });
      }
      return { success: true, message: 'Analytics disabled' };
    }

    try {
      // Try to send to backend API
      const response = await this.makeRequest('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ event, data, timestamp: Date.now() })
      });
      
      return { success: true, data: response };
    } catch (error) {
      // Fallback to local storage for offline analytics
      this.storeAnalyticsLocally(event, data);
      return { success: false, error: error.message, fallback: 'local_storage' };
    }
  }

  /**
   * Send web vitals data with proper fallback handling
   */
  async sendWebVitals(metric, value, status) {
    // Skip if analytics disabled or frontend-only mode
    if (!this.isAnalyticsEnabled || this.isFrontendOnly) {
      if (this.environment === 'development') {
        console.log('Web Vitals (disabled):', { metric, value, status });
      }
      return { success: true, message: 'Web vitals disabled' };
    }

    const data = {
      metric,
      value,
      status,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      // Try sendBeacon first (for page unload scenarios)
      if (navigator.sendBeacon && !this.isFrontendOnly) {
        const blob = new Blob([JSON.stringify(data)], {
          type: 'application/json',
        });

        const success = navigator.sendBeacon(`${this.apiUrl}/api/analytics/web-vitals`, blob);
        if (success) {
          return { success: true, method: 'sendBeacon' };
        }
      }

      // Fallback to fetch
      const response = await this.makeRequest('/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      });

      return { success: true, data: response, method: 'fetch' };
    } catch (error) {
      // Store locally for later sync
      this.storeWebVitalsLocally(data);
      return { success: false, error: error.message, fallback: 'local_storage' };
    }
  }

  /**
   * Generic API request handler with proper error handling
   */
  async makeRequest(endpoint, options = {}) {
    // Don't make requests in frontend-only mode
    if (this.isFrontendOnly) {
      throw new Error('Frontend-only mode: API calls disabled');
    }

    const url = `${this.apiUrl}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.warn(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Store analytics data locally for later sync
   */
  storeAnalyticsLocally(event, data) {
    try {
      const stored = JSON.parse(localStorage.getItem('dtb_analytics_queue') || '[]');
      stored.push({
        event,
        data,
        timestamp: Date.now(),
        url: window.location.href
      });
      
      // Keep only last 100 entries
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem('dtb_analytics_queue', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store analytics locally:', error);
    }
  }

  /**
   * Store web vitals data locally for later sync
   */
  storeWebVitalsLocally(data) {
    try {
      const stored = JSON.parse(localStorage.getItem('dtb_webvitals_queue') || '[]');
      stored.push(data);
      
      // Keep only last 50 entries
      if (stored.length > 50) {
        stored.splice(0, stored.length - 50);
      }
      
      localStorage.setItem('dtb_webvitals_queue', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store web vitals locally:', error);
    }
  }

  /**
   * Sync locally stored data when backend becomes available
   */
  async syncLocalData() {
    if (this.isFrontendOnly || !this.isAnalyticsEnabled) {
      return { success: false, message: 'Sync not available in frontend-only mode' };
    }

    try {
      // Sync analytics data
      const analyticsQueue = JSON.parse(localStorage.getItem('dtb_analytics_queue') || '[]');
      const webVitalsQueue = JSON.parse(localStorage.getItem('dtb_webvitals_queue') || '[]');

      const results = {
        analytics: { synced: 0, failed: 0 },
        webVitals: { synced: 0, failed: 0 }
      };

      // Sync analytics
      for (const item of analyticsQueue) {
        try {
          await this.makeRequest('/api/analytics', {
            method: 'POST',
            body: JSON.stringify(item)
          });
          results.analytics.synced++;
        } catch (error) {
          results.analytics.failed++;
        }
      }

      // Sync web vitals
      for (const item of webVitalsQueue) {
        try {
          await this.makeRequest('/api/analytics/web-vitals', {
            method: 'POST',
            body: JSON.stringify(item)
          });
          results.webVitals.synced++;
        } catch (error) {
          results.webVitals.failed++;
        }
      }

      // Clear synced data
      if (results.analytics.synced > 0) {
        localStorage.removeItem('dtb_analytics_queue');
      }
      if (results.webVitals.synced > 0) {
        localStorage.removeItem('dtb_webvitals_queue');
      }

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check for API availability
   */
  async healthCheck() {
    if (this.isFrontendOnly) {
      return { 
        status: 'frontend-only', 
        available: false, 
        message: 'Running in frontend-only mode' 
      };
    }

    try {
      await this.makeRequest('/api/health');
      return { status: 'healthy', available: true };
    } catch (error) {
      return { 
        status: 'unavailable', 
        available: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get queued data statistics
   */
  getQueueStats() {
    try {
      const analyticsQueue = JSON.parse(localStorage.getItem('dtb_analytics_queue') || '[]');
      const webVitalsQueue = JSON.parse(localStorage.getItem('dtb_webvitals_queue') || '[]');

      return {
        analytics: analyticsQueue.length,
        webVitals: webVitalsQueue.length,
        total: analyticsQueue.length + webVitalsQueue.length
      };
    } catch (error) {
      return { analytics: 0, webVitals: 0, total: 0 };
    }
  }
}

// Create singleton instance
const apiService = new APIService();

// Export both the class and instance
export { APIService };
export default apiService;
