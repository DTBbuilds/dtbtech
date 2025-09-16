/**
 * Mobile Performance Optimizer
 * Specialized performance optimizations for mobile devices
 */

class MobilePerformanceOptimizer {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.isLowEndDevice = this.detectLowEndDevice();
    this.connectionType = this.getConnectionType();
    this.observers = new Map();
    this.performanceMetrics = {
      fps: 60,
      memoryUsage: 0,
      batteryLevel: 1,
      networkSpeed: 'fast'
    };
    
    this.init();
  }

  init() {
    if (!this.isMobile) return;

    this.setupPerformanceMonitoring();
    this.optimizeForDevice();
    this.setupBatteryOptimizations();
    this.setupNetworkOptimizations();
    this.setupMemoryManagement();
    this.setupFrameRateOptimization();
  }

  detectLowEndDevice() {
    // Detect low-end devices based on various factors
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 4;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Consider device low-end if:
    // - Less than 3GB RAM
    // - Less than 4 CPU cores
    // - Low pixel density
    return memory < 3 || cores < 4 || pixelRatio < 2;
  }

  getConnectionType() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      };
    }
    return { effectiveType: '4g', downlink: 10, rtt: 100, saveData: false };
  }

  setupPerformanceMonitoring() {
    // Monitor FPS
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        this.performanceMetrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust optimizations based on FPS
        if (this.performanceMetrics.fps < 30) {
          this.enableAggressiveOptimizations();
        } else if (this.performanceMetrics.fps > 50) {
          this.relaxOptimizations();
        }
      }
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.performanceMetrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (this.performanceMetrics.memoryUsage > 0.8) {
          this.triggerMemoryCleanup();
        }
      }, 5000);
    }
  }

  optimizeForDevice() {
    const root = document.documentElement;
    
    if (this.isLowEndDevice) {
      // Aggressive optimizations for low-end devices
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      
      // Disable heavy effects
      document.querySelectorAll('[class*="blur"]').forEach(el => {
        el.style.filter = 'none';
        el.style.backdropFilter = 'none';
      });
      
      // Reduce shadow complexity
      document.querySelectorAll('[class*="shadow"]').forEach(el => {
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      });
      
      // Disable non-essential animations
      document.querySelectorAll('[class*="animate-"]').forEach(el => {
        if (!el.classList.contains('animate-pulse')) {
          el.style.animation = 'none';
        }
      });
    } else {
      // Standard mobile optimizations
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }
  }

  setupBatteryOptimizations() {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.performanceMetrics.batteryLevel = battery.level;
        
        const handleBatteryChange = () => {
          this.performanceMetrics.batteryLevel = battery.level;
          
          if (battery.level < 0.2 || !battery.charging) {
            this.enableBatterySavingMode();
          } else {
            this.disableBatterySavingMode();
          }
        };
        
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
        
        // Initial check
        handleBatteryChange();
      });
    }
  }

  enableBatterySavingMode() {
    // Reduce animation frequency
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      el.style.animationDuration = '2s';
    });
    
    // Pause non-critical animations
    document.querySelectorAll('.animate-spin, .animate-pulse').forEach(el => {
      if (!el.closest('.loading')) {
        el.style.animationPlayState = 'paused';
      }
    });
    
    // Reduce update frequency
    this.reduceUpdateFrequency();
  }

  disableBatterySavingMode() {
    // Restore normal animation speeds
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      el.style.animationDuration = '';
      el.style.animationPlayState = 'running';
    });
    
    this.restoreUpdateFrequency();
  }

  setupNetworkOptimizations() {
    const connection = this.connectionType;
    
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      this.enableDataSavingMode();
    }
    
    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connectionType = this.getConnectionType();
        this.adjustForConnection();
      });
    }
  }

  enableDataSavingMode() {
    // Lazy load all images
    document.querySelectorAll('img').forEach(img => {
      if (!img.dataset.src && img.src) {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjY2MiLz48L3N2Zz4=';
      }
    });
    
    // Disable autoplay videos
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.removeAttribute('autoplay');
      video.pause();
    });
    
    // Reduce image quality
    document.querySelectorAll('img').forEach(img => {
      img.style.imageRendering = 'pixelated';
    });
  }

  adjustForConnection() {
    const connection = this.connectionType;
    
    if (connection.effectiveType === '4g' && connection.downlink > 5) {
      // Fast connection - enable all features
      this.enableAllFeatures();
    } else if (connection.effectiveType === '3g') {
      // Medium connection - moderate optimizations
      this.enableModerateOptimizations();
    } else {
      // Slow connection - aggressive optimizations
      this.enableDataSavingMode();
    }
  }

  setupMemoryManagement() {
    // Clean up unused resources periodically
    setInterval(() => {
      this.cleanupUnusedResources();
    }, 30000);
    
    // Monitor for memory pressure
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 85) {
          this.triggerMemoryCleanup();
        }
      }, 10000);
    }
  }

  setupFrameRateOptimization() {
    // Adaptive frame rate based on device performance
    let frameDropCount = 0;
    let lastFrameTime = performance.now();
    
    const checkFrameRate = (currentTime) => {
      const frameDuration = currentTime - lastFrameTime;
      
      if (frameDuration > 33) { // More than 30fps
        frameDropCount++;
      } else {
        frameDropCount = Math.max(0, frameDropCount - 1);
      }
      
      // If we're dropping too many frames, reduce visual complexity
      if (frameDropCount > 10) {
        this.reduceVisualComplexity();
        frameDropCount = 0;
      }
      
      lastFrameTime = currentTime;
      requestAnimationFrame(checkFrameRate);
    };
    
    requestAnimationFrame(checkFrameRate);
  }

  enableAggressiveOptimizations() {
    // Disable all non-essential animations
    document.querySelectorAll('[class*="animate-"]:not(.animate-pulse)').forEach(el => {
      el.style.animation = 'none';
    });
    
    // Reduce blur effects
    document.querySelectorAll('[class*="blur"]').forEach(el => {
      el.style.filter = 'blur(2px)';
      el.style.backdropFilter = 'blur(2px)';
    });
    
    // Simplify gradients
    document.querySelectorAll('[class*="gradient"]').forEach(el => {
      el.style.background = '#1e293b';
    });
  }

  relaxOptimizations() {
    // Re-enable animations
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      el.style.animation = '';
    });
    
    // Restore blur effects
    document.querySelectorAll('[class*="blur"]').forEach(el => {
      el.style.filter = '';
      el.style.backdropFilter = '';
    });
    
    // Restore gradients
    document.querySelectorAll('[class*="gradient"]').forEach(el => {
      el.style.background = '';
    });
  }

  reduceVisualComplexity() {
    // Temporarily reduce visual effects
    document.body.classList.add('reduced-motion');
    
    setTimeout(() => {
      document.body.classList.remove('reduced-motion');
    }, 5000);
  }

  triggerMemoryCleanup() {
    // Clear unused caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('old')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // Clear unused images
    document.querySelectorAll('img').forEach(img => {
      if (!this.isInViewport(img) && img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
    });
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  cleanupUnusedResources() {
    // Remove unused event listeners
    this.observers.forEach((observer, key) => {
      if (!document.contains(key)) {
        observer.disconnect();
        this.observers.delete(key);
      }
    });
    
    // Clean up unused blob URLs
    document.querySelectorAll('img, video').forEach(media => {
      if (media.src.startsWith('blob:') && !this.isInViewport(media)) {
        URL.revokeObjectURL(media.src);
      }
    });
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  reduceUpdateFrequency() {
    // Reduce scroll event frequency
    this.throttleScrollEvents(500);
    
    // Reduce resize event frequency
    this.throttleResizeEvents(1000);
  }

  restoreUpdateFrequency() {
    // Restore normal event frequencies
    this.throttleScrollEvents(100);
    this.throttleResizeEvents(250);
  }

  throttleScrollEvents(delay) {
    let scrollTimeout;
    const originalHandler = window.onscroll;
    
    window.onscroll = function(e) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (originalHandler) originalHandler.call(this, e);
      }, delay);
    };
  }

  throttleResizeEvents(delay) {
    let resizeTimeout;
    const originalHandler = window.onresize;
    
    window.onresize = function(e) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (originalHandler) originalHandler.call(this, e);
      }, delay);
    };
  }

  enableAllFeatures() {
    document.body.classList.remove('data-saving-mode', 'battery-saving-mode');
    this.relaxOptimizations();
  }

  enableModerateOptimizations() {
    // Moderate optimizations for 3G connections
    document.querySelectorAll('video').forEach(video => {
      video.preload = 'metadata';
    });
    
    // Reduce animation complexity slightly
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      el.style.animationDuration = '0.5s';
    });
  }

  // Public API
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  forceOptimization(level = 'moderate') {
    switch (level) {
      case 'aggressive':
        this.enableAggressiveOptimizations();
        break;
      case 'moderate':
        this.enableModerateOptimizations();
        break;
      case 'minimal':
        this.relaxOptimizations();
        break;
    }
  }

  updateDeviceInfo() {
    this.isMobile = window.innerWidth <= 768;
    this.isLowEndDevice = this.detectLowEndDevice();
    this.connectionType = this.getConnectionType();
    this.optimizeForDevice();
  }
}

export default MobilePerformanceOptimizer;
