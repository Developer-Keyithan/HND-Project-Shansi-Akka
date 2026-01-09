// Payment Page JavaScript with Stripe Integration
import { Toast } from "../../plugins/Toast/toast.js";

let stripe;
let elements;
let paymentElement;
let clientSecret;
let orderData = {};
let isMockPayment = false;
let taxRate = 0;
let deliveryFee = 0;

// Helper to wait for dependencies
async function waitForDependencies() {
    return new Promise(resolve => {
        const check = () => {
            if (window.Auth && window.AppConfig && window.Common) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

// Helper to wait for Auth to be loaded by load-scripts.js
async function waitForAuth() {
    return new Promise(resolve => {
        if (window.Auth) return resolve();
        const interval = setInterval(() => {
            if (window.Auth) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await waitForDependencies();

    // Initialize global config values
    taxRate = (window.AppConfig.tax || 0) / 100;
    deliveryFee = window.AppConfig.deliveryFee || 0;

    // Check authentication
    const currentUser = window.Auth?.getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to continue', 'error');
        setTimeout(() => {
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/auth/login.html?redirect=payment.html';
        }, 1500);
        return;
    }

    // Load order data from session
    const checkoutCart = sessionStorage.getItem('checkout-cart');
    if (!checkoutCart) {
        showNotification('No items in cart', 'error');
        setTimeout(() => {
            const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/pages/cart.html';
        }, 1500);
        return;
    }

    orderData.cart = JSON.parse(checkoutCart);
    orderData.user = currentUser;

    // Initialize page
    loadOrderSummary();
    await initializeStripe();
    initEventListeners();
    updateCartCount();
});

async function initializeStripe() {
    try {
        // Calculate total
        const subtotal = orderData.cart.reduce((total, item) => {
            const product = window.products?.find(p => p.id === item.id) || item;
            return total + (product.price || item.price) * item.quantity;
        }, 0);

        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax;

        // Create payment intent (Mock or Real)
        let data;
        if (window.API && window.API.createPaymentIntent) {
            data = await window.API.createPaymentIntent(total, 'lkr', orderData.cart);
        } else {
            // Fallback if API not updated yet (should not happen with correct load order)
            data = { success: true, clientSecret: 'mock_secret_fallback', paymentIntentId: 'pi_mock_fallback' };
        }

        if (!data.success) {
            throw new Error(data.error || 'Failed to initialize payment');
        }

        clientSecret = data.clientSecret;
        orderData.paymentIntentId = data.paymentIntentId;

        // Check if Mock Payment
        if (clientSecret.startsWith('mock_')) {
            isMockPayment = true;
            renderMockPaymentElement();
            return;
        }

        // Real Stripe Initialization (Requires Real Backend for Client Secret)
        // Get Stripe publishable key
        let stripePublishableKey = 'pk_test_51SiVxnJ7t3J5nMf6S27rcXJrY0T0mkR93ct5KNbmP9X1o12tgCRvAn6x910ONCHd605coYiWczJJu2VwxU7KKODP00rwN2gjel';
        try {
            const keyResponse = await fetch('/api/config/stripe-key');
            if (keyResponse.ok) {
                const keyData = await keyResponse.json();
                if (keyData.success && keyData.publishableKey) {
                    stripePublishableKey = keyData.publishableKey;
                }
            }
        } catch (e) { /* Ignore */ }

        stripe = Stripe(stripePublishableKey);
        elements = stripe.elements({ clientSecret });
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

    } catch (error) {
        console.error('Payment initialization error:', error);
        showNotification('Failed to initialize payment. Please try again.', 'error');
    }
}

function renderMockPaymentElement() {
    const container = document.getElementById('payment-element');
    container.innerHTML = `
        <div class="mock-card-form">
            <div class="mock-notice">
                <i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> No real payment will be processed.
            </div>
            <div class="mock-form-group">
                <label>Card Number</label>
                <div class="mock-input-wrapper">
                    <input type="text" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" disabled>
                    <i class="far fa-credit-card"></i>
                </div>
            </div>
            <div class="mock-row">
                <div class="mock-col">
                    <div class="mock-form-group">
                        <label>Expiration</label>
                        <input type="text" value="12/30" disabled>
                    </div>
                </div>
                <div class="mock-col">
                    <div class="mock-form-group">
                        <label>CVC</label>
                        <input type="text" value="123" disabled>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    const products = window.products || [];

    const subtotal = orderData.cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const deliveryFee = 200;
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    // Update order items
    orderItemsContainer.innerHTML = orderData.cart.map(item => {
        const product = products.find(p => p.id === item.id) || item;
        const itemTotal = (product.price || item.price) * item.quantity;

        return `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${product.image || item.image}" alt="${product.name || item.name}">
                </div>
                <div class="order-item-details">
                    <h4>${product.name || item.name}</h4>
                    <span class="order-item-quantity">Qty: ${item.quantity}</span>
                </div>
                <div class="order-item-price">
                    LKR ${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');

    // Update totals
    const subtotalEl = document.getElementById('order-subtotal');
    const taxEl = document.getElementById('order-tax');
    const totalEl = document.getElementById('order-total');

    if (subtotalEl) subtotalEl.textContent = `LKR ${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `LKR ${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `LKR ${total.toFixed(2)}`;

    // Pre-fill delivery form with user data
    if (orderData.user) {
        const nameInput = document.getElementById('delivery-name');
        const phoneInput = document.getElementById('delivery-phone');
        const addressInput = document.getElementById('delivery-address');

        if (nameInput) nameInput.value = orderData.user.name || '';
        if (phoneInput) phoneInput.value = orderData.user.phone || '';
        if (addressInput) addressInput.value = orderData.user.address || '';
    }
}

function initEventListeners() {
    // Submit payment button
    const submitBtn = document.getElementById('submit-payment');
    if (submitBtn) {
        submitBtn.addEventListener('click', handlePayment);
    }

    // Security info button
    const securityBtn = document.getElementById('security-info-btn');
    if (securityBtn) {
        securityBtn.addEventListener('click', showSecurityInfo);
    }
}

function showSecurityInfo() {
    if (!window.CustomModal) return;

    window.CustomModal.show({
        title: 'Payment Security',
        content: `
            <div style="font-family: 'Poppins', sans-serif;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-green); opacity: 0.8;"></i>
                </div>
                <p style="color: #444; line-height: 1.6;">We take your security seriously. Your payment details are processed through <strong>Stripe</strong>, a global leader in payment processing.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-top: 15px;">
                    <h4 style="margin: 0 0 10px; font-size: 1rem; color: #333;"><i class="fas fa-check-circle" style="color: #4caf50;"></i> Security Features:</h4>
                    <ul style="padding-left: 20px; color: #666; font-size: 0.9rem; margin: 0;">
                        <li style="margin-bottom: 5px;">256-bit SSL/TLS Encryption</li>
                        <li style="margin-bottom: 5px;">PCI DSS Level 1 Compliance</li>
                        <li style="margin-bottom: 5px;">We never store your card numbers</li>
                        <li>Fraud detection & prevention</li>
                    </ul>
                </div>
            </div>
        `,
        confirmText: 'Understood'
    });
}

async function handlePayment(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    const errorsDiv = document.getElementById('payment-errors');

    // Validate delivery form
    const deliveryForm = document.getElementById('delivery-form');
    if (!deliveryForm.checkValidity()) {
        deliveryForm.reportValidity();
        return;
    }

    // Get delivery information
    const deliveryInfo = {
        name: document.getElementById('delivery-name').value,
        phone: document.getElementById('delivery-phone').value,
        address: document.getElementById('delivery-address').value,
        notes: document.getElementById('delivery-notes').value
    };

    // Disable button and show loading
    submitBtn.disabled = true;
    buttonText.textContent = 'Processing...';
    spinner.classList.remove('hidden');
    errorsDiv.textContent = '';

    try {
        let paymentSuccess = false;

        if (isMockPayment) {
            // Simulate Payment Processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            paymentSuccess = true;
        } else {
            // Confirm payment with Stripe (Real Mode)
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/payment-success.html`,
                },
                redirect: 'if_required'
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                paymentSuccess = true;
            }
        }

        if (paymentSuccess) {
            // Mock Order Creation (Frontend Only)
            const orderId = window.Utils?.generateOrderId() || 'HB' + Date.now();
            const total = parseFloat(document.getElementById('order-total').textContent.replace('LKR ', '').replace(',', ''));

            const orderDataToSave = {
                orderId,
                userId: orderData.user.id,
                items: orderData.cart.map(item => {
                    const product = window.products?.find(p => p.id === item.id) || item;
                    return {
                        productId: item.id,
                        name: product.name || item.name,
                        price: product.price || item.price,
                        quantity: item.quantity,
                        image: product.image || item.image
                    };
                }),
                total,
                deliveryAddress: deliveryInfo.address,
                paymentStatus: 'paid',
                paymentIntentId: orderData.paymentIntentId,
                status: 'confirmed',
                date: new Date().toISOString()
            };

            // Store in local "database" (dummy data persistence)
            const existingOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
            existingOrders.push(orderDataToSave);
            localStorage.setItem('healthybite-orders', JSON.stringify(existingOrders));

            // Send Bill via EmailJS
            if (window.Auth && typeof window.Auth.sendEmail === 'function') {
                // Create bill details string
                const itemsList = orderDataToSave.items.map(item =>
                    `${item.name} x${item.quantity} - LKR ${item.price * item.quantity}`
                ).join('\n');

                await window.Auth.sendEmail('template_bill', {
                    to_name: orderData.user.name,
                    to_email: orderData.user.email,
                    order_id: orderId,
                    total_amount: `LKR ${total.toFixed(2)}`,
                    items_list: itemsList,
                    delivery_address: deliveryInfo.address
                });
            } else {
                console.warn('Auth.sendEmail not found, skipping email');
            }

            // Clear cart
            localStorage.removeItem('healthybite-cart');
            sessionStorage.removeItem('checkout-cart');

            // Show success and redirect
            showNotification('Payment successful! Order placed.', 'success');
            setTimeout(() => {
                const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
                window.location.href = appUrl + `/pages/payment-success.html?orderId=${orderId}`;
            }, 1500);
        }

    } catch (error) {
        console.error('Payment error:', error);
        errorsDiv.textContent = error.message || 'Payment failed. Please try again.';
        showNotification(error.message || 'Payment failed', 'error');

        // Re-enable button
        submitBtn.disabled = false;
        buttonText.textContent = 'Pay Now';
        spinner.classList.add('hidden');
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
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

