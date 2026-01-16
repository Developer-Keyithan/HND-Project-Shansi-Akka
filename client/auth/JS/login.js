// Login Page JavaScript with EmailJS, Social Auth, and Logging
import { Auth } from "../../shared/auth.js";
import { SocialAuth } from "../../shared/socialauth.js";
import { EmailServiceImpl } from "../../shared/emailjs.js";
import { Logger } from "../../shared/logger.js";
import { AppConfig } from "../../app.config.js";
import { Utils } from "../../shared/utils.js";
import { showNotification } from "../../actions.js";

const EmailService = EmailServiceImpl; // Alias

document.addEventListener('DOMContentLoaded', function () {
    // --- Method 1: Official Google Render Button (Robust but Fixed Design) ---
    /*
    // Initialize Social Auth immediately
    // We call renderGoogleButton directly. It has internal logic to wait/init.
    const googleBtnContainer = document.querySelector('.btn-google');
    if (googleBtnContainer) {
        // Clear for cleaner render
        googleBtnContainer.innerHTML = '';
        googleBtnContainer.style.padding = '0';
        googleBtnContainer.style.border = 'none';

        // Use a unique ID for the button
        googleBtnContainer.id = 'google-btn-official-container';

        SocialAuth.renderGoogleButton('google-btn-official-container');
    }

    // Global handler for Google Button Callback
    window.handleGoogleLoginResponse = async (response) => {
        console.log('Google login response:', response);
        try {
            const result = await API.googleLogin(response.credential);
            if (result && result.success) {
                const user = result.user;
                Auth.setCurrentUser(user, result.token); // Assuming token is what we got
                
                // Notification
                const deviceInfo = getDeviceInfo();
                const ip = await getIPAddress();
                // Send mail silently
                EmailService.notifyLogin(user.email, deviceInfo, ip).catch(console.warn);

                showNotification('Login successful!', 'success');
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
                showNotification('Google login failed: ' + (result.error || 'Unknown'), 'error');
            }
        } catch (error) {
            console.error('Google login error', error);
            showNotification('Google login error', 'error');
        }
    };
    */

    // --- Method 2: Custom Google Button (Better Design, uses Popup) ---
    // Initialize Social Auth for One Tap / Popup
    SocialAuth.init();

    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async function () {
            try {
                // Prevent multiple clicks
                if (this.disabled) return;
                this.disabled = true;

                showNotification('Connecting to Google...', 'info');
                const result = await SocialAuth.signInWithGoogle();

                if (result && result.success) {
                    const user = result.user;
                    Auth.setCurrentUser(user, result.token);

                    // Notification
                    const deviceInfo = getDeviceInfo();
                    // Send mail silently
                    try {
                        const ip = await getIPAddress();
                        EmailService.notifyLogin(user.email, deviceInfo, ip).catch(console.warn);
                    } catch (e) { }

                    showNotification('Login successful!', 'success');
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
                }
            } catch (error) {
                console.error('Google login failed', error);
                showNotification('Google login failed: ' + (error.message || 'Unknown error'), 'error');
            } finally {
                if (googleBtn) googleBtn.disabled = false;
            }
        });
    }

    // Check for existing session
    // Check for existing session
    const currentUser = API.getCurrentUser();
    if (currentUser) {
        const redirectPaths = {
            'admin': '/dashboard/admin.html',
            'administrator': '/dashboard/admin.html',
            'seller': '/dashboard/seller.html',
            'delivery-partner': '/dashboard/delivery-partner.html',
            'delivery-man': '/dashboard/delivery-man.html',
            'technical-supporter': '/dashboard/technical.html'
        };
        const redirectPath = redirectPaths[currentUser.role] || '/dashboard/consumer.html';
        const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
        window.location.href = appUrl + redirectPath;
        return;
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
        const deviceInfo = getDeviceInfo();
        const ipAddress = await getIPAddress();

        // Attempt login via API
        const result = await Auth.loginUser(email, password);

        if (result && result.success) {

            // --- Verification Check ---
            if (result.verificationRequired) {
                showNotification('Verification code sent to your email.', 'info');
                setTimeout(() => {
                    const appUrl = (AppConfig.app?.url || '').replace(/\/$/, ''); // Ensure no trailing slash
                    // Redirect to verification page with mode=login
                    window.location.href = `${appUrl}/auth/verification.html?email=${encodeURIComponent(result.email)}&mode=login&new=true`;
                    // Note: Check if path logic is correct relative to deployment
                }, 1000);
                return;
            }

            const user = result.user;

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
    // Google login - Handled by renderGoogleButton above
    // const googleBtn = document.querySelector('.btn-google');
    // if (googleBtn) {
    //     googleBtn.addEventListener('click', async () => { ... });
    // }

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
