class SiteFooter extends HTMLElement {
    connectedCallback() {
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
        const depth = pathSegments.length - 1; // Subtract 1 for the filename
        const prefix = depth > 0 ? '../'.repeat(depth) : './';
        const year = new Date().getFullYear();

        this.innerHTML = `
            <footer class="bg-slate-900 border-t border-slate-800">
                <div class="container mx-auto px-4 py-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <!-- Company Info -->
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3 mb-2">
                                <img src="${prefix}assets/dtb-logo.png" alt="DTB Technologies Logo" class="h-8 w-8 rounded-full object-cover">
                                <h3 class="text-xl font-bold text-white">DTB Technologies</h3>
                            </div>
                            <p class="text-gray-300">Custom software and IT support for businesses in Australia and Kenya.</p>
                            <div class="flex items-center space-x-3">
                                <a href="https://facebook.com/dtbtechnologies" aria-label="DTB Technologies on Facebook" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 border border-slate-700/30 hover:border-blue-500/30 group">
                                    <i class="fab fa-facebook-f text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://linkedin.com/company/dtbtechnologies" aria-label="DTB Technologies on LinkedIn" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 border border-slate-700/30 hover:border-blue-500/30 group">
                                    <i class="fab fa-linkedin-in text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://instagram.com/dtb_technologies" aria-label="DTB Technologies on Instagram" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 border border-slate-700/30 hover:border-blue-500/30 group">
                                    <i class="fab fa-instagram text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://github.com/DTBbuilds" aria-label="DTBbuilds on GitHub" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 border border-slate-700/30 hover:border-blue-500/30 group">
                                    <i class="fab fa-github text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Company -->
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-white">Company</h4>
                            <ul class="space-y-2">
                                <li><a href="${prefix}" class="text-gray-300 hover:text-blue-400 transition-colors">Home</a></li>
                                <li><a href="${prefix}projects" class="text-gray-300 hover:text-blue-400 transition-colors">Projects</a></li>
                                <li><a href="${prefix}" class="text-gray-300 hover:text-blue-400 transition-colors">About</a></li>
                                <li><a href="${prefix}contact" class="text-gray-300 hover:text-blue-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <!-- Services -->
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-white">Services</h4>
                            <ul class="space-y-2">
                                <li><a href="${prefix}services/websites" class="text-gray-300 hover:text-blue-400 transition-colors">Websites</a></li>
                                <li><a href="${prefix}services/web-app-dev" class="text-gray-300 hover:text-blue-400 transition-colors">Web Apps</a></li>
                                <li><a href="${prefix}services/mobile-apps" class="text-gray-300 hover:text-blue-400 transition-colors">Mobile Apps</a></li>
                                <li><a href="${prefix}services/software-development" class="text-gray-300 hover:text-blue-400 transition-colors">Business Software</a></li>
                                <li><a href="${prefix}services/e-commerce" class="text-gray-300 hover:text-blue-400 transition-colors">E-Commerce</a></li>
                                <li><a href="${prefix}services/hosting-domains" class="text-gray-300 hover:text-blue-400 transition-colors">Hosting &amp; Support</a></li>
                            </ul>
                        </div>

                        <!-- Locations -->
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-white">Locations</h4>
                            <ul class="space-y-2 text-gray-300">
                                <li class="flex items-start"><i class="fas fa-map-marker-alt text-blue-400 mr-3 w-5 mt-1"></i><a href="${prefix}locations/software-development-sydney" class="hover:text-blue-400 transition-colors">Greystanes, Sydney NSW 2145, Australia</a></li>
                                <li class="flex items-start"><i class="fas fa-map-marker-alt text-blue-400 mr-3 w-5 mt-1"></i><a href="${prefix}locations/software-development-nairobi" class="hover:text-blue-400 transition-colors">Uthiru Muthua, Nairobi, Kenya</a></li>
                            </ul>
                            <div class="pt-2 space-y-2">
                                <a href="mailto:dtbbuildsoffice@gmail.com" class="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
                                    <i class="fas fa-envelope text-blue-400 mr-3 w-5"></i>dtbbuildsoffice@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Bottom -->
                    <div class="mt-12 pt-8 border-t border-slate-800 text-center">
                        <p class="text-gray-400 text-sm font-medium tracking-wide">&copy; ${year} DTB Technologies. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-footer', SiteFooter);
