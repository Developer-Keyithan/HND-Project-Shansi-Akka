// Product View Page JavaScript
import { Toast } from "../../plugins/Toast/toast.js";

let currentProduct = null;

document.addEventListener('DOMContentLoaded', function () {
    initEventListeners();
    updateCartCount();
    loadProduct();
});

function initEventListeners() {
    // Add to cart button
    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-add-to-cart')) {
            const productId = parseInt(e.target.closest('.btn-add-to-cart').dataset.productId);
            addToCart(productId);
        }
    });

    // Quantity buttons
    document.addEventListener('click', function (e) {
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

}

async function loadProduct() {
    // Wait for dependencies (Common and API) at the very start
    let attempts = 0;
    while ((!window.API || !window.Common) && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.API || !window.Common) {
        console.error('Core modules (API/Common) failed to load.');
        showError('System component error. Please refresh.');
        return;
    }

    const productId = parseInt(window.Common.getParameterByName('id') || 0);
    const container = document.querySelector('.product-view-section .container');

    if (!productId) {
        showError('Product not found');
        loadRelatedProducts();
        loadReviews();
        return;
    }

    // Show loading
    if (container) window.Common.showLoading(document.getElementById('product-container'), 'Fetching product details...');

    try {
        currentProduct = await window.API.getProductById(productId);

        if (currentProduct) {
            renderProduct();
            // Load additional sections
            loadRelatedProducts();
            loadReviews();
        } else {
            showError('Product not found');
        }
    } catch (e) {
        console.error(e);
        showError('Failed to load product');
    }
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

async function loadRelatedProducts() {
    if (!currentProduct) return;

    const container = document.getElementById('related-products');
    if (!container) return;

    // Show loading
    window.Common.showLoading(container, 'Searching for similar items...');

    try {
        // Wait for API
        let attempts = 0;
        while (!window.API && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const allProducts = await window.API.getProducts();
        const related = allProducts
            .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
            .slice(0, 4);

        if (related.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No Similar Items</h3>
                    <p>We don't have any other products in this category right now, but check back soon!</p>
                    <a href="menu.html" class="btn btn-outline">Explore Full Menu</a>
                </div>
            `;
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
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load related products.</p>';
    }
}

async function loadReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    // Show loading
    window.Common.showLoading(container, 'Fetching customer reviews...');

    try {
        // Wait for API
        let attempts = 0;
        while (!window.API && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const reviews = await window.API.getReviews();

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-comments"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to share your experience with the <strong>${currentProduct.name}</strong>. Your feedback helps others make healthy choices!</p>
                    <button class="btn btn-primary" onclick="showNotification('Review system coming soon!', 'info')">Write a Review</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%;">
                ${reviews.map(review => `
                    <div class="review-card" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0; color: #333;">${review.name}</h4>
                            <span style="font-size: 0.8rem; color: #999;">${new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div style="color: #ffc107; margin-bottom: 10px;">
                            ${generateStars(review.rating)}
                        </div>
                        <p style="color: #555; font-style: italic; line-height: 1.6; margin: 0;">"${review.text}"</p>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load reviews.</p>';
    }
}

function addToCart(productId) {
    const quantity = parseInt(document.getElementById('product-quantity')?.value || 1);
    const product = window.products?.find(p => p.id === productId) || currentProduct;

    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
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

    localStorage.setItem('healthybite-cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
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

window.showNotification = showNotification;