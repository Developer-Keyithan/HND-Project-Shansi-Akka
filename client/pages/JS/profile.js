// Profile Page JavaScript
import { Auth } from "../../shared/auth.js";
import { showLoading, formatDate } from "../../shared/common.js";
import { API } from "../../shared/api.js";
import { AppConfig } from "../../app.config.js";
import { Navbar } from "../../components/navbar/navbar-functions.js";
import { showNotification, updateCartCount } from "../../actions.js";

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    if (!Auth.requireAuth()) {
        return;
    }

    loadProfile();
    initEventListeners();
    updateCartCount();
});

function initEventListeners() {
    // Profile navigation
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
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
}

function loadProfile() {
    const currentUser = Auth.getCurrentUser();

    if (!currentUser) {
        const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
        window.location.href = appUrl + '/auth/login.html';
        return;
    }

    // Update profile display
    if (document.getElementById('profile-name')) document.getElementById('profile-name').textContent = currentUser.name || 'User';
    if (document.getElementById('profile-email')) document.getElementById('profile-email').textContent = currentUser.email || '';

    // Fill form
    if (document.getElementById('profile-name-input')) document.getElementById('profile-name-input').value = currentUser.name || '';
    if (document.getElementById('profile-email-input')) document.getElementById('profile-email-input').value = currentUser.email || '';
    if (document.getElementById('profile-phone-input')) document.getElementById('profile-phone-input').value = currentUser.phone || '';
    if (document.getElementById('profile-address-input')) document.getElementById('profile-address-input').value = currentUser.address || '';

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

    const currentUser = Auth.getCurrentUser();
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
        Auth.setCurrentUser(updatedUser);

        showNotification('Profile updated successfully!', 'success');
        loadProfile();
        Navbar.updateUserMenu();
    } catch (error) {
        showNotification('Failed to update profile', 'error');
    }
}

async function loadOrders() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    const ordersContainer = document.getElementById('orders-list');
    if (!ordersContainer) return;

    showLoading(ordersContainer, 'Loading orders...');

    try {
        const orders = await API.getUserOrders(currentUser.email);
        renderOrders(orders);
    } catch (error) {
        console.error('Failed to load orders:', error);
        ordersContainer.innerHTML = '<p class="error-text">Failed to load orders. Please try again.</p>';
    }
}

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-list');
    if (!ordersContainer) return;

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
                    <p class="order-date">${formatDate(order.date || order.createdAt) || 'N/A'}</p>
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

async function loadDietPlans() {
    const plansContainer = document.getElementById('diet-plans-list');
    if (!plansContainer) return;

    showLoading(plansContainer, 'Loading plans...');

    try {
        const plans = await API.getDietPlans();
        renderDietPlans(plans);
    } catch (err) {
        console.error(err);
        plansContainer.innerHTML = 'Failed to load plans.';
    }
}

function renderDietPlans(plans) {
    const plansContainer = document.getElementById('diet-plans-list');
    if (!plansContainer) return;

    if (!plans || plans.length === 0) {
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

