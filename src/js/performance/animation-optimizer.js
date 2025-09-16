/**
 * Animation Optimizer for Mobile Performance
 * Reduces animation complexity based on device capabilities and user preferences
 */

class AnimationOptimizer {
  constructor() {
    this.isLowEndDevice = this.detectLowEndDevice();
    this.prefersReducedMotion = this.checkReducedMotionPreference();
    this.isMobile = this.detectMobile();
    this.init();
  }

  init() {
    this.optimizeAnimations();
    this.setupPerformanceObserver();
    this.addEventListeners();
  }

  detectLowEndDevice() {
    // Check for low-end device indicators
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4;
    const connection = navigator.connection;

    // Consider device low-end if:
    // - Less than 4GB RAM
    // - Less than 4 CPU cores
    // - Slow connection
    const isLowMemory = memory < 4;
    const isLowCores = cores < 4;
    const isSlowConnection =
      connection &&
      (connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g');

    return isLowMemory || isLowCores || isSlowConnection;
  }

  checkReducedMotionPreference() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  optimizeAnimations() {
    if (this.prefersReducedMotion) {
      this.disableAllAnimations();
      return;
    }

    if (this.isLowEndDevice || this.isMobile) {
      this.applyMobileOptimizations();
    }

    this.optimizeBlurEffects();
    this.optimizeTransforms();
    this.setupAnimationFrameThrottling();
  }

  disableAllAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  applyMobileOptimizations() {
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
      @media (max-width: 768px) {
        /* Reduce blur effects on mobile */
        .backdrop-blur-xl { backdrop-filter: blur(8px) !important; }
        .backdrop-blur-lg { backdrop-filter: blur(4px) !important; }
        .backdrop-blur-md { backdrop-filter: blur(2px) !important; }
        
        /* Simplify animations */
        .animate-float-slow { animation-duration: 15s !important; }
        .animate-spin-very-slow { animation-duration: 20s !important; }
        .animate-spin-extremely-slow { animation-duration: 30s !important; }
        
        /* Reduce transform complexity */
        .animate-blob {
          animation: simple-float 8s ease-in-out infinite !important;
        }
        
        /* Optimize gradients */
        .bg-gradient-to-br,
        .bg-gradient-to-r {
          background-size: 200% 200% !important;
        }
      }
      
      @keyframes simple-float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-10px) scale(1.02); }
      }
    `;
    document.head.appendChild(mobileStyle);
  }

  optimizeBlurEffects() {
    // Reduce blur intensity based on device capability
    if (this.isLowEndDevice) {
      document.querySelectorAll('[class*="blur"]').forEach(element => {
        const classes = element.className.split(' ');
        classes.forEach(className => {
          if (className.includes('blur-')) {
            element.classList.remove(className);
            // Replace with lighter blur
            const lightBlur = className.replace(/blur-\w+/, 'blur-sm');
            element.classList.add(lightBlur);
          }
        });
      });
    }
  }

  optimizeTransforms() {
    // Use transform3d for hardware acceleration
    document.querySelectorAll('[class*="animate-"]').forEach(element => {
      element.style.willChange = 'transform';
      element.style.transform = element.style.transform + ' translateZ(0)';
    });
  }

  setupAnimationFrameThrottling() {
    // Throttle animations on low-end devices
    if (this.isLowEndDevice) {
      let lastFrame = 0;
      const throttleRate = 1000 / 30; // 30fps instead of 60fps

      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function (callback) {
        const now = Date.now();
        const elapsed = now - lastFrame;

        if (elapsed > throttleRate) {
          lastFrame = now;
          return originalRAF(callback);
        } else {
          return setTimeout(
            () => originalRAF(callback),
            throttleRate - elapsed
          );
        }
      };
    }
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Monitor for long animation frames
          if (entry.entryType === 'measure' && entry.duration > 16.67) {
            console.warn(
              'Long animation frame detected:',
              entry.duration + 'ms'
            );
            this.reduceAnimationComplexity();
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        console.log('Performance observer not fully supported');
      }
    }
  }

  reduceAnimationComplexity() {
    // Dynamically reduce animation complexity if performance issues detected
    document
      .querySelectorAll('.animate-blob, .animate-float-slow')
      .forEach(element => {
        element.style.animationDuration = '20s';
      });

    document.querySelectorAll('[class*="backdrop-blur"]').forEach(element => {
      element.style.backdropFilter = 'blur(4px)';
    });
  }

  addEventListeners() {
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.isMobile = this.detectMobile();
        if (this.isMobile) {
          this.applyMobileOptimizations();
        }
      }, 100);
    });

    // Listen for reduced motion preference changes
    window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', e => {
        this.prefersReducedMotion = e.matches;
        if (this.prefersReducedMotion) {
          this.disableAllAnimations();
        }
      });

    // Monitor battery status if available
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateAnimations = () => {
          if (battery.level < 0.2 || !battery.charging) {
            // Reduce animations when battery is low
            this.reduceAnimationComplexity();
          }
        };

        battery.addEventListener('levelchange', updateAnimations);
        battery.addEventListener('chargingchange', updateAnimations);
        updateAnimations();
      });
    }
  }

  // Public method to manually optimize animations
  optimizeForPerformance() {
    this.reduceAnimationComplexity();
  }

  // Public method to restore full animations
  restoreAnimations() {
    if (!this.prefersReducedMotion && !this.isLowEndDevice) {
      location.reload(); // Simple way to restore original animations
    }
  }
}

// Initialize animation optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.animationOptimizer = new AnimationOptimizer();
  });
} else {
  window.animationOptimizer = new AnimationOptimizer();
}

export default AnimationOptimizer;
