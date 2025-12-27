// Main JavaScript for HelthyBite

import { Toast } from "./plugins/Toast/toast.js";

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const toggleSearch = document.getElementById('toggle-search')
const searchContainer = document.getElementById('foods-search')
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');
const cartCount = document.querySelector('.cart-count');
const categoryBtns = document.querySelectorAll('.category-btn');
const productsContainer = document.getElementById('products-container');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const passwordInput = document.getElementById('register-password');
const confirmPasswordInput = document.getElementById('register-confirm-password');
const strengthBar = document.querySelector('.strength-bar');
const strengthLevel = document.getElementById('strength-level');
const passwordMatchIndicator = document.getElementById('password-match-indicator');

// Global Variables
let cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('helthybite-user')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    console.log('HelthyBite initialized');

    // Initialize navigation
    initNavigation();

    // Initialize products
    if (productsContainer) {
        loadProducts();
        initCategoryFilters();
    }

    // Update cart count
    updateCartCount();

    // Initialize user menu
    updateUserMenu();

    // Initialize modals
    initModals();

    // Initialize search icon toggle
    toggleSearchBar();

    // Initialize search
    initSearch();

    // Initialize dropdown functionality
    initDropdowns();
});

// Navigation Functions
function initNavigation() {
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Product Functions
function loadProducts(category = 'all') {
    if (!productsContainer) return;

    let filteredProducts = window.products || [];

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
                    <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                    <a href="pages/product-view.html?id=${product.id}" class="btn-view-details">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

function initCategoryFilters() {
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
function addToCart(productId) {
    const product = window.products.find(p => p.id === productId);

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
    localStorage.setItem('helthybite-cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCartCount() {
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

// User Functions
function updateUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    // Clear existing content
    userMenu.innerHTML = '';

    if (currentUser) {
        // User is logged in - show dropdown
        userMenu.innerHTML = `
            <div class="user-dropdown">
                <button class="user-profile-btn">
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="dashboard/consumer.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="pages/profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="pages/cart.html"><i class="fas fa-shopping-cart"></i> Cart</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
    } else {
        // User is not logged in - show login/register buttons
        userMenu.innerHTML = `
            <button class="btn-login" id="login-btn">Login</button>
            <button class="btn-register" id="register-btn">Sign Up</button>
        `;

        // Re-attach event listeners to new buttons
        const newLoginBtn = userMenu.querySelector('#login-btn');
        const newRegisterBtn = userMenu.querySelector('#register-btn');
        
        if (newLoginBtn) {
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginModal) {
                    loginModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                } else {
                    window.location.href = 'auth/login.html';
                }
            });
        }
        
        if (newRegisterBtn) {
            newRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'auth/register.html';
            });
        }
    }
}

function logout() {
    localStorage.removeItem('helthybite-user');
    currentUser = null;
    
    // Update UI
    updateUserMenu();
    
    // Show notification
    showNotification('Logged out successfully!', 'success');
    
    // If on a protected page, redirect to home
    const protectedPages = ['dashboard/', 'pages/profile.html', 'pages/cart.html'];
    const currentPath = window.location.pathname;
    
    const isProtected = protectedPages.some(page => currentPath.includes(page));
    if (isProtected) {
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

// Dropdown Functions
function initDropdowns() {
    // Initialize user dropdown if user is logged in
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        const userProfileBtn = userDropdown.querySelector('.user-profile-btn');
        const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
        
        if (userProfileBtn && dropdownMenu) {
            userProfileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
            
            // Handle logout button
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
            
            // Close dropdown when clicking on a link
            dropdownMenu.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }
}

// Modal Functions
function initModals() {
    // Login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                window.location.href = 'auth/login.html';
            }
        });
    }

    // Register button
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'auth/register.html';
        });
    }

    // Close modal when clicking X
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('modal-email').value;
            const password = document.getElementById('modal-password').value;

            // Simple validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            // Mock authentication
            const mockUsers = window.users;

            const user = mockUsers.find(u => u.email === email && u.password === password);

            if (user) {
                // Store user data
                currentUser = {
                    id: Date.now(),
                    email: user.email,
                    name: user.name,
                    role: user.role
                };

                localStorage.setItem('helthybite-user', JSON.stringify(currentUser));

                showNotification('Login successful! Redirecting...', 'success');

                // Close modal
                if (loginModal) {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }

                // Update user menu
                updateUserMenu();
                
                // Initialize dropdown for the new user
                setTimeout(initDropdowns, 100);

                // Redirect based on role
                setTimeout(() => {
                    switch (user.role) {
                        case 'admin':
                            window.location.href = 'dashboard/admin.html';
                            break;
                        case 'seller':
                            window.location.href = 'dashboard/seller.html';
                            break;
                        default:
                            window.location.href = 'dashboard/consumer.html';
                    }
                }, 1500);

            } else {
                showNotification('Invalid email or password', 'error');
            }
        });
    }
}

function toggleSearchBar() {
    if (toggleSearch && searchContainer) {
        toggleSearch.addEventListener('click', function () {
            if (searchContainer.style.display === 'flex') {
                searchContainer.style.display = 'none'; // hide if visible
            } else {
                searchContainer.style.display = 'flex'; // show if hidden
            }
        });
    }
}

// Search Functionality
function initSearch() {
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
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
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

// Export functions for use in other modules
window.HelthyBite = {
    addToCart,
    updateCartCount,
    showNotification,
    formatPrice,
    currentUser,
    cart,
    logout,
    updateUserMenu
};