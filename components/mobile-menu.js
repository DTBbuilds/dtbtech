// Mobile Menu Handler (legacy)
// Note: If <nav-header> is present, that component owns the mobile menu.
class MobileMenu {
  constructor() {
    // Skip initialization if nav-header is present (to avoid conflicts)
    if (document.querySelector('nav-header')) {
      this.button = null;
      this.menu = null;
      this.isOpen = false;
      return;
    }

    this.button = document.querySelector('.mobile-menu-button');
    this.menu = document.querySelector('.mobile-menu');
    this.isOpen = false;
    this.lastToggleAt = 0;
    this.init();
  }

  init() {
    if (!this.button || !this.menu) return;

    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Prevent bubbling from initiating outside-click close
    this.button.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
    this.menu.addEventListener('pointerdown', (e) => e.stopPropagation(), { passive: true });
    this.menu.addEventListener('click', (e) => e.stopPropagation());

    // Close menu when clicking outside
    document.addEventListener('pointerdown', e => {
      // Debounce after toggle to avoid immediate re-close from touch->click
      if (Date.now() - this.lastToggleAt < 350) return;
      if (
        this.isOpen &&
        !this.menu.contains(e.target) &&
        !this.button.contains(e.target)
      ) {
        this.close();
      }
    }, { passive: true });

    // Close menu when screen resizes to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 640 && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.menu.classList.remove('hidden');
    this.button.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
    this.lastToggleAt = Date.now();
  }

  close() {
    this.menu.classList.add('hidden');
    this.button.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
    this.lastToggleAt = Date.now();
  }
}

// Initialize mobile menu
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
});
