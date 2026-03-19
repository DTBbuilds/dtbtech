class NavHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentPath = window.location.pathname;
        const isLoggedIn = sessionStorage.getItem('dashboardAccess') !== null;
        
        // Better path depth calculation
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        const depth = pathSegments.length - 1; // Subtract 1 for the filename
        const prefix = depth > 0 ? '../'.repeat(depth) : './';
        
        // Determine active page for highlighting
        const getActiveClass = (page) => {
            const isActive = currentPath.includes(page) || 
                           (page === 'index' && (currentPath === '/' || currentPath.endsWith('index.html')));
            return isActive ? 'text-white border-b-2 border-blue-500' : '';
        };
        
        const getMobileActiveClass = (page) => {
            const isActive = currentPath.includes(page) || 
                           (page === 'index' && (currentPath === '/' || currentPath.endsWith('index.html')));
            return isActive ? 'bg-blue-600/30 text-white' : '';
        };

        this.innerHTML = `
            <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/60 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <a href="${prefix}index.html" class="group inline-flex items-center">
                                <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700/70 shadow-lg shadow-blue-900/30 transition-colors duration-300 group-hover:border-blue-500/60">
                                    <span class="mr-2 w-3 h-3 rounded-sm bg-gradient-to-tr from-blue-900 via-indigo-800 to-purple-800 shadow-inner shadow-blue-900/60"></span>
                                    <span class="text-white font-semibold text-lg tracking-tight group-hover:text-blue-100 transition-colors">DTB Technologies</span>
                                </span>
                            </a>
                        </div>
                        
                        <!-- Navigation Links -->
                        <div class="hidden md:flex items-center space-x-2">
                            <a href="${prefix}index.html" class="px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors ${getActiveClass('index')}">Home</a>
                            <a href="${prefix}about.html" class="px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors ${getActiveClass('about')}">About</a>
                            <a href="${prefix}services.html" class="px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors ${getActiveClass('services')}">Services</a>
                            <a href="${prefix}tech-lab.html" class="px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors ${getActiveClass('tech-lab')}">Tech Lab</a>
                            <a href="${prefix}contact.html" class="px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors ${getActiveClass('contact')}">Contact</a>
                            ${isLoggedIn ? `
                                <a href="${prefix}dashboard/welcome.html" class="ml-2 px-3 py-2 text-slate-300 hover:text-white border-b-2 border-transparent transition-colors">Dashboard</a>
                                <button onclick="logout()" class="ml-3 px-3 py-2 rounded-md bg-slate-800/50 text-slate-200 hover:bg-slate-700/70 transition-colors">Logout</button>
                            ` : `
                                <a href="${prefix}dashboard.html" class="ml-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-colors">Dashboard</a>
                            `}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button class="md:hidden text-slate-300 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onclick="this.closest('nav-header').toggleMobileMenu()" aria-controls="mobile-menu" aria-expanded="false">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div class="md:hidden hidden" id="mobile-menu">
                    <div class="px-4 py-3 space-y-1 bg-slate-900/95 border-t border-slate-800/60">
                        <a href="${prefix}index.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center font-medium ${getMobileActiveClass('index')}">
                            <i class="fas fa-home mr-3 w-4"></i>Home
                        </a>
                        <a href="${prefix}about.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center font-medium ${getMobileActiveClass('about')}">
                            <i class="fas fa-info-circle mr-3 w-4"></i>About Us
                        </a>
                        <a href="${prefix}services.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center font-medium ${getMobileActiveClass('services')}">
                            <i class="fas fa-cogs mr-3 w-4"></i>Services
                        </a>
                        <a href="${prefix}tech-lab.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-pink-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center font-medium ${getMobileActiveClass('tech-lab')}">
                            <i class="fas fa-flask mr-3 w-4"></i>Tech Lab
                        </a>
                        <a href="${prefix}contact.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center font-medium ${getMobileActiveClass('contact')}">
                            <i class="fas fa-envelope mr-3 w-4"></i>Contact
                        </a>
                        ${isLoggedIn ? `
                            <a href="${prefix}dashboard/welcome.html" class="block px-4 py-3 min-h-[44px] text-gray-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center">
                                <i class="fas fa-chart-line mr-3 w-4"></i>Dashboard
                            </a>
                            <button onclick="logout()" class="w-full mt-2 px-4 py-3 min-h-[44px] text-left text-gray-300 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center">
                                <i class="fas fa-sign-out-alt mr-3 w-4"></i>Logout
                            </button>
                        ` : `
                            <a href="${prefix}dashboard.html" class="w-full mt-2 px-4 py-3 min-h-[44px] text-left text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center">
                                <i class="fas fa-tachometer-alt mr-3 w-4"></i>Dashboard
                            </a>
                        `}
                    </div>
                </div>
            </nav>
        `;
        
        // Auto-close mobile menu when clicking on links
        this.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.closest('#mobile-menu')) {
                setTimeout(() => this.closeMobileMenu(), 100);
            }
        });

        this.menuToggleButton = this.querySelector('button[aria-controls="mobile-menu"]');
        this.mobileMenu = this.querySelector('#mobile-menu');
        this.firstMenuItem = this.mobileMenu ? this.mobileMenu.querySelector('a, button') : null;
        this.boundKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                if (this.menuToggleButton) this.menuToggleButton.focus();
            } else if (e.key === 'Tab' && this.mobileMenu && !this.mobileMenu.classList.contains('hidden')) {
                const focusable = Array.from(this.mobileMenu.querySelectorAll('a, button'));
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        this.boundOutsideClick = (e) => {
            if (!this.contains(e.target)) {
                this.closeMobileMenu();
            }
        };
    }

    toggleMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        const nowOpen = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        if (this.menuToggleButton) this.menuToggleButton.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        if (nowOpen) {
            document.addEventListener('keydown', this.boundKeyHandler);
            document.addEventListener('click', this.boundOutsideClick);
            if (this.firstMenuItem) this.firstMenuItem.focus();
        } else {
            document.removeEventListener('keydown', this.boundKeyHandler);
            document.removeEventListener('click', this.boundOutsideClick);
            if (this.menuToggleButton) this.menuToggleButton.focus();
        }
    }
    
    closeMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        mobileMenu.classList.add('hidden');
        if (this.menuToggleButton) this.menuToggleButton.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', this.boundKeyHandler);
        document.removeEventListener('click', this.boundOutsideClick);
    }
}

customElements.define('nav-header', NavHeader);
