/**
 * API Service for HealthyBite
 * Simulates backend database calls using local data.
 * This abstraction allows for easy migration to a real backend later.
 */

import { products, users, orders, dietPlans, ctaOffer, termsOfService, privacyPolicy, teamMembers } from "./data.js";

export const API = {
    _delay: (ms = 800) => new Promise(resolve => setTimeout(resolve, ms)),

    // Products
    getProducts: async () => {
        await API._delay(500);
        return products ? [...products] : [];
    },

    getProductById: async (id) => {
        await API._delay(300);
        // id might be string or number in data
        return products.find(p => p.id == id);
    },

    getProductsByCategory: async (category) => {
        await API._delay(500);
        if (category === 'all') return [...products];
        return products.filter(p => p.category === category);
    },

    // Users
    login: async (email, password) => {
        await API._delay(1000);
        const user = users.find(u => u.email === email && u.password === password);
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
        await API._delay(1000);
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }
        const newUser = { ...userData, role: 'consumer', id: Date.now() };
        users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword, token: 'dummy-jwt-token-' + Date.now() };
    },

    getUsers: async () => {
        await API._delay(500);
        return [...users];
    },

    saveUser: async (userData) => {
        await API._delay(800);
        const index = users.findIndex(u => u.email === userData.email || u.id === userData.id);
        if (index !== -1) {
            // Update
            users[index] = { ...users[index], ...userData };
            return { success: true, user: users[index] };
        } else {
            // Create
            const newUser = { ...userData, id: Date.now() };
            users.push(newUser);
            return { success: true, user: newUser };
        }
    },

    deleteUser: async (userId) => {
        await API._delay(800);
        const index = users.findIndex(u => u.id == userId || u.email === userId);
        if (index !== -1) {
            users.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    },

    // Orders
    getUserOrders: async (email) => { // Using email as user ID for now
        await API._delay(600);
        // Combine mock data and local storage data
        const localOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
        const mockOrders = orders || [];
        // Filter by user email if available in order data, otherwise return all for demo
        return [...localOrders, ...mockOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getOrderById: async (orderId) => {
        await API._delay(300);
        const localOrders = JSON.parse(localStorage.getItem('healthybite-orders') || '[]');
        const mockOrders = orders || [];
        const allOrders = [...localOrders, ...mockOrders];
        return allOrders.find(o => (o.orderId === orderId || o.id === orderId));
    },

    // Diet Plans
    getDietPlans: async () => {
        await API._delay(400);
        return dietPlans ? [...dietPlans] : [];
    },

    // Offers
    getCTAOffer: async () => {
        await API._delay(400);
        return ctaOffer ? { ...ctaOffer } : null;
    },

    // Legal Content (Simulating DB Fetch)
    getTermsOfService: async () => {
        await API._delay(300);
        return termsOfService ? { ...termsOfService } : null;
    },

    getPrivacyPolicy: async () => {
        await API._delay(300);
        return privacyPolicy ? { ...privacyPolicy } : null;
    },

    // Reviews (Mock)
    getReviews: async (productId) => {
        await API._delay(600);
        // Returning empty array to showcase the "No reviews" empty state
        return [];
    },

    // Subscriptions (Mock)
    getSubscriptions: async () => {
        await API._delay(500);
        return [
            { id: 1, name: "Weekly Basic", price: 1500, status: "active", nextDelivery: "2023-11-20" }
        ];
    },

    // Team
    getTeamMembers: async () => {
        await API._delay(400);
        return teamMembers ? [...teamMembers] : [];
    },

    // Payments (Mock)
    createPaymentIntent: async (amount, currency, items) => {
        await API._delay(1000);
        return {
            success: true,
            clientSecret: 'mock_secret_' + Date.now(),
            paymentIntentId: 'pi_mock_' + Date.now()
        };
    }
};
