import { Auth } from "../../shared/auth.js";
import { users as usersData, orders as ordersData } from "../../shared/data.js";

document.addEventListener('DOMContentLoaded', function () {
    // Auth Check
    if (!Auth.requireRole('admin')) return;

    initDashboard();
    initEventListeners();
});

function initDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    if (document.getElementById('user-name')) document.getElementById('user-name').textContent = user.name;
    if (document.getElementById('dashboard-date')) document.getElementById('dashboard-date').textContent = new Date().toDateString();

    loadStats();
    loadRecentOrders();
    loadUsers();
}

function loadStats() {
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || ordersData;
    const users = usersData;

    // Calculate Revenue
    const revenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

    if (document.getElementById('total-users')) document.getElementById('total-users').textContent = users.length;
    if (document.getElementById('total-revenue')) document.getElementById('total-revenue').textContent = `LKR ${revenue.toLocaleString()}`;
    if (document.getElementById('total-orders-count')) document.getElementById('total-orders-count').textContent = orders.length;
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || ordersData;
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;

    tbody.innerHTML = orders.slice(0, 5).map(order => `
        <tr>
            <td>${order.id || order.orderId}</td>
            <td>${order.userId || 'Guest'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>LKR ${(order.total || 0).toFixed(2)}</td>
            <td><span class="order-status ${order.status}">${order.status}</span></td>
            <td><button class="btn-icon"><i class="fas fa-eye"></i></button></td>
        </tr>
    `).join('');
}

function loadUsers() {
    const users = usersData;
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" title="Delete" style="color:red;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function initEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logoutUser();
        });
    }

    // Sidebar Navigation
    document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            loadSection(sectionId);

            // Highlight active link
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

export function loadSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    const sec = document.getElementById(`${sectionId}-section`);
    if (sec) sec.classList.add('active');
}

// Keep it for legacy onclick if needed, but try to move to listeners
window.loadSection = loadSection;
