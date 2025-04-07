// Auth state management
const AUTH_TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

// Check if token is expired
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
}

// Check authentication state and update UI accordingly
function checkAuthState() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const isAuthenticated = token && !isTokenExpired(token);
    
    // Update UI elements
    const dashboardBtns = document.querySelectorAll('.dashboard-btn');
    const authButtons = document.querySelectorAll('.auth-show');
    const userMenus = document.querySelectorAll('.user-menu');
    const userNames = document.querySelectorAll('.user-name');
    
    if (isAuthenticated && user) {
        // Show dashboard buttons and user menu
        dashboardBtns.forEach(btn => btn.classList.remove('hidden'));
        authButtons.forEach(btn => btn.classList.add('hidden'));
        userMenus.forEach(menu => menu.classList.remove('hidden'));
        
        // Update user name displays
        userNames.forEach(name => {
            name.textContent = user.name || 'User';
        });

        // Update welcome message if on dashboard
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome back, ${user.name || 'User'}!`;
        }
    } else {
        // Hide dashboard buttons and user menu
        dashboardBtns.forEach(btn => btn.classList.add('hidden'));
        authButtons.forEach(btn => btn.classList.remove('hidden'));
        userMenus.forEach(menu => menu.classList.add('hidden'));
        
        // If on dashboard page, redirect to login
        if (window.location.pathname.includes('/dashboard/')) {
            window.location.href = '/';
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
}

// Add logout event listeners
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
    
    // Initial auth check
    checkAuthState();
});

// Listen for storage changes (in case of login/logout in other tabs)
window.addEventListener('storage', (e) => {
    if (e.key === AUTH_TOKEN_KEY || e.key === USER_KEY) {
        checkAuthState();
    }
});

// Export for use in other modules
export { checkAuthState, handleLogout };
