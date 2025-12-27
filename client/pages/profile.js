// Profile Page JavaScript
import { Toast } from "../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.Auth?.requireAuth()) {
        return;
    }

    loadProfile();
    initEventListeners();
    updateCartCount();
});

function initEventListeners() {
    // Profile navigation
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }

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
                window.location.href = '../index.html';
            });
        }
    }
}

function loadProfile() {
    const currentUser = window.Auth?.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '../auth/login.html';
        return;
    }

    // Update profile display
    document.getElementById('profile-name').textContent = currentUser.name || 'User';
    document.getElementById('profile-email').textContent = currentUser.email || '';

    // Fill form
    document.getElementById('profile-name-input').value = currentUser.name || '';
    document.getElementById('profile-email-input').value = currentUser.email || '';
    document.getElementById('profile-phone-input').value = currentUser.phone || '';
    document.getElementById('profile-address-input').value = currentUser.address || '';

    // Load orders
    loadOrders();

    // Load diet plans
    loadDietPlans();
}

function showSection(sectionId) {
    // Update nav
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.profile-section-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

async function saveProfile(e) {
    e.preventDefault();

    const currentUser = window.Auth?.getCurrentUser();
    if (!currentUser) return;

    const formData = {
        name: document.getElementById('profile-name-input').value,
        email: document.getElementById('profile-email-input').value,
        phone: document.getElementById('profile-phone-input').value,
        address: document.getElementById('profile-address-input').value
    };

    try {
        // Update user in localStorage
        const updatedUser = { ...currentUser, ...formData };
        window.Auth?.setCurrentUser(updatedUser);

        // In production, make API call to update user
        // await fetch('/api/users/update', { ... });

        showNotification('Profile updated successfully!', 'success');
        loadProfile();
    } catch (error) {
        showNotification('Failed to update profile', 'error');
    }
}

async function loadOrders() {
    const currentUser = window.Auth?.getCurrentUser();
    if (!currentUser) return;

    const ordersContainer = document.getElementById('orders-list');
    
    try {
        // Try to load from API
        const response = await fetch(`/api/orders?userId=${currentUser.id}`);
        const data = await response.json();

        if (data.success && data.orders) {
            renderOrders(data.orders);
        } else {
            // Fallback to local data
            renderOrders(window.orders || []);
        }
    } catch (error) {
        // Fallback to local data
        renderOrders(window.orders || []);
    }
}

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>No orders yet</h3>
                <p>Start ordering healthy meals!</p>
                <a href="menu.html" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h3>Order #${order.orderId || order.id}</h3>
                    <p class="order-date">${window.Utils?.formatDate(order.date || order.createdAt) || 'N/A'}</p>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            <div class="order-items">
                ${(order.items || []).map(item => `
                    <div class="order-item-row">
                        <span>${item.name} x${item.quantity}</span>
                        <span>LKR ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <span>Total:</span>
                    <span>LKR ${(order.total || 0).toFixed(2)}</span>
                </div>
                <a href="delivery-tracking.html?orderId=${order.orderId || order.id}" class="btn btn-outline">Track Order</a>
            </div>
        </div>
    `).join('');
}

function loadDietPlans() {
    const plansContainer = document.getElementById('diet-plans-list');
    const plans = window.dietPlans || [];

    if (plans.length === 0) {
        plansContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>No diet plans yet</h3>
                <p>Start your healthy journey with a personalized diet plan!</p>
                <a href="diet-planning.html" class="btn btn-primary">Browse Plans</a>
            </div>
        `;
        return;
    }

    plansContainer.innerHTML = plans.map(plan => `
        <div class="diet-plan-card">
            <h3>${plan.name}</h3>
            <p>${plan.description}</p>
            <div class="plan-meta">
                <span><i class="fas fa-fire"></i> ${plan.calories} cal/day</span>
                <span><i class="fas fa-calendar"></i> ${plan.duration}</span>
            </div>
            <a href="diet-planning.html?plan=${plan.id}" class="btn btn-outline">View Plan</a>
        </div>
    `).join('');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
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

