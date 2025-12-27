// Forgot Password Page JavaScript with EmailJS
import { Toast } from "../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', function() {
    initServices();
    
    const forgotForm = document.getElementById('forgotPasswordForm');
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleForgotPassword();
        });
    }
});

function initServices() {
    const scripts = [
        '../shared/config.js',
        '../shared/utils.js',
        '../shared/auth.js',
        '../shared/emailjs.js',
        '../shared/logger.js'
    ];
    
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        document.head.appendChild(script);
    });
}

async function handleForgotPassword() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    if (!window.Utils?.validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#forgotPasswordForm .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        window.Logger?.info('Forgot password request', { email });
        
        // Generate reset token
        const resetToken = generateResetToken();
        const resetLink = `${window.location.origin}/auth/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
        
        // Store reset token (in production, store in database)
        sessionStorage.setItem(`reset_token_${email}`, resetToken);
        
        // Send reset email
        const emailResult = await window.EmailService?.sendForgotPassword(email, resetToken, resetLink);
        
        if (emailResult && emailResult.success) {
            window.Logger?.info('Password reset email sent', { email });
            showNotification('Password reset link has been sent to your email', 'success');
            
            // Show success message
            const formContainer = document.querySelector('.auth-container');
            if (formContainer) {
                formContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h2>Check Your Email</h2>
                        <p>We've sent a password reset link to ${email}</p>
                        <p class="note">Please check your inbox and click the link to reset your password.</p>
                        <a href="/auth/login.html" class="btn btn-primary">Back to Login</a>
                    </div>
                `;
            }
        } else {
            throw new Error(emailResult?.error || 'Failed to send email');
        }
        
    } catch (error) {
        window.Logger?.error('Forgot password error', error, { email });
        showNotification('Failed to send reset email. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function generateResetToken() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}


