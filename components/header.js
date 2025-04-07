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
                                <img src="/assets/images/logo.png" alt="DTB Technologies Logo" class="h-10 w-auto" onerror="this.src='/assets/images/default-logo.svg'"/>
                                <span class="text-xl font-bold text-white">DTB Technologies</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex md:items-center md:space-x-8">
                            <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
                            <a href="/services" class="text-gray-300 hover:text-white transition-colors">Services</a>
                            <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                            <a href="/contact" class="text-gray-300 hover:text-white transition-colors">Contact</a>
                            <a href="/help" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                                <i class="fas fa-question-circle"></i>
                                <span>Help</span>
                            </a>
                            <button class="login-btn px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign In</button>
                            <button class="signup-btn px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Sign Up</button>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button type="button" class="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Mobile Navigation -->
                    <div class="mobile-menu hidden md:hidden">
                        <div class="px-2 pt-2 pb-3 space-y-1">
                            <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800">Home</a>
                            <a href="/services" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800">Services</a>
                            <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800">About</a>
                            <a href="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800">Contact</a>
                            <a href="/help" class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800">
                                <i class="fas fa-question-circle mr-2"></i>
                                Help
                            </a>
                            <button class="login-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 mt-4">Sign In</button>
                            <button class="signup-btn block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700">Sign Up</button>
                        </div>
                    </div>
                </nav>
            </header>
        `;

        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const mobileMenuButton = this.querySelector('.mobile-menu-button');
        const mobileMenu = this.querySelector('.mobile-menu');
        const menuIcon = this.querySelector('.menu-icon');
        const closeIcon = this.querySelector('.close-icon');

        mobileMenuButton?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }
}

customElements.define('site-header', Header);
