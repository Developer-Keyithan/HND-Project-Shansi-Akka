// Product View Page JavaScript
import { Toast } from "../plugins/Toast/toast.js";

let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    initEventListeners();
    updateCartCount();
});

function initEventListeners() {
    // Add to cart button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-add-to-cart')) {
            const productId = parseInt(e.target.closest('.btn-add-to-cart').dataset.productId);
            addToCart(productId);
        }
    });

    // Quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.quantity-btn')) {
            const btn = e.target.closest('.quantity-btn');
            const action = btn.dataset.action;
            const input = document.getElementById('product-quantity');
            
            if (action === 'decrease' && input.value > 1) {
                input.value = parseInt(input.value) - 1;
            } else if (action === 'increase') {
                input.value = parseInt(input.value) + 1;
            }
        }
    });

    initNavigation();
}

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function loadProduct() {
    const productId = parseInt(window.Utils?.getUrlParam('id') || 0);
    
    if (!productId) {
        showError('Product not found');
        return;
    }

    // Try to load from API first, fallback to local data
    fetch(`/api/products?id=${productId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.products && data.products.length > 0) {
                currentProduct = data.products[0];
                renderProduct();
                loadRelatedProducts();
            } else {
                // Fallback to local data
                loadFromLocalData(productId);
            }
        })
        .catch(() => {
            // Fallback to local data
            loadFromLocalData(productId);
        });
}

function loadFromLocalData(productId) {
    const products = window.products || [];
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) {
        showError('Product not found');
        return;
    }
    
    renderProduct();
    loadRelatedProducts();
}

function renderProduct() {
    if (!currentProduct) return;

    const container = document.getElementById('product-container');
    const quantity = parseInt(document.getElementById('product-quantity')?.value || 1);

    container.innerHTML = `
        <div class="product-view-image">
            <img src="${currentProduct.image}" alt="${currentProduct.name}">
            ${currentProduct.badge ? `<span class="product-badge">${currentProduct.badge}</span>` : ''}
        </div>
        <div class="product-view-details">
            <h1>${currentProduct.name}</h1>
            <div class="product-rating">
                <div class="stars">
                    ${generateStars(currentProduct.rating)}
                </div>
                <span class="rating-value">${currentProduct.rating}</span>
                <span class="rating-count">(24 reviews)</span>
            </div>
            <p class="product-description">${currentProduct.description}</p>
            
            <div class="product-price-section">
                <span class="product-price">LKR ${currentProduct.price.toFixed(2)}</span>
                <span class="product-calories"><i class="fas fa-fire"></i> ${currentProduct.calories} cal</span>
            </div>

            <div class="product-nutrients">
                <h3>Nutritional Information</h3>
                <div class="nutrients-grid">
                    <div class="nutrient-item">
                        <span class="nutrient-label">Protein</span>
                        <span class="nutrient-value">${currentProduct.nutrients?.protein || 0}g</span>
                    </div>
                    <div class="nutrient-item">
                        <span class="nutrient-label">Carbs</span>
                        <span class="nutrient-value">${currentProduct.nutrients?.carbs || 0}g</span>
                    </div>
                    <div class="nutrient-item">
                        <span class="nutrient-label">Fat</span>
                        <span class="nutrient-value">${currentProduct.nutrients?.fat || 0}g</span>
                    </div>
                    <div class="nutrient-item">
                        <span class="nutrient-label">Fiber</span>
                        <span class="nutrient-value">${currentProduct.nutrients?.fiber || 0}g</span>
                    </div>
                </div>
            </div>

            <div class="product-ingredients">
                <h3>Ingredients</h3>
                <ul class="ingredients-list">
                    ${(currentProduct.ingredients || []).map(ing => `<li><i class="fas fa-check"></i> ${ing}</li>`).join('')}
                </ul>
            </div>

            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" data-action="decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="product-quantity" value="1" min="1" max="10">
                    <button class="quantity-btn" data-action="increase">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="btn btn-primary btn-add-to-cart" data-product-id="${currentProduct.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function loadRelatedProducts() {
    if (!currentProduct) return;

    const products = window.products || [];
    const related = products
        .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
        .slice(0, 4);

    const container = document.getElementById('related-products');
    if (!container) return;

    if (related.length === 0) {
        container.innerHTML = '<p>No related products found.</p>';
        return;
    }

    container.innerHTML = related.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 80)}...</p>
                <div class="product-meta">
                    <span class="product-price">LKR ${product.price.toFixed(2)}</span>
                    <span class="product-calories">${product.calories} cal</span>
                </div>
                <div class="product-actions">
                    <a href="product-view.html?id=${product.id}" class="btn-view-details">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const quantity = parseInt(document.getElementById('product-quantity')?.value || 1);
    const product = window.products?.find(p => p.id === productId) || currentProduct;

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    localStorage.setItem('helthybite-cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('helthybite-cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function showError(message) {
    const container = document.getElementById('product-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h2>${message}</h2>
            <a href="menu.html" class="btn btn-primary">Back to Menu</a>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    Toast({
        icon: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message
    });
}

