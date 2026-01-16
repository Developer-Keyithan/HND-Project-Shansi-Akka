import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { GoogleDrive } from "../../shared/googledrive.js";
import { showNotification } from "../../actions.js";
import { users as usersData, orders as ordersData } from "../../shared/data.js";
import { products as productsData } from "../../shared/data.js";

document.addEventListener('DOMContentLoaded', function () {
    // Auth Check
    if (!Auth.requireRole('admin')) return;

    initDashboard();
    initEventListeners();
});

function initDashboard() {
    const user = API.getCurrentUser();
    if (!user) return;

    if (document.getElementById('user-name')) document.getElementById('user-name').textContent = user.name;
    if (document.getElementById('dashboard-date')) document.getElementById('dashboard-date').textContent = new Date().toDateString();

    loadStats();
    loadRecentOrders();
    loadUsers();
    loadReviews();
    loadProducts();
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

async function loadProducts() {
    let products = [];
    try {
        products = await API.getProducts();
    } catch (e) {
        products = productsData || [];
    }

    const tbody = document.getElementById('admin-products-table-body');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" alt="${p.name}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;"></td>
            <td>${p.name}</td>
            <td>LKR ${p.price}</td>
            <td>${p.category}</td>
            <td>
                <button class="btn-icon edit-product" data-id="${p.id || p._id}"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-product" data-id="${p.id || p._id}" style="color:red;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Add edit listeners
    tbody.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const product = products.find(p => (p.id || p._id) == id);
            if (product) openProductModal(product);
        });
    });

    // Add delete listeners
    tbody.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this product?')) return;
            const id = btn.dataset.id;
            try {
                await API.deleteProduct(id);
                showNotification('Product deleted', 'success');
                loadProducts();
            } catch (err) {
                showNotification('Failed to delete product', 'error');
            }
        });
    });
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

async function loadReviews() {
    const tbody = document.getElementById('reviews-table-body');
    if (!tbody) return;

    try {
        const reviews = await API.getReviews({ type: 'app' });
        tbody.innerHTML = reviews.map(r => `
            <tr>
                <td>${r.userName}</td>
                <td>${r.rating} <i class="fas fa-star" style="color:gold;"></i></td>
                <td>${r.comment}</td>
                <td>
                    <span class="status-badge ${r.isFeatured ? 'active' : 'inactive'}">
                        ${r.isFeatured ? 'Featured' : 'Not Featured'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${r.isFeatured ? 'btn-danger' : 'btn-success'} toggle-featured" 
                            data-id="${r._id || r.id}" data-featured="${r.isFeatured}">
                        ${r.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                </td>
            </tr>
        `).join('');

        // Link buttons
        tbody.querySelectorAll('.toggle-featured').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const isFeatured = btn.getAttribute('data-featured') === 'true';
                await toggleReviewFeatured(id, !isFeatured);
            });
        });
    } catch (error) {
        console.error("Failed to load reviews:", error);
    }
}

async function toggleReviewFeatured(id, featured) {
    try {
        const result = await API.toggleFeaturedReview(id, featured);
        if (result.success) {
            loadReviews(); // Refresh
        }
    } catch (error) {
        console.error("Failed to toggle review featured status:", error);
    }
}

function initEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logoutUser();
        });
    }

    // Modal Events
    const modal = document.getElementById('product-modal');
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    // Image Upload to Google Drive
    const imageInput = document.getElementById('p-image-file');
    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const preview = document.getElementById('image-preview');
            preview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Drive...';

            try {
                const result = await GoogleDrive.uploadImage(file);
                if (result.success) {
                    document.getElementById('p-image-url').value = result.webViewLink;
                    preview.innerHTML = `<img src="${result.thumbnailLink || result.webViewLink}" style="max-height: 100px;">`;
                    showNotification('Image uploaded to Google Drive', 'success');
                }
            } catch (err) {
                console.error("Drive upload error:", err);
                preview.innerHTML = '<span class="error">Upload failed</span>';
            }
        });
    }

    // Form Submit
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProduct();
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

export function openProductModal(productValue = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');

    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('p-image-url').value = '';
    document.getElementById('image-preview').innerHTML = '<span>No image selected</span>';

    if (productValue && typeof productValue === 'object') {
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = productValue.id || productValue._id;
        document.getElementById('p-name').value = productValue.name;
        document.getElementById('p-price').value = productValue.price;
        document.getElementById('p-category').value = productValue.category;
        document.getElementById('p-calories').value = productValue.calories;
        document.getElementById('p-description').value = productValue.description;
        document.getElementById('p-image-url').value = productValue.image;
        document.getElementById('image-preview').innerHTML = `<img src="${productValue.image}" style="max-height: 100px;">`;
    } else {
        title.textContent = 'Add New Product';
    }

    modal.style.display = 'block';
}

window.openProductModal = openProductModal;

async function saveProduct() {
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        category: document.getElementById('p-category').value,
        calories: parseInt(document.getElementById('p-calories').value),
        description: document.getElementById('p-description').value,
        image: document.getElementById('p-image-url').value
    };

    try {
        if (id) {
            await API.updateProduct(id, productData);
            showNotification('Product updated', 'success');
        } else {
            await API.addProduct(productData);
            showNotification('Product created', 'success');
        }
        document.getElementById('product-modal').style.display = 'none';
        loadProducts();
    } catch (err) {
        console.error("Save product error:", err);
        showNotification('Error saving product: ' + (err.message || ''), 'error');
    }
}
