/**
 * API Service for HealthyBite
 * Simulates backend database calls using local data.
 * This abstraction allows for easy migration to a real backend later.
 */

window.API = {
    _delay: (ms = 800) => new Promise(resolve => setTimeout(resolve, ms)),

    // Products
    getProducts: async () => {
        await window.API._delay(500);
        return window.products ? [...window.products] : [];
    },

    getProductById: async (id) => {
        await window.API._delay(300);
        // id might be string or number in data
        return window.products.find(p => p.id == id);
    },

    getProductsByCategory: async (category) => {
        await window.API._delay(500);
        if (category === 'all') return [...window.products];
        return window.products.filter(p => p.category === category);
    },

    // Users
    login: async (email, password) => {
        await window.API._delay(1000);
        const user = window.users.find(u => u.email === email && u.password === password);
        if (user) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                user: userWithoutPassword,
                token: 'dummy-jwt-token-' + Date.now()
            };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    register: async (userData) => {
        await window.API._delay(1000);
        if (window.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }
        const newUser = { ...userData, role: 'consumer', id: Date.now() };
        window.users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword, token: 'dummy-jwt-token-' + Date.now() };
    },

    // Orders
    getUserOrders: async (email) => { // Using email as user ID for now
        await window.API._delay(600);
        // Combine mock data and local storage data
        const localOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
        const mockOrders = window.orders || [];
        // Filter by user email if available in order data, otherwise return all for demo
        // For localOrders, we saved userId. We need to match it.
        // Assuming current user context isn't passed here, we rely on caller.
        // But for mock purposes, let's just return all combined.
        return [...localOrders, ...mockOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getOrderById: async (orderId) => {
        await window.API._delay(300);
        const localOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
        const mockOrders = window.orders || [];
        const allOrders = [...localOrders, ...mockOrders];
        return allOrders.find(o => (o.orderId === orderId || o.id === orderId));
    },

    // Diet Plans
    getDietPlans: async () => {
        await window.API._delay(400);
        return window.dietPlans ? [...window.dietPlans] : [];
    },

    // Offers
    // getOffers: async () => {
    //     await window.API._delay(400);
    //     return window.offers ? [...window.offers] : [];
    // },
    getCTAOffer: async () => {
        await window.API._delay(400);
        return window.ctaOffer ? { ...window.ctaOffer } : null;
    },

    // Legal Content (Simulating DB Fetch)
    getTermsOfService: async () => {
        await window.API._delay(300);
        return window.termsOfService ? { ...window.termsOfService } : null;
    },

    getPrivacyPolicy: async () => {
        await window.API._delay(300);
        return window.privacyPolicy ? { ...window.privacyPolicy } : null;
    },

    // Reviews (Mock)
    getReviews: async (productId) => {
        await window.API._delay(600);
        // Returning empty array to showcase the "No reviews" empty state
        return [];
    },

    // Subscriptions (Mock)
    getSubscriptions: async () => {
        await window.API._delay(500);
        return [
            { id: 1, name: "Weekly Basic", price: 1500, status: "active", nextDelivery: "2023-11-20" }
        ];
    },

    // Payments (Mock)
    createPaymentIntent: async (amount, currency, items) => {
        await window.API._delay(1000);
        // We cannot generate a real Stripe Client Secret without a backend.
        // We will return a mock one to allow the frontend flow to proceed to a certain point,
        // or to trigger a "Mock Mode" in the frontend.
        return {
            success: true,
            clientSecret: 'mock_secret_' + Date.now(),
            paymentIntentId: 'pi_mock_' + Date.now()
        };
    }
};
