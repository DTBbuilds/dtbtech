const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Analytics API endpoints
app.post('/api/analytics/web-vitals', (req, res) => {
    const { metric, value, timestamp, url } = req.body;
    
    // Log web vitals data (in production, you'd save to database)
    console.log(`📊 Web Vitals - ${metric}: ${value} at ${url}`);
    
    res.status(200).json({ 
        success: true, 
        message: 'Web vitals data received',
        metric,
        value
    });
});

// General analytics endpoint
app.post('/api/analytics', (req, res) => {
    const { event, data, timestamp, url } = req.body;
    
    // Log analytics data
    console.log(`📈 Analytics - ${event}:`, data, `at ${url}`);
    
    res.status(200).json({ 
        success: true, 
        message: 'Analytics data received',
        event,
        data
    });
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'dtb-logo.png'));
});

// Serve static files
app.use(express.static('.'));
app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/components', express.static('components'));
app.use('/services', express.static('services'));
app.use('/tech-lab', express.static('tech-lab'));
app.use('/dashboard', express.static('dashboard'));
app.use('/auth', express.static('auth'));
app.use('/virtual-tour', express.static('virtual-tour'));
app.use('/viewer', express.static('viewer'));
app.use('/dist', express.static('dist'));
app.use('/src', express.static('src'));

// Handle all HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle routes for all directories
app.get('/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, `${req.params.page}.html`));
});

app.get('/auth/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth', `${req.params.page}.html`));
});

app.get('/dashboard/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', `${req.params.page}.html`));
});

app.get('/services/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'services', `${req.params.page}.html`));
});

app.get('/tech-lab/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tech-lab', `${req.params.page}.html`));
});

app.get('/tech-lab/skills/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tech-lab', 'skills', `${req.params.page}.html`));
});

app.get('/components/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', `${req.params.page}.html`));
});

// Error handling for 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Analytics server running at http://localhost:${PORT}`);
});
