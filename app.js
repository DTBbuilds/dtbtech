// DTB Technologies - Main Application JavaScript
// Combined nav-header and dashboard functionality

// Navigation Header Component
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
            return isActive ? 'text-white bg-blue-600/20 rounded-lg px-3 py-2' : '';
        };

        this.innerHTML = `
            <nav class="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex-shrink-0 flex items-center">
                            <a href="${prefix}index.html" class="flex items-center space-x-2">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span class="text-white font-bold text-lg">DTB</span>
                                </div>
                                <span class="text-white font-semibold text-xl hidden sm:block">DTB Technologies</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-4">
                                <a href="${prefix}index.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('index')}">Home</a>
                                <a href="${prefix}about.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('about')}">About</a>
                                <a href="${prefix}services.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('services')}">Services</a>
                                <a href="${prefix}tech-lab.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('tech-lab')}">Tech Lab</a>
                                <a href="${prefix}contact.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('contact')}">Contact</a>
                                <a href="${prefix}help.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('help')}">Help</a>
                            </div>
                        </div>

                        <!-- Dashboard Button -->
                        <div class="hidden md:block">
                            ${isLoggedIn ? 
                                `<div class="flex items-center space-x-4">
                                    <span class="text-green-400 text-sm">Dashboard Active</span>
                                    <button onclick="logout()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Logout
                                    </button>
                                </div>` :
                                `<button onclick="accessDashboard()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Access Dashboard
                                </button>`
                            }
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button onclick="this.closest('nav-header').toggleMobileMenu()" class="text-gray-400 hover:text-white focus:outline-none focus:text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Mobile Navigation -->
                    <div id="mobile-menu" class="md:hidden hidden">
                        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700">
                            <a href="${prefix}index.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('index')}" onclick="this.closest('nav-header').closeMobileMenu()">Home</a>
                            <a href="${prefix}about.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('about')}" onclick="this.closest('nav-header').closeMobileMenu()">About</a>
                            <a href="${prefix}services.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('services')}" onclick="this.closest('nav-header').closeMobileMenu()">Services</a>
                            <a href="${prefix}tech-lab.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('tech-lab')}" onclick="this.closest('nav-header').closeMobileMenu()">Tech Lab</a>
                            <a href="${prefix}contact.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('contact')}" onclick="this.closest('nav-header').closeMobileMenu()">Contact</a>
                            <a href="${prefix}help.html" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium ${getActiveClass('help')}" onclick="this.closest('nav-header').closeMobileMenu()">Help</a>
                            
                            <!-- Mobile Dashboard Button -->
                            <div class="pt-4 border-t border-slate-700">
                                ${isLoggedIn ? 
                                    `<div class="space-y-2">
                                        <span class="text-green-400 text-sm block px-3">Dashboard Active</span>
                                        <button onclick="logout()" class="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium">
                                            Logout
                                        </button>
                                    </div>` :
                                    `<button onclick="accessDashboard()" class="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium">
                                        Access Dashboard
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    toggleMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        mobileMenu.classList.toggle('hidden');
    }
    
    closeMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        mobileMenu.classList.add('hidden');
    }
}

// Register the custom element
customElements.define('nav-header', NavHeader);

// Dashboard Functions
function accessDashboard() {
    // Set dashboard access flag
    sessionStorage.setItem('dashboardAccess', 'true');
    
    // Redirect to dashboard entry page
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    window.location.href = `${prefix}dashboard.html`;
}

// Legacy function for backward compatibility (now redirects to free access)
function promptNameAndRedirect() {
    accessDashboard();
}

// Function to handle logout from dashboard
function logout() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('dashboardAccess');
    
    // Redirect to home page
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    window.location.href = `${prefix}index.html`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DTB Technologies app loaded successfully - v1.1');
    
    // Force refresh navigation if needed
    const navHeaders = document.querySelectorAll('nav-header');
    navHeaders.forEach(nav => {
        if (!nav.innerHTML.trim()) {
            nav.connectedCallback();
        }
    });
});
