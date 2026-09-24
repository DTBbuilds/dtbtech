// DTB Technologies - Main Application JavaScript
// Shared dashboard/session helpers.
// The <nav-header> component lives in components/nav-header.js and is loaded
// alongside this file on pages that need it.

// Dashboard Functions
function accessDashboard() {
    sessionStorage.setItem('dashboardAccess', 'true');
    
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    window.location.href = `${prefix}dashboard/welcome.html`;
}

// Legacy function for backward compatibility
function promptNameAndRedirect() {
    accessDashboard();
}

// Function to handle logout from dashboard
function logout() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('dashboardAccess');
    
    // Redirect to home page
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    window.location.href = `${prefix}index.html`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DTB Technologies app loaded successfully - v1.1');
});
