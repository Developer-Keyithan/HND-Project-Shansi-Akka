import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { GoogleDrive } from "../../shared/googledrive.js";
import { showNotification } from "../../actions.js";
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

async function loadProducts() {
    let products = [];
    try {
        // In a real app, we'd fetch only this seller's products
        // For now, let's get all products or from data.js as fallback
        products = await API.getProducts();
    } catch (e) {
        console.error("Failed to load products from API:", e);
        products = productsData || [];
    }

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

function initEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logoutUser();
        });
    }

    // Add Product Button
    const addProductBtn = document.querySelector('#products-section .btn-primary');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }

    // Modal Close
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
                showNotification('Failed to upload image to Google Drive', 'error');
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

window.loadSection = loadSection;

function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');

    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('p-image-url').value = '';
    document.getElementById('image-preview').innerHTML = '<span>No image selected</span>';

    // Populate categories
    const categories = ['Main Course', 'Salads', 'Drinks', 'Desserts', 'Breakfast'];
    const catSelect = document.getElementById('p-category');
    catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id || product._id;
        document.getElementById('p-name').value = product.name;
        document.getElementById('p-price').value = product.price;
        document.getElementById('p-category').value = product.category;
        document.getElementById('p-calories').value = product.calories;
        document.getElementById('p-description').value = product.description;
        document.getElementById('p-image-url').value = product.image;
        document.getElementById('image-preview').innerHTML = `<img src="${product.image}" style="max-height: 100px;">`;
    } else {
        title.textContent = 'Add New Product';
    }

    modal.style.display = 'block';
}

async function saveProduct() {
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        category: document.getElementById('p-category').value,
        calories: parseInt(document.getElementById('p-calories').value),
        description: document.getElementById('p-description').value,
        image: document.getElementById('p-image-url').value || 'https://via.placeholder.com/150'
    };

    const btn = document.getElementById('save-product-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

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
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Product';
    }
}
