// Consumer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard
    initDashboard();

    // Load user data
    loadUserData();

    // Load orders
    loadOrders();

    // Load recommendations
    loadRecommendations();

    // Load subscriptions
    loadSubscriptions();

    // Initialize event listeners
    initEventListeners();

    // Update dashboard date
    updateDashboardDate();
});

function initDashboard() {
    // Check for authorization
    if (!window.Auth || !window.Auth.requireRole('consumer')) return;

    const user = window.Auth.getCurrentUser();

    // Set user data
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('greeting').textContent = getGreeting() + ', ' + user.name.split(' ')[0] + '!';

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
    document.getElementById('dashboard-date').textContent = now.toLocaleDateString('en-US', options);
}

function loadUserData() {
    // Load user stats from localStorage or calculate from orders
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || [];
    const currentMonth = new Date().getMonth();

    const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth;
    });

    document.getElementById('total-orders').textContent = monthlyOrders.length;

    // Calculate calories saved (mock calculation)
    const caloriesSaved = monthlyOrders.length * 650; // Average calories saved per meal
    document.getElementById('calories-saved').textContent = caloriesSaved.toLocaleString();

    // Calculate healthy days streak
    const streak = calculateHealthyDaysStreak();
    document.getElementById('healthy-days').textContent = streak;

    // Calculate active deliveries
    const activeDeliveries = orders.filter(order =>
        order.status === 'preparing' || order.status === 'shipping'
    ).length;
    document.getElementById('active-deliveries').textContent = activeDeliveries;
}

function calculateHealthyDaysStreak() {
    return Math.floor(Math.random() * 30) + 1;
}

async function loadOrders() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    // Show loading
    tableBody.innerHTML = `<tr><td colspan="6">
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading orders...</div>
        </div>
    </td></tr>`;

    try {
        // Wait for dependencies
        let attempts = 0;
        while ((!window.API || !window.Common) && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const orders = await window.API.getUserOrders();

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>${order.id || order.orderId}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td>
                    ${(order.items || []).map(item => `${item.quantity}× ${item.name}`).join(', ')}
                </td>
                <td><strong>LKR ${(order.total || 0).toFixed(2)}</strong></td>
                <td>
                    <span class="order-status ${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="viewOrder('${order.id || order.orderId}')" title="View Order">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="reorder('${order.id || order.orderId}')" title="Reorder">
                            <i class="fas fa-redo"></i>
                        </button>
                        ${order.status === 'delivered' ? `
                        <button class="btn-icon" onclick="rateOrder('${order.id || order.orderId}')" title="Rate Order">
                            <i class="fas fa-star"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = '<tr><td colspan="6" class="error-text text-center">Failed to load orders.</td></tr>';
    }
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

async function loadRecommendations() {
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    // Show loading
    window.Common.showLoading(container, 'Loading recommendations...');

    try {
        // Wait for API
        let attempts = 0;
        while (!window.API && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const products = await window.API.getProducts();
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
                        <span class="recommendation-price">LKR ${product.price.toFixed(2)}</span>
                        <span class="recommendation-calories">${product.calories} cal</span>
                    </div>
                    <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load recommendations.</p>';
    }
}

async function loadSubscriptions() {
    const container = document.getElementById('subscriptions-container');
    if (!container) return;

    // Show loading
    window.Common.showLoading(container, 'Loading your subscriptions...');

    try {
        // Wait for API
        let attempts = 0;
        while (!window.API && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const subscriptions = await window.API.getSubscriptions();

        if (subscriptions.length === 0) {
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
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Section navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            loadSection(sectionId);
        });
    });

    // Initialize progress circles
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

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCounts = document.querySelectorAll('.cart-count-sidebar');
    cartCounts.forEach(count => {
        count.textContent = totalItems;
        count.style.display = totalItems === 0 ? 'none' : 'flex';
    });
}

function addToCart(productId) {
    // This function can be imported or used from window.Common if available
    showNotification('Product added to cart!', 'success');
}

function trackOrder(orderId) {
    window.location.href = `/pages/delivery-tracking.html?order=${orderId}`;
}

function contactSupport() {
    window.location.href = `/pages/contact.html`;
}

async function viewOrder(orderId) {
    if (!window.API || !window.CustomModal) return;

    try {
        const order = await window.API.getOrderById(orderId);
        if (!order) return;

        const dateStr = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const itemsHtml = (order.items || []).map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.quantity}× ${item.name}</span>
                <strong>LKR ${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        `).join('');

        window.CustomModal.show({
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
                        <span>LKR ${(order.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            `,
            confirmText: 'Clone Order',
            onConfirm: () => reorder(orderId)
        });

    } catch (e) {
        console.error(e);
        window.Common.showNotification('Failed to load order details.', 'error');
    }
}

function reorder(orderId) {
    if (!window.CustomModal) {
        window.Common.showNotification('Order added to cart!', 'success');
        return;
    }

    window.CustomModal.confirm(
        'Reorder Items',
        `Do you want to add all items from order #${orderId} back to your cart?`,
        () => {
            window.Common.showNotification('Order items added to cart!', 'success');
        },
        'info'
    );
}

function rateOrder(orderId) {
    showNotification(`Opening rating form for order ${orderId}...`, 'info');
}

function logout() {
    if (!window.CustomModal) {
        // Fallback if plugin fails
        if (confirm('Are you sure you want to logout?')) {
            performLogout();
        }
        return;
    }

    window.CustomModal.confirm(
        'Logout Confirmation',
        'Are you sure you want to log out of your HealthyBite account?',
        () => performLogout(),
        'warning'
    );
}

function performLogout() {
    localStorage.removeItem('healthybite-user');
    window.Common.showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1500);
}

function showNotification(message, type = 'info') {
    if (window.Common && window.Common.showNotification) {
        window.Common.showNotification(message, type);
    } else {
        alert(message);
    }
}