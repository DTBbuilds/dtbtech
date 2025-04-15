// Auth state management
const USER_KEY = 'currentUser';

// Check if user is authenticated
function isAuthenticated() {
    try {
        const userData = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        return userData.isAuthenticated === true;
    } catch (e) {
        return false;
    }
}

// Check authentication state and update UI accordingly
function checkAuthState() {
    const userData = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const isAuthed = isAuthenticated();
    
    // Update UI elements
    const dashboardBtns = document.querySelectorAll('.dashboard-btn');
    const authButtons = document.querySelectorAll('.auth-show');
    const userMenus = document.querySelectorAll('.user-menu');
    const userNames = document.querySelectorAll('.user-name');
    
    if (isAuthed) {
        // Show dashboard buttons and user menu
        dashboardBtns.forEach(btn => btn.classList.remove('hidden'));
        authButtons.forEach(btn => btn.classList.add('hidden'));
        userMenus.forEach(menu => menu.classList.remove('hidden'));
        
        // Update user name displays
        userNames.forEach(name => {
            name.textContent = userData.name || 'User';
        });

        // Update welcome message if on dashboard
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome back, ${userData.name || 'User'}!`;
        }

        // Redirect to dashboard if we just logged in
        if (window.location.pathname.endsWith('index.html') && sessionStorage.getItem('justLoggedIn')) {
            sessionStorage.removeItem('justLoggedIn');
            window.location.href = './dashboard/welcome.html';
        }
    } else {
        // Hide dashboard buttons and user menu
        dashboardBtns.forEach(btn => btn.classList.add('hidden'));
        authButtons.forEach(btn => btn.classList.remove('hidden'));
        userMenus.forEach(menu => menu.classList.add('hidden'));
        
        // If on any dashboard page, redirect to home
        if (window.location.pathname.includes('/dashboard/')) {
            window.location.href = '../index.html';
        }
    }
}

// Handle logout
function handleLogout() {
    // Clear auth data
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('justLoggedIn');

    // Redirect to home page
    const isInDashboard = window.location.pathname.includes('/dashboard/');
    window.location.href = isInDashboard ? '../index.html' : './index.html';
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Handle both desktop and mobile logout buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn, #mobile-logoutBtn, .logout-btn');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', handleLogout);
        }
    });
    
    // Initial auth check
    checkAuthState();
});

// Listen for storage changes (in case of login/logout in other tabs)
window.addEventListener('storage', (e) => {
    if (e.key === USER_KEY) {
        checkAuthState();
    }
});

// Listen for auth state changes from auth-modal
document.addEventListener('authStateChanged', () => {
    checkAuthState();
});
