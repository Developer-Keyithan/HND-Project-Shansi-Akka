import { Toast } from "../../plugins/Toast/toast.js";
import { Auth } from "../../shared/auth.js";
import { AppConfig } from "../../app.config.js";
import { showNotification } from "../../actions.js";

document.addEventListener('DOMContentLoaded', function () {
    // Check for existing session
    const userStr = localStorage.getItem('healthybite-user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
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
            localStorage.removeItem('healthybite-user');
        }
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthLevel = document.getElementById('strength-level');
    const passwordMatchIndicator = document.getElementById('password-match-indicator');

    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function () {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Password strength checker
    if (passwordInput) {
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
        });
    }

    // Password match checker
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            const password = passwordInput.value;
            const confirmPassword = this.value;

            if (confirmPassword.length === 0) {
                resetPasswordMatch();
            } else if (password === confirmPassword) {
                passwordMatchIndicator.textContent = '✓ Passwords match';
                passwordMatchIndicator.className = 'password-match match';
            } else {
                passwordMatchIndicator.textContent = '✗ Passwords do not match';
                passwordMatchIndicator.className = 'password-match no-match';
            }
        });
    }

    // Reset password strength indicator
    function resetPasswordStrength() {
        if (!strengthBar) return;
        strengthBar.className = 'strength-bar';
        strengthBar.style.width = '0%';
        strengthLevel.textContent = 'Weak';
        strengthLevel.style.color = '#666';
    }

    // Reset password match indicator
    function resetPasswordMatch() {
        if (!passwordMatchIndicator) return;
        passwordMatchIndicator.textContent = '';
        passwordMatchIndicator.className = 'password-match';
    }

    // Helper functions for error handling
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const formGroup = input ? input.closest('.form-group') : null;

        if (!formGroup && inputId === 'acceptTerms') {
            const checkbox = document.getElementById(inputId);
            if (checkbox && checkbox.closest('label')) {
                checkbox.closest('label').classList.add('error');
            }
            return;
        }

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
        document.querySelectorAll('label.checkbox.error').forEach(l => l.classList.remove('error'));
    }

    // Form validation and submission
    const registerForm = document.getElementById('registerForm');
    const submitBtn = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

    if (!registerForm || !submitBtn) return;

    // Initial disable
    submitBtn.disabled = true;

    function validateForm() {
        const fullName = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const acceptTerms = document.getElementById('acceptTerms')?.checked;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let isValid = true;
        if (!fullName || fullName.length < 2) isValid = false;
        if (!email || !emailRegex.test(email)) isValid = false;
        if (!phone) isValid = false;
        if (password.length < 8) isValid = false;
        if (password !== confirmPassword) isValid = false;
        if (!acceptTerms) isValid = false;

        submitBtn.disabled = !isValid;
        return isValid;
    }

    // Real-time validation listeners
    const inputs = [
        document.getElementById('fullname'),
        document.getElementById('email'),
        document.getElementById('phone'),
        passwordInput,
        confirmPasswordInput,
        document.getElementById('acceptTerms')
    ];

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', validateForm);
            input.addEventListener('change', validateForm); // For checkbox
        }
    });

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Prevent resubmit
        if (submitBtn.disabled) return;

        clearErrors();

        if (!validateForm()) return; // Double check

        // Disable during submission
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        const fullName = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;

        try {
            const result = await Auth.registerUser({
                name: fullName,
                email: email,
                phone: phone,
                password: password
            });

            if (result.success) {
                showNotification('Account created successfully! Welcome to healthybite.', 'success');
                setTimeout(() => {
                    const appUrl = (AppConfig.app?.url || '').replace(/\/$/, '');
                    window.location.href = appUrl + '/dashboard/consumer.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                // Re-enable on error
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                // Re-validate to ensure button state aligns with form state
                validateForm();
            }
        } catch (err) {
            console.error(err);
            showNotification("An error occurred during registration.", 'error');
            // Re-enable on error
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            validateForm();
        }
    });

    // Google sign-in check
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            showNotification('Google sign-in would be implemented here.', 'info');
        });
    }
});
