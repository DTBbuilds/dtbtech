// Authentication utility functions
import { apiUrl, baseUrl } from '../config.js';

async function login(email, password) {
    try {
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = `${baseUrl}/dashboard/welcome.html`;
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function signup(username, email, password) {
    try {
        const response = await fetch(`${apiUrl}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ username, email }));
            window.location.href = `${baseUrl}/dashboard/welcome.html`;
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
}

async function resetPassword(email) {
    try {
        const response = await fetch(`${apiUrl}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login.html';
}

function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 hidden';
    
    if (loginForm) {
        loginForm.insertAdjacentElement('beforeend', errorDisplay);
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDisplay.classList.add('hidden');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await login(email, password);
            } catch (error) {
                errorDisplay.textContent = error.message;
                errorDisplay.classList.remove('hidden');
            }
        });
    }
    
    if (signupForm) {
        signupForm.insertAdjacentElement('beforeend', errorDisplay);
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDisplay.classList.add('hidden');
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                errorDisplay.textContent = 'Passwords do not match';
                errorDisplay.classList.remove('hidden');
                return;
            }
            
            try {
                await signup(username, email, password);
            } catch (error) {
                errorDisplay.textContent = error.message;
                errorDisplay.classList.remove('hidden');
            }
        });
    }
    
    // Check authentication status
    if (!isAuthenticated() && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login.html';
    }
});
