import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Config from '../models/config.model.js';
import Policy from '../models/policy.model.js';
import Translation from '../models/translation.model.js';
import DietPlan from '../models/dietplan.model.js';
import Review from '../models/review.model.js';
import User from '../models/user.model.js';
import Faq from '../models/faq.model.js';
import TeamMember from '../models/teammember.model.js';
import Contact from '../models/contact.model.js';
import Stats from '../models/stats.model.js';
import { Dictionary } from '../client/shared/dictionary.js';
import connectDB from '../lib/db.js';

dotenv.config();

// --- DATA ---
const users = [
    { email: 'user@example.com', password: 'user123', name: 'John Doe', role: 'consumer' },
    { email: 'admin@healthybite.com', password: 'admin123', name: 'Admin User', role: 'administrator' },
    { email: 'super@healthybite.com', password: 'super123', name: 'Super Administrator', role: 'administrator' },
    { email: 'tech@healthybite.com', password: 'tech123', name: 'Tech Support', role: 'technical-supporter' },
    { email: 'seller@healthybite.com', password: 'seller123', name: 'Healthy Seller', role: 'seller' },
    { email: 'delivery@healthybite.com', password: 'delivery123', name: 'Delivery Partner', role: 'delivery-partner' }
];

const dietPlans = [
    { id: 'plan_weight_loss', name: 'Weight Loss Plan', description: 'Available for breakfast, lunch, and dinner. Low carb, high protein.', calories: 1200, duration: '4 Weeks', price: 15000, features: ['Personalized meals', 'Weekly consultation'], image: './assets/diet-1.jpg' },
    { id: 'plan_muscle_gain', name: 'Muscle Gain Plan', description: 'High protein, high carb for building muscle mass.', calories: 2500, duration: '8 Weeks', price: 20000, features: ['Workout plan included', 'Daily protein shakes'], image: './assets/diet-2.jpg' },
    { id: 'plan_vegan', name: 'Vegan Wellness', description: '100% plant-based meals rich in nutrients.', calories: 1800, duration: '4 Weeks', price: 16000, features: ['Cruelty-free', 'Organic ingredients'], image: './assets/diet-3.jpg' }
];


const categories = [
    { id: 'all', name: 'All', icon: 'fas fa-utensils', displayOrder: 1 },
    { id: 'salads', name: 'Salads', icon: 'fas fa-leaf', displayOrder: 2 },
    { id: 'smoothies', name: 'Smoothies', icon: 'fas fa-blender', displayOrder: 3 },
    { id: 'bowls', name: 'Bowls', icon: 'fas fa-bowl-food', displayOrder: 4 },
    { id: 'meals', name: 'Main Meals', icon: 'fas fa-utensils', displayOrder: 5 },
    { id: 'snacks', name: 'Snacks', icon: 'fas fa-cookie-bite', displayOrder: 6 }
];

const products = [
    {
        name: "Superfood Salad", description: "A nutrient-packed salad with kale, quinoa, avocado, berries, and lemon vinaigrette.",
        price: 1850, calories: 320, category: "salads", rating: 4.8, image: "./assets/superfood-salad.avif",
        ingredients: ["Kale", "Quinoa", "Avocado", "Mixed Berries", "Almonds"], nutrients: { protein: 15, carbs: 35, fat: 12, fiber: 8 }, badge: "Best Seller"
    },
    {
        name: "Green Power Smoothie", description: "Spinach, banana, almond milk, chia seeds, protein powder, and honey.",
        price: 950, calories: 280, category: "smoothies", rating: 4.6, image: './assets/green-power-smoothie.jpg',
        ingredients: ["Spinach", "Banana", "Almond Milk", "Chia Seeds"], nutrients: { protein: 20, carbs: 40, fat: 8, fiber: 6 }, badge: "New"
    },
    {
        name: "Vegan Buddha Bowl", description: "Brown rice, roasted vegetables, chickpeas, avocado, and tahini dressing.",
        price: 2200, calories: 450, category: "bowls", rating: 4.9, image: "./assets/vegan-buddha-bowl.avif",
        ingredients: ["Brown Rice", "Roasted Veggies", "Chickpeas"], nutrients: { protein: 18, carbs: 60, fat: 15, fiber: 12 }
    },
    {
        name: "Protein Energy Ball", description: "Healthy snacks made with dates, nuts, protein powder, and coconut.",
        price: 250, calories: 180, category: "snacks", rating: 4.5, image: "./assets/protein-energy-balls.jpg",
        ingredients: ["Dates", "Mixed Nuts", "Protein Powder"], nutrients: { protein: 12, carbs: 20, fat: 8, fiber: 4 }
    },
    {
        name: "Grilled Salmon & Veggies", description: "Wild-caught salmon with roasted seasonal vegetables and quinoa.",
        price: 3400, calories: 520, category: "meals", rating: 4.7, image: "./assets/grilled-salmon-and-veggies.avif",
        ingredients: ["Salmon", "Seasonal Vegetables", "Quinoa"], nutrients: { protein: 35, carbs: 45, fat: 20, fiber: 7 }, badge: "Chef's Special"
    },
    {
        name: "Acai Superfood Bowl", description: "Acai berry base topped with granola, fruits, coconut, and honey.",
        price: 2400, calories: 380, category: "bowls", rating: 4.8, image: "./assets/acai-superfood-bowl.avif",
        ingredients: ["Acai Berry", "Granola", "Mixed Fruits"], nutrients: { protein: 8, carbs: 65, fat: 12, fiber: 10 }
    },
    {
        name: "Mediterranean Bowl", description: "Quinoa, chickpeas, olives, feta, cucumber, tomatoes, and lemon dressing.",
        price: 2100, calories: 420, category: "bowls", rating: 4.6, image: "./assets/mediterranean-bowl.avif",
        ingredients: ["Quinoa", "Chickpeas", "Olives", "Feta"], nutrients: { protein: 16, carbs: 55, fat: 14, fiber: 11 }
    },
    {
        name: "Detox Green Juice", description: "Kale, cucumber, celery, green apple, lemon, and ginger.",
        price: 850, calories: 120, category: "smoothies", rating: 4.4, image: "./assets/detox-green-juice.jpg",
        ingredients: ["Kale", "Cucumber", "Celery", "Green Apple"], nutrients: { protein: 3, carbs: 25, fat: 1, fiber: 4 }
    },
    {
        name: "Protein Power Bowl", description: "Brown rice, grilled chicken, black beans, corn, and avocado.",
        price: 1950, calories: 480, category: "meals", rating: 4.9, image: "./assets/protein-power-bowl.jpg",
        ingredients: ["Brown Rice", "Grilled Chicken", "Black Beans"], nutrients: { protein: 38, carbs: 50, fat: 16, fiber: 9 }, badge: "High Protein"
    },
    {
        name: "Berry Bliss Smoothie", description: "Mixed berries, Greek yogurt, almond milk, honey, and flax seeds.",
        price: 1100, calories: 250, category: "smoothies", rating: 4.7, image: "./assets/berry-bliss-smoothie.webp",
        ingredients: ["Mixed Berries", "Greek Yogurt", "Almond Milk"], nutrients: { protein: 15, carbs: 35, fat: 6, fiber: 7 }
    }
];

const currencyRates = {
    'LKR': 1, 'USD': 0.0032, 'EUR': 0.0029, 'GBP': 0.0025, 'JPY': 0.46, 'CNY': 0.023,
    'CHF': 0.0028, 'INR': 0.27, 'PKR': 0.90, 'MVR': 0.049, 'SAR': 0.012, 'QAR': 0.012,
    'IRR': 135, 'AED': 0.011, 'KRW': 4.30, 'MYR': 0.015, 'IDR': 50.0, 'THB': 0.11,
    'SGD': 0.0043, 'HKD': 0.025, 'TWD': 0.10, 'RUB': 0.30, 'AUD': 0.0048, 'CAD': 0.0043
};

const faqs = [
    { question: "How does the diet planning work?", answer: "Our diet planning starts with a consultation or an online quiz to understand your health goals, dietary preferences, and lifestyle. Based on this, our nutritionists craft a personalized meal plan for you.", category: "General", displayOrder: 1 },
    { question: "Do you offer delivery to my area?", answer: "We currently deliver to most major cities in Sri Lanka, including Colombo, Kandy, and Galle. Please check our delivery page or enter your zip code at checkout to confirm.", category: "Delivery", displayOrder: 2 },
    { question: "Are the meals fresh or frozen?", answer: "We pride ourselves on using fresh ingredients. Our meals are prepared daily and delivered fresh to your doorstep. They are never frozen.", category: "Food", displayOrder: 3 },
    { question: "Can I customize my meals?", answer: "Yes! Once you select a plan, you can swap out meals or ingredients based on allergies or preferences through your user dashboard.", category: "Customization", displayOrder: 4 },
    { question: "What is your cancellation policy?", answer: "You can pause or cancel your subscription at any time. For immediate order cancellations, please do so within 1 hour of placing the order.", category: "General", displayOrder: 5 }
];

const teamMembers = [
    {
        name: "Dr. Sarah Johnson",
        role: "Chief Nutritionist",
        bio: "Certified nutritionist with 15+ years of experience in clinical dietetics and sports nutrition.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        icon: "fas fa-user-md",
        displayOrder: 1
    },
    {
        name: "Chef Michael Chen",
        role: "Head Chef",
        bio: "Award-winning chef specializing in healthy cuisine. Former executive chef at GreenLeaf.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        icon: "fas fa-utensils",
        displayOrder: 2
    },
    {
        name: "Priya Sharma",
        role: "Operations Manager",
        bio: "Ensuring smooth operations and customer satisfaction. Expert in supply chain management.",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        icon: "fas fa-chart-line",
        displayOrder: 3
    },
    {
        name: "Alex Silva",
        role: "Sustainability Lead",
        bio: "Passionately driving our zero-waste initiatives and sourcing organic partnerships.",
        image: "https://randomuser.me/api/portraits/men/86.jpg",
        icon: "fas fa-leaf",
        displayOrder: 4
    }
];

const policyPrivacy = {
    type: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: 'January 2026',
    sections: [
        {
            title: "1. Introduction",
            content: "HealthyBite ('we', 'us', or 'our') describes how we collect, use, process, and disclose your information, including your personal information, in conjunction with your access to and use of the HealthyBite website and services. We are committed to protecting your privacy and ensuring your personal data is handled responsibly."
        },
        {
            title: "2. Information We Collect",
            content: "We collect three broad categories of information during your use of our service:",
            list: [
                "**Information You Give Us:** Account information (name, email), Profile information (address, phone number), Payment information (billing address, payment method details via secure processor), and Communications.",
                "**Information We Automatically Collect:** Usage data (pages viewed, time spent), Device information (IP address, browser type), and Location information.",
                "**Information from Third Parties:** We may receive information from delivery partners or payment processors."
            ]
        },
        {
            title: "3. How We Use Information",
            content: "We use, store, and process information, including personal information, to provide, understand, improve, and develop the HealthyBite Platform.",
            list: [
                "Process and fulfill your orders, including sending order confirmations and delivery updates.",
                "Create and maintain a trusted and safer environment (e.g., fraud detection).",
                "Provide customer support and resolve technical issues.",
                "Send you promotional messages, marketing, and advertising (you can opt-out at any time)."
            ]
        },
        {
            title: "4. Sharing and Disclosure",
            content: "We maintain your trust by never selling your personal data. However, we may share information in the following circumstances:",
            list: [
                "**With Service Providers:** We share simplified data with delivery riders, payment processors, and cloud hosting services.",
                "**Legal Requirements:** We may disclose information if required to do so by law.",
                "**Business Transfers:** If HealthyBite is involved in a merger, your information may be transferred as part of that deal."
            ]
        },
        {
            title: "5. Your Rights and Choices",
            content: "You have specific rights regarding your personal information under applicable data protection laws:",
            list: [
                "**Access and Update:** You can access and update your account information directly in your profile settings.",
                "**Data Portability and Deletion:** You have the right to request a copy of your data or request deletion of your account.",
                "**Marketing Opt-Out:** You can unsubscribe from marketing emails at any time."
            ]
        },
        {
            title: "6. Data Security",
            content: "We implement rigorous security controls including encryption (SSL) and secure access protocols to protect your data. We retain your personal information only for as long as is necessary for the performance of the contract."
        },
        {
            title: "7. Cookies",
            content: "We use cookies and similar technologies to help provide, protect, and improve the HealthyBite Platform, such as remembering your preferences and analyzing site performance."
        },
        {
            title: "8. Children's Privacy",
            content: "Our Service is not directed to children under the age of 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately."
        },
        {
            title: "9. Changes to Policy",
            content: "We reserve the right to modify this Privacy Policy at any time. If we make changes, we will post the revised policy and update the 'Last Updated' date."
        },
        {
            title: "10. Contact Us",
            content: "If you have any questions or complaints about this Privacy Policy, please contact us:",
            list: [
                `By email: legal@healthybite.com`,
                "By visiting this page on our website: /contact.html",
                `By phone number: +94 11 234 5678`
            ]
        }
    ]
};

const policyTerms = {
    type: 'terms',
    title: 'Terms of Service',
    lastUpdated: 'January 2026',
    sections: [
        {
            title: "1. Agreement to Terms",
            content: "Welcome to HealthyBite ('we', 'our', or 'us'). By accessing or using our website, mobile application, and services (collectively, the 'Service'), you agree to be bound by these Terms of Service ('Terms'). If you disagree with any part of the terms, you may not access the Service."
        },
        {
            title: "2. Eligibility and Account Registration",
            content: "You must be at least 18 years old to use our Service. When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.",
            list: [
                "You are responsible for maintaining the confidentiality of your account and password.",
                "You agree to accept responsibility for all activities that occur under your account.",
                "You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account."
            ]
        },
        {
            title: "3. Products and Services",
            content: "We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Service. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.",
            list: [
                "All products are subject to availability, and we cannot guarantee that items will be in stock.",
                "We reserve the right to discontinue any product at any time for any reason.",
                "Prices for all products are subject to change without notice."
            ]
        },
        {
            title: "4. Orders, Pricing, and Payments",
            content: "By placing an order, you represent that you have the legal right to use the payment method provided. All prices are listed in Sri Lankan Rupees (LKR) and are inclusive of applicable taxes unless stated otherwise.",
            list: [
                "We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price of the product or service, or error in your order.",
                "We may also require additional verifications or information before accepting any order.",
                "You agree to provide current, complete, and accurate purchase and account information for all purchases made via our store."
            ]
        },
        {
            title: "5. Delivery and Logistics",
            content: "Delivery times are estimates and start from the date of shipping, rather than the date of order. Delivery times are to be used as a guide only and are subject to the acceptance and approval of your order.",
            list: [
                "We will make every reasonable effort to deliver the products to you within the timeframe stated.",
                "We are not responsible for any delays caused by destination clearance processes or other unforeseen circumstances.",
                "Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier."
            ]
        },
        {
            title: "6. Cancellations, Returns, and Refunds",
            content: "Our goal is your complete satisfaction. If you are not entirely satisfied with your purchase, we're here to help.",
            list: [
                "**Cancellations:** You may cancel your order within 5 minutes of placing it for a full refund. Orders cannot be canceled once preparation has begun.",
                "**Refunds:** If you receive a damaged, incorrect, or incomplete order, please contact us immediately. Refunds are processed within 5-7 business days to the original method of payment.",
                "**Non-Returnable Items:** Due to the perishable nature of food products, we generally do not accept returns. Issues will be resolved via refunds or replacements."
            ]
        },
        {
            title: "7. Intellectual Property",
            content: "The Service and its original content, features, and functionality are and will remain the exclusive property of HealthyBite and its licensors. The Service is protected by copyright, trademark, and other laws of both Sri Lanka and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of HealthyBite."
        },
        {
            title: "8. Prohibited Activities",
            content: "You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.",
            list: [
                "Systematically retrieving data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.",
                "Making any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means.",
                "Circumventing, disabling, or otherwise interfering with security-related features of the Service.",
                "Engaging in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools."
            ]
        },
        {
            title: "9. Limitation of Liability",
            content: "In no event shall HealthyBite, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:",
            list: [
                "Your access to or use of or inability to access or use the Service;",
                "Any conduct or content of any third party on the Service;",
                "Any content obtained from the Service;",
                "Unauthorized access, use, or alteration of your transmissions or content."
            ]
        },
        {
            title: "10. Changes to Terms",
            content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
        },
        {
            title: "11. Contact Us",
            content: "If you have any questions about these Terms, please contact us:",
            list: [
                `By email: legal@healthybite.com`,
                "By visiting this page on our website: /contact.html",
                `By phone number: +94 11 234 5678`
            ]
        }
    ]
};

async function seed() {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Clear existing
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Config.deleteMany({});
        await Policy.deleteMany({});
        await Translation.deleteMany({});
        await DietPlan.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data');

        // Clear additional models
        await Faq.deleteMany({});
        await TeamMember.deleteMany({});
        await Contact.deleteMany({});
        await Stats.deleteMany({});

        // Insert Stats
        await Stats.create({
            totalMealsServed: 0,
            totalStars: 0,
            totalReviews: 0,
            totalDeliveryTime: 0,
            totalDeliveries: 0
        });
        console.log('Inserted Stats');

        // Insert Users
        await User.create(users);
        console.log('Inserted Users');

        // Insert Diet Plans
        await DietPlan.insertMany(dietPlans);
        console.log('Inserted Diet Plans');

        // Insert Categories
        await Category.insertMany(categories);
        console.log('Inserted Categories');

        // Insert Products
        await Product.insertMany(products);
        console.log('Inserted Products');

        // Insert Config
        await Config.create({
            key: 'app_settings',
            tax: 5,
            deliveryFee: 200,
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_sample',
            currencyRates: currencyRates,
            maintenanceMode: false,
            ctaOffer: {
                discountRate: 80,
                validTill: new Date('2026-12-31T23:59:59+05:30'),
                minimumOrderValue: 50,
                maxDiscount: 100
            }
        });
        console.log('Inserted Config');

        // Insert Policies
        await Policy.create(policyPrivacy);
        await Policy.create(policyTerms);
        console.log('Inserted Policies');

        // Insert FAQs
        await Faq.insertMany(faqs);
        console.log('Inserted FAQs');

        // Insert Team Members
        await TeamMember.insertMany(teamMembers);
        console.log('Inserted Team Members');

        // Insert Reviews
        const adminUser = await User.findOne({ role: 'administrator' });
        const consumerUser = await User.findOne({ role: 'consumer' });
        const product = await Product.findOne();

        const reviews = [
            {
                userId: adminUser._id,
                userName: adminUser.name,
                rating: 5,
                comment: "Excellent platform! Very easy to manage and use.",
                type: 'app',
                isFeatured: true
            },
            {
                userId: consumerUser._id,
                userName: consumerUser.name,
                rating: 4,
                comment: "Love the healthy meal options. The delivery is always on time!",
                type: 'app',
                isFeatured: true
            },
            {
                userId: consumerUser._id,
                userName: consumerUser.name,
                rating: 5,
                comment: "The Superfood Salad is amazing! Fresh and tasty.",
                type: 'product',
                productId: product._id
            }
        ];
        await Review.insertMany(reviews);
        console.log('Inserted Reviews');

        // Insert Translations (ALL from Dictionary)
        const translationPromises = Object.keys(Dictionary).map(lang => {
            return Translation.create({ lang, translations: Dictionary[lang] });
        });
        await Promise.all(translationPromises);
        console.log('Inserted All Translations');

        console.log('Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seed();
