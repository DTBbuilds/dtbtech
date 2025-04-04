# DTB Technologies Website Documentation

## Project Overview
A modern, responsive website for DTB Technologies, a leading IT solutions provider in Kenya. The website showcases the company's services, expertise, and provides an e-commerce functionality for booking IT services.

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [SEO Implementation](#seo-implementation)
5. [Cart System](#cart-system)
6. [Installation](#installation)
7. [Usage](#usage)
8. [Maintenance](#maintenance)

## Technology Stack
- **Frontend Framework**: HTML5, Tailwind CSS
- **JavaScript**: Vanilla JS with ES6+ features
- **Icons**: Font Awesome 6.0.0-beta3
- **Responsive Design**: Mobile-first approach
- **Local Storage**: For cart functionality
- **SEO**: Schema.org markup, Open Graph, Twitter Cards

## Project Structure
```
dtb-technologies/
├── index.html          # Homepage
├── about.html         # About page
├── services.html      # Services listing
├── tech-lab.html      # Tech lab information
├── contact.html       # Contact information
├── help.html          # Help and support
├── cart.html          # Shopping cart
├── styles.css         # Custom styles
├── script.js          # Global JavaScript
└── assets/           # Images and resources
```

## Features

### 1. Navigation
- Responsive header with mobile menu
- Smooth scrolling
- Active page indication
- Cart counter integration

### 2. Services
- IT Support (from KSh 500/hour)
  - Remote & on-site support
  - Hardware troubleshooting
  - Software installation
  - Network maintenance
  - Data backup & recovery

- Web Development (from KSh 30,000)
  - Responsive design
  - E-commerce solutions
  - CMS integration
  - SEO optimization
  - Performance tuning

- Cloud Solutions (from KSh 5,000/month)
  - Cloud migration
  - Server management
  - Data storage
  - Backup solutions
  - 24/7 monitoring

### 3. Cart System
- Local storage-based cart management
- Real-time cart updates
- Dynamic price calculations
- VAT (16%) inclusion
- Remove item functionality
- Empty cart state handling

### 4. SEO Implementation
Each page includes:
- Optimized meta tags
- Schema.org markup
- Open Graph tags
- Twitter Cards
- Canonical URLs
- Geo-targeting for Kenya
- Language specifications

### 5. Contact Integration
- Contact form with validation
- Location information
- Social media links
- Business hours
- Emergency support contact

## Installation
1. Clone the repository
2. No build process required - static HTML site
3. Deploy to any web server

## Usage

### Local Development
1. Open any HTML file in a modern web browser
2. For best results, use a local server (e.g., Live Server in VS Code)

### Adding New Services
1. Update `services.html`
2. Add service details in the grid section
3. Include pricing information
4. Add corresponding schema markup

### Modifying Cart Functionality
```javascript
// Add item to cart
function addToCart(service, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
        service: service,
        price: price,
        id: Date.now()
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.length;
    document.getElementById('cartCount').textContent = count;
}
```

## Maintenance

### Regular Updates
1. Keep dependencies updated:
   - Font Awesome
   - Tailwind CSS

2. Content Updates:
   - Service prices
   - Contact information
   - Company details

### SEO Maintenance
1. Regular review of meta tags
2. Update schema markup when adding services
3. Monitor and update canonical URLs
4. Keep social media links current

### Performance Optimization
1. Compress new images before adding
2. Minimize CSS and JavaScript
3. Regular testing of responsive design
4. Monitor cart system performance

## Security Considerations
1. Form validation implementation
2. XSS prevention in cart system
3. Secure data handling
4. Regular security audits

## Contact Information
For technical support or inquiries:
- Email: support@dtbtechnologies.co.ke
- Phone: +254-729983567
- Location: Nairobi, Kenya

## License
Copyright © 2025 DTB Technologies. All rights reserved.
