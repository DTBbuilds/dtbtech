class SiteFooter extends HTMLElement {
    connectedCallback() {
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
        const depth = pathSegments.length - 1; // Subtract 1 for the filename
        const prefix = depth > 0 ? '../'.repeat(depth) : './';
        const year = new Date().getFullYear();

        const link = 'text-slate-400 hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm';
        const contactLink = 'text-slate-200 hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm';
        const heading = 'text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4';
        const social = 'w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 border border-slate-700/30 hover:border-blue-500/30 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

        this.innerHTML = `
            <footer class="bg-slate-950 border-t border-slate-800">
                <div class="container mx-auto px-4 sm:px-6">

                    <!-- Upper: Project CTA -->
                    <section class="pt-12 sm:pt-14" aria-label="Start a project">
                        <div class="relative overflow-hidden bg-slate-900 border border-slate-700/40 rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
                            <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div class="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div class="max-w-xl">
                                    <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Have a project in mind?</h2>
                                    <p class="text-slate-400 text-sm sm:text-base">From websites to complete software platforms, tell us what you're planning.</p>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
                                    <a href="${prefix}contact" class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                                        <i class="fas fa-rocket mr-2 text-xs"></i>
                                        Discuss Your Project
                                    </a>
                                    <a href="${prefix}projects" class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                                        See Our Projects
                                        <i class="fas fa-arrow-right ml-2 text-xs"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Middle: Footer Navigation -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-12 mt-10 border-t border-slate-800/80">

                        <!-- Brand -->
                        <div class="space-y-4 lg:pr-6">
                            <a href="${prefix}" class="inline-flex items-center space-x-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg">
                                <img src="${prefix}assets/dtb-logo.png" alt="DTB Technologies Logo" class="h-9 w-9 rounded-full object-cover">
                                <span class="text-white font-semibold text-lg tracking-tight">DTB Technologies</span>
                            </a>
                            <p class="text-slate-400 text-sm leading-relaxed">Software studio building websites, apps and business systems for teams in Australia and Kenya.</p>
                            <div class="flex items-center space-x-3 pt-1">
                                <a href="https://facebook.com/dtbtechnologies" aria-label="DTB Technologies on Facebook" target="_blank" rel="noopener noreferrer" class="${social}">
                                    <i class="fab fa-facebook-f text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://linkedin.com/company/dtbtechnologies" aria-label="DTB Technologies on LinkedIn" target="_blank" rel="noopener noreferrer" class="${social}">
                                    <i class="fab fa-linkedin-in text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://instagram.com/dtb_technologies" aria-label="DTB Technologies on Instagram" target="_blank" rel="noopener noreferrer" class="${social}">
                                    <i class="fab fa-instagram text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://github.com/DTBbuilds" aria-label="DTBbuilds on GitHub" target="_blank" rel="noopener noreferrer" class="${social}">
                                    <i class="fab fa-github text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Company -->
                        <nav aria-label="Company">
                            <h3 class="${heading}">Company</h3>
                            <ul class="space-y-2.5 text-sm">
                                <li><a href="${prefix}" class="${link}">Home</a></li>
                                <li><a href="${prefix}services" class="${link}">Services</a></li>
                                <li><a href="${prefix}projects" class="${link}">Projects</a></li>
                                <li><a href="${prefix}about" class="${link}">About</a></li>
                                <li><a href="${prefix}tech-lab" class="${link}">Tech Lab</a></li>
                                <li><a href="${prefix}contact" class="${link}">Contact</a></li>
                            </ul>
                        </nav>

                        <!-- What We Build -->
                        <nav aria-label="What We Build">
                            <h3 class="${heading}">What We Build</h3>
                            <ul class="space-y-2.5 text-sm">
                                <li><a href="${prefix}services/websites" class="${link}">Websites & Web Applications</a></li>
                                <li><a href="${prefix}services/mobile-apps" class="${link}">Mobile Applications</a></li>
                                <li><a href="${prefix}services/software-development" class="${link}">Business Software</a></li>
                                <li><a href="${prefix}services/e-commerce" class="${link}">E-Commerce</a></li>
                                <li><a href="${prefix}services/hosting-domains" class="${link}">Hosting & Support</a></li>
                            </ul>
                        </nav>

                        <!-- Contact -->
                        <div>
                            <h3 class="${heading}">Contact</h3>
                            <ul class="space-y-4 text-sm">
                                <li class="flex items-start">
                                    <i class="fas fa-map-marker-alt text-blue-400 mr-3 w-4 mt-0.5"></i>
                                    <a href="${prefix}locations/software-development-sydney" class="${contactLink}">Sydney, NSW, Australia</a>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-phone text-blue-400 mr-3 w-4 mt-1 text-xs"></i>
                                    <div>
                                        <span class="block text-xs uppercase tracking-wider text-slate-500 mb-0.5">Australia</span>
                                        <a href="tel:+61450275013" class="${contactLink}" aria-label="Call DTB Technologies in Australia">+61 450 275 013</a>
                                    </div>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-phone text-blue-400 mr-3 w-4 mt-1 text-xs"></i>
                                    <div>
                                        <span class="block text-xs uppercase tracking-wider text-slate-500 mb-0.5">Kenya</span>
                                        <a href="tel:+254729983567" class="${contactLink}" aria-label="Call DTB Technologies in Kenya">+254 729 983 567</a>
                                    </div>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-envelope text-blue-400 mr-3 w-4 mt-0.5"></i>
                                    <a href="mailto:dtbbuildsoffice@gmail.com" class="${contactLink}">dtbbuildsoffice@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Bottom -->
                    <div class="border-t border-slate-800/80 py-7 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                        <p class="text-slate-500 text-sm">&copy; ${year} DTB Technologies. All rights reserved.</p>
                        <p class="text-slate-600 text-sm">Built with purpose.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-footer', SiteFooter);
