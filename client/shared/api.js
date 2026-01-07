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
        // Logic to simulate filtering orders by user (if data structure supports it)
        // Currently data.js orders don't have user linkage explicitly shown in the snippet
        // Assuming all orders in window.orders are for the demo user
        return window.orders ? [...window.orders] : [];
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
    }
};

console.log('API Service Initialized');
