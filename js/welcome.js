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

// Display welcome message and check authentication
function displayWelcome() {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) return;

    // Get the welcome message element
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (!welcomeMessage) return;
    
    // Create a generic welcome message
    const message = `Welcome to DTB Technologies Dashboard!`;
    let charIndex = 0;
    
    // Remove opacity-0 class to start fade in
    welcomeMessage.classList.remove('opacity-0');
    
    // Type out the message
    const typeMessage = setInterval(() => {
        welcomeMessage.textContent = message.slice(0, charIndex) + '|';
        charIndex++;
        
        if (charIndex > message.length) {
            clearInterval(typeMessage);
            welcomeMessage.textContent = message;
            // Add a subtle pulse to the final message
            welcomeMessage.classList.add('animate-pulse-subtle');
        }
    }, 100);
}
