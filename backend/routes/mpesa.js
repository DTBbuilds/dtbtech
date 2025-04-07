const express = require('express');
const router = express.Router();
const mpesa = require('../utils/mpesa');
const logger = require('../utils/logger');

// Initiate STK Push
router.post('/stkpush', async (req, res, next) => {
    try {
        const { phoneNumber, amount, description } = req.body;

        if (!phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and amount are required'
            });
        }

        const result = await mpesa.initiateSTKPush(phoneNumber, amount, description);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Check transaction status
router.get('/status/:checkoutRequestId', async (req, res, next) => {
    try {
        const { checkoutRequestId } = req.params;
        const status = await mpesa.checkTransactionStatus(checkoutRequestId);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

// M-Pesa callback URL
router.post('/callback', (req, res) => {
    try {
        const { Body } = req.body;
        logger.info('M-Pesa callback received:', Body);

        // Handle the callback data
        if (Body.stkCallback) {
            const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

            if (ResultCode === 0) {
                // Payment successful
                logger.info('Payment successful:', CallbackMetadata);
            } else {
                // Payment failed
                logger.error('Payment failed:', ResultDesc);
            }
        }

        // Always respond with success to M-Pesa
        res.json({ ResponseCode: "0", ResponseDesc: "success" });
    } catch (error) {
        logger.error('Error processing callback:', error);
        res.json({ ResponseCode: "0", ResponseDesc: "success" });
    }
});

module.exports = router;
