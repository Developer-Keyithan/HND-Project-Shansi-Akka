import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';

// Controllers
import { initiateRegistration, verifyRegistration, verifyLogin, resendVerification } from './controllers/verification.controller.js';
import { login, logout, googleLogin, facebookLogin, registerUser, getCurrentUser } from './controllers/auth.controller.js';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from './controllers/product.controller.js';
import { getCategories } from './controllers/category.controller.js';
import { getConfig, getStripeKey, getSocialKeys, getCTAOffer } from './controllers/config.controller.js';
import { getUsers, saveUser, deleteUser, getUserById, updateUserCart, updateUserProfile } from './controllers/user.controller.js';
import { getOrders, createOrder, updateOrder, getOrderById } from './controllers/order.controller.js';
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
const router = express.Router();

// Auth
router.post('/auth/login', login);
router.post('/auth/register', registerUser);
router.post('/auth/logout', logout);
router.post('/auth/google', googleLogin);
router.post('/auth/facebook', facebookLogin);
router.get('/auth/me', new Auth().middleware(), getCurrentUser);
router.post('/auth/register-init', initiateRegistration);
router.post('/auth/verify', verifyRegistration);
router.post('/auth/verify-login', verifyLogin);
router.post('/auth/resend-verify', resendVerification);

// Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products', updateProduct);
router.delete('/products', deleteProduct);
router.get('/products/:id', getProductById);

// Orders
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders', updateOrder);
router.get('/orders/:id', getOrderById);

// Users
router.get('/users', getUsers);
router.post('/users', saveUser);
router.get('/users/profile', getUserById);
router.put('/users/update-profile', updateUserProfile);
router.post('/users/cart', updateUserCart);
router.delete('/users/delete', deleteUser);

// Categories
router.get('/common/categories', getCategories);

// Config
router.get('/common/config', getConfig);
router.get('/common/cta-offer', getCTAOffer);
router.get('/common/stripe-key', getStripeKey);
router.get('/common/social-keys', getSocialKeys);

// Reviews
router.get('/common/reviews', getReviews);
router.post('/common/reviews', (req, res) => {
    if (req.body.reviewId !== undefined) return toggleFeatured(req, res);
    return addReview(req, res);
});

// FAQs
router.get('/common/faqs', getFaqs);

// Team Members
router.get('/common/team-members', getTeamMembers);

// Contact
router.post('/common/contact', submitContactForm);
router.get('/common/contact', getContactMessages);

// Diet Plans
router.get('/common/diet-plans', getDietPlans);

// Policies
router.get('/common/policies', getPolicy);

// Translations
router.get('/common/translations', getTranslations);

// Logs
router.get('/common/logs', handleLogs);
router.post('/common/logs', handleLogs);

// Stats
router.get('/common/stats', getStats);

// Use router
// Important: When running in Vercel, the path might be different, but we mount on /api/
// or simply handle requests directly if we treat this as the root handlerouter.
// For consistency with client-side, we mount on /api but handle stripping if needed.
// However, in Vercel function, req.url comes relative to the function.
// So if we hit /api/auth/login, and rewritten to /api/index.js, req.url might be /auth/login or /api/auth/login depending on rewrite.
// Safe bet: Mount on /api AND / (fallback) or just inspect.
// But standard Express app in Vercel usually mounts root.
// Let's stick to mounting on /api to match serverouter.js behaviorouter.
app.use('/api', router);

export default app;
