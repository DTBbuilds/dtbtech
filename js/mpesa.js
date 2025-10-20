// M-Pesa Integration Module
class MpesaPayment {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/mpesa'; // Local development server
    }

    async initiateSTKPush(amount, phone, description = 'Payment for DTB Technologies services') {
        try {
            const response = await fetch(`${this.baseUrl}/stkpush`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: this.formatPhoneNumber(phone),
                    amount: amount,
                    description: description
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('M-Pesa payment initiation failed:', error);
            throw new Error('Payment initiation failed. Please try again.');
        }
    }

    formatPhoneNumber(phone) {
        // Remove any non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Ensure the number starts with 254
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        } else if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }
        
        return cleaned;
    }

    async checkPaymentStatus(checkoutRequestId) {
        try {
            const response = await fetch(`${this.baseUrl}/status/${checkoutRequestId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Payment status check failed:', error);
            throw new Error('Could not verify payment status.');
        }
    }
}

// Payment UI Handler
class PaymentUI {
    constructor() {
        this.mpesa = new MpesaPayment();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const paymentForm = document.getElementById('mpesa-payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusDiv = document.getElementById('payment-status');

        const amount = form.querySelector('#payment-amount').value;
        const phone = form.querySelector('#phone-number').value;
        const description = form.querySelector('#payment-description').value;

        // Frontend phone validation (Kenyan format: 2547XXXXXXXX or 07XXXXXXXX)
        const cleanedPhone = phone.replace(/\D/g, '');
        const phoneValid = cleanedPhone.match(/^(2547\d{8}|07\d{8})$/);
        if (!phoneValid) {
            statusDiv.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Enter a valid Safaricom number: 07XXXXXXXX or 2547XXXXXXXX</p>
                </div>`;
            return;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            statusDiv.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Enter a valid amount greater than 0</p>
                </div>`;
            return;
        }

        try {
            // Disable form elements and show loading state
            submitBtn.disabled = true;
            form.querySelectorAll('input').forEach(inp => inp.disabled = true);
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            statusDiv.innerHTML = '<p class="text-blue-500">Initiating payment...</p>';

            const response = await this.mpesa.initiateSTKPush(amount, phone, description);
            if (response.success) {
                statusDiv.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <p>Please check your phone and enter M-Pesa PIN to complete payment.</p>
                    </div>`;
                // Start checking payment status
                this.pollPaymentStatus(response.checkoutRequestId);
            } else {
                statusDiv.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>${response.message || 'Payment initiation failed'}</p>
                    </div>`;
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>${error.message}</p>
                </div>`;
        } finally {
            // Reset button and form state
            submitBtn.disabled = false;
            form.querySelectorAll('input').forEach(inp => inp.disabled = false);
            submitBtn.innerHTML = 'Pay with M-Pesa';
        }
    }

    async pollPaymentStatus(checkoutRequestId) {
        const statusDiv = document.getElementById('payment-status');
        let attempts = 0;
        const maxAttempts = 10;

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                statusDiv.innerHTML = `
                    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <p>Payment verification timed out.<br>If you completed the payment, please contact support with your transaction details.</p>
                    </div>`;
                return;
            }

            try {
                const status = await this.mpesa.checkPaymentStatus(checkoutRequestId);
                if (status.success) {
                    statusDiv.innerHTML = `
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            <p>Payment completed successfully! Thank you for your business.</p>
                        </div>`;
                    return;
                } else if (status.pending) {
                    attempts++;
                    statusDiv.innerHTML = `
                        <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                            <p>Waiting for payment confirmation... (Attempt ${attempts}/${maxAttempts})</p>
                        </div>`;
                    setTimeout(checkStatus, 5000); // Check again in 5 seconds
                } else {
                    statusDiv.innerHTML = `
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>${status.message || 'Payment failed. Please try again.'}</p>
                        </div>`;
                }
            } catch (error) {
                statusDiv.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>${error.message}</p>
                    </div>`;
            }
        };

        await checkStatus();
    }
}

// Initialize payment UI when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new PaymentUI();
});
