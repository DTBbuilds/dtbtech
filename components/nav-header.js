class NavHeader extends HTMLElement {
  constructor() {
    super();
    this.isMenuOpen = false;
    this.lastToggleAt = 0;
    this.listenersBound = false;
  }

  connectedCallback() {
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2; // -2 to account for leading and trailing slashes
    const prefix = depth > 0 ? '../'.repeat(depth) : './';

    this.innerHTML = `
            <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-800/30 backdrop-blur-md border-b border-gray-700/30" role="navigation" aria-label="Main navigation">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <a href="${prefix}index.html" class="text-white font-bold text-xl hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm" aria-label="DTB Technologies - Home">
                                DTB Technologies
                            </a>
                        </div>
                        
                        <!-- Navigation Links -->
                        <div class="hidden md:flex items-center space-x-8" role="menubar">
                            <a href="${prefix}index.html" class="text-gray-300 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-home mr-2" aria-hidden="true"></i>Home
                            </a>
                            <a href="${prefix}services.html" class="text-gray-300 hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-cogs mr-2" aria-hidden="true"></i>Services
                            </a>
                            <a href="${prefix}about.html" class="text-gray-300 hover:text-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-info-circle mr-2" aria-hidden="true"></i>About
                            </a>
                            <a href="${prefix}projects/showcase.html" class="text-gray-300 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-hammer mr-2" aria-hidden="true"></i>Projects
                            </a>
                            <a href="${prefix}tech-lab.html" class="text-gray-300 hover:text-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-flask mr-2" aria-hidden="true"></i>Tech Lab
                            </a>
                            <a href="${prefix}contact.html" class="text-gray-300 hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm px-2 py-1" role="menuitem">
                                <i class="fas fa-envelope mr-2" aria-hidden="true"></i>Contact
                            </a>
                        </div>

                        <!-- Mobile Menu Button -->
                        <button 
                            class="md:hidden relative w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-lg transition-all duration-300" 
                            id="mobile-menu-button"
                            aria-expanded="false"
                            aria-controls="mobile-menu"
                            aria-label="Toggle mobile navigation menu"
                        >
                            <span class="sr-only">Open main menu</span>
                            <!-- Hamburger Icon -->
                            <div class="hamburger-icon w-6 h-6 flex flex-col justify-center items-center space-y-1">
                                <span class="hamburger-line block w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out"></span>
                                <span class="hamburger-line block w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out"></span>
                                <span class="hamburger-line block w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out"></span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div class="md:hidden transform transition-all duration-300 ease-in-out" id="mobile-menu" aria-hidden="true">
                    <div class="mobile-menu-content px-4 py-3 space-y-1 bg-slate-800/95 backdrop-blur-lg border-t border-gray-700/30 shadow-lg" role="menu">
                        <a href="${prefix}index.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-home mr-3 w-5" aria-hidden="true"></i>Home
                        </a>
                        <a href="${prefix}services.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-cogs mr-3 w-5" aria-hidden="true"></i>Services
                        </a>
                        <a href="${prefix}about.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-pink-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-info-circle mr-3 w-5" aria-hidden="true"></i>About
                        </a>
                        <a href="${prefix}projects/showcase.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-hammer mr-3 w-5" aria-hidden="true"></i>Projects
                        </a>
                        <a href="${prefix}tech-lab.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-pink-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-flask mr-3 w-5" aria-hidden="true"></i>Tech Lab
                        </a>
                        <a href="${prefix}contact.html" class="mobile-menu-item block px-4 py-3 text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800" role="menuitem" tabindex="-1">
                            <i class="fas fa-envelope mr-3 w-5" aria-hidden="true"></i>Contact
                        </a>
                    </div>
                </div>
            </nav>
        `;
    
    // Initialize mobile menu functionality after DOM is ready
    this.initializeMobileMenu();
  }

  initializeMobileMenu() {
    const menuButton = this.querySelector('#mobile-menu-button');
    const mobileMenu = this.querySelector('#mobile-menu');
    const menuItems = this.querySelectorAll('.mobile-menu-item');
    // Note: hamburger lines are handled in open/close methods

    if (!menuButton || !mobileMenu) return;

    // Prevent duplicate bindings if connectedCallback runs again
    if (this.listenersBound) return;
    this.listenersBound = true;

    // Set initial state
    this.closeMobileMenu();

    // Menu button click handler
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMobileMenu();
    });

    // Prevent pointer and click from bubbling when interacting with menu or button
    menuButton.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    }, { passive: true });
    mobileMenu.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    }, { passive: true });
    mobileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Keyboard navigation for menu button
    menuButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMobileMenu();
      }
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Close menu when clicking/touching outside (disabled on coarse pointer devices)
    if (!this.isCoarsePointer()) {
      setTimeout(() => {
        document.addEventListener('pointerdown', (e) => {
          // Ignore if just toggled very recently (avoid delayed click after touch)
          if (Date.now() - this.lastToggleAt < 350) return;

          const menuButtonEl = this.querySelector('#mobile-menu-button');
          const clickedInsideHeader = this.contains(e.target);
          const clickedToggle = menuButtonEl && (e.target === menuButtonEl || menuButtonEl.contains(e.target));

          if (this.isMenuOpen && !clickedInsideHeader && !clickedToggle) {
            this.closeMobileMenu();
          }
        }, { passive: true });
      }, 100);
    }

    // Handle escape key globally
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
        menuButton.focus();
      }
    });

    // Close or reset menu state on resize across breakpoint
    let lastIsMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile !== lastIsMobile) {
        // Breakpoint crossed; ensure consistent state
        this.closeMobileMenu();
        lastIsMobile = isMobile;
      }
    }, { passive: true });

    // Menu item keyboard navigation
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (index + 1) % menuItems.length;
          menuItems[nextIndex].focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
          menuItems[prevIndex].focus();
        }
        if (e.key === 'Home') {
          e.preventDefault();
          menuItems[0].focus();
        }
        if (e.key === 'End') {
          e.preventDefault();
          menuItems[menuItems.length - 1].focus();
        }
      });

      // Close menu when item is clicked
      item.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const menuButton = this.querySelector('#mobile-menu-button');
    const mobileMenu = this.querySelector('#mobile-menu');
    const menuItems = this.querySelectorAll('.mobile-menu-item');
    const hamburgerLines = this.querySelectorAll('.hamburger-line');

    this.isMenuOpen = true;
    this.lastToggleAt = Date.now();
    
    // Update button attributes
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.querySelector('.sr-only').textContent = 'Close main menu';
    
    // Show menu with animation
    mobileMenu.style.maxHeight = '0px';
    mobileMenu.style.opacity = '0';
    mobileMenu.classList.remove('hidden');
    mobileMenu.setAttribute('aria-hidden', 'false');
    
    // Animate menu appearance
    requestAnimationFrame(() => {
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      mobileMenu.style.opacity = '1';
    });
    
    // Transform hamburger to X
    if (hamburgerLines.length >= 3) {
      hamburgerLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      hamburgerLines[1].style.opacity = '0';
      hamburgerLines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    }
    
    // Enable tab navigation for menu items
    menuItems.forEach(item => {
      item.setAttribute('tabindex', '0');
    });
    
    // Focus first menu item
    if (menuItems.length > 0) {
      setTimeout(() => menuItems[0].focus(), 150);
    }
  }

  closeMobileMenu() {
    const menuButton = this.querySelector('#mobile-menu-button');
    const mobileMenu = this.querySelector('#mobile-menu');
    const menuItems = this.querySelectorAll('.mobile-menu-item');
    const hamburgerLines = this.querySelectorAll('.hamburger-line');

    this.isMenuOpen = false;
    this.lastToggleAt = Date.now();
    
    // Update button attributes
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open main menu';
    
    // Animate menu disappearance
    mobileMenu.style.maxHeight = '0px';
    mobileMenu.style.opacity = '0';
    
    // Hide menu after animation
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }, 300);
    
    // Transform X back to hamburger
    if (hamburgerLines.length >= 3) {
      hamburgerLines[0].style.transform = 'none';
      hamburgerLines[1].style.opacity = '1';
      hamburgerLines[2].style.transform = 'none';
    }
    
    // Disable tab navigation for menu items
    menuItems.forEach(item => {
      item.setAttribute('tabindex', '-1');
    });
  }

  // Detect coarse pointer (touch) devices to adjust outside-click behavior
  isCoarsePointer() {
    const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
    if (hasMatchMedia) {
      const query = window.matchMedia('(pointer: coarse)');
      if (query && typeof query.matches === 'boolean') {
        return query.matches;
      }
    }
    // Fallback heuristics
    return (
      ('ontouchstart' in window) ||
      (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
    );
  }
}

customElements.define('nav-header', NavHeader);

// Add CSS for mobile navigation animations
if (!document.querySelector('#mobile-nav-styles')) {
  const style = document.createElement('style');
  style.id = 'mobile-nav-styles';
  style.textContent = `
    /* Mobile Navigation Styles */
    #mobile-menu {
      overflow: hidden;
      transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
    }
    
    #mobile-menu.hidden {
      max-height: 0 !important;
      opacity: 0 !important;
    }
    
    .mobile-menu-item {
      transform: translateX(0);
      transition: all 0.2s ease-in-out;
    }
    
    .mobile-menu-item:hover {
      transform: translateX(4px);
    }
    
    .hamburger-line {
      transform-origin: center;
    }
    
    /* Focus styles for better accessibility */
    .mobile-menu-item:focus {
      transform: translateX(4px);
    }
    
    /* Smooth scrolling for mobile menu */
    @media (max-width: 768px) {
      .mobile-menu-content {
        max-height: calc(100vh - 4rem);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .mobile-menu-item:focus {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      #mobile-menu,
      .mobile-menu-item,
      .hamburger-line {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}
