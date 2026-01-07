// Payment Page JavaScript with Stripe Integration
import { Toast } from "../plugins/Toast/toast.js";

let stripe;
let elements;
let paymentElement;
let clientSecret;
let orderData = {};

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    const currentUser = window.Auth?.getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to continue', 'error');
        setTimeout(() => {
            window.location.href = '../auth/login.html?redirect=payment.html';
        }, 1500);
        return;
    }

    // Load order data from session
    const checkoutCart = sessionStorage.getItem('checkout-cart');
    if (!checkoutCart) {
        showNotification('No items in cart', 'error');
        setTimeout(() => {
            window.location.href = 'cart.html';
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
        // Get Stripe publishable key from API
        // This endpoint returns the publishable key from environment variables
        let stripePublishableKey = 'pk_test_your_key_here';

        try {
            const keyResponse = await fetch('/api/config/stripe-key');
            if (keyResponse.ok) {
                const keyData = await keyResponse.json();
                if (keyData.success && keyData.publishableKey) {
                    stripePublishableKey = keyData.publishableKey;
                }
            }
        } catch (e) {
            console.warn('Could not fetch Stripe key from API:', e);
            // In development, you might want to use a test key directly
            // stripePublishableKey = 'pk_test_your_development_key';
        }

        if (!stripePublishableKey || stripePublishableKey === 'pk_test_your_key_here') {
            throw new Error('Stripe publishable key not configured. Please set STRIPE_PUBLISHABLE_KEY environment variable.');
        }

        stripe = Stripe(stripePublishableKey);

        // Calculate total
        const subtotal = orderData.cart.reduce((total, item) => {
            const product = window.products?.find(p => p.id === item.id) || item;
            return total + (product.price || item.price) * item.quantity;
        }, 0);

        const deliveryFee = 200;
        const tax = subtotal * 0.05;
        const total = subtotal + deliveryFee + tax;

        // Create payment intent
        const response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: total,
                currency: 'lkr',
                items: orderData.cart
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to initialize payment');
        }

        clientSecret = data.clientSecret;
        orderData.paymentIntentId = data.paymentIntentId;

        // Create payment element
        elements = stripe.elements({ clientSecret });
        paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');

    } catch (error) {
        console.error('Stripe initialization error:', error);
        showNotification('Failed to initialize payment. Please try again.', 'error');
    }
}

function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    const products = window.products || [];

    const subtotal = orderData.cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const deliveryFee = 200;
    const tax = subtotal * 0.05;
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
    document.getElementById('order-subtotal').textContent = `LKR ${subtotal.toFixed(2)}`;
    document.getElementById('order-tax').textContent = `LKR ${tax.toFixed(2)}`;
    document.getElementById('order-total').textContent = `LKR ${total.toFixed(2)}`;

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

    // Navigation
    initNavigation();
}

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
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
        // Confirm payment with Stripe
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
                window.location.href = `/pages/payment-success.html?orderId=${orderId}`;
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

