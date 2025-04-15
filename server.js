const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
