/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and provides real-time performance insights
 */

class WebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };
    this.init();
  }

  init() {
    this.measureCoreWebVitals();
    this.measureCustomMetrics();
    this.setupPerformanceObserver();
  }

  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.measureLCP();

    // First Input Delay (FID)
    this.measureFID();

    // Cumulative Layout Shift (CLS)
    this.measureCLS();

    // First Contentful Paint (FCP)
    this.measureFCP();

    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.metrics.LCP = Math.round(lastEntry.startTime);
        this.reportMetric('LCP', this.metrics.LCP);
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }
    }
  }

  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.metrics.FID = Math.round(
            entry.processingStart - entry.startTime
          );
          this.reportMetric('FID', this.metrics.FID);
        });
      });

      try {
        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID measurement not supported');
      }
    }
  }

  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries = [];

      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];

            if (
              !firstSessionEntry ||
              entry.startTime - lastSessionEntry.startTime < 1000 ||
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              clsEntries.push(entry);
              clsValue += entry.value;
            } else {
              clsEntries = [entry];
              clsValue = entry.value;
            }
          }
        });

        this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
        this.reportMetric('CLS', this.metrics.CLS);
      });

      try {
        // Check if layout-shift is supported before observing
        if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
          observer.observe({ type: 'layout-shift', buffered: true });
        } else {
          this.metrics.CLS = 0;
        }
      } catch (e) {
        this.metrics.CLS = 0;
      }
    }
  }

  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = Math.round(entry.startTime);
            this.reportMetric('FCP', this.metrics.FCP);
          }
        });
      });

      try {
        observer.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('FCP measurement not supported');
      }
    }
  }

  measureTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      this.metrics.TTFB = Math.round(
        navigationEntry.responseStart - navigationEntry.requestStart
      );
      this.reportMetric('TTFB', this.metrics.TTFB);
    }
  }

  measureCustomMetrics() {
    // Time to Interactive (TTI) approximation
    this.measureTTI();

    // Resource loading performance
    this.measureResourcePerformance();

    // JavaScript execution time
    this.measureJSExecutionTime();
  }

  measureTTI() {
    // Simple TTI approximation based on main thread quiet periods
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.now();
        this.metrics.TTI = Math.round(loadTime);
        this.reportMetric('TTI', this.metrics.TTI);
      }, 0);
    });
  }

  measureResourcePerformance() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');

      const cssResources = resources.filter(r => r.name.includes('.css'));
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const imageResources = resources.filter(
        r =>
          r.name.includes('.jpg') ||
          r.name.includes('.png') ||
          r.name.includes('.webp') ||
          r.name.includes('.svg')
      );

      this.metrics.cssLoadTime = this.calculateAverageLoadTime(cssResources);
      this.metrics.jsLoadTime = this.calculateAverageLoadTime(jsResources);
      this.metrics.imageLoadTime =
        this.calculateAverageLoadTime(imageResources);

      this.reportMetric('CSS Load Time', this.metrics.cssLoadTime);
      this.reportMetric('JS Load Time', this.metrics.jsLoadTime);
      this.reportMetric('Image Load Time', this.metrics.imageLoadTime);
    });
  }

  calculateAverageLoadTime(resources) {
    if (resources.length === 0) return 0;

    const totalTime = resources.reduce((sum, resource) => {
      return sum + (resource.responseEnd - resource.startTime);
    }, 0);

    return Math.round(totalTime / resources.length);
  }

  measureJSExecutionTime() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            // Log long tasks (>50ms)
            console.warn(`Long task detected: ${entry.duration}ms`);
            this.reportLongTask(entry);
          }
        });
      });

      try {
        // Check if longtask is supported before observing
        if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
          observer.observe({ type: 'longtask', buffered: true });
        }
      } catch (e) {
        // Silently handle unsupported entry types
      }
    }
  }

  setupPerformanceObserver() {
    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };

        // Warn if memory usage is high
        const usagePercent =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }, 10000); // Check every 10 seconds
    }
  }

  reportMetric(name, value) {
    const threshold = this.thresholds[name];
    let status = 'unknown';

    if (threshold) {
      if (value <= threshold.good) {
        status = 'good';
      } else if (value <= threshold.poor) {
        status = 'needs-improvement';
      } else {
        status = 'poor';
      }
    }

    // Send to analytics (replace with your analytics service)
    this.sendToAnalytics(name, value, status);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value}ms (${status})`);
    }
  }

  reportLongTask(entry) {
    // Report long tasks that might affect user experience
    this.sendToAnalytics('Long Task', entry.duration, 'poor');
  }

  sendToAnalytics(metric, value, status) {
    // Example implementation - replace with your analytics service
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'web_vitals', {
        metric_name: metric,
        metric_value: value,
        metric_status: status,
      });
    }

    // Send to custom analytics endpoint with proper error handling
    const data = {
      metric,
      value,
      status,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Try sendBeacon first (for page unload scenarios)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });

      const success = navigator.sendBeacon('/api/analytics/web-vitals', blob);
      if (success) return;
    }

    // Fallback to fetch for better error handling
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(error => {
      // Silently handle analytics failures in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics request failed:', error);
      }
    });
  }

  // Public method to get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Public method to get performance score
  getPerformanceScore() {
    const scores = [];

    Object.keys(this.thresholds).forEach(metric => {
      if (this.metrics[metric] !== undefined) {
        const value = this.metrics[metric];
        const threshold = this.thresholds[metric];

        let score;
        if (value <= threshold.good) {
          score = 100;
        } else if (value <= threshold.poor) {
          score = 50;
        } else {
          score = 0;
        }

        scores.push(score);
      }
    });

    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length)
      : 0;
  }

  // Public method to display performance summary
  displayPerformanceSummary() {
    const score = this.getPerformanceScore();
    const metrics = this.getMetrics();

    console.group('🚀 Performance Summary');
    console.log(`Overall Score: ${score}/100`);
    console.log('Core Web Vitals:', metrics);
    console.groupEnd();

    return { score, metrics };
  }
}

// Initialize Web Vitals monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.webVitalsMonitor = new WebVitalsMonitor();
  });
} else {
  window.webVitalsMonitor = new WebVitalsMonitor();
}

export default WebVitalsMonitor;
