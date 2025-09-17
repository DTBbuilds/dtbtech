/**
 * Main Application Entry Point
 * Orchestrates all performance optimizations and core functionality
 */

import LazyLoader from './performance/lazy-loading.js';
import AnimationOptimizer from './performance/animation-optimizer.js';
import WebVitalsMonitor from './performance/web-vitals.js';
import MobileEnhancements from './mobile-enhancements.js';
import MobilePerformanceOptimizer from './performance/mobile-performance.js';

class DTBApp {
  constructor() {
    this.lazyLoader = null;
    this.animationOptimizer = null;
    this.webVitalsMonitor = null;
    this.mobileEnhancements = null;
    this.mobilePerformanceOptimizer = null;
    this.serviceWorkerRegistration = null;
    this.init();
  }

  async init() {
    // Register service worker first for caching
    await this.registerServiceWorker();

    // Initialize performance modules
    this.initializePerformanceModules();

    // Setup core functionality
    this.setupEventListeners();
    this.initializeComponents();

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Only register service worker in production or secure contexts
      if (
        location.protocol === 'https:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1'
      ) {
        try {
          this.serviceWorkerRegistration =
            await navigator.serviceWorker.register(
              '/service-worker.js',
              {
                scope: '/',
              }
            );

          console.log('Service Worker registered successfully');

          // Handle updates
          this.serviceWorkerRegistration.addEventListener('updatefound', () => {
            const newWorker = this.serviceWorkerRegistration.installing;
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                this.showUpdateNotification();
              }
            });
          });
        } catch (error) {
          // Silently handle service worker registration failures in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker not available in development mode');
          } else {
            console.warn('Service Worker registration failed:', error);
          }
        }
      }
    }
  }

  initializePerformanceModules() {
    // Initialize lazy loading
    this.lazyLoader = new LazyLoader();

    // Initialize animation optimizer
    this.animationOptimizer = new AnimationOptimizer();

    // Initialize web vitals monitoring
    this.webVitalsMonitor = new WebVitalsMonitor();

    // Initialize mobile enhancements
    this.mobileEnhancements = new MobileEnhancements();

    // Initialize mobile performance optimizer
    this.mobilePerformanceOptimizer = new MobilePerformanceOptimizer();
  }

  setupEventListeners() {
    // Optimized scroll handling
    let scrollTimeout;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = requestAnimationFrame(() => {
          this.handleScroll();
        });
      },
      { passive: true }
    );

    // Optimized resize handling
    let resizeTimeout;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.handleResize();
        }, 250);
      },
      { passive: true }
    );

    // Visibility change handling for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });

    // Network status handling
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });
  }

  initializeComponents() {
    // Initialize navigation
    this.initializeNavigation();

    // Initialize forms with optimization
    this.initializeForms();

    // Initialize interactive elements
    this.initializeInteractiveElements();

    // Initialize analytics
    this.initializeAnalytics();
  }

  initializeNavigation() {
    // Smooth scroll for anchor links (desktop only)
    if (window.innerWidth > 768) {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
          e.preventDefault();
          const target = document.querySelector(anchor.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        });
      });
    }
  }

  initializeForms() {
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleFormSubmission(contactForm);
      });
    }

    // Optimize form inputs for mobile
    document.querySelectorAll('input, textarea').forEach(input => {
      // Prevent zoom on iOS
      if (input.type !== 'file') {
        input.style.fontSize = '16px';
      }

      // Add touch optimization
      input.style.touchAction = 'manipulation';
    });
  }

  initializeInteractiveElements() {
    // Optimize button interactions
    document
      .querySelectorAll('button, .btn-primary, .btn-secondary')
      .forEach(button => {
        button.style.touchAction = 'manipulation';

        // Add haptic feedback for supported devices
        button.addEventListener('click', () => {
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        });
      });

    // Initialize counters with intersection observer
    this.initializeCounters();

    // Initialize carousel if present
    this.initializeCarousel();
  }

  initializeCounters() {
    const counters = document.querySelectorAll('.counter-value, .counter');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(counter => counterObserver.observe(counter));
  }

  animateCounter(element) {
    const target =
      parseInt(element.getAttribute('data-target')) ||
      parseInt(element.textContent) ||
      0;
    // const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;

    const updateCounter = () => {
      current += stepValue;
      if (current < target) {
        element.textContent = Math.ceil(current) + (target > 100 ? '+' : '');
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target + (target > 100 ? '+' : '');
      }
    };

    requestAnimationFrame(updateCounter);
  }

  initializeCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    let currentSlide = 0;
    const slides = carousel.querySelector('.flex');
    const slideButtons = document.querySelectorAll('[data-slide]');

    if (!slides || slideButtons.length === 0) return;

    const updateSlides = () => {
      slides.style.transform = `translateX(-${currentSlide * 100}%)`;
      slideButtons.forEach((btn, idx) => {
        btn.classList.toggle('bg-blue-400', idx === currentSlide);
        btn.classList.toggle('bg-gray-400', idx !== currentSlide);
      });
    };

    // Touch handling
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener(
      'touchstart',
      e => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    carousel.addEventListener(
      'touchend',
      e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
          if (diff > 0 && currentSlide < slideButtons.length - 1) {
            currentSlide++;
          } else if (diff < 0 && currentSlide > 0) {
            currentSlide--;
          }
          updateSlides();
        }
      },
      { passive: true }
    );

    // Button handlers
    slideButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        currentSlide = index;
        updateSlides();
      });
    });

    // Auto-advance (paused when not visible)
    let autoAdvanceInterval;
    const startAutoAdvance = () => {
      autoAdvanceInterval = setInterval(() => {
        if (!document.hidden) {
          currentSlide = (currentSlide + 1) % slideButtons.length;
          updateSlides();
        }
      }, 5000);
    };

    startAutoAdvance();

    // Pause on interaction
    carousel.addEventListener('mouseenter', () => {
      clearInterval(autoAdvanceInterval);
    });

    carousel.addEventListener('mouseleave', startAutoAdvance);
  }

  initializeAnalytics() {
    // Initialize performance tracking
    if (this.webVitalsMonitor) {
      // Track user interactions
      document.addEventListener('click', e => {
        if (e.target.matches('a, button, [role="button"]')) {
          this.trackInteraction('click', e.target);
        }
      });

      // Track scroll depth
      let maxScrollDepth = 0;
      window.addEventListener(
        'scroll',
        () => {
          const scrollDepth = Math.round(
            (window.scrollY /
              (document.body.scrollHeight - window.innerHeight)) *
              100
          );

          if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (maxScrollDepth % 25 === 0) {
              // Track at 25%, 50%, 75%, 100%
              this.trackScrollDepth(maxScrollDepth);
            }
          }
        },
        { passive: true }
      );
    }
  }

  startPerformanceMonitoring() {
    // Monitor performance every 30 seconds
    setInterval(() => {
      if (this.webVitalsMonitor) {
        const metrics = this.webVitalsMonitor.getMetrics();
        this.reportPerformanceMetrics(metrics);
      }
    }, 30000);

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usagePercent =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (usagePercent > 85) {
          console.warn(
            'High memory usage detected:',
            usagePercent.toFixed(1) + '%'
          );
          this.optimizeMemoryUsage();
        }
      }, 10000);
    }
  }

  // Event Handlers
  handleScroll() {
    // Optimize scroll performance
    const scrollY = window.pageYOffset;

    // Update navigation background opacity
    const nav = document.querySelector('nav');
    if (nav) {
      const opacity = Math.min(scrollY / 100, 1);
      nav.style.backgroundColor = `rgba(30, 41, 59, ${0.3 + opacity * 0.7})`;
    }

    // Lazy load images in viewport
    if (this.lazyLoader) {
      // Trigger lazy loading for elements coming into view
      const elements = document.querySelectorAll('[data-src]:not(.loaded)');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          this.lazyLoader.loadImage(element);
        }
      });
    }
  }

  handleResize() {
    // Update mobile optimizations
    if (this.animationOptimizer) {
      this.animationOptimizer.isMobile = window.innerWidth <= 768;
      if (this.animationOptimizer.isMobile) {
        this.animationOptimizer.applyMobileOptimizations();
      }
    }
  }

  pauseAnimations() {
    document.querySelectorAll('[class*="animate-"]').forEach(element => {
      element.style.animationPlayState = 'paused';
    });
  }

  resumeAnimations() {
    document.querySelectorAll('[class*="animate-"]').forEach(element => {
      element.style.animationPlayState = 'running';
    });
  }

  handleOnline() {
    console.log('Connection restored');
    // Sync any queued data
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.sync.register('analytics-sync');
      this.serviceWorkerRegistration.sync.register('form-sync');
    }
  }

  handleOffline() {
    console.log('Connection lost - entering offline mode');
    this.showOfflineNotification();
  }


  async handleFormSubmission(form) {
    // const formData = new FormData(form);
    // const data = Object.fromEntries(formData.entries());

    try {
      // Show loading state
      const submitButton = form.querySelector('[type="submit"]');
      // const originalText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;

      // Simulate form submission (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      this.showNotification('Message sent successfully!', 'success');
      form.reset();
    } catch (error) {
      this.showNotification(
        'Failed to send message. Please try again.',
        'error'
      );
    } finally {
      // Restore button state
      const submitButton = form.querySelector('[type="submit"]');
      submitButton.textContent = 'Submit';
      submitButton.disabled = false;
    }
  }

  // Utility Methods
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success'
        ? 'bg-green-600'
        : type === 'error'
          ? 'bg-red-600'
          : 'bg-blue-600'
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.className =
      'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between">
        <span>A new version is available!</span>
        <button onclick="location.reload()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  showOfflineNotification() {
    this.showNotification(
      'You are offline. Some features may be limited.',
      'info'
    );
  }

  trackInteraction(type, element) {
    // Track user interactions for analytics
    const data = {
      type,
      element: element.tagName.toLowerCase(),
      text: element.textContent?.substring(0, 50),
      href: element.href,
      timestamp: Date.now(),
    };

    // Send to analytics service
    this.sendAnalytics('interaction', data);
  }

  trackScrollDepth(depth) {
    this.sendAnalytics('scroll_depth', { depth, timestamp: Date.now() });
  }

  reportPerformanceMetrics(metrics) {
    this.sendAnalytics('performance', metrics);
  }

  sendAnalytics(event, data) {
    // Check if analytics is enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
      return;
    }
    
    // Queue analytics data for sending
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({ event, data, timestamp: Date.now() });
      navigator.sendBeacon('/api/analytics', payload);
    }
  }

  optimizeMemoryUsage() {
    // Clear unused caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }

    // Trigger garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Public API
  getPerformanceScore() {
    return this.webVitalsMonitor?.getPerformanceScore() || 0;
  }

  displayPerformanceSummary() {
    return this.webVitalsMonitor?.displayPerformanceSummary() || {};
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dtbApp = new DTBApp();
  });
} else {
  window.dtbApp = new DTBApp();
}

export default DTBApp;
