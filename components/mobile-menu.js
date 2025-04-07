// Mobile Menu Handler
class MobileMenu {
    constructor() {
        this.button = document.querySelector('.mobile-menu-button');
        this.menu = document.querySelector('.mobile-menu');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.button || !this.menu) return;
        
        this.button.addEventListener('click', () => this.toggle());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.button.contains(e.target)) {
                this.close();
            }
        });

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
    }

    close() {
        this.menu.classList.add('hidden');
        this.button.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
}

// Initialize mobile menu
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
});
