import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import mongoose from 'mongoose';
import Product from './models/product.model.js';
import Order from './models/order.model.js';

// Controllers
import { login, logout, googleLogin, facebookLogin, registerUser } from './controllers/auth.controller.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from './controllers/product.controller.js';
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

import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS configuration
app.use(cors({
    origin: true, // Mirrors the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(bodyParser.json());

// Routes
const r = express.Router();

// Auth
r.post('/auth/login', login);
r.post('/auth/register', registerUser);
r.post('/auth/logout', logout);
r.post('/auth/google', googleLogin);
r.post('/auth/facebook', facebookLogin);

// Products
r.get('/products', getProducts);
r.post('/products', createProduct);
r.put('/products', updateProduct);
r.delete('/products', deleteProduct);
r.get('/products/:id', async (req, res) => {
    try {
        await connectDB();
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.use('/api', r);

// Start
// Start
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Local Express Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB', err);
});
