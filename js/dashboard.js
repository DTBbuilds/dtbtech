// Dashboard access is now free - no name prompt required
// This file is kept for compatibility but functions are disabled

// Function to handle dashboard access
function promptNameAndRedirect() {
  // Direct redirect to dashboard without authentication
  window.location.href = './dashboard/welcome.html';
}

// Logout function for compatibility
function logout() {
  sessionStorage.clear();
  window.location.href = './index.html';
}

// Make functions globally available for onclick handlers
window.promptNameAndRedirect = promptNameAndRedirect;
window.logout = logout;
