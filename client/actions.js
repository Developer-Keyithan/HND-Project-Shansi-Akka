// Common User Actions for HealthyBite (not shared)
import { Toast } from "./plugins/Toast/toast.js";
import { API } from "./shared/api.js";
import { Auth } from "./shared/auth.js";
import { AppConfig } from "./app.config.js";

// Add Product to Cart
export async function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    let product;

    try {
        product = await API.getProductById(productId);
    } catch (e) {
        console.error("Add to cart error:", e);
    }

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    // Check if product is already in cart
    const existingItem = cart.find(item => item.id == productId || item._id == productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('healthybite-cart', JSON.stringify(cart));

    // Sync with DB if logged in
    const user = API.getCurrentUser();
    if (user && user.id) {
        try {
            await API.updateCart(user.id, cart);
        } catch (e) {
            console.warn("Failed to sync cart with database", e);
        }
    }

    // Update cart count
    updateCartCount();

    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

// Update Cart Count
export function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    const currentCart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    const totalItems = currentCart.reduce((total, item) => total + item.quantity, 0);

    cartCount.textContent = totalItems;

    if (totalItems === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
}

// Show Notification
export function showNotification(message, type = 'info') {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    Toast({
        icon: type,
        title: capitalizedType,
        message: message
    });
}

// Check Page Access
export function checkPageAccess(requiredRole) {
    if (!Auth.isAuthenticated()) {
        const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
        window.location.href = appUrl + '/auth/login.html';
        return false;
    }

    if (requiredRole && !Auth.hasRole(requiredRole)) {
        // Special logic for hierarchy
        const user = API.getCurrentUser();

        // Administrator (Super Admin) implies Admin
        if (requiredRole === 'admin' && user.role === 'administrator') return true;

        // Technical Supporter implies full access
        if (user.role === 'technical-supporter') return true;

        const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
        window.location.href = appUrl + '/pages/errors/403.html';
        return false;
    }

    return true;
}

// Show Popover (Re-exporting for convenience if needed, though Import is better)
// Using dynamic import or assuming Popover is globally available or imported where needed.
// Since user asked for commonly used functions, let's keep it simple.

export const Actions = {
    addToCart,
    updateCartCount,
    showNotification,
    checkPageAccess
};
