// Payment Page JavaScript with Stripe Integration
import { Popover } from "../../plugins/Modal/modal.js";
import { AppConfig, isProduction, isDev, setEnv } from "../../app.config.js";
import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { Utils } from "../../shared/utils.js";
import { Common } from "../../shared/common.js";
import { showNotification, updateCartCount } from "../../actions.js";

// setEnv('production');

let stripe;
let elements;
let paymentElement;
let clientSecret;
let orderData = {};
let isMockPayment = false;
let taxRate = (AppConfig.tax || 0) / 100;
let deliveryFee = AppConfig.deliveryFee || 200;
let productsData = [];

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to continue', 'error');
        setTimeout(() => {
            const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/auth/login.html?redirect=payment.html';
        }, 1500);
        return;
    }

    // Fetch Products and Config (fresh data)
    try {
        const [products, config] = await Promise.all([
            API.getProducts(),
            API.getConfig()
        ]);
        productsData = products || [];

        if (config) {
            taxRate = (config.tax || AppConfig.tax || 0) / 100;
            deliveryFee = config.deliveryFee || AppConfig.deliveryFee || 200;
        }
    } catch (e) {
        console.error("Failed to fetch initial data", e);
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
    if (isMockPayment || !isProduction()) {
        const cardInput = document.getElementById('card-number');
        const expiryInput = document.getElementById('card-expiry');
        const cvcInput = document.getElementById('card-cvc');

        if (cardInput) {
            // Visualize selection only, or fill if safe
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
            if (paymentIntent && paymentIntent.status === 'succeeded') paymentSuccess = true;
        }

        if (paymentSuccess) {
            const orderId = Utils.generateOrderId();
            const totalText = document.getElementById('order-total')?.textContent || '0';
            const total = parseFloat(totalText.replace('LKR ', '').replace(',', '')) || 0;

            const orderDataToSave = {
                orderId,
                userId: orderData.user.id || orderData.user._id,
                items: orderData.cart.map(item => {
                    const product = productsData.find(p => p.id === item.id || p._id === item.id) || item;
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

            // Save to Backend
            await API.createOrder(orderDataToSave);

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
    // ... (No logic changes here, keeping window.initValidation for mock)
    window.initValidation = () => {
        const cardInput = document.getElementById('card-number');
        const expiryInput = document.getElementById('card-expiry');
        const cvcInput = document.getElementById('card-cvc');
        const submitBtn = document.getElementById('submit-payment');
        const deliveryForm = document.getElementById('delivery-form');
        const deliveryInputs = deliveryForm ? deliveryForm.querySelectorAll('input, textarea') : [];

        if (!cardInput || !expiryInput || !cvcInput) return;

        const validateForm = () => {
            const cardVal = cardInput.value.replace(/\s+/g, '');
            const isCardValid = /^\d{16}$/.test(cardVal);

            const expiryVal = expiryInput.value;
            let isExpiryValid = false;
            if (/^\d{2}\/\d{2}$/.test(expiryVal)) {
                const [month, year] = expiryVal.split('/').map(num => parseInt(num, 10));
                if (month >= 1 && month <= 12) isExpiryValid = true;
            }

            const cvcVal = cvcInput.value;
            const isCvcValid = /^\d{3}$/.test(cvcVal);

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

        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            const parts = [];
            for (let i = 0; i < value.length; i += 4) parts.push(value.substring(i, i + 4));
            e.target.value = parts.join(' ');
            validateForm();
        });

        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
            e.target.value = value;
            validateForm();
        });

        cvcInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.slice(0, 3);
            e.target.value = value;
            validateForm();
        });

        deliveryInputs.forEach(input => input.addEventListener('input', validateForm));
        validateForm();
    }

    // Call it immediately
    if (window.initValidation) window.initValidation();
}


function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;

    const subtotal = orderData.cart.reduce((total, item) => {
        const product = productsData.find(p => p.id === item.id || p._id === item.id) || item;
        return total + (product.price || item.price) * item.quantity;
    }, 0);

    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    // Update order items
    orderItemsContainer.innerHTML = orderData.cart.map(item => {
        const product = productsData.find(p => p.id === item.id || p._id === item.id) || item;
        const itemTotal = (product.price || item.price) * item.quantity;
        const imgSrc = product.image || item.image || '../assets/placeholder.jpg';
        const safeImg = imgSrc.startsWith('.') ? imgSrc : '../' + imgSrc;

        return `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${safeImg}" alt="${product.name || item.name}" onerror="this.src='../assets/placeholder.jpg'">
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

    const subtotalEl = document.getElementById('order-subtotal');
    const taxEl = document.getElementById('order-tax');
    const totalEl = document.getElementById('order-total');

    if (subtotalEl) subtotalEl.textContent = `LKR ${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `LKR ${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `LKR ${total.toFixed(2)}`;

    if (orderData.user) {
        if (document.getElementById('delivery-name')) document.getElementById('delivery-name').value = orderData.user.name || '';
        if (document.getElementById('delivery-phone')) document.getElementById('delivery-phone').value = orderData.user.phone || '';
        if (document.getElementById('delivery-address')) document.getElementById('delivery-address').value = orderData.user.address || '';
    }
}


async function initializeStripe() {
    try {
        const subtotal = orderData.cart.reduce((total, item) => {
            const product = productsData.find(p => p.id === item.id || p._id === item.id) || item;
            return total + (product.price || item.price) * item.quantity;
        }, 0);

        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax;

        const data = await API.createPaymentIntent(total, 'lkr', orderData.cart); // Should pass userId if possible

        if (!data.success) throw new Error(data.error || 'Failed to initialize payment');

        clientSecret = data.clientSecret;
        orderData.paymentIntentId = data.paymentIntentId;

        if (clientSecret.startsWith('mock_')) {
            isMockPayment = true;
            renderMockPaymentElement();
            return;
        }

        let stripePublishableKey = 'pk_test_sample';
        try {
            stripePublishableKey = await API.getStripeKey();
        } catch (e) { console.error('Stripe Key Error', e); }

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
            ${!isProduction() ?
                `<div class="notice">
                    <i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> No real payment will be processed.
                </div>`
                : ''}
                <div class="form-group">
                    <label>Card Number</label>
                    <div class="input-wrapper">
                        <input type="text" id="card-number" class="num-type-input" style="padding-left: 2.8rem;" placeholder="${!isProduction() ? "4242 4242 4242 4242" : 'Card Number'}" ${!isProduction() ? 'value="4242 4242 4242 4242"' : ''} ${!isProduction() ? 'disabled' : ''} inputmode="numeric">
                        <i class="far fa-credit-card"></i>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label>Expiration</label>
                            <input type="text" id="card-expiry" class="num-type-input" placeholder="MM/YY" value="${!isProduction() ? "12/30" : ''}" ${!isProduction() ? 'disabled' : ''} inputmode="numeric">
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label>CVC</label>
                            <input type="text" id="card-cvc" class="num-type-input" placeholder="CVC" value="${!isProduction() ? "123" : ''}" ${!isProduction() ? 'disabled' : ''} inputmode="numeric">
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (window.initValidation) window.initValidation();
    }
}


function setupBtnToggles() {
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');

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
