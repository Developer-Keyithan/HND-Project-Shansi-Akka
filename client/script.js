// Main JavaScript for healthybite

import { Toast } from "./plugins/Toast/toast.js";

// Global Variables
let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('healthybite-user')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    const checkAPI = setInterval(() => {
        if (window.API) {
            clearInterval(checkAPI);
            loadProducts();
            loadReviews();
            setCTADiscount();
        }
    }, 50);

    // Stop checking after 10 seconds to avoid infinite loop (though critical if API missing)
    setTimeout(() => clearInterval(checkAPI), 10000);

    initCategoryFilters();
});

// Product Functions
async function loadProducts(category = 'all') {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    // Wait for dependencies
    let attempts = 0;
    while ((!window.API || !window.Common) && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.Common || !window.API) return;

    // Show loading
    window.Common.showLoading(productsContainer, 'Loading recommendations...');

    let allProducts = [];
    try {
        allProducts = await window.API.getProducts();
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
                    <button class="btn btn-add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                        <button class="btn btn-view-details" onclick="viewProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

window.viewProductDetails = function (productId) {
    const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
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

// Cart Functions
async function addToCart(productId) {
    let product;
    try {
        product = await window.API.getProductById(productId);
    } catch (e) {
        console.error(e);
    }

    // Fallback
    if (!product) {
        product = window.products ? window.products.find(p => p.id === productId) : null;
    }

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save to localStorage
    await localStorage.setItem('healthybite-cart', JSON.stringify(cart));

    // Update cart count
    await window.Navbar.updateCartCount();

    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

async function setCTADiscount() {
    const discount = document.getElementById('cta-discount');
    if (!discount) return;

    let offers;
    try {
        offers = await window.API.getCTAOffer();
    } catch (e) {
        console.error(e);
        return;
    }

    if (offers && discount) {
        discount.textContent = offers.discountRate;
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    Toast({
        icon: type,
        title: capitalizedType,
        message: message
    })
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 0
    }).format(price);
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
            if (!window.Auth) {
                showNotification('Authentication module not loaded', 'error');
                return;
            }

            const result = await window.Auth.loginUser(email, password);

            if (result.success) {
                currentUser = result.user;
                showNotification('Login successful! Redirecting...', 'success');

                // Close modal
                const loginModal = document.getElementById('loginModal'); // Ensure we select the modal
                if (loginModal) {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }

                // Update user menu
                if (window.Navbar && typeof window.Navbar.updateUserMenu === 'function') {
                    window.Navbar.updateUserMenu();
                    // Re-init dropdowns after DOM update
                    setTimeout(() => {
                        if (typeof window.Navbar.initDropdowns === 'function') window.Navbar.initDropdowns();
                    }, 100);
                }

                // Redirect based on role
                setTimeout(() => {
                    const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
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


// Export functions for use in other modules
window.healthybite = {
    addToCart,
    showNotification,
    formatPrice,
    currentUser,
    cart,
};

window.addToCart = addToCart;
window.setCTADiscount = setCTADiscount;
