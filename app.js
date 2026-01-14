import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import Order from './models/order.model.js';

// Controllers
import { initiateRegistration, verifyRegistration, verifyLogin, resendVerification } from './controllers/verification.controller.js';
import { login, logout, googleLogin, facebookLogin, registerUser, getCurrentUser } from './controllers/auth.controller.js';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from './controllers/product.controller.js';
import { getCategories } from './controllers/category.controller.js';
import { getConfig, getStripeKey, getSocialKeys, getCTAOffer } from './controllers/config.controller.js';
import { getUsers, saveUser, deleteUser, getUserById, updateUserCart, updateUserProfile } from './controllers/user.controller.js';
import { getOrders, createOrder, updateOrder } from './controllers/order.controller.js';
import { getReviews, addReview, toggleFeatured } from './controllers/review.controller.js';
import { getFaqs } from './controllers/faq.controller.js';
import { getTeamMembers } from './controllers/teammember.controller.js';
import { submitContactForm, getContactMessages } from './controllers/contact.controller.js';
import { getDietPlans } from './controllers/dietplan.controller.js';
import { getPolicy } from './controllers/policy.controller.js';
import { getTranslations } from './controllers/translation.controller.js';
import { handleLogs } from './controllers/log.controller.js';
import { getStats } from './controllers/stats.controller.js';
import { Auth } from './middlewares/auth.middleware.js';

import cors from 'cors';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: true, // Mirrors the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(bodyParser.json());

// Global middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection failed:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Load DB connection early (for Vercel cold starts)
connectDB();

// Routes
const r = express.Router();

// Auth
r.post('/auth/login', login);
r.post('/auth/register', registerUser);
r.post('/auth/logout', logout);
r.post('/auth/google', googleLogin);
r.post('/auth/facebook', facebookLogin);
r.get('/auth/me', new Auth().middleware(), getCurrentUser);

// Verification Flow
r.post('/auth/register-init', initiateRegistration);
r.post('/auth/verify', verifyRegistration);
r.post('/auth/verify-login', verifyLogin);
r.post('/auth/resend-verify', resendVerification);

// Products
r.get('/products', getProducts);
r.post('/products', createProduct);
r.put('/products', updateProduct);
r.delete('/products', deleteProduct);
r.get('/products/:id', getProductById);

// Categories
r.get('/categories', getCategories);

// Config
r.get('/config', getConfig);
r.get('/config/cta-offer', getCTAOffer);
r.get('/config/stripe-key', getStripeKey);
r.get('/config/social-keys', getSocialKeys);

// Users
r.get('/users', getUsers);
r.post('/users', saveUser);
r.delete('/users', deleteUser);
r.get('/users/profile', getUserById);
r.post('/users/profile/update', updateUserProfile);
r.post('/users/cart', updateUserCart);

// Orders
r.get('/orders', getOrders);
r.post('/orders', createOrder);
r.put('/orders', updateOrder);
r.get('/orders/:id', async (req, res) => {
    try {
        await connectDB();
        const id = req.params.id;
        const order = await Order.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { orderId: id }
            ].filter(q => q._id || q.orderId)
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reviews
r.get('/reviews', getReviews);
r.post('/reviews', (req, res) => {
    if (req.body.reviewId !== undefined) return toggleFeatured(req, res);
    return addReview(req, res);
});

// FAQs
r.get('/faqs', getFaqs);

// Team Members
r.get('/team-members', getTeamMembers);

// Contact
r.post('/contact', submitContactForm);
r.get('/contact', getContactMessages);

// Diet Plans
r.get('/diet-plans', getDietPlans);

// Policies
r.get('/policies', getPolicy);

// Translations
r.get('/translations', getTranslations);

// Logs
r.get('/logs', handleLogs);
r.post('/logs', handleLogs);

// Stats
r.get('/stats', getStats);

// Use router
// Important: When running in Vercel, the path might be different, but we mount on /api/
// or simply handle requests directly if we treat this as the root handler.
// For consistency with client-side, we mount on /api but handle stripping if needed.
// However, in Vercel function, req.url comes relative to the function.
// So if we hit /api/auth/login, and rewritten to /api/index.js, req.url might be /auth/login or /api/auth/login depending on rewrite.
// Safe bet: Mount on /api AND / (fallback) or just inspect.
// But standard Express app in Vercel usually mounts root.
// Let's stick to mounting on /api to match server.js behavior.
app.use('/api', r);

export default app;
