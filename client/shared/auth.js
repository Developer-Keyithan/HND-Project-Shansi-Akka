(function () {
    // Authentication utilities for HealthyBite Platform (Dummy Data Mode)

    // Initialize EmailJS (Replace 'YOUR_PUBLIC_KEY' with actual key in production)
    // For this demo, we assume EmailJS SDK is loaded in index.html
    const EMAILJS_SERVICE_ID = 'service_healthybite';
    const EMAILJS_TEMPLATE_ID_WELCOME = 'template_welcome';
    const EMAILJS_TEMPLATE_ID_RESET = 'template_reset';
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Placeholder

    // Get current user from localStorage
    function getCurrentUser() {
        const userStr = localStorage.getItem('healthybite-user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }

    // Set current user
    function setCurrentUser(user) {
        localStorage.setItem('healthybite-user', JSON.stringify(user));
    }

    // Remove current user (logout)
    function removeCurrentUser() {
        localStorage.removeItem('healthybite-user');
        if (window.Navbar && typeof window.Navbar.updateUserMenu === 'function') {
            window.Navbar.updateUserMenu();
        }
        const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
        window.location.href = appUrl + '/index.html';
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
    function requireAuth(redirectTo = '/index.html') {
        if (!isAuthenticated()) {
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/pages/errors/401.html';
            return false;
        }
        return true;
    }

    // Require specific role
    function requireRole(role) {
        if (!hasRole(role)) {
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/pages/errors/403.html';
            return false;
        }
        return true;
    }

    // Helper: Send Email via EmailJS
    async function sendEmail(templateId, templateParams) {
        try {
            if (window.emailjs) {
                await window.emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
                console.log('Email sent successfully:', templateId);
            } else {
                console.warn('EmailJS not loaded');
            }
        } catch (error) {
            console.error('Email sending failed:', error);
        }
    }

    // Authenticate user (Mock)
    async function loginUser(email, password) {
        try {
            // Use API for validation
            const result = await window.API.login(email, password);

            if (result.success) {
                setCurrentUser(result.user);
                // Send Login Notification Email (Optional)
                // await sendEmail(EMAILJS_TEMPLATE_ID_WELCOME, { to_name: result.user.name, to_email: result.user.email, message: "New login detected." });
                return result;
            } else {
                return { success: false, error: result.message };
            }
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    // Register user (Mock)
    async function registerUser(userData) {
        try {
            // API Call
            const result = await window.API.register(userData);

            if (result.success) {
                setCurrentUser(result.user);

                // Send Welcome Email
                await sendEmail(EMAILJS_TEMPLATE_ID_WELCOME, {
                    to_name: result.user.name,
                    to_email: result.user.email,
                    subject: "Welcome to HealthyBite!",
                    message: "Thank you for joining us. Start your healthy journey today."
                });

                return result;
            } else {
                return { success: false, error: result.message };
            }
        } catch (error) {
            return { success: false, error: 'Registration failed.' };
        }
    }

    // Forgot Password (Mock)
    async function forgotPassword(email) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const users = window.users || [];
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (user) {
                    const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || 'http://localhost:5500').replace(/\/$/, '');
                    // Send Reset Email
                    await sendEmail(EMAILJS_TEMPLATE_ID_RESET, {
                        to_name: user.name,
                        to_email: user.email,
                        reset_link: `${appUrl}/auth/reset-password.html?token=dummy`
                    });
                    resolve({ success: true, message: 'Password reset link sent to your email.' });
                } else {
                    // For security, usually say "If account exists..." but for this mock:
                    resolve({ success: false, error: 'User not found' });
                }
            }, 800);
        });
    }

    // Logout
    async function logoutUser() {
        removeCurrentUser();
        // Redirect handled in removeCurrentUser or caller
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
        logoutUser,
        forgotPassword,
        sendEmail
    };
})();

