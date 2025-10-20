# M-Pesa Integration for DTB Technologies

This guide explains how to set up and use M-Pesa payments on the DTB Technologies website.

## Setup Instructions

1. **Backend API Setup**
   - Set up a backend server to handle M-Pesa API requests
   - Configure your Safaricom Daraja API credentials:
     - Consumer Key
     - Consumer Secret
     - Business Short Code
     - Pass Key
     - Callback URL

2. **Configuration**
   - Update the `baseUrl` in `js/mpesa.js` to point to your backend API endpoint
   - Ensure your SSL certificate is valid for secure transactions

## Usage

### For Customers
1. Click on any payment button or navigate to `/#payment` to access the payment form
2. Enter the payment amount
3. Enter your M-Pesa registered phone number
4. Add a description (optional)
5. Click "Pay with M-Pesa"
6. Check your phone for the STK push notification
7. Enter your M-Pesa PIN to complete the payment

### For Developers
The integration consists of three main components:

1. **Frontend Payment Form** (`components/payment-form.html`)
   - Responsive payment form with amount and phone number inputs
   - Real-time payment status updates
   - Error handling and validation

2. **M-Pesa Integration Module** (`js/mpesa.js`)
   - Handles STK push requests
   - Payment status checking
   - Phone number formatting
   - Error handling

3. **Backend API Requirements**
   Your backend needs to implement these endpoints:
   - POST `/api/mpesa/stkpush` - Initiates STK push
   - GET `/api/mpesa/status/:checkoutRequestId` - Checks payment status

## Security Considerations

1. Always use HTTPS for API requests
2. Validate phone numbers and amounts on both frontend and backend
3. Implement rate limiting for API endpoints
4. Keep your Daraja API credentials secure
5. Implement proper error handling and logging

## Testing

For testing purposes, use Safaricom's sandbox environment:
1. Use test credentials from your Daraja account
2. Use test phone numbers provided by Safaricom
3. Test both successful and failed payment scenarios

## Support

For any issues or questions:
- Email: support@dtbtechnologies.com
- Phone: [Your support phone number]
- Visit: [Your office address]
