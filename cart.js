// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage with debounce
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const saveCart = debounce(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadges();
    showNotification('Cart updated');
}, 300);

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-24 right-8 p-4 rounded-lg shadow-lg transform transition-all duration-300 z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('translate-y-[-20px]'), 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('translate-y-[-20px]');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function updateCartBadges() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCounts.forEach(badge => {
        badge.textContent = totalItems;
        badge.classList.toggle('scale-0', totalItems === 0);
        badge.classList.toggle('scale-100', totalItems > 0);
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(price).replace('KES', 'KSh');
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!cartItemsDiv || !cartTotal) return;

    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8">
                <i class="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-400 text-lg">Your cart is empty</p>
                <a href="services.html" class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                    Browse Services
                </a>
            </div>
        `;
        cartTotal.textContent = formatPrice(0);
        if (checkoutBtn) checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    if (checkoutBtn) checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center bg-gray-700 p-4 rounded-lg mb-4 transform transition-all hover:scale-[1.02]';
        itemDiv.innerHTML = `
            <div class="flex-1">
                <h4 class="text-white font-medium">${item.name}</h4>
                <p class="text-gray-300">${formatPrice(item.price)} x ${item.quantity}</p>
                <p class="text-blue-400 text-sm mt-1">Subtotal: ${formatPrice(item.price * item.quantity)}</p>
            </div>
            <div class="flex items-center gap-2">
                <button class="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all quantity-btn flex items-center justify-center" 
                        data-index="${index}" data-action="decrease">
                    <i class="fas fa-minus text-sm"></i>
                </button>
                <span class="w-8 text-center text-white">${item.quantity}</span>
                <button class="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all quantity-btn flex items-center justify-center" 
                        data-index="${index}" data-action="increase">
                    <i class="fas fa-plus text-sm"></i>
                </button>
                <button class="ml-4 text-red-400 hover:text-red-300 transition-all remove-item p-2 hover:bg-red-500/10 rounded" 
                        data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);

        // Add slide-in animation
        setTimeout(() => itemDiv.classList.add('translate-x-0', 'opacity-100'), 50 * index);
    });

    cartTotal.textContent = formatPrice(total);

    // Event delegation for cart actions
    cartItemsDiv.addEventListener('click', (e) => {
        const quantityBtn = e.target.closest('.quantity-btn');
        const removeBtn = e.target.closest('.remove-item');
        
        if (quantityBtn) {
            const index = parseInt(quantityBtn.dataset.index);
            const action = quantityBtn.dataset.action;
            
            if (action === 'increase') {
                cart[index].quantity += 1;
                showNotification('Quantity increased');
            } else if (action === 'decrease') {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    showNotification('Quantity decreased');
                } else {
                    cart.splice(index, 1);
                    showNotification('Item removed from cart');
                }
            }
            
            saveCart();
            updateCartDisplay();
        }
        
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index);
            cart.splice(index, 1);
            showNotification('Item removed from cart');
            saveCart();
            updateCartDisplay();
        }
    });
}

// Add to cart functionality with animation
function addToCart(service, price) {
    const existingItem = cart.find(item => item.name === service);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Added another ${service} to cart`);
    } else {
        cart.push({
            name: service,
            price: price,
            quantity: 1
        });
        showNotification(`${service} added to cart`);
    }
    
    saveCart();
    updateCartDisplay();
    
    // Animate cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => cartIcon.classList.remove('animate-bounce'), 1000);
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    updateCartCount();
    
    // Cart sidebar toggle with animation
    const cartButton = document.getElementById('cart-button');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartButton && cartSidebar) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            cartSidebar.classList.remove('translate-x-full');
            if (cartOverlay) {
                cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
            }
        });
        
        const closeCart = () => {
            cartSidebar.classList.add('translate-x-full');
            if (cartOverlay) {
                cartOverlay.classList.add('opacity-0', 'pointer-events-none');
            }
        };
        
        document.querySelectorAll('.close-cart').forEach(btn => {
            btn.addEventListener('click', closeCart);
        });
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', closeCart);
        }
    }
});