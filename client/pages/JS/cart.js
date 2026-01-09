import { Toast } from "../../plugins/Toast/toast.js";
import { Popover } from "../../plugins/Modal/modal.js";

let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let deliveryFee = 0;
let taxRate = 0;

// Helper to wait for dependencies
async function waitForDependencies() {
    return new Promise(resolve => {
        const check = () => {
            if (window.AppConfig && window.Common) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await waitForDependencies();

    // Initialize global config values
    deliveryFee = window.AppConfig.deliveryFee;
    taxRate = window.AppConfig.tax;

    loadCart();
    initEventListeners();
    updateCartCount();
    setDeliveryFee();
});

function setDeliveryFee() {
    const feeEl = document.getElementById('delivery-fee');
    if (feeEl) {
        feeEl.innerHTML = `LKR ${deliveryFee.toFixed(2)} <i class="fas fa-info-circle info-icon" id="delivery-info-btn" style="cursor: pointer; color: var(--primary-green); margin-left: 5px;"></i>`;

        const infoBtn = document.getElementById('delivery-info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', showDeliveryInfo);
        }
    }
}

function showDeliveryInfo() {
    if (!window.CustomModal) return;

    window.CustomModal.show({
        title: 'Delivery Information',
        content: `
            <div style="font-family: 'Poppins', sans-serif;">
                <div style="background: #f0f7f0; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #2e7d32; font-weight: 600;"><i class="fas fa-truck"></i> Flat Rate Delivery</p>
                    <p style="margin: 5px 0 0; font-size: 0.9rem;">We charge a flat fee of <strong>LKR 200.00</strong> for all orders within Colombo.</p>
                </div>
                <h4 style="margin-bottom: 10px; color: #333;">Estimated Delivery Times</h4>
                <ul style="padding-left: 20px; color: #666; font-size: 0.95rem;">
                    <li style="margin-bottom: 8px;"><strong>Standard:</strong> 30 - 45 minutes</li>
                    <li style="margin-bottom: 8px;"><strong>Peak Hours:</strong> 50 - 70 minutes</li>
                    <li><strong>Pre-orders:</strong> At your selected time slot</li>
                </ul>
                <div style="margin-top: 20px; padding: 10px; border-left: 3px solid var(--primary-green); background: #fafafa;">
                    <p style="margin: 0; font-style: italic; font-size: 0.85rem;">"We ensure your meals remain at the perfect temperature during transit using insulated thermal bags."</p>
                </div>
            </div>
        `,
        confirmText: 'Got it!'
    });
}

function initEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Update user menu
    updateUserMenu();
}

function updateUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    const currentUser = window.Auth?.getCurrentUser();

    if (currentUser) {
        userMenu.innerHTML = `
            <div class="user-dropdown">
                <button class="user-profile-btn">
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="../dashboard/consumer.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await window.Auth?.logoutUser();
                const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
                window.location.href = appUrl + '/index.html';
            });
        }
    }
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some healthy meals to get started!</p>
                <a href="menu.html" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateSummary();
        return;
    }

    // Load products from data or API
    const products = window.products || [];

    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id) || item;
        const itemTotal = product.price * item.quantity;

        return `
        <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                ${product.image || item.image ?
                `<i class="fas fa-image"></i>` :
                `<img src="${product.image || item.image}" alt="${product.name || item.name}">`
            } 
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-details">
                        <h3>${product.name || item.name}</h3>
                        <p class="cart-item-price">LKR ${(product.price || item.price).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="increaseQuantity(${item.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-total">
                            <span>LKR ${itemTotal.toFixed(2)}</span>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (checkoutBtn) checkoutBtn.disabled = false;
    updateSummary();
}

function updateSummary() {
    const subtotal = cart.reduce((total, item) => {
        const product = window.products?.find(p => p.id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    document.getElementById('cart-subtotal').textContent = `LKR ${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax') ? document.getElementById('cart-tax').textContent = `LKR ${tax.toFixed(2)}` : null;
    document.getElementById('cart-total').textContent = `LKR ${total.toFixed(2)}`;
}

function increaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += 1;
        localStorage.setItem('healthybite-cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
        showNotification('Item quantity updated', 'success');
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        localStorage.setItem('healthybite-cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
        showNotification('Item quantity updated', 'success');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('healthybite-cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Item removed from cart', 'success');
}

function clearCart() {
    Popover.confirm({
        title: 'Clear Cart',
        message: 'Are you sure you want to remove all items from your cart? This action cannot be undone.',
        type: 'danger',
        icon: 'fas fa-trash-alt',
        confirm: {
            text: 'Clear All',
            onClick: () => performClearCart()
        },
        cancel: {
            text: 'Keep Items'
        }
    });
}

function performClearCart() {
    cart = [];
    localStorage.setItem('healthybite-cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Cart cleared', 'success');
}

function proceedToCheckout() {
    const currentUser = window.Auth?.getCurrentUser();

    if (!currentUser) {
        showNotification('Please login to proceed to checkout', 'error');
        setTimeout(() => {
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/auth/login.html?redirect=cart.html';
        }, 1500);
        return;
    }

    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // Save cart to session for payment page
    sessionStorage.setItem('checkout-cart', JSON.stringify(cart));
    const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + '/pages/payment.html';
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}

// Make functions available globally
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;

