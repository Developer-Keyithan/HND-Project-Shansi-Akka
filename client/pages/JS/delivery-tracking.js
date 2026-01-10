// Delivery Tracking JavaScript
import { Toast } from "../../plugins/Toast/toast.js";
import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { formatDate, showLoading } from "../../shared/common.js";
import { AppConfig } from "../../app.config.js";
import { showNotification } from "../../actions.js";
// Utils is not used directly except for formatDate which is in Common or Utils
// But we can check where formatDate is. Common usually has it.
// Checking previous common.js view, it has formatDate.

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!Auth.requireAuth()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId') || urlParams.get('order');

    if (!orderId) {
        showNotification('Order ID not found', 'error');
        setTimeout(() => {
            const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
            window.location.href = appUrl + '/dashboard/consumer.html';
        }, 1500);
        return;
    }

    loadOrderTracking(orderId);
    initEventListeners();
});

async function loadOrderTracking(orderId) {
    const container = document.querySelector('.tracking-container');

    try {
        if (container) showLoading(container, 'Fetching real-time tracking data...');

        const order = await API.getOrderById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        if (container) container.innerHTML = ''; // Clear loading
        renderOrderInfo(order);
        renderTimeline(order);
        renderDeliveryPartner();
        renderOrderItems(order);

    } catch (error) {
        console.error('Tracking Error:', error);
        document.querySelector('.tracking-container').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Order Not Found</h3>
                <p>We couldn't find the order details for ID: <strong>${orderId}</strong></p>
                <a href="/dashboard/consumer.html" class="btn btn-primary">Go to Dashboard</a>
            </div>
        `;
    }
}

function renderOrderInfo(order) {
    document.getElementById('order-id-display').textContent = order.orderId || order.id;
    document.getElementById('order-date-display').textContent = formatDate(order.date || order.createdAt) || 'Just now';

    // Calculate estimated delivery (e.g., +45 mins from order time)
    const orderTime = new Date(order.date || Date.now());
    const deliveryTime = new Date(orderTime.getTime() + 45 * 60000);
    const timeString = deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('estimated-delivery').textContent = `Today, ${timeString}`;
}

function renderTimeline(order) {
    // Mock Logic for Demo:
    // If order is < 5 mins old: Order Placed
    // < 15 mins: Preparing
    // < 40 mins: On the Way
    // > 40 mins: Delivered

    const orderTime = new Date(order.date || Date.now());
    const now = new Date();
    const diffMins = (now - orderTime) / 60000;

    let currentStep = 1;
    if (diffMins > 2) currentStep = 2; // Confirmed
    if (diffMins > 5) currentStep = 3; // Preparing
    if (diffMins > 15) currentStep = 4; // On the Way
    if (diffMins > 45 || order.status === 'delivered') currentStep = 5; // Delivered

    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Update status text
    const statusTextMap = {
        1: 'Order Placed',
        2: 'Order Confirmed',
        3: 'Preparing your food',
        4: 'Rider is on the way',
        5: 'Delivered'
    };
    document.getElementById('current-status-text').textContent = statusTextMap[currentStep];
}

function renderDeliveryPartner() {
    // Mock Data
    const partner = {
        name: "Kamal Perera",
        vehicle: "Honda Activa (WP BCL-1234)",
        rating: 4.8,
        image: "https://randomuser.me/api/portraits/men/32.jpg"
    };

    const container = document.getElementById('delivery-partner-card');
    if (container) {
        container.innerHTML = `
            <div class="partner-info">
                <img src="${partner.image}" alt="${partner.name}" class="partner-avatar">
                <div>
                    <h4>${partner.name}</h4>
                    <p>${partner.vehicle}</p>
                    <div class="partner-rating">
                        <i class="fas fa-star"></i> ${partner.rating}
                    </div>
                </div>
            </div>
            <div class="partner-actions">
                <a href="tel:+94771234567" class="btn-icon"><i class="fas fa-phone-alt"></i></a>
                <button class="btn-icon"><i class="fas fa-comment-alt"></i></button>
            </div>
        `;
    }
}

function renderOrderItems(order) {
    const list = document.getElementById('tracking-items-list');
    if (!list) return;

    if (!order.items || order.items.length === 0) {
        list.innerHTML = '<p>No items info available.</p>';
        return;
    }

    list.innerHTML = order.items.map(item => `
        <div class="tracking-item">
            <span class="item-qty">${item.quantity}x</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">LKR ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    document.getElementById('tracking-total').textContent = `LKR ${order.total.toFixed(2)}`;
}

function initEventListeners() {
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
