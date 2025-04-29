// Mobile-optimized Single Page Checkout Modal with Mobile Wallet Support
class CheckoutModal extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" role="dialog" aria-modal="true" style="display:none;" id="checkout-modal">
                <div class="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 relative animate-slide-up">
                    <button class="absolute top-4 right-4 text-gray-500 hover:text-blue-600 text-2xl" aria-label="Close Checkout" id="close-checkout">&times;</button>
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Checkout</h2>
                    <form id="checkout-form" class="space-y-4">
                        <div>
                            <label for="name" class="block text-gray-700 font-medium mb-1">Name</label>
                            <input type="text" id="name" name="name" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" autocomplete="name" />
                        </div>
                        <div>
                            <label for="email" class="block text-gray-700 font-medium mb-1">Email</label>
                            <input type="email" id="email" name="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" autocomplete="email" />
                        </div>
                        <div>
                            <label for="phone" class="block text-gray-700 font-medium mb-1">Phone</label>
                            <input type="tel" id="phone" name="phone" required pattern="[0-9]{10,15}" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" autocomplete="tel" />
                        </div>
                        <div>
                            <label for="payment" class="block text-gray-700 font-medium mb-1">Payment Method</label>
                            <select id="payment" name="payment" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value="mpesa">M-PESA</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="applepay">Apple Pay</option>
                                <option value="googlepay">Google Pay</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 transition-all">Pay Now</button>
                    </form>
                </div>
            </div>
        `;
    }
    connectedCallback() {
        // Show/hide modal logic
        const modal = this.querySelector('#checkout-modal');
        const closeBtn = this.querySelector('#close-checkout');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        window.showCheckoutModal = () => {
            modal.style.display = 'flex';
        };
        // Handle form submit (integration with backend/payment APIs required)
        this.querySelector('#checkout-form').addEventListener('submit', e => {
            e.preventDefault();
            // Simulate payment processing
            modal.style.display = 'none';
            window.navigator.vibrate?.(50); // Haptic feedback
            alert('Payment processed! (Integrate with backend/payment gateway)');
        });
    }
}
customElements.define('checkout-modal', CheckoutModal);
