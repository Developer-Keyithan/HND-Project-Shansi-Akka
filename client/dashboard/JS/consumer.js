// Consumer Dashboard JavaScript
import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { showLoading, formatDate, formatCurrency } from "../../shared/common.js";
import { Popover } from "../../plugins/Modal/modal.js";
import { addToCart, showNotification, updateCartCount } from "../../actions.js";

document.addEventListener('DOMContentLoaded', function () {
    // Check for authorization
    if (!Auth.requireRole('consumer')) return;

    // Initialize dashboard
    initDashboard();
    loadUserData();
    loadOrders();
    loadRecommendations();
    loadSubscriptions();
    initEventListeners();
    updateDashboardDate();
});

function initDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Set user data
    if (document.getElementById('user-name')) document.getElementById('user-name').textContent = user.name;
    if (document.getElementById('user-role')) document.getElementById('user-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (document.getElementById('greeting')) document.getElementById('greeting').textContent = getGreeting() + ', ' + user.name.split(' ')[0] + '!';

    // Update cart count
    updateCartCount();
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
}

function updateDashboardDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);
}

function loadUserData() {
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || [];
    const currentMonth = new Date().getMonth();

    const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth;
    });

    if (document.getElementById('total-orders')) document.getElementById('total-orders').textContent = monthlyOrders.length;

    // Calculate calories saved (mock calculation)
    const caloriesSaved = monthlyOrders.length * 650;
    if (document.getElementById('calories-saved')) document.getElementById('calories-saved').textContent = caloriesSaved.toLocaleString();

    // Calculate healthy days streak
    const streak = Math.floor(Math.random() * 30) + 1;
    if (document.getElementById('healthy-days')) document.getElementById('healthy-days').textContent = streak;

    // Calculate active deliveries
    const activeDeliveries = orders.filter(order =>
        order.status === 'preparing' || order.status === 'shipping'
    ).length;
    if (document.getElementById('active-deliveries')) document.getElementById('active-deliveries').textContent = activeDeliveries;
}

async function loadOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    // Show loading
    tableBody.innerHTML = `<tr><td colspan="6">
        <div class="loading-container" style="text-align: center; padding: 20px;">
            <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-green); border-radius: 50%; width: 30px; height: 30px; animation: spin 2s linear infinite; margin: 0 auto 10px;"></div>
            <div class="loading-text">Loading orders...</div>
        </div>
    </td></tr>`;

    try {
        const orders = await API.getUserOrders();

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px;">No orders found.</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.id || order.orderId}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td>
                    ${(order.items || []).map(item => `${item.quantity}× ${item.name}`).join(', ')}
                </td>
                <td><strong>${formatCurrency(order.total || 0)}</strong></td>
                <td>
                    <span class="order-status ${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon view-btn" data-id="${order.id || order.orderId}" title="View Order">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon reorder-btn" data-id="${order.id || order.orderId}" title="Reorder">
                            <i class="fas fa-redo"></i>
                        </button>
                        ${order.status === 'delivered' ? `
                        <button class="btn-icon rate-btn" data-id="${order.id || order.orderId}" title="Rate Order">
                            <i class="fas fa-star"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        tableBody.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => viewOrder(btn.getAttribute('data-id')));
        });
        tableBody.querySelectorAll('.reorder-btn').forEach(btn => {
            btn.addEventListener('click', () => reorder(btn.getAttribute('data-id')));
        });
        tableBody.querySelectorAll('.rate-btn').forEach(btn => {
            btn.addEventListener('click', () => rateOrder(btn.getAttribute('data-id')));
        });
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-text text-center" style="padding: 20px;">Failed to load orders.</td></tr>';
    }
}



async function loadRecommendations() {
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    showLoading(container, 'Loading recommendations...');

    try {
        const products = await API.getProducts();
        const recommendations = products.slice(0, 4);

        container.innerHTML = recommendations.map(product => `
            <div class="recommendation-card">
                <div class="recommendation-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="recommendation-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="recommendation-meta">
                        <span class="recommendation-price">${formatCurrency(product.price)}</span>
                        <span class="recommendation-calories">${product.calories} cal</span>
                    </div>
                    <button class="btn btn-primary btn-block add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => addToCart(parseInt(btn.getAttribute('data-id'))));
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load recommendations.</p>';
    }
}

async function loadSubscriptions() {
    const container = document.getElementById('subscriptions-container');
    if (!container) return;

    showLoading(container, 'Loading your subscriptions...');

    try {
        const subscriptions = await API.getSubscriptions();

        if (!subscriptions || subscriptions.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 20px; color: #888;">You have no active subscriptions.</p>';
            return;
        }

        container.innerHTML = subscriptions.map(sub => `
            <div class="subscription-card" style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 50px; height: 50px; background: #e8f5e9; color: var(--primary-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #333;">${sub.name}</h4>
                        <p style="margin: 5px 0 0; color: #666; font-size: 0.9rem;">Next delivery: ${sub.nextDelivery}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--primary-green); font-size: 1.1rem;">LKR ${sub.price}</div>
                    <span style="display: inline-block; padding: 2px 10px; background: #e8f5e9; color: #2e7d32; border-radius: 20px; font-size: 0.7rem; font-weight: 700; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Active</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load subscriptions.</p>';
    }
}

function initEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            loadSection(sectionId);
        });
    });

    initProgressCircles();
}

function loadSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    const section = document.getElementById(sectionId + '-section');
    if (section) {
        section.classList.add('active');
    }

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function initProgressCircles() {
    document.querySelectorAll('.progress-circle').forEach(circle => {
        const progress = circle.getAttribute('data-progress');
        const radius = 35;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        const progressBar = circle.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
            progressBar.style.strokeDashoffset = offset;
        }
    });
}



async function viewOrder(orderId) {
    try {
        const order = await API.getOrderById(orderId);
        if (!order) return;

        const dateStr = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const itemsHtml = (order.items || []).map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.quantity}× ${item.name}</span>
                <strong>${formatCurrency(item.price * item.quantity)}</strong>
            </div>
        `).join('');

        Popover.content({
            title: `Order #${orderId}`,
            content: `
                <div style="text-align: left; font-family: 'Poppins', sans-serif;">
                    <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid var(--primary-green);">
                        <p style="margin: 0; color: #666;">Placed on ${dateStr}</p>
                        <p style="margin: 5px 0; font-weight: 600;">Status: <span class="order-status ${order.status}">${order.status.toUpperCase()}</span></p>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 10px; color: #333;">Order Items</h4>
                        ${itemsHtml}
                    </div>
                    <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: var(--primary-green);">
                        <span>Total Amount</span>
                        <span>${formatCurrency(order.total || 0)}</span>
                    </div>
                </div>
            `,
            confirm: {
                text: 'Close'
            }
        });

    } catch (e) {
        console.error(e);
        showNotification('Failed to load order details.', 'error');
    }
}

function reorder(orderId) {
    Popover.confirm({
        title: 'Reorder Items',
        message: `Do you want to add all items from order #${orderId} back to your cart?`,
        confirm: {
            text: 'Reorder',
            onClick: () => showNotification('Order items added to cart!', 'success')
        }
    });
}

function rateOrder(orderId) {
    showNotification(`Opening rating form for order ${orderId}...`, 'info');
}

function logout() {
    Popover.confirm({
        title: 'Logout Confirmation',
        message: 'Are you sure you want to log out of your HealthyBite account?',
        confirm: {
            text: 'Logout',
            onClick: () => performLogout()
        },
        type: 'warning'
    });
}

function performLogout() {
    Auth.logoutUser();
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1500);
}