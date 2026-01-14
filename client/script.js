// Main JavaScript for healthybite

import { Toast } from "./plugins/Toast/toast.js";
import { API } from "./shared/api.js";
import { Common } from "./shared/common.js";
import { Auth } from "./shared/auth.js";
import { Navbar } from "./components/navbar/navbar-functions.js";
import { AppConfig } from "./app.config.js";
import { addToCart, showNotification } from "./actions.js";

// Global Variables
let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('healthybite-user')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    loadReviews();
    setCTADiscount();
    initCategoryFilters();
});

// Product Functions
async function loadProducts(category = 'all') {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    // Show loading
    Common.showLoading(productsContainer, 'Loading recommendations...');

    let allProducts = [];
    try {
        allProducts = await API.getProducts();
    } catch (e) {
        console.error(e);
        productsContainer.innerHTML = 'Failed to load products.';
        return;
    }

    let filteredProducts = allProducts;

    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Take first 8 products for homepage
    const displayProducts = filteredProducts.slice(0, 8);

    productsContainer.innerHTML = displayProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">LKR ${product.price.toFixed(2)}</span>
                    <span class="product-calories">${product.calories} cal</span>
                    <span class="product-rating">
                        <i class="fas fa-star"></i> ${product.rating}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-to-cart" data-id="${product.id}">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                        <button class="btn btn-view-details" data-id="${product.id}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners instead of using inline onclick
    productsContainer.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.getAttribute('data-id'))));
    });

    productsContainer.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', () => viewProductDetails(parseInt(btn.getAttribute('data-id'))));
    });
}

function viewProductDetails(productId) {
    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + `/pages/product-view.html?id=${productId}`;
};

function initCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    if (!categoryBtns.length) return;

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Load products for this category
            const category = this.getAttribute('data-category');
            loadProducts(category);
        });
    });
}

async function setCTADiscount() {
    const discount = document.getElementById('cta-discount');
    if (!discount) return;

    let offers;
    try {
        offers = await API.getCTAOffer();
    } catch (e) {
        console.error(e);
        return;
    }

    if (offers && discount) {
        discount.textContent = offers.discountRate;
    }
}

async function loadReviews() {
    // Placeholder for review loading if needed on homepage
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;

        // Simple validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        // Real authentication
        try {
            const result = await Auth.loginUser(email, password);

            if (result.success) {
                currentUser = result.user;
                showNotification('Login successful! Redirecting...', 'success');

                // Close modal
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }

                // Update user menu
                Navbar.updateUserMenu();

                // Redirect based on role
                setTimeout(() => {
                    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
                    switch (result.user.role) {
                        case 'admin':
                            window.location.href = appUrl + '/dashboard/admin.html';
                            break;
                        case 'seller':
                            window.location.href = appUrl + '/dashboard/seller.html';
                            break;
                        case 'delivery-partner':
                            window.location.href = appUrl + '/dashboard/delivery.html';
                            break;
                        default:
                            window.location.href = appUrl + '/dashboard/consumer.html';
                    }
                }, 1500);

            } else {
                showNotification(result.error || 'Invalid email or password', 'error');
            }
        } catch (error) {
            console.error("Login logic error:", error);
            showNotification('An unexpected error occurred', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
