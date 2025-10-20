const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mpesaRoutes = require('./routes/mpesa');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Backend on 8080, frontend on 3000

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'", "cdnjs.cloudflare.com"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dtb_technologies';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => {
    logger.warn('MongoDB connection error:', err);
    logger.info('Running in development mode without MongoDB');
});

// API Routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling for API routes
app.use('/api', (err, req, res, next) => {
    logger.error('API Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// API Routes first
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Handle HTML routes
const htmlRoutes = [
    '/',
    '/about',
    '/services',
    '/tech-lab',
    '/contact',
    '/help',
    '/privacy-policy',
    '/services/it-support',
    '/services/web-app-dev',
    '/services/network-solutions',
    '/services/cloud-solutions',
    '/services/cybersecurity',
    '/services/data-recovery',
    '/services/digital-transformation',
    '/services/hardware-solutions',
    '/services/wifi-starlink'
];

htmlRoutes.forEach(route => {
    app.get(route, (req, res) => {
        const htmlFile = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
        res.sendFile(path.join(__dirname, '..', htmlFile));
    });
});

// Fallback route - send index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Global error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Frontend accessible at http://localhost:3000`);
    logger.info(`API endpoints available at http://localhost:${PORT}/api`);
});
