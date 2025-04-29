// Bottom Navigation Bar Component for Mobile
class BottomNav extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <nav class="fixed bottom-0 left-0 w-full z-50 bg-slate-900/95 border-t border-slate-800 flex justify-around items-center py-2 md:hidden">
                <a href="/" class="flex flex-col items-center text-gray-300 hover:text-blue-400 focus:text-blue-500 px-2" aria-label="Home">
                    <i class="fas fa-home text-xl mb-1"></i>
                    <span class="text-xs">Home</span>
                </a>
                <a href="/categories.html" class="flex flex-col items-center text-gray-300 hover:text-blue-400 focus:text-blue-500 px-2" aria-label="Categories">
                    <i class="fas fa-th-large text-xl mb-1"></i>
                    <span class="text-xs">Categories</span>
                </a>
                <a href="/cart.html" class="flex flex-col items-center text-gray-300 hover:text-blue-400 focus:text-blue-500 px-2 relative" aria-label="Cart">
                    <i class="fas fa-shopping-cart text-xl mb-1"></i>
                    <span class="text-xs">Cart</span>
                    <span id="cart-count" class="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold hidden">0</span>
                </a>
                <a href="/profile.html" class="flex flex-col items-center text-gray-300 hover:text-blue-400 focus:text-blue-500 px-2" aria-label="Profile">
                    <i class="fas fa-user text-xl mb-1"></i>
                    <span class="text-xs">Profile</span>
                </a>
            </nav>
        `;
        this.updateCartCount();
    }
    // Example: Update cart count from localStorage or backend
    updateCartCount() {
        const count = Number(localStorage.getItem('cartCount')) || 0;
        const badge = this.querySelector('#cart-count');
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    }
}
customElements.define('bottom-nav', BottomNav);
