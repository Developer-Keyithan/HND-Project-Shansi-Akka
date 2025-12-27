// Consumer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    
    // Load user data
    loadUserData();
    
    // Load orders
    loadOrders();
    
    // Load recommendations
    loadRecommendations();
    
    // Initialize event listeners
    initEventListeners();
    
    // Update dashboard date
    updateDashboardDate();
});

function initDashboard() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('helthybite-user'));
    if (!user) {
        window.location.href = '../auth/login.html';
        return;
    }
    
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
    const orders = JSON.parse(localStorage.getItem('helthybite-orders')) || [];
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
    // Mock calculation - in real app, this would come from backend
    return Math.floor(Math.random() * 30) + 1;
}

function loadOrders() {
    const orders = window.orders || [];
    const tableBody = document.getElementById('orders-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${formatDate(order.date)}</td>
            <td>
                ${order.items.map(item => `${item.quantity}× ${item.name}`).join(', ')}
            </td>
            <td><strong>$${order.total.toFixed(2)}</strong></td>
            <td>
                <span class="order-status ${order.status}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="viewOrder('${order.id}')" title="View Order">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="reorder('${order.id}')" title="Reorder">
                        <i class="fas fa-redo"></i>
                    </button>
                    ${order.status === 'delivered' ? `
                    <button class="btn-icon" onclick="rateOrder('${order.id}')" title="Rate Order">
                        <i class="fas fa-star"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function loadRecommendations() {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    // Get recommendations based on user's order history
    const recommendations = window.products.slice(0, 4); // First 4 products as recommendations
    
    container.innerHTML = recommendations.map(product => `
        <div class="recommendation-card">
            <div class="recommendation-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="recommendation-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="recommendation-meta">
                    <span class="recommendation-price">$${product.price.toFixed(2)}</span>
                    <span class="recommendation-calories">${product.calories} cal</span>
                </div>
                <button class="btn btn-primary btn-block" onclick="addToCart(${product.id})">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function initEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Section navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            loadSection(sectionId);
        });
    });
    
    // Initialize progress circles
    initProgressCircles();
}

function loadSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId + '-section');
    if (section) {
        section.classList.add('active');
    }
    
    // Update active nav link
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
    const cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count-sidebar');
    cartCounts.forEach(count => {
        count.textContent = totalItems;
        if (totalItems === 0) {
            count.style.display = 'none';
        } else {
            count.style.display = 'flex';
        }
    });
}

function addToCart(productId) {
    const product = window.products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('helthybite-cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function trackOrder(orderId) {
    showNotification(`Tracking order ${orderId}...`, 'info');
    window.location.href = `../pages/delivery-tracking.html?order=${orderId}`;
}

function contactSupport() {
    showNotification('Connecting you with support...', 'info');
    window.location.href = `../pages/contact.html`;
}

function viewOrder(orderId) {
    showNotification(`Viewing order ${orderId} details...`, 'info');
    // In a real app, this would show order details modal
}

function reorder(orderId) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found!', 'error');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
    
    order.items.forEach(item => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            });
        }
    });
    
    localStorage.setItem('helthybite-cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Order added to cart!', 'success');
}

function rateOrder(orderId) {
    showNotification(`Opening rating form for order ${orderId}...`, 'info');
    // In a real app, this would open a rating modal
}

function logout() {
    localStorage.removeItem('helthybite-user');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.5s ease forwards;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(150%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(150%);
            opacity: 0;
        }
    }
    
    .btn-icon {
        background: none;
        border: none;
        color: var(--primary-green);
        cursor: pointer;
        font-size: 1rem;
        padding: 5px;
        border-radius: 4px;
        transition: var(--transition);
    }
    
    .btn-icon:hover {
        background-color: #e8f5e9;
    }
    
    .table-actions {
        display: flex;
        gap: 5px;
    }
`;
document.head.appendChild(style);