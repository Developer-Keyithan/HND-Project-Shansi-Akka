document.addEventListener('DOMContentLoaded', function () {
    initDashboard();
    initEventListeners();
});

function initDashboard() {
    // Auth Check
    if (!window.Auth || !window.Auth.requireRole('seller')) return;

    const user = window.Auth.getCurrentUser();
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('dashboard-date').textContent = new Date().toDateString();

    loadProducts();
}

function loadProducts() {
    const products = window.products || [];
    document.getElementById('total-products').textContent = products.length;

    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
            <td>${p.name}</td>
            <td>LKR ${p.price}</td>
            <td>${p.category}</td>
            <td><span class="user-status active">Active</span></td>
            <td>
                <button class="btn-icon"><i class="fas fa-edit"></i></button>
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
}

// Global scope
window.loadSection = loadSection;
