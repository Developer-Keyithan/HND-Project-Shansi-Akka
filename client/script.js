// Main JavaScript for healthybite

import { Toast } from "./plugins/Toast/toast.js";
import { API } from "./shared/api.js";
import { Common } from "./shared/common.js";
import { Auth } from "./shared/auth.js";
import { Navbar } from "./components/navbar/navbar-functions.js";
import { AppConfig } from "./app.config.js";
import { addToCart, showNotification } from "./actions.js";

// Global Variables
let allProducts = [];
let categoriesInitialized = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    loadReviews();
    setCTADiscount();
    loadHeroStats();
});

async function loadHeroStats() {
    const mealsEl = document.getElementById('stat-meals');
    const satisfactionEl = document.getElementById('stat-satisfaction');
    const deliveryEl = document.getElementById('stat-delivery');

    if (!mealsEl || !satisfactionEl || !deliveryEl) return;

    try {
        const stats = await API.getStats();
        if (stats) {
            mealsEl.textContent = stats.mealsServed + "+";
            satisfactionEl.textContent = stats.satisfaction + "%";
            deliveryEl.textContent = stats.avgDeliveryTime + " min";
        }
    } catch (e) {
        console.error("Failed to load hero stats:", e);
    }
}

// Product Functions
async function loadProducts(category = 'all') {
    const productsContainer = document.getElementById('products-container');
    const categoryContainer = document.querySelector('.menu-categories');
    if (!productsContainer) return;

    // Show loading for products
    productsContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Gathering fresh recommendations...</p>
        </div>
    `;

    try {
        // Fetch all products if not already loaded
        if (allProducts.length === 0) {
            allProducts = await API.getProducts();
        }

        // Initialize Categories if not done
        if (!categoriesInitialized && categoryContainer) {
            const categories = ['all', ...new Set(allProducts.map(p => p.category))];
            categoryContainer.innerHTML = categories.map(cat => `
                <button class="btn category-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
                    ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
            `).join('');

            // Add event listeners to dynamic buttons
            categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    categoryContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    loadProducts(this.getAttribute('data-category'));
                });
            });
            categoriesInitialized = true;
        }

        let filteredProducts = allProducts;
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>We couldn't find any products in this category at the moment. Check back soon!</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Reload Menu</button>
                </div>
            `;
            return;
        }

        // Take first 8 products for homepage
        const displayProducts = filteredProducts.slice(0, 8);

        productsContainer.innerHTML = displayProducts.map(product => `
            <div class="product-card" data-id="${product._id || product.id}">
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
                        <button class="btn btn-add-to-cart" data-id="${product._id || product.id}">
                            <i class="fas fa-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-view-details" data-id="${product._id || product.id}">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        productsContainer.querySelectorAll('.btn-add-to-cart').forEach(btn => {
            btn.addEventListener('click', () => addToCart(btn.getAttribute('data-id')));
        });

        productsContainer.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', () => viewProductDetails(btn.getAttribute('data-id')));
        });
    } catch (e) {
        console.error("Failed to load products:", e);
        productsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>We're having trouble loading the menu right now. Please try again.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
            </div>
        `;
    }
}

async function loadReviews() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    // Show loading
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading what our customers say...</p>
        </div>
    `;

    try {
        const reviews = await API.getReviews({ type: 'app', featured: 'true', limit: 3 });

        // Hide section if fewer than 2 reviews
        if (!reviews || reviews.length < 2) {
            const section = document.querySelector('.testimonials');
            if (section) section.style.display = 'none';
            return;
        }

        if (reviews && reviews.length > 0) {
            container.innerHTML = reviews.map(review => `
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <i class="fas fa-quote-left"></i>
                        <p>${review.comment}</p>
                    </div>
                    <div class="testimonial-author">
                        <img src="${review.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="${review.userName}">
                        <div>
                            <h4>${review.userName}</h4>
                            <span>${new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Failed to load reviews:", error);
        container.innerHTML = `
            <div class="error-state" style="background: transparent; box-shadow: none;">
                <i class="fas fa-wifi"></i>
                <p>Unable to load reviews. Please check your connection.</p>
            </div>
        `;
    }
}

function viewProductDetails(productId) {
    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + `/pages/product-view.html?id=${productId}`;
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
