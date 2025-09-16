class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';

    this.innerHTML = `
            <footer class="relative bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50">
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/90 pointer-events-none"></div>
                
                <div class="container mx-auto px-4 py-12 relative">
                    <!-- Main Footer Content -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <!-- Company Info -->
                        <div class="space-y-6 backdrop-blur-sm bg-slate-900/30 p-6 rounded-2xl border border-gray-800/30">
                            <div class="flex items-center space-x-3">
                                <img src="${prefix}assets/dtb-logo.png" alt="DTB Technologies Logo" class="h-8" onerror="this.style.display='none'">
                                <h3 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DTB Technologies</h3>
                            </div>
                            <p class="text-gray-300">Empowering businesses with innovative technology solutions and expert IT services across Kenya and East Africa.</p>
                            <div class="flex items-center space-x-4">
                                <a href="https://facebook.com/dtbtechnologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/50 group" aria-label="Facebook">
                                    <i class="fab fa-facebook-f text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://twitter.com/dtbtechnologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-cyan-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-cyan-500/50 group" aria-label="Twitter">
                                    <i class="fab fa-twitter text-gray-400 group-hover:text-cyan-400 transition-colors"></i>
                                </a>
                                <a href="https://linkedin.com/company/dtbtechnologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/50 group" aria-label="LinkedIn">
                                    <i class="fab fa-linkedin-in text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                                </a>
                                <a href="https://instagram.com/dtb_technologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-pink-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-pink-500/50 group" aria-label="Instagram">
                                    <i class="fab fa-instagram text-gray-400 group-hover:text-pink-400 transition-colors"></i>
                                </a>
                                <a href="https://youtube.com/@dtbtechnologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-red-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-red-500/50 group" aria-label="YouTube">
                                    <i class="fab fa-youtube text-gray-400 group-hover:text-red-400 transition-colors"></i>
                                </a>
                                <a href="https://tiktok.com/@dtb_technologies" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-pink-600/20 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-700/30 hover:border-pink-500/50 group" aria-label="TikTok">
                                    <i class="fab fa-tiktok text-gray-400 group-hover:text-pink-400 transition-colors"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="space-y-6 backdrop-blur-sm bg-slate-900/30 p-6 rounded-2xl border border-gray-800/30">
                            <h4 class="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Quick Links</h4>
                            <ul class="space-y-3">
                                <li><a href="${prefix}index.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Home</a></li>
                                <li><a href="${prefix}about.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>About Us</a></li>
                                <li><a href="${prefix}services.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Services</a></li>
                                <li><a href="${prefix}tech-lab.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Tech Lab</a></li>
                                <li><a href="${prefix}contact.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Contact</a></li>
                                <li><a href="${prefix}help.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Help</a></li>
                            </ul>
                        </div>

                        <!-- Services -->
                        <div class="space-y-6 backdrop-blur-sm bg-slate-900/30 p-6 rounded-2xl border border-gray-800/30">
                            <h4 class="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Our Services</h4>
                            <ul class="space-y-3">
                                <li><a href="${prefix}services/web-app-dev.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Web Development</a></li>
                                <li><a href="${prefix}services/cloud-solutions.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Cloud Solutions</a></li>
                                <li><a href="${prefix}services/cybersecurity.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Cybersecurity</a></li>
                                <li><a href="${prefix}services/it-support.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>IT Support</a></li>
                                <li><a href="${prefix}services/network-solutions.html" class="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><i class="fas fa-chevron-right text-xs mr-2 text-blue-400"></i>Network Solutions</a></li>
                            </ul>
                        </div>

                        <!-- Contact Info -->
                        <div class="space-y-6 backdrop-blur-sm bg-slate-900/30 p-6 rounded-2xl border border-gray-800/30">
                            <h4 class="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Contact Info</h4>
                            <div class="space-y-4">
                                <div class="flex items-start space-x-3">
                                    <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                                    <div>
                                        <p class="text-gray-300 text-sm">Nairobi, Kenya</p>
                                        <p class="text-gray-400 text-xs">East Africa</p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-phone text-blue-400"></i>
                                    <a href="tel:+254729983567" class="text-gray-300 hover:text-blue-400 transition-colors text-sm">+254 729983567</a>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-envelope text-blue-400"></i>
                                    <a href="mailto:dtbinfotech@gmail.com" class="text-gray-300 hover:text-blue-400 transition-colors text-sm">dtbinfotech@gmail.com</a>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-clock text-blue-400"></i>
                                    <div>
                                        <p class="text-gray-300 text-sm">Mon - Fri: 8AM - 6PM</p>
                                        <p class="text-gray-400 text-xs">EAT (UTC+3)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="mt-12 pt-8 border-t border-gray-800/50">
                        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div class="text-center md:text-left">
                                <p class="text-gray-400 text-sm">
                                    © ${new Date().getFullYear()} DTB Technologies. All rights reserved.
                                </p>
                                <p class="text-gray-500 text-xs mt-1">
                                    Empowering businesses through innovative technology solutions.
                                </p>
                            </div>
                            <div class="flex items-center space-x-6">
                                <a href="${prefix}privacy.html" class="text-gray-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a>
                                <a href="${prefix}terms.html" class="text-gray-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a>
                                <a href="${prefix}sitemap.html" class="text-gray-400 hover:text-blue-400 transition-colors text-sm">Sitemap</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;
  }
}

// Define the custom element
customElements.define('footer-component', FooterComponent);
