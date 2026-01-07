// Main JavaScript for healthybite

import { Toast } from "./plugins/Toast/toast.js";

// Global Variables
let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('healthybite-user')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    initCategoryFilters();
    updateCartCount();
    initSearch();
    // performLogin(); // Removed undefined function call
});

// Product Functions
async function loadProducts(category = 'all') {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    // Show loading
    productsContainer.innerHTML = '<div class="loading-spinner">Loading recommendations...</div>';

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
                    <a href="pages/product-view.html?id=${product.id}" class="btn btn-view-details">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

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
    localStorage.setItem('healthybite-cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Hide cart count if zero
    if (totalItems === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
}

// Search Functionality
function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    // Redirect to menu page with search query
    window.location.href = `pages/menu.html?search=${encodeURIComponent(query)}`;
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
                    switch (result.user.role) {
                        case 'admin':
                            window.location.href = 'dashboard/admin.html';
                            break;
                        case 'seller':
                            window.location.href = 'dashboard/seller.html';
                            break;
                        case 'delivery-partner':
                            window.location.href = 'dashboard/delivery.html';
                            break;
                        default:
                            window.location.href = 'dashboard/consumer.html';
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
    updateCartCount,
    showNotification,
    formatPrice,
    currentUser,
    cart
};

window.addToCart = addToCart;