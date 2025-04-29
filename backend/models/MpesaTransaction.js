const mongoose = require('mongoose');

const mpesaTransactionSchema = new mongoose.Schema({
    merchantRequestId: String,
    checkoutRequestId: String,
    resultCode: Number,
    resultDesc: String,
    callbackMetadata: mongoose.Schema.Types.Mixed,
    phoneNumber: String,
    amount: Number,
    orderId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MpesaTransaction', mpesaTransactionSchema);
