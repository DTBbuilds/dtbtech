require('dotenv').config();
const mpesa = require('./utils/mpesa');
const logger = require('./utils/logger');

async function testMpesaIntegration() {
    try {
        console.log('1. Testing M-Pesa Access Token...');
        const accessToken = await mpesa.getAccessToken();
        console.log('✓ Access token obtained successfully');

        console.log('\n2. Testing STK Push...');
        // Using test phone number and minimum amount
        const result = await mpesa.initiateSTKPush(
            '254708374149', // Safaricom test number
            1, // Amount (minimum)
            'Test Payment'
        );
        console.log('✓ STK Push initiated successfully');
        console.log('Checkout Request ID:', result.checkoutRequestId);

        console.log('\n3. Testing Transaction Status...');
        // Wait for 10 seconds before checking status
        console.log('Waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        const status = await mpesa.checkTransactionStatus(result.checkoutRequestId);
        console.log('✓ Status check completed');
        console.log('Status:', status);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('API Error:', error.response.data);
        }
    }
}

testMpesaIntegration();
