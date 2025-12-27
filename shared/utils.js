// Utility Functions for HealthyBite Platform

// Format price in LKR
function formatPrice(price) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-LK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Format date and time
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-LK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Sri Lankan format)
function validatePhone(phone) {
    const re = /^(?:\+94|0)?[0-9]{9}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    return result;
}

// Get URL parameter by name
function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Show loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    }
}

// Hide loading spinner
function hideLoading(element, content) {
    if (element && content) {
        element.innerHTML = content;
    }
}

// Calculate cart total
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Calculate cart item count
function calculateCartItemCount(cart) {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Generate order ID
function generateOrderId() {
    return 'HB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Export functions
window.Utils = {
    formatPrice,
    formatDate,
    formatDateTime,
    debounce,
    validateEmail,
    validatePhone,
    getUrlParams,
    getUrlParam,
    showLoading,
    hideLoading,
    calculateCartTotal,
    calculateCartItemCount,
    generateOrderId
};

