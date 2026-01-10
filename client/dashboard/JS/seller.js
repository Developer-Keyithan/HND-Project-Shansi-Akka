import { Auth } from "../../shared/auth.js";
import { products as productsData } from "../../shared/data.js";

document.addEventListener('DOMContentLoaded', function () {
    // Auth Check
    if (!Auth.requireRole('seller')) return;

    initDashboard();
    initEventListeners();
});

function initDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    if (document.getElementById('user-name')) document.getElementById('user-name').textContent = user.name;
    if (document.getElementById('dashboard-date')) document.getElementById('dashboard-date').textContent = new Date().toDateString();

    loadProducts();
}

function loadProducts() {
    const products = productsData || [];
    if (document.getElementById('total-products')) document.getElementById('total-products').textContent = products.length;

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

window.loadSection = loadSection;
