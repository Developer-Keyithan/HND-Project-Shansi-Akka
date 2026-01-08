// Menu Page JavaScript
document.addEventListener('DOMContentLoaded', function () {

    const checkAPI = setInterval(() => {
        if (window.API) {
            clearInterval(checkAPI);

            loadCategories();
            loadMenuProducts();
            loadDietPlans();
            initFilters();

            if (window.Common && window.Common.currentNav() === 'menu.html') {
                window.Navbar.toggleSearchBar();
            }
        }
    }, 50);
});

let currentCategory = 'all';
let currentSort = 'popular';
let maxPrice = 5000;
let maxCalories = 1000;
let visibleProducts = 6;


function loadCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    container.innerHTML = window.categories.map(category => `
        <button class="category-filter-btn ${category.id === 'all' ? 'active' : ''}" 
                data-category="${category.id}">
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
            <span class="category-count">${category.count}</span>
        </button>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active button
            document.querySelectorAll('.category-filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Update category and reload products
            currentCategory = this.getAttribute('data-category');
            visibleProducts = 6;
            loadMenuProducts();
        });
    });
}

// Global cache
let allProducts = [];

async function loadMenuProducts() {
    console.log('Loading menu products...');
    const container = document.getElementById('menu-products');
    const countElement = document.getElementById('product-count');
    const titleElement = document.getElementById('menu-title');

    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="loading-spinner">Loading healthy meals...</div>';

    // Fetch if needed
    if (allProducts.length === 0) {
        try {
            allProducts = await window.API.getProducts();
        } catch (e) {
            console.error(e);
            container.innerHTML = '<p class="error-text">Failed to load menu items.</p>';
            return;
        }
    }

    // Filter products
    let filteredProducts = allProducts.filter(product => {
        // Category filter
        if (currentCategory !== 'all' && product.category !== currentCategory) {
            return false;
        }

        // Price filter
        if (product.price > maxPrice) {
            return false;
        }

        // Calories filter
        if (product.calories > maxCalories) {
            return false;
        }

        return true;
    });

    // Sort products
    filteredProducts = sortProducts(filteredProducts, currentSort);

    // Update count and title
    const totalProducts = filteredProducts.length;
    const displayProducts = filteredProducts.slice(0, visibleProducts);

    if (countElement) countElement.textContent = totalProducts;

    // Update title based on category
    if (titleElement) {
        if (currentCategory === 'all') {
            titleElement.textContent = 'All Healthy Meals';
        } else {
            const category = window.categories.find(c => c.id === currentCategory);
            const catName = category ? category.name : 'Healthy Meals';
            titleElement.textContent = catName;
        }
    }

    // Render products
    container.innerHTML = displayProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="../${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${window.Common.formatCurrency(product.price)}</span>
                    <span class="product-calories">${product.calories} cal</span>
                    <span class="product-rating">
                        <i class="fas fa-star"></i> ${product.rating}
                    </span>
                </div>
                <div class="product-nutrients">
                    <span class="nutrient"><span>Protein</span>: ${product.nutrients.protein}g</span>
                    <span class="nutrient"><span>Carbs</span>: ${product.nutrients.carbs}g</span>
                    <span class="nutrient"><span>Fat</span>: ${product.nutrients.fat}g</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i> <span>Add to Cart</span>
                    </button>
                    <button class="btn btn-view-details" onclick="viewProductDetails(${product.id})">
                         <span>View Details</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        if (visibleProducts >= totalProducts) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }
}

function sortProducts(products, sortBy) {
    const sorted = [...products];

    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'calories-low':
            return sorted.sort((a, b) => a.calories - b.calories);
        case 'calories-high':
            return sorted.sort((a, b) => b.calories - a.calories);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'popular':
        default:
            // Popular is based on rating and badge
            return sorted.sort((a, b) => {
                const aScore = a.rating + (a.badge ? 0.5 : 0);
                const bScore = b.rating + (b.badge ? 0.5 : 0);
                return bScore - aScore;
            });
    }
}

function initFilters() {
    // Sort by
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            loadMenuProducts();
        });
    }

    // Price range
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-range-value');

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function () {
            maxPrice = parseInt(this.value);
            priceValue.textContent = `LKR 0 - LKR ${maxPrice}`;
            loadMenuProducts();
        });
    }

    // Calorie range
    const calorieRange = document.getElementById('calorie-range');
    const calorieValue = document.getElementById('calorie-value');

    if (calorieRange && calorieValue) {
        calorieRange.addEventListener('input', function () {
            maxCalories = parseInt(this.value);
            calorieValue.textContent = maxCalories;
            loadMenuProducts();
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            visibleProducts += 6;
            loadMenuProducts();

            // Scroll to show new products
            const container = document.getElementById('menu-products');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
}

async function loadDietPlans() {
    const container = document.getElementById('diet-plans');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading plans...</div>';

    let plans = [];
    try {
        plans = await window.API.getDietPlans();
    } catch (e) {
        console.error(e);
        container.innerHTML = 'Failed to load plans.';
        return;
    }

    container.innerHTML = plans.map(plan => `
        <div class="plan-card">
            <div class="plan-header">
                <h3>${plan.name}</h3>
                <div class="plan-price">${window.Common.formatCurrency(plan.price)}</div>
            </div>
            <div class="plan-content">
                <p>${plan.description}</p>
                <div class="plan-features">
                    ${plan.features.map(feature => `
                        <div class="feature">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="plan-meta">
                    <span class="calories">
                        <i class="fas fa-fire"></i>
                        ${plan.calories} calories/day
                    </span>
                    <span class="duration">
                        <i class="fas fa-calendar"></i>
                        ${plan.duration}
                    </span>
                </div>
            </div>
            <div class="plan-footer">
                <button class="btn btn-outline" onclick="viewPlanDetails(${plan.id})">
                     <span>Learn More</span>
                </button>
                <button class="btn btn-primary" onclick="selectPlan(${plan.id})">
                     <span>Select Plan</span>
                </button>
            </div>
        </div>
    `).join('');
}

function viewPlanDetails(planId) {
    const plan = window.dietPlans.find(p => p.id === planId);
    if (plan) {
        showNotification(`Opening details for ${plan.name}...`, 'info');
        // In real app, this would open a modal or redirect
    }
}

function selectPlan(planId) {
    const plan = window.dietPlans.find(p => p.id === planId);
    if (plan) {
        showNotification(`${plan.name} selected! Redirecting to diet planning...`, 'success');
        setTimeout(() => {
            window.location.href = 'diet-planning.html?plan=' + planId;
        }, 1500);
    }
}

function performSearch() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();

    if (!query) {
        loadMenuProducts();
        return;
    }

    // Filter products by search query
    const filteredProducts = window.products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.ingredients.some(ing => ing.toLowerCase().includes(query))
    );

    // Update UI
    document.getElementById('product-count').textContent = filteredProducts.length;
    document.getElementById('menu-title').textContent = `Search Results for "${query}"`;

    const container = document.getElementById('menu-products');
    if (container) {
        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">${window.Common.formatCurrency(product.price)}</span>
                        <span class="product-calories">${product.calories} cal</span>
                        <span class="product-rating">
                            <i class="fas fa-star"></i> ${product.rating}
                        </span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-plus"></i> Add to Cart
                        </button>
                        <a href="product-view.html?id=${product.id}" class="btn-view-details">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Hide load more button for search results
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
    }
}

// Make functions available globally
// Make functions available globally
window.addToCart = function (productId) {
    // Search in cache or fallback to window.products if available (for legacy/other pages)
    const product = (typeof allProducts !== 'undefined' ? allProducts.find(p => p.id === productId) : null) || (window.products && window.products.find(p => p.id === productId));

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
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

    localStorage.setItem('healthybite-cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
};

window.viewProductDetails = function (productId) {
    window.location.href = `product-view.html?id=${productId}`;
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        if (totalItems === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'flex';
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 3000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.5s ease forwards;
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Initialize on page load
updateCartCount();

// Add search event listener
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