const axios = require('axios');
const logger = require('./logger');

class MpesaAPI {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
        this.passkey = process.env.MPESA_PASSKEY;
        this.baseURL = 'https://sandbox.safaricom.co.ke';
    }

    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
            const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            });
            return response.data.access_token;
        } catch (error) {
            logger.error('Error getting access token:', error);
            throw new Error('Failed to get access token');
        }
    }

    generateTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hour}${minutes}${seconds}`;
    }

    generatePassword() {
        const timestamp = this.generateTimestamp();
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
        return password;
    }

    async initiateSTKPush(phoneNumber, amount, description) {
        try {
            const timestamp = this.generateTimestamp();
            const accessToken = await this.getAccessToken();

            const requestBody = {
                BusinessShortCode: this.businessShortCode,
                Password: this.generatePassword(),
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: this.businessShortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: process.env.MPESA_CALLBACK_URL,
                AccountReference: "DTB Technologies",
                TransactionDesc: description || "Payment for services"
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                checkoutRequestId: response.data.CheckoutRequestID,
                merchantRequestId: response.data.MerchantRequestID
            };
        } catch (error) {
            logger.error('STK push initiation error:', error);
            throw new Error(error.response?.data?.errorMessage || 'Failed to initiate payment');
        }
    }

    async checkTransactionStatus(checkoutRequestId) {
        try {
            const timestamp = this.generateTimestamp();
            const accessToken = await this.getAccessToken();

            const requestBody = {
                BusinessShortCode: this.businessShortCode,
                Password: this.generatePassword(),
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpushquery/v1/query`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const resultCode = response.data.ResultCode;
            return {
                success: resultCode === 0,
                pending: resultCode === null,
                message: response.data.ResultDesc
            };
        } catch (error) {
            logger.error('Transaction status check error:', error);
            throw new Error('Failed to check transaction status');
        }
    }
}

module.exports = new MpesaAPI();
