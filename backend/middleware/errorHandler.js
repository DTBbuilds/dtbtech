const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    if (err.response?.data) {
        // Handle M-Pesa API specific errors
        return res.status(err.response.status || 500).json({
            success: false,
            message: err.response.data.errorMessage || 'An error occurred with the payment service'
        });
    }

    // Handle general errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
}

module.exports = errorHandler;
