// Product View Page JavaScript
import { API } from "../../shared/api.js";
import { Auth } from "../../shared/auth.js";
import { getParameterByName, showLoading, formatCurrency } from "../../shared/common.js";
import { addToCart, updateCartCount, showNotification } from "../../actions.js";

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
            const productId = e.target.closest('.btn-add-to-cart').dataset.productId;
            addToCart(productId);
        }
    });

    // Quantity buttons
    document.addEventListener('click', function (e) {
        if (e.target.closest('.quantity-btn')) {
            const btn = e.target.closest('.quantity-btn');
            const action = btn.dataset.action;
            const input = document.getElementById('product-quantity');

            if (input) {
                if (action === 'decrease' && input.value > 1) {
                    input.value = parseInt(input.value) - 1;
                } else if (action === 'increase') {
                    input.value = parseInt(input.value) + 1;
                }
            }
        }
    });

    // Star rating interactivity
    const starRating = document.getElementById('star-rating');
    if (starRating) {
        const stars = starRating.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('mouseover', function () {
                const val = parseInt(this.dataset.value);
                highlightStars(val);
            });

            star.addEventListener('mouseout', function () {
                const currentVal = parseInt(document.getElementById('rating-value').value);
                highlightStars(currentVal);
            });

            star.addEventListener('click', function () {
                const val = parseInt(this.dataset.value);
                document.getElementById('rating-value').value = val;
                highlightStars(val);
            });
        });
    }

    // Review form submission
    const reviewForm = document.getElementById('product-review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleSubmitReview();
        });
    }
}

function highlightStars(count) {
    const starRating = document.getElementById('star-rating');
    if (!starRating) return;
    const stars = starRating.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.remove('far', 'fa-star');
            star.classList.add('fas', 'fa-star');
        } else {
            star.classList.remove('fas', 'fa-star');
            star.classList.add('far', 'fa-star');
        }
    });
}

async function loadProduct() {
    const productId = getParameterByName('id');
    const container = document.getElementById('product-container');

    if (!productId) {
        showError('Product ID is missing');
        loadRelatedProducts();
        loadReviews();
        return;
    }

    // Show loading
    if (container) showLoading(container, 'Fetching product details...');

    try {
        currentProduct = await API.getProductById(productId);

        if (currentProduct) {
            renderProduct();
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

function renderProduct() {
    if (!currentProduct) return;

    const container = document.getElementById('product-container');
    if (!container) return;

    container.innerHTML = `
        <div class="product-view-image">
            <img src="${currentProduct.image.startsWith('.') ? currentProduct.image : '../' + currentProduct.image}" alt="${currentProduct.name}">
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
                <span class="product-price">${formatCurrency(currentProduct.price)}</span>
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

    showLoading(container, 'Searching for similar items...');

    try {
        const allProducts = await API.getProducts();
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
                    <img src="${product.image.startsWith('.') ? product.image : '../' + product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description.substring(0, 80)}...</p>
                    <div class="product-meta">
                        <span class="product-price">${formatCurrency(product.price)}</span>
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

    if (!currentProduct) return;

    showLoading(container, 'Fetching customer reviews...');

    try {
        const reviews = await API.getReviews({ type: 'product', productId: currentProduct._id || currentProduct.id });

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-comments"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to share your experience with <strong>${currentProduct.name}</strong>.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-user">
                                <img src="${review.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="${review.userName}">
                                <h4>${review.userName}</h4>
                            </div>
                            <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="review-stars">
                            ${generateStars(review.rating)}
                        </div>
                        <p class="review-comment">${review.comment}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="error-text">Failed to load reviews.</p>';
    }
}

async function handleSubmitReview() {
    const user = API.getCurrentUser();
    if (!user) {
        showNotification('Please login to leave a review', 'warning');
        return;
    }

    const rating = parseInt(document.getElementById('rating-value').value);
    const comment = document.getElementById('review-comment').value.trim();

    if (rating === 0) {
        showNotification('Please select a star rating', 'warning');
        return;
    }

    if (!comment) {
        showNotification('Please enter a comment', 'warning');
        return;
    }

    const submitBtn = document.querySelector('#product-review-form button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        const result = await API.addReview({
            userId: user.id || user._id,
            userName: user.name,
            userAvatar: user.avatar,
            rating,
            comment,
            type: 'product',
            productId: currentProduct._id || currentProduct.id
        });

        if (result.success) {
            showNotification('Thank you for your review!', 'success');
            document.getElementById('product-review-form').reset();
            document.getElementById('rating-value').value = 0;
            highlightStars(0);
            loadReviews(); // Refresh reviews
        }
    } catch (error) {
        console.error('Submit review error:', error);
        showNotification('Failed to submit review', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Review';
    }
}

function showError(message) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h2>${message}</h2>
                <a href="menu.html" class="btn btn-primary">Back to Menu</a>
            </div>
        `;
    }
}