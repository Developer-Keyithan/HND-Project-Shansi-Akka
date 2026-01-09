// Login Page JavaScript with EmailJS, Social Auth, and Logging
import { Toast } from "../../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', function () {
    // Check for existing session
    const userStr = localStorage.getItem('healthybite-user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const redirectPaths = {
                'admin': '/dashboard/admin.html',
                'seller': '/dashboard/seller.html',
                'delivery-partner': '/dashboard/delivery-partner.html',
                'delivery-man': '/dashboard/delivery-man.html'
            };
            const redirectPath = redirectPaths[user.role] || '/dashboard/consumer.html';
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + redirectPath;
            return;
        } catch (e) {
            localStorage.removeItem('healthybite-user');
        }
    }

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Initialize services
    initServices();

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

            if (!window.Utils?.validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            await handleLogin(email, password, rememberMe);
        });
    }

    // Social login buttons
    initSocialLogin();
});

function initServices() {
    // Load required scripts
    const scripts = [
        '../shared/config.js',
        '../shared/utils.js',
        '../shared/auth.js',
        '../shared/emailjs.js',
        '../shared/socialauth.js',
        '../shared/logger.js'
    ];

    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        document.head.appendChild(script);
    });
}

async function handleLogin(email, password, rememberMe) {
    const submitBtn = document.querySelector('#loginForm .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
        // Log login attempt
        window.Logger?.info('Login attempt', { email });

        // Get device info
        const deviceInfo = getDeviceInfo();
        const ipAddress = await getIPAddress();

        // Attempt login via API
        const result = await window.Auth?.loginUser(email, password);

        if (result && result.success) {
            const user = result.user;

            // Store user session
            window.Auth?.setCurrentUser({
                ...user,
                rememberMe,
                loginTime: new Date().toISOString()
            });

            // Send login notification email
            try {
                await window.EmailService?.notifyLogin(user.email, deviceInfo, ipAddress);
            } catch (emailError) {
                console.warn('Failed to send login email:', emailError);
            }

            // Log successful login
            window.Logger?.info('Login successful', {
                email: user.email,
                userId: user.id,
                role: user.role
            });

            showNotification('Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                const redirectPaths = {
                    'admin': '/dashboard/admin.html',
                    'seller': '/dashboard/seller.html',
                    'delivery-partner': '/dashboard/delivery-partner.html',
                    'delivery-man': '/dashboard/delivery-man.html'
                };

                const redirectPath = redirectPaths[user.role] || '/dashboard/consumer.html';
                const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
                window.location.href = appUrl + redirectPath;
            }, 1500);

        } else {
            // Log failed login
            window.Logger?.warn('Login failed', { email, error: result?.error });
            showNotification(result?.error || 'Invalid email or password', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }

    } catch (error) {
        window.Logger?.error('Login error', error, { email });
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
                window.Logger?.info('Google login initiated');
                const user = await window.SocialAuth?.signInWithGoogle();

                if (user) {
                    window.Auth?.setCurrentUser(user);
                    window.Logger?.info('Google login successful', { userId: user.id });

                    // Send notification
                    const deviceInfo = getDeviceInfo();
                    await window.EmailService?.notifyLogin(user.email, deviceInfo, await getIPAddress());

                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
                        window.location.href = appUrl + '/dashboard/consumer.html';
                    }, 1500);
                }
            } catch (error) {
                window.Logger?.error('Google login failed', error);
                showNotification('Google login failed', 'error');
            }
        });
    }

    // Facebook login
    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                window.Logger?.info('Facebook login initiated');
                const user = await window.SocialAuth?.signInWithFacebook();

                if (user) {
                    window.Auth?.setCurrentUser(user);
                    window.Logger?.info('Facebook login successful', { userId: user.id });

                    const deviceInfo = getDeviceInfo();
                    await window.EmailService?.notifyLogin(user.email, deviceInfo, await getIPAddress());

                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
                        window.location.href = appUrl + '/dashboard/consumer.html';
                    }, 1500);
                }
            } catch (error) {
                window.Logger?.error('Facebook login failed', error);
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

function showNotification(message, type = 'info') {
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}
