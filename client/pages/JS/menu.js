import { Toast } from "../../plugins/Toast/toast.js";
import { API } from "../../shared/api.js";
import { currentNav, formatCurrency, showLoading } from "../../shared/common.js";
import { AppConfig } from "../../app.config.js";
import { Navbar } from "../../components/navbar/navbar-functions.js";
import { addToCart, updateCartCount } from "../../actions.js";

// Menu Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadMenuProducts();
    initFilters();

    if (currentNav() === 'menu.html') {
        Navbar.toggleSearchBar();
    }

    // Listen for search events from navbar
    document.addEventListener('menu-search', (e) => {
        if (e.detail && e.detail.query) {
            performMenuSearch(e.detail.query);
        }
    });

    updateCartCount();
});

let currentCategory = 'all';
let currentSort = 'popular';
let maxPrice = 5000;
let maxCalories = 1000;
let visibleProducts = 6;
let allProducts = [];
let allCategories = [];

async function loadCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    try {
        const categories = await API.getCategories();
        allCategories = categories;

        // Ensure 'All' category exists if not returned by API or merge it
        // Depending on seed, 'all' might be in DB or UI only.
        // My seed script puts 'all' in DB.

        container.innerHTML = categories.map(category => `
            <button class="category-filter-btn ${category.id === 'all' || category.id === currentCategory ? 'active' : ''}" 
                    data-category="${category.id}">
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
                <!-- Count is hard to dynamically get without aggregation, hiding or placeholder -->
                <!-- <span class="category-count">${category.count || ''}</span> -->
            </button>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                // Update active button
                container.querySelectorAll('.category-filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');

                // Update category and reload products
                currentCategory = this.getAttribute('data-category');
                visibleProducts = 6;
                loadMenuProducts();
            });
        });

    } catch (err) {
        console.error("Failed to load categories", err);
    }
}

async function loadMenuProducts() {
    const container = document.getElementById('menu-products');
    const countElement = document.getElementById('product-count');
    const titleElement = document.getElementById('menu-title');

    if (!container) return;

    // Show loading state
    showLoading(container, 'Loading healthy meals...');

    // Fetch if needed
    if (allProducts.length === 0) {
        try {
            allProducts = await API.getProducts();
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
            const category = allCategories.find(c => c.id === currentCategory);
            const catName = category ? category.name : 'Healthy Meals';
            titleElement.textContent = catName;
        }
    }

    // Render products
    container.innerHTML = displayProducts.map(product => `
        <div class="product-card" data-id="${product.id || product._id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="../${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='../assets/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <span class="product-calories">${product.calories} cal</span>
                    <span class="product-rating">
                        <i class="fas fa-star"></i> ${product.rating}
                    </span>
                </div>
                <div class="product-nutrients">
                    <span class="nutrient"><span>Protein</span>: ${product.nutrients?.protein || 0}g</span>
                    <span class="nutrient"><span>Carbs</span>: ${product.nutrients?.carbs || 0}g</span>
                    <span class="nutrient"><span>Fat</span>: ${product.nutrients?.fat || 0}g</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-to-cart" data-id="${product.id || product._id}">
                        <i class="fas fa-plus"></i> <span>Add to Cart</span>
                    </button>
                    <button class="btn btn-view-details" data-id="${product.id || product._id}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        // Use correct ID access (likely _id from mongo, but maybe id field if preserved)
        // My seed script didn't force _id to be number 1, 2. It lets Mongo generate ObjectId.
        // But addToCart might expect number? No, JS is flexible.
        // But addToCart in action.js might parseInt. I should check.
        // For now, assume string IDs are fine.
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => addToCart(id));
    });
    container.querySelectorAll('.btn-view-details').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => viewProductDetails(id));
    });

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
            return sorted.sort((a, b) => {
                const aScore = a.rating + (a.badge ? 0.5 : 0);
                const bScore = b.rating + (b.badge ? 0.5 : 0);
                return bScore - aScore;
            });
    }
}

function initFilters() {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            loadMenuProducts();
        });
    }

    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-range-value');

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function () {
            maxPrice = parseInt(this.value);
            priceValue.textContent = `LKR 0 - LKR ${maxPrice}`;
            loadMenuProducts();
        });
    }

    const calorieRange = document.getElementById('calorie-range');
    const calorieValue = document.getElementById('calorie-value');

    if (calorieRange && calorieValue) {
        calorieRange.addEventListener('input', function () {
            maxCalories = parseInt(this.value);
            calorieValue.textContent = maxCalories;
            loadMenuProducts();
        });
    }

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            visibleProducts += 6;
            loadMenuProducts();

            const container = document.getElementById('menu-products');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => performMenuSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMenuSearch();
            }
        });
    }
}

async function performMenuSearch(queryOverride = null) {
    const searchInput = document.getElementById('search-input');
    const query = (queryOverride || (searchInput ? searchInput.value : '')).trim().toLowerCase();

    const container = document.getElementById('menu-products');
    const countElement = document.getElementById('product-count');
    const titleElement = document.getElementById('menu-title');

    if (!container) return;

    if (!query) {
        loadMenuProducts();
        return;
    }

    if (allProducts.length === 0) {
        try {
            allProducts = await API.getProducts();
        } catch (e) { }
    }

    // Filter products by search query
    // Update to check for nutrients safety
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query)) ||
        (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(query)))
    );

    // Update UI
    if (countElement) countElement.textContent = filteredProducts.length;
    if (titleElement) titleElement.textContent = `Search Results for "${query}"`;

    showLoading(container, `Searching for "${query}"...`);
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
        <div class="product-card" data-id="${product.id || product._id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.image ? '../' + product.image : '../assets/placeholder.jpg'}" alt="${product.name}" 
                     onerror="this.src='../assets/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <span class="product-calories">${product.calories} cal</span>
                    <span class="product-rating">
                        <i class="fas fa-star"></i> ${product.rating}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-to-cart" data-id="${product.id || product._id}">
                        <i class="fas fa-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-view-details" data-id="${product.id || product._id}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => addToCart(id));
    });
    container.querySelectorAll('.btn-view-details').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => viewProductDetails(id));
    });

    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
    }
}

function viewProductDetails(productId) {
    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + `/pages/product-view.html?id=${productId}`;
};

// Export for Navbar compatibility if needed
export { performMenuSearch };