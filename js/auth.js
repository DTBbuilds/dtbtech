// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const button = e.target.querySelector('button');
    const spinner = button.querySelector('.loading-spinner');
    const buttonText = button.querySelector('.button-text');

    try {
        // Show loading state
        button.disabled = true;
        spinner.classList.remove('hidden');
        buttonText.textContent = 'Signing in...';
        errorMessage.classList.add('hidden');

        // Simulate authentication (replace with actual auth logic)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store auth state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ email }));
        
        // Redirect to welcome page
        window.location.href = '../dashboard/welcome.html';
    } catch (error) {
        errorMessage.textContent = error.message || 'An error occurred during sign in';
        errorMessage.classList.remove('hidden');
    } finally {
        button.disabled = false;
        spinner.classList.add('hidden');
        buttonText.textContent = 'Sign In';
    }
});
