// Payment Page JavaScript with Stripe Integration
import { Popover } from "../../plugins/Modal/modal.js";
import { AppConfig, isProduction, setEnv } from "../../app.config.js";
import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { Utils } from "../../shared/utils.js";
import { Common } from "../../shared/common.js";
import { products as productsData } from "../../shared/data.js";
import { showNotification, updateCartCount } from "../../actions.js";

setEnv('production');

let stripe;
let elements;
let paymentElement;
let clientSecret;
let orderData = {};
let isMockPayment = false;
let taxRate = (AppConfig.tax || 0) / 100;
let deliveryFee = AppConfig.deliveryFee || 200;

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to continue', 'error');
        setTimeout(() => {
            const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/auth/login.html?redirect=payment.html';
        }, 1500);
        return;
    }

    // Load order data from session
    const checkoutCart = sessionStorage.getItem('checkout-cart');
    if (!checkoutCart) {
        showNotification('No items in cart', 'error');
        setTimeout(() => {
            const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/pages/cart.html';
        }, 1500);
        return;
    }

    orderData.cart = JSON.parse(checkoutCart);
    orderData.user = currentUser;

    // Initialize page
    loadOrderSummary();
    loadSavedData();
    await initializeStripe();
    initEventListeners();
    updateCartCount();
    Common.selectDropdowns();
});

// Saved Data Management
function loadSavedData() {
    if (!orderData.user) return;

    // Load Addresses
    const saveAddrBtn = document.getElementById('save-address-btn');
    const addrContainer = document.getElementById('saved-addresses-container');

    if (orderData.user.savedAddresses && orderData.user.savedAddresses.length > 0) {
        if (addrContainer) addrContainer.classList.remove('hidden');
        renderSavedAddresses(orderData.user.savedAddresses);
        if (saveAddrBtn) {
            const wrapper = saveAddrBtn.closest('.checkbox-group');
            if (wrapper) wrapper.style.display = 'none';
        }
    } else {
        if (addrContainer) addrContainer.classList.add('hidden');
        if (saveAddrBtn) {
            const wrapper = saveAddrBtn.closest('.checkbox-group');
            if (wrapper) wrapper.style.display = 'flex';
        }
    }

    // Load Cards
    const saveCardBtn = document.getElementById('save-card-btn');
    const cardContainer = document.getElementById('saved-cards-container');

    if (orderData.user.savedCards && orderData.user.savedCards.length > 0) {
        if (cardContainer) cardContainer.classList.remove('hidden');
        renderSavedCards(orderData.user.savedCards);
        if (saveCardBtn) {
            const wrapper = saveCardBtn.closest('.checkbox-group');
            if (wrapper) wrapper.style.display = 'none';
        }
    } else {
        if (cardContainer) cardContainer.classList.add('hidden');
        if (saveCardBtn) {
            const wrapper = saveCardBtn.closest('.checkbox-group');
            if (wrapper) wrapper.style.display = 'flex';
        }
    }
}

function renderSavedAddresses(addresses) {
    const list = document.getElementById('saved-addresses-list');
    if (!list) return;

    list.innerHTML = addresses.map(addr => `
        <div class="saved-item" onclick="selectAddress('${addr.id}')" id="addr-${addr.id}">
            <div class="saved-item-info">
                <div class="saved-icon"><i class="fas fa-${getIconForType(addr.type)}"></i></div>
                <div class="saved-details">
                    <h4>${addr.type}</h4>
                    <p>${addr.address}</p>
                </div>
            </div>
            <div class="saved-actions">
                <button class="btn-icon-small delete" onclick="deleteAddress('${addr.id}', event)"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function getIconForType(type) {
    if (!type) return 'map-marker-alt';
    const t = type.toLowerCase();
    if (t === 'home') return 'home';
    if (t === 'office') return 'briefcase';
    return 'map-marker-alt';
}

function renderSavedCards(cards) {
    const list = document.getElementById('saved-cards-list');
    if (!list) return;

    list.innerHTML = cards.map(card => `
        <div class="saved-item" onclick="selectCard('${card.id}')" id="card-${card.id}">
            <div class="saved-item-info">
                <div class="saved-icon"><i class="fab fa-cc-${card.brand ? card.brand.toLowerCase() : 'visa'}"></i></div>
                <div class="saved-details">
                    <h4>${card.brand || 'Card'} ending in ${card.last4}</h4>
                    <p>Expires ${card.exp_month}/${card.exp_year}</p>
                </div>
            </div>
            <div class="saved-actions">
                <button class="btn-icon-small delete" onclick="deleteCard('${card.id}', event)"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Global functions for inline handlers
window.selectAddress = function (id) {
    const addr = orderData.user.savedAddresses.find(a => a.id === id);
    if (!addr) return;

    document.querySelectorAll('.saved-item').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`addr-${id}`);
    if (el) el.classList.add('selected');

    // Auto-fill form
    const nameInput = document.getElementById('delivery-name');
    const phoneInput = document.getElementById('delivery-phone');
    const addressInput = document.getElementById('delivery-address');
    const typeSelect = document.getElementById('address-type');

    if (nameInput) nameInput.value = addr.name || orderData.user.name;
    if (phoneInput) phoneInput.value = addr.phone || orderData.user.phone;
    if (addressInput) addressInput.value = addr.address;
    if (typeSelect && addr.type) typeSelect.value = addr.type;

    // Trigger validation
    const deliveryForm = document.getElementById('delivery-form');
    if (deliveryForm) {
        const inputs = deliveryForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.dispatchEvent(new Event('input')));
    }
};

window.deleteAddress = function (id, event) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this address?')) return;

    orderData.user.savedAddresses = orderData.user.savedAddresses.filter(a => a.id !== id);
    Auth.setCurrentUser(orderData.user); // Persist
    loadSavedData();
    // Hide container if empty
    if (orderData.user.savedAddresses.length === 0) {
        document.getElementById('saved-addresses-container').classList.add('hidden');
    }
};

window.selectCard = function (id) {
    const card = orderData.user.savedCards.find(c => c.id === id);
    if (!card) return;

    document.querySelectorAll('.saved-item').forEach(el => el.classList.remove('selected'));
    const el = document.getElementById(`card-${id}`);
    if (el) el.classList.add('selected');

    // For Mock: Fill inputs
    if (isMockPayment || isProduction()) {
        const cardInput = document.getElementById('card-number');
        const expiryInput = document.getElementById('card-expiry');
        const cvcInput = document.getElementById('card-cvc');

        if (cardInput) {
            cardInput.value = `**** **** **** ${card.last4}`; // Or fill full mock data if we had it, but we only store last4 safe. 
            // Actually for mock functionality we might want to allow re-submission without re-typing 
            // but here let's just indicate selection.
            // Simulating "full" fill for demo if we had safe mock data
            if (card.last4 === '4242') cardInput.value = '4242 4242 4242 4242';
        }
        if (expiryInput) expiryInput.value = `${card.exp_month}/${card.exp_year}`;
        if (cvcInput) cvcInput.value = '123';

        // Trigger validation
        if (window.initValidation) {
            // We need to re-trigger validation logic. 
            // dispatch input events
            [cardInput, expiryInput, cvcInput].forEach(inp => {
                if (inp) inp.dispatchEvent(new Event('input'));
            });
        }
    } else {
        // Real Stripe: We would set a hidden field with payment_method_id
        // For now, visual selection only
        console.log('Selected card for next payment:', id);
    }
};

window.deleteCard = function (id, event) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this card?')) return;

    orderData.user.savedCards = orderData.user.savedCards.filter(c => c.id !== id);
    Auth.setCurrentUser(orderData.user); // Persist
    loadSavedData();
    if (orderData.user.savedCards.length === 0) {
        document.getElementById('saved-cards-container').classList.add('hidden');
    }
};

async function handlePayment(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    const errorsDiv = document.getElementById('payment-error');

    const deliveryForm = document.getElementById('delivery-form');
    if (deliveryForm && !deliveryForm.checkValidity()) {
        deliveryForm.reportValidity();
        return;
    }

    const deliveryInfo = {
        name: document.getElementById('delivery-name')?.value,
        phone: document.getElementById('delivery-phone')?.value,
        address: document.getElementById('delivery-address')?.value,
        notes: document.getElementById('delivery-notes')?.value
    };

    // Save Address Logic
    const saveAddressInput = document.getElementById('save-address');
    if (saveAddressInput && saveAddressInput.value === 'true') {
        if (!orderData.user.savedAddresses) orderData.user.savedAddresses = [];

        // Simple duplicate check based on address string
        const exists = orderData.user.savedAddresses.some(a => a.address === deliveryInfo.address);
        if (!exists) {
            const type = document.getElementById('address-type')?.value || 'Other';
            orderData.user.savedAddresses.push({
                id: 'addr_' + Date.now(),
                type: type,
                name: deliveryInfo.name,
                phone: deliveryInfo.phone,
                address: deliveryInfo.address
            });
            Auth.setCurrentUser(orderData.user);
        }
    }

    if (submitBtn) submitBtn.disabled = true;
    if (buttonText) buttonText.textContent = 'Processing...';
    if (spinner) spinner.classList.remove('hidden');
    if (errorsDiv) errorsDiv.textContent = '';

    try {
        let paymentSuccess = false;

        // Mock Payment / Dev Mode Card Saving
        if (isMockPayment) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            paymentSuccess = true;

            // Save Card Mock Logic
            const saveCardInput = document.getElementById('save-card');
            if (saveCardInput && saveCardInput.value === 'true') {
                if (!orderData.user.savedCards) orderData.user.savedCards = [];

                // Get mock card details
                const numInput = document.getElementById('card-number');
                const expInput = document.getElementById('card-expiry');
                const last4 = numInput ? numInput.value.slice(-4) : '4242';
                const [exp_month, exp_year] = expInput ? expInput.value.split('/') : ['12', '30'];

                // Avoid storing duplicate last4 for demo
                const cardExists = orderData.user.savedCards.some(c => c.last4 === last4);
                if (!cardExists) {
                    orderData.user.savedCards.push({
                        id: 'card_' + Date.now(),
                        brand: 'Visa', // Mock
                        last4: last4,
                        exp_month: exp_month,
                        exp_year: exp_year
                    });
                    Auth.setCurrentUser(orderData.user);
                }
            }
        } else {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/payment-success.html`,
                },
                redirect: 'if_required'
            });

            if (error) throw error;
            if (paymentIntent.status === 'succeeded') paymentSuccess = true;

            // Real Stripe Card Saving would happen here via setup_future_usage: 'off_session' in payment intent creation
            // Since we don't control the CreateIntent call fully here (it's in initial load), we assume backend handles it.
            // But for this client-side demo, we can't easily "save" the real card details safely.
        }

        if (paymentSuccess) {
            // ... (rest of success logic)
            const orderId = Utils.generateOrderId();
            const totalText = document.getElementById('order-total')?.textContent || '0';
            const total = parseFloat(totalText.replace('LKR ', '').replace(',', '')) || 0;

            const orderDataToSave = {
                orderId,
                userId: orderData.user.id,
                items: orderData.cart.map(item => {
                    const product = productsData.find(p => p.id === item.id) || item;
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

            const existingOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
            existingOrders.push(orderDataToSave);
            localStorage.setItem('healthybite-orders', JSON.stringify(existingOrders));

            // Send Bill via EmailJS
            if (Auth.sendEmail) {
                const itemsList = orderDataToSave.items.map(item =>
                    `${item.name} x${item.quantity} - LKR ${item.price * item.quantity}`
                ).join('\n');

                await Auth.sendEmail('template_bill', {
                    to_name: orderData.user.name,
                    to_email: orderData.user.email,
                    order_id: orderId,
                    total_amount: `LKR ${total.toFixed(2)}`,
                    items_list: itemsList,
                    delivery_address: deliveryInfo.address
                });
            }

            localStorage.removeItem('healthybite-cart');
            sessionStorage.removeItem('checkout-cart');

            showNotification('Payment successful! Order placed.', 'success');
            setTimeout(() => {
                const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
                window.location.href = appUrl + `/pages/payment-success.html?orderId=${orderId}`;
            }, 1500);
        }

    } catch (error) {
        console.error('Payment error:', error);
        if (errorsDiv) errorsDiv.textContent = error.message || 'Payment failed. Please try again.';
        showNotification(error.message || 'Payment failed', 'error');

        if (buttonText) buttonText.textContent = 'Pay Now';
        if (spinner) spinner.classList.add('hidden');
    }
}


function initValidation() {
    const cardInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('card-expiry');
    const cvcInput = document.getElementById('card-cvc');
    const submitBtn = document.getElementById('submit-payment');
    const deliveryForm = document.getElementById('delivery-form');
    const deliveryInputs = deliveryForm ? deliveryForm.querySelectorAll('input, textarea') : [];

    if (!cardInput || !expiryInput || !cvcInput) return;

    // Helper to validate form and toggle button
    const validateForm = () => {
        // Card: 16 digits
        const cardVal = cardInput.value.replace(/\s+/g, '');
        const isCardValid = /^\d{16}$/.test(cardVal);

        // Expiry: MM/YY
        const expiryVal = expiryInput.value;
        let isExpiryValid = false;
        if (/^\d{2}\/\d{2}$/.test(expiryVal)) {
            const [month, year] = expiryVal.split('/').map(num => parseInt(num, 10));
            if (month >= 1 && month <= 12) {
                isExpiryValid = true;
            }
        }

        // CVC: 3 digits
        const cvcVal = cvcInput.value;
        const isCvcValid = /^\d{3}$/.test(cvcVal);

        // Delivery Form Validation
        const isDeliveryValid = deliveryForm ? deliveryForm.checkValidity() : true;

        if (isCardValid && isExpiryValid && isCvcValid && isDeliveryValid) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        } else {
            if (submitBtn) submitBtn.disabled = true;
        }
    };

    // Card Input
    cardInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const parts = [];
        for (let i = 0; i < value.length; i += 4) {
            parts.push(value.substring(i, i + 4));
        }
        e.target.value = parts.join(' ');
        validateForm();
    });

    // Expiry Input
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
        validateForm();
    });

    // CVC Input
    cvcInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
        validateForm();
    });

    // Delivery Inputs
    deliveryInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Initial check
    validateForm();
}


function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;

    const subtotal = orderData.cart.reduce((total, item) => {
        const product = productsData.find(p => p.id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    // Update order items
    orderItemsContainer.innerHTML = orderData.cart.map(item => {
        const product = productsData.find(p => p.id === item.id) || item;
        const itemTotal = (product.price || item.price) * item.quantity;

        return `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="../${product.image.startsWith('.') ? product.image : '../' + product.image}" alt="${product.name || item.name}">
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


async function initializeStripe() {
    try {
        // Calculate total
        const subtotal = orderData.cart.reduce((total, item) => {
            const product = productsData.find(p => p.id === item.id) || item;
            return total + (product.price || item.price) * item.quantity;
        }, 0);

        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax;

        // Create payment intent
        const data = await API.createPaymentIntent(total, 'lkr', orderData.cart);

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

        // Real Stripe Initialization
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

        if (typeof Stripe !== 'undefined') {
            stripe = Stripe(stripePublishableKey);
            elements = stripe.elements({ clientSecret });
            paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
        } else {
            console.warn('Stripe.js not loaded');
            isMockPayment = true;
            renderMockPaymentElement();
        }

    } catch (error) {
        console.error('Payment initialization error:', error);
        showNotification('Failed to initialize payment. Please try again.', 'error');
    }
}

function renderMockPaymentElement() {
    const container = document.getElementById('payment-element');
    if (container) {
        container.innerHTML = `
            <div class="card-form">
            ${isProduction() ?
                `<div class="notice">
                    <i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> No real payment will be processed.
                </div>`
                : ''}
                <div class="form-group">
                    <label>Card Number</label>
                    <div class="input-wrapper">
                        <input type="text" id="card-number" class="num-type-input" style="padding-left: 2.8rem;" placeholder="${isProduction() ? "4242 4242 4242 4242" : 'Card Number'}" ${isProduction() ? 'value="4242 4242 4242 4242"' : ''} ${isProduction() ? 'disabled' : ''} inputmode="numeric">
                        <i class="far fa-credit-card"></i>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label>Expiration</label>
                            <input type="text" id="card-expiry" class="num-type-input" placeholder="MM/YY" value="${isProduction() ? "12/30" : ''}" ${isProduction() ? 'disabled' : ''} inputmode="numeric">
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label>CVC</label>
                            <input type="text" id="card-cvc" class="num-type-input" placeholder="CVC" value="${isProduction() ? "123" : ''}" ${isProduction() ? 'disabled' : ''} inputmode="numeric">
                        </div>
                    </div>
                </div>
            </div>
        `;
        initValidation();
    }
}


function setupBtnToggles() {
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');

            // Check mark update
            const icon = btn.querySelector('i');
            if (icon) {
                if (btn.classList.contains('active')) {
                    icon.classList.remove('far', 'fa-square');
                    icon.classList.add('fas', 'fa-check-square');
                } else {
                    icon.classList.remove('fas', 'fa-check-square');
                    icon.classList.add('far', 'fa-square');
                }
            }

            // Sync hidden input if needed
            const id = btn.id.replace('-btn', '');
            const input = document.getElementById(id);
            if (input) {
                input.value = btn.classList.contains('active') ? 'true' : 'false';
            }
        });
    });
}

function initEventListeners() {
    const submitBtn = document.getElementById('submit-payment');
    if (submitBtn) {
        submitBtn.addEventListener('click', handlePayment);
    }

    const securityBtn = document.getElementById('security-info-btn');
    if (securityBtn) {
        securityBtn.addEventListener('click', showSecurityInfo);
    }

    setupBtnToggles();
}

function showSecurityInfo() {
    Popover.content({
        title: 'Payment Security',
        content: `
            <div style="font-family: 'Poppins', sans-serif;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-green);"></i>
                </div>
                <p style="color: var(--text-light); line-height: 1.6;">We take your security seriously. Your payment details are processed through <strong>Stripe</strong>, a global leader in payment processing.</p>
                <div style="background: var(--white); padding: 15px; border-radius: 12px; margin-top: 15px;">
                    <h4 style="margin: 0 0 10px; font-size: 1rem; color: var(--primary-green);"><i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Security Features:</h4>
                    <ul style="padding-left: 20px; color: var(--text-light); font-size: 0.9rem; margin: 0;">
                        <li style="margin-bottom: 5px;">256-bit SSL/TLS Encryption</li>
                        <li style="margin-bottom: 5px;">PCI DSS Level 1 Compliance</li>
                        <li style="margin-bottom: 5px;">We do not sell or share your details</li>
                        <li>Fraud detection & prevention</li>
                    </ul>
                </div>
            </div>
        `,
        confirm: { text: 'Understood' }
    });
}
