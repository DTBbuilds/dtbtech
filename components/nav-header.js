class NavHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const currentPath = window.location.pathname;
        const isLoggedIn = sessionStorage.getItem('userName') !== null;
        const depth = currentPath.split('/').length - 2; // -2 to account for leading and trailing slashes
        const prefix = depth > 0 ? '../'.repeat(depth) : './';

        this.innerHTML = `
            <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-800/30 backdrop-blur-md border-b border-gray-700/30">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <a href="${prefix}index.html" class="text-white font-bold text-xl hover:text-blue-400 transition-colors">
                                DTB Technologies
                            </a>
                        </div>
                        
                        <!-- Navigation Links -->
                        <div class="hidden md:flex items-center space-x-8">
                            <a href="${prefix}index.html" class="text-gray-300 hover:text-blue-400 transition-colors">
                                <i class="fas fa-home mr-2"></i>Home
                            </a>
                            <a href="${prefix}services.html" class="text-gray-300 hover:text-purple-400 transition-colors">
                                <i class="fas fa-cogs mr-2"></i>Services
                            </a>
                            <a href="${prefix}tech-lab.html" class="text-gray-300 hover:text-pink-400 transition-colors">
                                <i class="fas fa-flask mr-2"></i>Tech Lab
                            </a>
                            <a href="${prefix}contact.html" class="text-gray-300 hover:text-indigo-400 transition-colors">
                                <i class="fas fa-envelope mr-2"></i>Contact
                            </a>
                            ${isLoggedIn ? `
                                <a href="${prefix}dashboard/welcome.html" class="text-gray-300 hover:text-green-400 transition-colors">
                                    <i class="fas fa-chart-line mr-2"></i>Dashboard
                                </a>
                                <button onclick="logout()" class="px-4 py-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-slate-700/80 hover:text-white transition-all duration-300 flex items-center space-x-2">
                                    <i class="fas fa-sign-out-alt"></i>
                                    <span>Logout</span>
                                </button>
                            ` : `
                                <button onclick="promptNameAndRedirect()" class="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 flex items-center space-x-2">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>Dashboard</span>
                                </button>
                            `}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button class="md:hidden text-gray-300 hover:text-white" onclick="this.closest('nav-header').toggleMobileMenu()">
                            <i class="fas fa-bars text-2xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div class="md:hidden hidden" id="mobile-menu">
                    <div class="px-4 py-3 space-y-2 bg-slate-800/95 border-t border-gray-700/30">
                        <a href="${prefix}index.html" class="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">
                            <i class="fas fa-home mr-2"></i>Home
                        </a>
                        <a href="${prefix}services.html" class="block px-3 py-2 text-gray-300 hover:text-purple-400 transition-colors">
                            <i class="fas fa-cogs mr-2"></i>Services
                        </a>
                        <a href="${prefix}tech-lab.html" class="block px-3 py-2 text-gray-300 hover:text-pink-400 transition-colors">
                            <i class="fas fa-flask mr-2"></i>Tech Lab
                        </a>
                        <a href="${prefix}contact.html" class="block px-3 py-2 text-gray-300 hover:text-indigo-400 transition-colors">
                            <i class="fas fa-envelope mr-2"></i>Contact
                        </a>
                        ${isLoggedIn ? `
                            <a href="${prefix}dashboard/welcome.html" class="block px-3 py-2 text-gray-300 hover:text-green-400 transition-colors">
                                <i class="fas fa-chart-line mr-2"></i>Dashboard
                            </a>
                            <button onclick="logout()" class="w-full mt-2 px-3 py-2 text-left text-gray-300 hover:text-red-400 transition-colors">
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        ` : `
                            <button onclick="promptNameAndRedirect()" class="w-full mt-2 px-3 py-2 text-left text-blue-400 hover:text-blue-300 transition-colors">
                                <i class="fas fa-sign-in-alt mr-2"></i>Dashboard
                            </button>
                        `}
                    </div>
                </div>
            </nav>
        `;
    }

    toggleMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        mobileMenu.classList.toggle('hidden');
    }
}

customElements.define('nav-header', NavHeader);
