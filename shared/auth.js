// Authentication utilities for HealthyBite Platform

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('helthybite-user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem('helthybite-user', JSON.stringify(user));
}

// Remove current user (logout)
function removeCurrentUser() {
    localStorage.removeItem('helthybite-user');
}

// Check if user is authenticated
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Check if user has specific role
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

// Require authentication (redirect if not logged in)
function requireAuth(redirectTo = '/auth/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Require specific role
function requireRole(role, redirectTo = '/index.html') {
    if (!hasRole(role)) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// API call to authenticate user
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok && data.user) {
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// API call to register user
async function registerUser(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok && data.user) {
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// API call to logout
async function logoutUser() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        removeCurrentUser();
    }
}

// Export functions
window.Auth = {
    getCurrentUser,
    setCurrentUser,
    removeCurrentUser,
    isAuthenticated,
    hasRole,
    requireAuth,
    requireRole,
    loginUser,
    registerUser,
    logoutUser
};

