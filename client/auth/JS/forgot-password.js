import { Toast } from "../../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', function () {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

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

    const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
    const emailInput = document.getElementById('email');

    function showNotification(message, type = 'info') {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        Toast({
            icon: type,
            title: capitalizedType,
            message: message
        });
    }

    // Helper to show errors
    function showError(inputId, message) {
        // Also show toast for better visibility
        showNotification(message, 'error');

        const input = document.getElementById(inputId);
        const formGroup = input ? input.closest('.form-group') : null;

        if (formGroup) {
            formGroup.classList.add('error');
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) existingError.remove();

            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.textContent = message;
            formGroup.appendChild(errorSpan);
        }
    }

    function clearErrors() {
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const msg = group.querySelector('.error-message');
            if (msg) msg.remove();
        });
    }

    forgotPasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();

        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            return;
        }

        // Disable button during processing
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            if (!window.Auth) throw new Error("Auth module missing");

            // Call the forgotPassword function from auth.js
            const result = await window.Auth.forgotPassword(email);

            if (result.success) {
                // Show success message and hide form or redirect
                showNotification('Reset link sent!', 'success');
                forgotPasswordForm.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 20px;"></i>
                        <h3 style="margin-bottom: 10px; color: var(--dark-green);">Reset Link Sent!</h3>
                        <p style="color: var(--text-light); margin-bottom: 20px;">${result.message}</p>
                        <a href="login.html" class="btn btn-primary btn-block">Back to Login</a>
                    </div>
                `;
            } else {
                showError('email', result.error || 'Failed to send reset link.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error(error);
            showError('email', 'An unexpected error occurred. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Real-time validation clearance
    emailInput.addEventListener('input', function () {
        if (this.closest('.form-group').classList.contains('error')) {
            this.closest('.form-group').classList.remove('error');
            const msg = this.closest('.form-group').querySelector('.error-message');
            if (msg) msg.remove();
        }
    });
});
