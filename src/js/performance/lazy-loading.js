/**
 * Modern Lazy Loading Implementation with Intersection Observer
 * Optimized for mobile performance and future-proof
 */

class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.componentObserver = null;
    this.init();
  }

  init() {
    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadAllImages();
      return;
    }

    this.setupImageLazyLoading();
    this.setupComponentLazyLoading();
  }

  setupImageLazyLoading() {
    const imageObserverOptions = {
      root: null,
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, imageObserverOptions);

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  setupComponentLazyLoading() {
    const componentObserverOptions = {
      root: null,
      rootMargin: '100px 0px', // Load components earlier
      threshold: 0.1
    };

    this.componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadComponent(entry.target);
          this.componentObserver.unobserve(entry.target);
        }
      });
    }, componentObserverOptions);

    // Observe lazy components
    document.querySelectorAll('[data-lazy-component]').forEach(component => {
      this.componentObserver.observe(component);
    });
  }

  loadImage(img) {
    return new Promise((resolve, reject) => {
      const imageLoader = new Image();
      
      imageLoader.onload = () => {
        // Use requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          img.removeAttribute('data-src');
          resolve(img);
        });
      };

      imageLoader.onerror = () => {
        img.classList.add('error');
        reject(new Error(`Failed to load image: ${img.dataset.src}`));
      };

      imageLoader.src = img.dataset.src;
    });
  }

  async loadComponent(element) {
    const componentName = element.dataset.lazyComponent;
    
    try {
      // Use fetch for dynamic component loading to avoid build issues
      const response = await fetch(`/components/${componentName}.js`);
      if (response.ok) {
        const moduleText = await response.text();
        const moduleFunction = new Function('element', moduleText + '; return init;');
        await moduleFunction(element);
      }
      
      element.classList.add('component-loaded');
      element.removeAttribute('data-lazy-component');
    } catch (error) {
      console.warn(`Failed to load component: ${componentName}`, error);
      element.classList.add('component-error');
    }
  }

  // Fallback for browsers without Intersection Observer
  loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  // Public method to manually trigger loading
  loadImagesInContainer(container) {
    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.loadImage(img);
      if (this.imageObserver) {
        this.imageObserver.unobserve(img);
      }
    });
  }

  // Cleanup method
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    if (this.componentObserver) {
      this.componentObserver.disconnect();
    }
  }
}

// Initialize lazy loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
  });
} else {
  window.lazyLoader = new LazyLoader();
}

export default LazyLoader;
