import { Popover } from "../../plugins/Modal/modal.js";
import { AppConfig } from "../../app.config.js";
import { Auth } from "../../shared/auth.js";
import { products } from "../../shared/data.js";
import { showNotification, updateCartCount } from "../../actions.js";

let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let deliveryFee = AppConfig.deliveryFee || 200;
let taxRate = AppConfig.tax || 0.05;

document.addEventListener('DOMContentLoaded', function () {
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
    Popover.content({
        title: 'Delivery Information',
        content: `
            <div style="font-family: 'Poppins', sans-serif;">
                <div style="background: var(--white); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <p style="margin: 0; color: var(--primary-green); font-weight: 600;"><i class="fas fa-truck"></i> Flat Rate Delivery</p>
                    <p style="margin: 5px 0 0; font-size: 0.9rem;">We charge a flat fee of <strong>LKR ${deliveryFee.toFixed(2)}</strong> for all orders within Colombo.</p>
                </div>
                <h4 style="margin-bottom: 10px; color: var(--primary-green);">Estimated Delivery Times</h4>
                <ul style="padding-left: 20px; color: var(--text-dark); font-size: 0.95rem;">
                    <li style="margin-bottom: 8px;"><strong>Standard:</strong> 30 - 45 minutes</li>
                    <li style="margin-bottom: 8px;"><strong>Peak Hours:</strong> 50 - 70 minutes</li>
                    <li><strong>Pre-orders:</strong> At your selected time slot</li>
                </ul>
                <div style="margin-top: 20px; padding: 10px; border-left: 3px solid var(--primary-green); background: var(--white);">
                    <p style="margin: 0; font-style: italic; font-size: 0.85rem;">"We ensure your meals remain at the perfect temperature during transit using insulated thermal bags."</p>
                </div>
            </div>
        `,
        confirm: { text: 'Got it!' }
    });
}

function initEventListeners() {
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItemsContainer) return;

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

    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id) || item;
        const itemTotal = (product.price || item.price) * item.quantity;

        return `
        <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="../${product.image || item.image}" alt="${product.name || item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-details">
                        <h3>${product.name || item.name}</h3>
                        <p class="cart-item-price">LKR ${(product.price || item.price).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-btn" data-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-total">
                            <span>LKR ${itemTotal.toFixed(2)}</span>
                        </div>
                        <button class="cart-item-remove remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    cartItemsContainer.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', () => increaseQuantity(parseInt(btn.getAttribute('data-id'))));
    });
    cartItemsContainer.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', () => decreaseQuantity(parseInt(btn.getAttribute('data-id'))));
    });
    cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.getAttribute('data-id'))));
    });

    if (checkoutBtn) checkoutBtn.disabled = false;
    updateSummary();
}

function updateSummary() {
    const subtotal = cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    if (document.getElementById('cart-subtotal')) document.getElementById('cart-subtotal').textContent = `LKR ${subtotal.toFixed(2)}`;
    if (document.getElementById('cart-tax')) document.getElementById('cart-tax').textContent = `LKR ${tax.toFixed(2)}`;
    if (document.getElementById('cart-total')) document.getElementById('cart-total').textContent = `LKR ${total.toFixed(2)}`;
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
    const currentUser = Auth.getCurrentUser();

    if (!currentUser) {
        showNotification('Please login to proceed to checkout', 'error');
        setTimeout(() => {
            const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
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
    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + '/pages/payment.html';
}
