import { Toast } from "../../plugins/Toast/toast.js";
import { Auth } from "../../shared/auth.js";
import { AppConfig } from "../../app.config.js";
import { showNotification } from "../../actions.js";

document.addEventListener('DOMContentLoaded', function () {
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Check for existing session
    // Check for existing session
    const currentUser = Auth.getCurrentUser();
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

    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordMatchIndicator = document.getElementById('password-match-indicator');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthLevel = document.getElementById('strength-level');

    // Toggle Password Visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });

    // Helper to get URL query params
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const token = getQueryParam('token');

    if (!token) {
        // No token, redirect or show error
        document.querySelector('.auth-card').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc3545; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">Invalid Link</h3>
                <p style="color: #666; margin-bottom: 20px;">This password reset link is invalid or expired.</p>
                <a href="forgot-password.html" class="btn btn-primary">Request New Link</a>
            </div>
        `;
        return;
    }

    // Password Strength Checker
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        let strength = 0;

        // Criteria checks
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Update strength indicator
        if (password.length === 0) {
            resetPasswordStrength();
        } else if (strength <= 1) {
            strengthBar.className = 'strength-bar weak';
            strengthLevel.textContent = 'Weak';
            strengthLevel.style.color = '#dc3545';
        } else if (strength <= 2) {
            strengthBar.className = 'strength-bar fair';
            strengthLevel.textContent = 'Fair';
            strengthLevel.style.color = '#ffc107';
        } else {
            strengthBar.className = 'strength-bar good';
            strengthLevel.textContent = 'Good';
            strengthLevel.style.color = '#28a745';
        }

        validate();
    });

    function resetPasswordStrength() {
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
            strengthBar.style.width = '0%';
        }
        if (strengthLevel) {
            strengthLevel.textContent = 'Weak';
            strengthLevel.style.color = '#666';
        }
    }

    // Password Match Checker
    confirmPasswordInput.addEventListener('input', function () {
        if (this.value && passwordInput.value === this.value) {
            passwordMatchIndicator.textContent = '✓ Passwords match';
            passwordMatchIndicator.className = 'password-match match';
        } else if (this.value) {
            passwordMatchIndicator.textContent = '✗ Passwords do not match';
            passwordMatchIndicator.className = 'password-match no-match';
        } else {
            passwordMatchIndicator.textContent = '';
            passwordMatchIndicator.className = 'password-match';
        }
        validate();
    });

    submitBtn.disabled = true;

    function validate() {
        const p1 = passwordInput.value;
        const p2 = confirmPasswordInput.value;
        // Simple validation: length >= 8 and match
        if (p1.length >= 8 && p1 === p2) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }


    resetPasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (submitBtn.disabled) return;

        const password = passwordInput.value;
        if (password.length < 8) {
            showNotification("Password must be at least 8 characters long.", 'error');
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        submitBtn.disabled = true;

        try {
            const result = await Auth.resetPassword(token, password);

            if (result.success) {
                showNotification('Password reset successfully!', 'success');
                document.querySelector('.auth-card').innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 20px;"></i>
                        <h3 style="margin-bottom: 10px;">Password Reset!</h3>
                        <p style="color: #666; margin-bottom: 20px;">Your password has been successfully updated.</p>
                        <a href="login.html" class="btn btn-primary btn-block">Login Now</a>
                    </div>
                `;
            } else {
                showNotification(result.error || 'Failed to reset password.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error(error);
            showNotification('An unexpected error occurred.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});
