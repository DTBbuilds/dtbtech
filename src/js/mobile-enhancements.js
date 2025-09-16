/**
 * Mobile Experience Enhancements
 * Advanced touch handling, gesture support, and mobile-specific optimizations
 */

class MobileEnhancements {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.isScrolling = false;
    this.lastScrollTime = 0;
    this.scrollVelocity = 0;
    this.pullToRefreshThreshold = 80;
    this.isPulling = false;
    
    this.init();
  }

  init() {
    if (!this.isMobile) return;

    this.setupTouchHandling();
    this.setupScrollOptimizations();
    this.setupGestureSupport();
    this.setupMobileNavigation();
    this.setupFormEnhancements();
    this.setupPerformanceOptimizations();
    this.setupAccessibilityEnhancements();
  }

  setupTouchHandling() {
    // Enhanced touch feedback
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('button, .btn-primary, .btn-secondary, a[role="button"]');
      if (target) {
        target.classList.add('touch-active');
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('button, .btn-primary, .btn-secondary, a[role="button"]');
      if (target) {
        setTimeout(() => {
          target.classList.remove('touch-active');
        }, 150);
      }
    }, { passive: true });

    // Prevent double-tap zoom on buttons
    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('button, input, .btn-primary, .btn-secondary');
      if (target) {
        e.preventDefault();
        target.click();
      }
    });
  }

  setupScrollOptimizations() {
    let ticking = false;
    let lastScrollY = 0;

    // Optimized scroll handler with momentum detection
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const scrollDelta = currentScrollY - lastScrollY;
      const currentTime = Date.now();
      
      // Calculate scroll velocity
      if (currentTime - this.lastScrollTime > 0) {
        this.scrollVelocity = scrollDelta / (currentTime - this.lastScrollTime);
      }
      
      // Hide/show navigation based on scroll direction
      const nav = document.querySelector('nav');
      if (nav && Math.abs(scrollDelta) > 5) {
        if (scrollDelta > 0 && currentScrollY > 100) {
          // Scrolling down
          nav.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          nav.style.transform = 'translateY(0)';
        }
      }

      lastScrollY = currentScrollY;
      this.lastScrollTime = currentTime;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Scroll to top functionality disabled for mobile
    // this.addScrollToTop();
  }

  addScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg opacity-0 transition-all duration-300 z-50 flex items-center justify-center';
    scrollToTopBtn.style.transform = 'translateY(100px)';
    
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.transform = 'translateY(0)';
      } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.transform = 'translateY(100px)';
      }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  setupGestureSupport() {
    // Swipe gesture detection
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipeGesture();
    }, { passive: true });

    // Pull-to-refresh functionality
    this.setupPullToRefresh();
  }

  setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;

    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-to-refresh';
    pullIndicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
    document.body.appendChild(pullIndicator);

    document.addEventListener('touchstart', (e) => {
      if (window.pageYOffset === 0) {
        startY = e.touches[0].pageY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (window.pageYOffset === 0 && startY !== 0) {
        currentY = e.touches[0].pageY;
        pullDistance = currentY - startY;

        if (pullDistance > 0 && pullDistance < 150) {
          e.preventDefault();
          const progress = Math.min(pullDistance / this.pullToRefreshThreshold, 1);
          pullIndicator.style.top = `${-60 + (progress * 80)}px`;
          pullIndicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`;
          
          if (pullDistance > this.pullToRefreshThreshold) {
            pullIndicator.classList.add('active');
            this.isPulling = true;
          }
        }
      }
    });

    document.addEventListener('touchend', () => {
      if (this.isPulling) {
        this.triggerRefresh();
      }
      
      // Reset pull indicator
      pullIndicator.style.top = '-60px';
      pullIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
      pullIndicator.classList.remove('active');
      this.isPulling = false;
      startY = 0;
    }, { passive: true });
  }

  triggerRefresh() {
    // Simulate refresh action
    const pullIndicator = document.querySelector('.pull-to-refresh');
    pullIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  handleSwipeGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const minSwipeDistance = 50;

    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        this.handleSwipeRight();
      } else {
        this.handleSwipeLeft();
      }
    }
  }

  handleSwipeRight() {
    // Open mobile menu on swipe right from left edge
    if (this.touchStartX < 50) {
      this.openMobileMenu();
    }
  }

  handleSwipeLeft() {
    // Close mobile menu on swipe left
    this.closeMobileMenu();
  }

  setupMobileNavigation() {
    // Skip if nav-header component is present (it handles its own navigation)
    if (document.querySelector('nav-header')) {
      return;
    }
    
    // Enhanced mobile menu for legacy pages
    const mobileMenuButton = document.querySelector('.hamburger, [data-mobile-menu]');
    const mobileMenu = document.querySelector('.mobile-menu, #mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeMobileMenu();
        }
      });
    }

    // Add smooth transitions to navigation
    const nav = document.querySelector('nav');
    if (nav) {
      nav.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }

  openMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu, #mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileMenu) {
      mobileMenu.classList.add('active');
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    
    if (hamburger) {
      hamburger.classList.add('active');
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu, #mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 300);
      document.body.style.overflow = '';
    }
    
    if (hamburger) {
      hamburger.classList.remove('active');
    }
  }

  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu, #mobile-menu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  setupFormEnhancements() {
    // Enhanced form validation and UX
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => {
          this.validateField(input);
        });

        // Auto-resize textareas
        if (input.tagName === 'TEXTAREA') {
          input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
          });
        }

        // Enhanced focus states
        input.addEventListener('focus', () => {
          input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
          input.parentElement.classList.remove('focused');
        });
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let message = '';

    // Remove existing validation classes
    field.classList.remove('error', 'success');
    const existingError = field.parentElement.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }

    // Validation rules
    if (field.required && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    } else if (type === 'tel' && value && !this.isValidPhone(value)) {
      isValid = false;
      message = 'Please enter a valid phone number';
    }

    // Apply validation state
    if (!isValid) {
      field.classList.add('error');
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      field.parentElement.appendChild(errorElement);
    } else if (value) {
      field.classList.add('success');
    }

    return isValid;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^[+]?[1-9]\d{0,15}$/.test(phone.replace(/\s/g, ''));
  }

  setupPerformanceOptimizations() {
    // Intersection Observer for animations
    const animatedElements = document.querySelectorAll('[class*="animate-"]');
    
    if (animatedElements.length > 0) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
          } else {
            entry.target.style.animationPlayState = 'paused';
          }
        });
      }, { threshold: 0.1 });

      animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        animationObserver.observe(el);
      });
    }

    // Lazy load images with enhanced loading states
    this.setupLazyLoading();

    // Optimize touch events
    this.optimizeTouchEvents();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const placeholder = img.parentElement.querySelector('.image-placeholder');
            
            img.src = img.dataset.src;
            img.classList.add('lazy-image');
            
            img.onload = () => {
              img.classList.add('loaded');
              if (placeholder) {
                placeholder.remove();
              }
            };
            
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  optimizeTouchEvents() {
    // Debounce touch events to prevent excessive firing
    let touchTimeout;
    
    document.addEventListener('touchmove', () => {
      clearTimeout(touchTimeout);
      document.body.classList.add('touching');
      
      touchTimeout = setTimeout(() => {
        document.body.classList.remove('touching');
      }, 300);
    }, { passive: true });
  }

  setupAccessibilityEnhancements() {
    // Enhanced focus management
    document.addEventListener('focusin', () => {
      // Focus management handled by event listener
    });

    // Skip to main content link
    this.addSkipLink();

    // Announce page changes for screen readers
    this.setupAriaLiveRegion();

    // Enhanced keyboard navigation
    this.setupKeyboardNavigation();
  }

  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    
    document.body.appendChild(liveRegion);
  }

  announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  setupKeyboardNavigation() {
    // Enhanced tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Arrow key navigation for menus
    const menuItems = document.querySelectorAll('.mobile-menu-item, nav a');
    let currentIndex = -1;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (e.key === 'ArrowDown') {
          currentIndex = (currentIndex + 1) % menuItems.length;
        } else {
          currentIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
        }
        
        menuItems[currentIndex].focus();
      }
    });
  }

  // Public methods
  updateMobileState() {
    this.isMobile = window.innerWidth <= 768;
  }

  destroy() {
    // Clean up event listeners and observers
    // Implementation would remove all added event listeners
  }
}

// Initialize mobile enhancements
document.addEventListener('DOMContentLoaded', () => {
  window.mobileEnhancements = new MobileEnhancements();
});

// Update on resize
window.addEventListener('resize', () => {
  if (window.mobileEnhancements) {
    window.mobileEnhancements.updateMobileState();
  }
});

export default MobileEnhancements;
