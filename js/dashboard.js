// Free dashboard access - no name required
function accessDashboard() {
    // Set dashboard access flag
    sessionStorage.setItem('dashboardAccess', 'true');
    
    // Redirect to dashboard entry page
    const currentPath = window.location.pathname;
    const depth = currentPath.split('/').length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    window.location.href = `${prefix}dashboard.html`;
}

// Legacy function for backward compatibility (now redirects to free access)
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
