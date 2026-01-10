// Login Page JavaScript with EmailJS, Social Auth, and Logging
import { Toast } from "../../plugins/Toast/toast.js";
import { Auth } from "../../shared/auth.js";
import { SocialAuth } from "../../shared/socialauth.js";
import { EmailServiceImpl } from "../../shared/emailjs.js";
import { Logger } from "../../shared/logger.js";
import { AppConfig } from "../../app.config.js";
import { Utils } from "../../shared/utils.js";
import { showNotification } from "../../actions.js";

const EmailService = EmailServiceImpl; // Alias

document.addEventListener('DOMContentLoaded', function () {
    // Check for existing session
    const userStr = localStorage.getItem('healthybite-user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log('User found in localStorage:', user);
            const redirectPaths = {
                'admin': '/dashboard/admin.html',
                'administrator': '/dashboard/admin.html',
                'seller': '/dashboard/seller.html',
                'delivery-partner': '/dashboard/delivery-partner.html',
                'delivery-man': '/dashboard/delivery-man.html',
                'technical-supporter': '/dashboard/technical.html'
            };
            const redirectPath = redirectPaths[user.role] || '/dashboard/consumer.html';
            const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
            window.location.href = appUrl + redirectPath;
            return;
        } catch (e) {
            console.warn('Failed to parse user session, clearing.', e);
            localStorage.removeItem('healthybite-user');
        }
    }

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;

            // Validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!Utils.validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            await handleLogin(email, password, rememberMe);
        });
    }

    // Social login buttons
    initSocialLogin();
});

async function handleLogin(email, password, rememberMe) {
    const submitBtn = document.querySelector('#loginForm .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
        // Log login attempt
        Logger.info('Login attempt', { email });

        // Get device info
        constDeviceInfo(); // Just internal helper usage or rename
        const deviceInfo = getDeviceInfo();
        const ipAddress = await getIPAddress();

        // Attempt login via API
        const result = await Auth.loginUser(email, password);

        if (result && result.success) {
            const user = result.user;

            // Store user session is handled inside Auth.loginUser usually, but let's confirm.
            // Auth.loginUser in shared/auth.js does NOT set current user, it returns result.
            // Assuming Auth.setCurrentUser is needed.

            Auth.setCurrentUser({
                ...user,
                rememberMe,
                loginTime: new Date().toISOString()
            });

            // Send login notification email
            try {
                await EmailService.notifyLogin(user.email, deviceInfo, ipAddress);
            } catch (emailError) {
                console.warn('Failed to send login email:', emailError);
            }

            // Log successful login
            Logger.info('Login successful', {
                email: user.email,
                userId: user.id,
                role: user.role
            });

            showNotification('Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                const redirectPaths = {
                    'admin': '/dashboard/admin.html',
                    'administrator': '/dashboard/admin.html',
                    'seller': '/dashboard/seller.html',
                    'delivery-partner': '/dashboard/delivery-partner.html',
                    'delivery-man': '/dashboard/delivery-man.html',
                    'technical-supporter': '/dashboard/technical.html'
                };

                const redirectPath = redirectPaths[user.role] || '/dashboard/consumer.html';
                const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
                window.location.href = appUrl + redirectPath;
            }, 1000);

        } else {
            // Log failed login
            Logger.warn('Login failed', { email, error: result?.error });
            showNotification(result?.error || 'Invalid email or password', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }

    } catch (error) {
        Logger.error('Login error', error, { email });
        showNotification('An error occurred. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function initSocialLogin() {
    // Google login
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                Logger.info('Google login initiated');
                const user = await SocialAuth.signInWithGoogle();

                if (user) {
                    Auth.setCurrentUser(user);
                    Logger.info('Google login successful', { userId: user.id });

                    // Send notification
                    const deviceInfo = getDeviceInfo();
                    await EmailService.notifyLogin(user.email, deviceInfo, await getIPAddress());

                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
                        window.location.href = appUrl + '/dashboard/consumer.html';
                    }, 1000);
                }
            } catch (error) {
                Logger.error('Google login failed', error);
                showNotification('Google login failed', 'error');
            }
        });
    }

    // Facebook login
    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                Logger.info('Facebook login initiated');
                const user = await SocialAuth.signInWithFacebook();

                if (user) {
                    Auth.setCurrentUser(user);
                    Logger.info('Facebook login successful', { userId: user.id });

                    const deviceInfo = getDeviceInfo();
                    await EmailService.notifyLogin(user.email, deviceInfo, await getIPAddress());

                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
                        window.location.href = appUrl + '/dashboard/consumer.html';
                    }, 1000);
                }
            } catch (error) {
                Logger.error('Facebook login failed', error);
                showNotification('Facebook login failed', 'error');
            }
        });
    }
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
        device: /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop',
        browser: getBrowserName(),
        os: getOSName(),
        location: 'Unknown' // Can be enhanced with geolocation API
    };
}

function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function getOSName() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
}
