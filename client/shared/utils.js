// Utility Functions for HealthyBite Platform


// Debounce function
export function debounce(func, wait) {
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
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Sri Lankan format)
export function validatePhone(phone) {
    const re = /^(?:\+94|0)?[0-9]{9}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}


// Calculate cart total
export function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Calculate cart item count
export function calculateCartItemCount(cart) {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Generate order ID
export function generateOrderId() {
    return 'HB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Combined export object
export const Utils = {
    debounce,
    validateEmail,
    validatePhone,
    calculateCartTotal,
    calculateCartItemCount,
    generateOrderId
};
