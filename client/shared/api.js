/**
 * API Service for HealthyBite
 * Connects to the backend via /api/* endpoints.
 */



const BASE_URL = (window.location.port === '5500' || window.location.port === '5501')
    ? `http://${window.location.hostname}:3000/api`
    : '/api';

export const API = {
    // Helper for requests using native fetch
    _fetch: async (endpoint, options = {}) => {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const method = (options.method || 'GET').toUpperCase();

            // Get token
            const token = localStorage.getItem('healthybite-token');
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                method,
                headers
            };

            if (options.body) {
                config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
            }

            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({})); // Handle empty responses gracefully

            if (!response.ok) {
                const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
                error.status = response.status;
                error.response = { data }; // Backward compatibility
                throw error;
            }

            console.log(`[API] ${method} ${endpoint}`, data);
            return data;

        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            const errMsg = error.message || 'API Request Failed';
            throw error; // Rethrow to be caught by caller
        }
    },

    // --- Configuration ---
    getConfig: async () => {
        const res = await API._fetch('/config');
        return res.config;
    },

    getStripeKey: async () => {
        const res = await API._fetch('/config/stripe-key');
        return res.publishableKey;
    },

    getSocialKeys: async () => {
        return await API._fetch('/config/social-keys');
    },

    getCTAOffer: async () => {
        const res = await API._fetch('/config/cta-offer');
        return res.offer;
    },

    // --- Products ---
    getProducts: async (params = {}) => {
        const query = new URLSearchParams();
        if (params.category) query.append('category', params.category);
        if (params.search) query.append('search', params.search);
        if (params.limit) query.append('limit', params.limit);
        if (params.sort) query.append('sort', params.sort);
        if (params.userId) query.append('userId', params.userId);

        const url = `/products?${query.toString()}`;
        const res = await API._fetch(url);
        return res.products || [];
    },

    getProductById: async (id) => {
        const res = await API._fetch(`/products/${id}`);
        return res.product;
    },

    getProductsByCategory: async (category) => {
        const endpoint = category === 'all' ? '/products' : `/products?category=${category}`;
        const res = await API._fetch(endpoint);
        return res.products || [];
    },

    addProduct: async (productData) => {
        return await API._fetch('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    updateProduct: async (id, productData) => {
        return await API._fetch(`/products?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    deleteProduct: async (id) => {
        return await API._fetch(`/products?id=${id}`, {
            method: 'DELETE'
        });
    },

    getCategories: async () => {
        const res = await API._fetch('/categories');
        return res.categories || [];
    },

    // --- Users (Auth) ---
    login: async (email, password, cart = []) => {
        // Assuming api/auth/login exists or created
        // If not, I need to create it. I check 'api/auth' exists.
        return await API._fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, cart })
        });
    },

    register: async (userData) => {
        // Ensure cart is included if present in localStorage
        const cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
        return await API._fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ ...userData, cart })
        });
    },

    updateCart: async (userId, cart) => {
        return await API._fetch('/users/cart', {
            method: 'POST',
            body: JSON.stringify({ userId, cart })
        });
    },

    updateUserProfile: async (profileData) => {
        return await API._fetch('/users/profile/update', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    },

    getUsers: async () => {
        return await API._fetch('/users');
    },

    getCurrentUser: async () => {
        return await API._fetch('/auth/me');
    },

    saveUser: async (userData) => {
        return await API._fetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    deleteUser: async (id) => {
        return await API._fetch(`/users?id=${id}`, {
            method: 'DELETE'
        });
    },

    // --- Orders ---
    getUserOrders: async (userId) => {
        const res = await API._fetch(`/orders?userId=${userId}`);
        return res.orders || [];
    },

    createOrder: async (orderData) => {
        return await API._fetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    getOrderById: async (orderId) => {
        const res = await API._fetch(`/orders/${orderId}`);
        return res.order;
    },

    // --- Diet Plans ---
    getDietPlans: async () => {
        const res = await API._fetch('/diet-plans');
        return res.plans || [];
    },

    getSubscriptions: async () => {
        // Return mock or empty if not implemented in backend yet
        return [];
    },

    // --- Legal ---
    getTermsOfService: async () => {
        const res = await API._fetch('/policies?type=terms');
        return res.policy;
    },

    getPrivacyPolicy: async () => {
        const res = await API._fetch('/policies?type=privacy');
        return res.policy;
    },

    // --- Translations ---
    getTranslations: async (lang) => {
        const res = await API._fetch(`/translations?lang=${lang}`);
        return res.translations;
    },

    // --- FAQs ---
    getFaqs: async () => {
        const res = await API._fetch('/faqs');
        return res.faqs || [];
    },

    // --- Team Members ---
    getTeamMembers: async () => {
        const res = await API._fetch('/team-members');
        return res.members || [];
    },

    // --- Contact ---
    submitContact: async (contactData) => {
        return await API._fetch('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    },

    // --- Payments ---
    createPaymentIntent: async (amount, currency, items, orderId) => {
        return await API._fetch('/payments/create-intent', {
            method: 'POST',
            body: JSON.stringify({ amount, currency, items, orderId })
        });
    },

    confirmPayment: async (paymentIntentId, orderId) => {
        return await API._fetch('/payments/confirm', {
            method: 'POST',
            body: JSON.stringify({ paymentIntentId, orderId })
        });
    },

    // --- Reviews ---
    getReviews: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await API._fetch(`/reviews?${query}`);
        return res.reviews || [];
    },

    addReview: async (reviewData) => {
        return await API._fetch('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    toggleFeaturedReview: async (reviewId, isFeatured) => {
        return await API._fetch('/reviews', {
            method: 'POST',
            body: JSON.stringify({ reviewId, isFeatured })
        });
    },

    // --- Social Auth ---
    googleLogin: async (token) => {
        return await API._fetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    },

    facebookLogin: async (accessToken) => {
        return await API._fetch('/auth/facebook', {
            method: 'POST',
            body: JSON.stringify({ accessToken })
        });
    },

    // --- Stats ---
    getStats: async () => {
        const res = await API._fetch('/stats');
        console.log(res);
        return res.stats || null;
    }
};
