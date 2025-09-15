const express = require('express');
const router = express.Router();
const mpesa = require('../utils/mpesa');
const logger = require('../utils/logger');
const MpesaTransaction = require('../models/MpesaTransaction');
const Order = require('../models/Order');

// Initiate STK Push
router.post('/stkpush', async (req, res, next) => {
    try {
        const { phoneNumber, amount, description } = req.body;

        // Validate phone number (Kenyan format: 2547XXXXXXXX)
        const phoneRegex = /^2547\d{8}$/;
        if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'A valid Safaricom phone number (format: 2547XXXXXXXX) is required.'
            });
        }
        // Validate amount
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid amount greater than 0 is required.'
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
router.post('/callback', async (req, res) => {
    try {
        if (!req.body || !req.body.Body || !req.body.Body.stkCallback) {
            logger.warn('Invalid M-Pesa callback payload:', req.body);
            return res.json({ ResponseCode: "0", ResponseDesc: "success" });
        }
        const { Body } = req.body;
        logger.info('M-Pesa callback received:', Body);

        // Handle the callback data
        if (Body && Body.stkCallback) {
            const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
            let phoneNumber = null;
            let amount = null;
            if (CallbackMetadata && CallbackMetadata.Item) {
                for (const item of CallbackMetadata.Item) {
                    if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
                    if (item.Name === 'Amount') amount = item.Value;
                }
            }

            // Save transaction to DB
            let mpesaTx = null;
            try {
                mpesaTx = await MpesaTransaction.create({
                    merchantRequestId: MerchantRequestID,
                    checkoutRequestId: CheckoutRequestID,
                    resultCode: ResultCode,
                    resultDesc: ResultDesc,
                    callbackMetadata: CallbackMetadata,
                    phoneNumber,
                    amount
                });
                logger.info('M-Pesa transaction saved to DB');
            } catch (dbErr) {
                logger.error('Failed to save M-Pesa transaction:', dbErr);
            }

            // Attempt to update the related order if orderId is present in the transaction
            // (Assumes orderId is included in the transaction metadata or can be mapped in your system)
            let orderId = null;
            if (CallbackMetadata && CallbackMetadata.Item) {
                for (const item of CallbackMetadata.Item) {
                    if (item.Name === 'OrderId') orderId = item.Value;
                }
            }
            if (orderId && mpesaTx) {
                try {
                    const updatedOrder = await Order.findByIdAndUpdate(
                        orderId,
                        { status: 'paid', mpesaTransactionId: mpesaTx._id },
                        { new: true }
                    );
                    if (updatedOrder) {
                        logger.info(`Order ${orderId} marked as paid.`);
                    } else {
                        logger.warn(`Order ${orderId} not found for payment update.`);
                    }
                } catch (orderErr) {
                    logger.error('Failed to update order status after payment:', orderErr);
                }
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
