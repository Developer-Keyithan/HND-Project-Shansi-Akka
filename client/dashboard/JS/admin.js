document.addEventListener('DOMContentLoaded', function () {
    initDashboard();
    initEventListeners();
});

function initDashboard() {
    // Auth Check
    if (!window.Auth || !window.Auth.requireRole('admin')) return;

    const user = window.Auth.getCurrentUser();
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('dashboard-date').textContent = new Date().toDateString();

    loadStats();
    loadRecentOrders();
    loadUsers();
}

function loadStats() {
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || window.orders || [];
    const users = window.users || [];

    // Calculate Revenue
    const revenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-revenue').textContent = `LKR ${revenue.toLocaleString()}`;
    document.getElementById('total-orders-count').textContent = orders.length;
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('healthybite-orders')) || window.orders || [];
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
    const users = window.users || [];
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
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.Auth.logoutUser();
    });
}

function loadSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    const sec = document.getElementById(`${sectionId}-section`);
    if (sec) sec.classList.add('active');

    // Highlight nav (simple approximation)
    // In real app use specific ID selectors for links
}

// Global scope for onclick
window.loadSection = loadSection;
