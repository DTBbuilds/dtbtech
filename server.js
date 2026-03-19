const express = require('express');
const path = require('path');
const app = express();

// Gzip compression for all responses
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
});

// Serve static files with caching headers
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        // Long cache for hashed/versioned assets
        if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
        // Long cache for images/fonts
        if (/\.(jpg|jpeg|png|gif|svg|ico|woff2?|ttf|eot)$/.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
        }
        // Short cache for HTML (so updates show quickly)
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    }
}));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try: SET PORT=3001 && npm run dev`);
        process.exit(1);
    }
});
