// Check if user has dashboard access (no name required)
function checkAuth() {
    // Check for simple dashboard access flag
    const dashboardAccess = sessionStorage.getItem('dashboardAccess');
    if (!dashboardAccess) {
        // Redirect to dashboard entry page if no access flag
        window.location.href = '../dashboard.html';
        return false;
    }
    return true;
}

// Handle logout
function logout() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('dashboardAccess');
    window.location.href = '../index.html';
}

// Display welcome message and check authentication (disabled message)
function displayWelcome() {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) return;

    // Get the welcome message element
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (!welcomeMessage) return;
    
    // Clear any content and do not render a banner message
    welcomeMessage.textContent = '';
}
