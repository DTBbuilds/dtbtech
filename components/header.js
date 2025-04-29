// Header Component
class Header extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <header class="fixed w-full top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
                <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <a href="/" class="flex items-center space-x-2">
                                <img src="/assets/images/default-logo.svg" alt="DTB Technologies Logo" class="h-10 w-auto"/> 
                                <span class="text-xl font-bold text-white">DTB Technologies</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex md:items-center md:space-x-8">
                            <a href="/" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="Home">
    <i class="fas fa-home mr-2"></i><span>Home</span>
</a>
<a href="/services.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="Services">
    <i class="fas fa-cogs mr-2"></i><span>Services</span>
</a>
<a href="/about.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="About">
    <i class="fas fa-info-circle mr-2"></i><span>About</span>
</a>
<a href="/contact.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="Contact">
    <i class="fas fa-envelope mr-2"></i><span>Contact</span>
</a>
<a href="/tech-lab.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="Tech Lab">
    <i class="fas fa-flask mr-2"></i><span>Tech Lab</span>
</a>
<a href="/help.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2" aria-label="Help">
    <i class="fas fa-question-circle mr-2"></i><span>Help</span>
</a>
                            <!-- Sign In (Secondary Button) -->
                            <button class="login-btn px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500">Sign In</button>
                            <!-- Sign Up (Primary Button) -->
                            <button class="signup-btn px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transform hover:scale-105 transition-all duration-200">Sign Up</button>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button type="button" class="mobile-menu-button inline-flex items-center justify-center p-3 rounded-full text-2xl text-white bg-gradient-to-br from-blue-600/80 to-purple-600/80 shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
    aria-label="Toggle navigation menu" aria-controls="mobile-menu-content" aria-expanded="false">
    <span class="sr-only">Open main menu</span>
    <i class="fa-solid fa-bars menu-icon transition-all duration-300 ease-in-out"></i>
    <i class="fa-solid fa-xmark close-icon hidden transition-all duration-300 ease-in-out"></i>
</button>
                        </div>
                    </div>

                    <!-- Mobile Navigation -->
                    <div class="mobile-menu hidden md:hidden" id="mobile-menu-content">
                        <div class="px-2 pt-2 pb-3 space-y-1">
                            <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="Home">
    <i class="fas fa-home mr-2"></i><span>Home</span>
</a>
<a href="/services.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="Services">
    <i class="fas fa-cogs mr-2"></i><span>Services</span>
</a>
<a href="/about.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="About">
    <i class="fas fa-info-circle mr-2"></i><span>About</span>
</a>
<a href="/contact.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="Contact">
    <i class="fas fa-envelope mr-2"></i><span>Contact</span>
</a>
<a href="/tech-lab.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="Tech Lab">
    <i class="fas fa-flask mr-2"></i><span>Tech Lab</span>
</a>
<a href="/help.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2" aria-label="Help">
    <i class="fas fa-question-circle mr-2"></i><span>Help</span>
</a>
                            <!-- Sign In (Secondary Button - Mobile) -->
                            <button class="login-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors mt-4">Sign In</button>
                            <!-- Sign Up (Primary Button - Mobile) -->
                            <button class="signup-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors">Sign Up</button>
                        </div>
                    </div>
                </nav>
            </header>
        `;

        this.mobileMenuButton = this.querySelector('.mobile-menu-button');
        this.mobileMenu = this.querySelector('.mobile-menu');
        this.menuIcon = this.querySelector('.menu-icon');
        this.closeIcon = this.querySelector('.close-icon');

        // Animate icon transitions
        this.mobileMenuButton.addEventListener('click', () => {
            if (this.mobileMenuButton.getAttribute('aria-expanded') === 'false') {
                this.menuIcon.classList.add('rotate-90','opacity-0');
                setTimeout(() => {
                    this.menuIcon.classList.add('hidden');
                    this.closeIcon.classList.remove('hidden');
                    this.closeIcon.classList.add('rotate-90');
                    setTimeout(() => {
                        this.closeIcon.classList.remove('rotate-90','opacity-0');
                    }, 10);
                }, 200);
            } else {
                this.closeIcon.classList.add('rotate-90','opacity-0');
                setTimeout(() => {
                    this.closeIcon.classList.add('hidden');
                    this.menuIcon.classList.remove('hidden');
                    this.menuIcon.classList.add('rotate-90');
                    setTimeout(() => {
                        this.menuIcon.classList.remove('rotate-90','opacity-0');
                    }, 10);
                }, 200);
            }
        });

        this.setupMobileMenu();
    }

    setupMobileMenu() {
        if (!this.mobileMenuButton || !this.mobileMenu) return;

        this.mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Add listener to the menu itself to close when an item is clicked
        this.mobileMenu.addEventListener('click', (e) => {
            // Check if the clicked element is a link or a button within the menu
            if (e.target.closest('a') || e.target.closest('button')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const isExpanded = this.mobileMenuButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenu.classList.remove('hidden');
        this.menuIcon.classList.remove('block');
        this.menuIcon.classList.add('hidden');
        this.closeIcon.classList.remove('hidden');
        this.closeIcon.classList.add('block');
        this.mobileMenuButton.setAttribute('aria-expanded', 'true');
    }

    closeMobileMenu() {
        this.mobileMenu.classList.add('hidden');
        this.menuIcon.classList.remove('hidden');
        this.menuIcon.classList.add('block');
        this.closeIcon.classList.remove('block');
        this.closeIcon.classList.add('hidden');
        this.mobileMenuButton.setAttribute('aria-expanded', 'false');
    }
}

customElements.define('site-header', Header);
