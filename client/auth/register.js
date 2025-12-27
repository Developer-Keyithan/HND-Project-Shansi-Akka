// Register Page JavaScript with EmailJS and Logging
import { Toast } from "../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', function() {
    initServices();
    
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Password match indicator
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            checkPasswordMatch(passwordInput.value, this.value);
        });
    }
    
    // Form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleRegistration();
        });
    }
    
    // Social registration
    initSocialRegistration();
});

function initServices() {
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

async function handleRegistration() {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    const userData = {
        name: formData.get('name') || document.getElementById('name')?.value,
        email: formData.get('email') || document.getElementById('email')?.value,
        password: formData.get('password') || document.getElementById('password')?.value,
        confirmPassword: formData.get('confirmPassword') || document.getElementById('confirmPassword')?.value,
        phone: formData.get('phone') || document.getElementById('phone')?.value,
        address: formData.get('address') || document.getElementById('address')?.value,
        role: formData.get('role') || 'consumer'
    };
    
    // Validation
    if (!userData.name || !userData.email || !userData.password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!window.Utils?.validateEmail(userData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (userData.password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#registerForm .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;
    
    try {
        window.Logger?.info('Registration attempt', { email: userData.email });
        
        const result = await window.Auth?.registerUser(userData);
        
        if (result && result.success) {
            const user = result.user;
            
            window.Auth?.setCurrentUser(user);
            
            // Send welcome email
            try {
                await window.EmailService?.sendEmail('welcome', {
                    to_email: user.email,
                    user_name: user.name,
                    welcome_message: 'Welcome to HealthyBite!'
                });
            } catch (emailError) {
                console.warn('Failed to send welcome email:', emailError);
            }
            
            window.Logger?.info('Registration successful', { userId: user.id, email: user.email });
            
            showNotification('Registration successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '/dashboard/consumer.html';
            }, 1500);
            
        } else {
            window.Logger?.warn('Registration failed', { email: userData.email, error: result?.error });
            showNotification(result?.error || 'Registration failed', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        window.Logger?.error('Registration error', error, { email: userData.email });
        showNotification('An error occurred. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthLevel = document.getElementById('strength-level');
    
    if (!strengthBar || !strengthLevel) return;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];
    
    strengthLevel.textContent = levels[strength - 1] || 'Very Weak';
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = colors[strength - 1] || colors[0];
}

function checkPasswordMatch(password, confirmPassword) {
    const matchIndicator = document.getElementById('password-match-indicator');
    if (!matchIndicator) return;
    
    if (confirmPassword === '') {
        matchIndicator.textContent = '';
        return;
    }
    
    if (password === confirmPassword) {
        matchIndicator.textContent = '✓ Passwords match';
        matchIndicator.style.color = '#4caf50';
    } else {
        matchIndicator.textContent = '✗ Passwords do not match';
        matchIndicator.style.color = '#f44336';
    }
}

function initSocialRegistration() {
    // Similar to login social auth
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const user = await window.SocialAuth?.signInWithGoogle();
                if (user) {
                    window.Auth?.setCurrentUser(user);
                    showNotification('Registration successful!', 'success');
                    setTimeout(() => {
                        window.location.href = '/dashboard/consumer.html';
                    }, 1500);
                }
            } catch (error) {
                showNotification('Google registration failed', 'error');
            }
        });
    }
}

function showNotification(message, type = 'info') {
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}


