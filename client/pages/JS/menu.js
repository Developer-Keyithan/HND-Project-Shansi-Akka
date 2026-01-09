import { Toast } from "../../plugins/Toast/toast.js";

// Menu Page JavaScript
document.addEventListener('DOMContentLoaded', function () {

    const checkAPI = setInterval(() => {
        if (window.API) {
            clearInterval(checkAPI);

            loadCategories();
            loadMenuProducts();
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
    const container = document.getElementById('menu-products');
    const countElement = document.getElementById('product-count');
    const titleElement = document.getElementById('menu-title');

    if (!container) return;

    // Wait for dependencies
    let attempts = 0;
    while ((!window.API || !window.Common) && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.Common || !window.API) return;

    // Show loading state
    window.Common.showLoading(container, 'Loading healthy meals...');

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
                        <i class="fas fa-info-circle"></i> View Details
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

async function performSearch(queryOverride = null) {
    const query = (queryOverride || document.getElementById('search-input').value).trim().toLowerCase();

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
        window.Common.showLoading(container, `Searching for "${query}"...`);
        // Simulate search delay for better UI feedback
        await new Promise(r => setTimeout(r, 600));

        if (filteredProducts.length === 0) {
            container.innerHTML = `<div class="empty-state text-center" style="grid-column: 1/-1; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>No results found</h3>
                <p>We couldn't find anything matching "${query}". Try different keywords.</p>
            </div>`;
            return;
        }

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
                        <button class="btn btn-view-details" onclick="viewProductDetails(${product.id})">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
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
    const appUrl = (window.AppConfig?.app?.url || window.AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + `/pages/product-view.html?id=${productId}`;
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
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}

// Initialize on page load
updateCartCount();
window.performMenuSearch = performSearch;

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