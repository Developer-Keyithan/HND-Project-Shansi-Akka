import connectDB from '../lib/db.js';
import Stats from '../models/stats.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';

export const getStats = async (req, res) => {
    try {
        await connectDB();
        let stats = await Stats.findOne();

        if (!stats) {
            // If no stats exist, create with initial base values
            stats = await Stats.create({
                totalMealsServed: 0,
                totalStars: 0,
                totalReviews: 0,
                totalDeliveryTime: 0,
                totalDeliveries: 0
            });
        }

        // Calculate Customer Satisfaction: total stars / (total reviews * 5) * 100
        const satisfaction = stats.totalReviews > 0
            ? Math.round((stats.totalStars / (stats.totalReviews * 5)) * 100)
            : 0; // Default value

        // Calculate Average Delivery Time: total time / total deliveries
        const avgDeliveryTime = stats.totalDeliveries > 0
            ? Math.round(stats.totalDeliveryTime / stats.totalDeliveries)
            : 45; // Default value

        res.status(200).json({
            success: true,
            stats: {
                mealsServed: stats.totalMealsServed,
                satisfaction: satisfaction,
                avgDeliveryTime: avgDeliveryTime
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Functions to update stats (to be called by other controllers)
export const updateStatsOnOrder = async (orderId) => {
    try {
        await connectDB();
        const order = await Order.findById(orderId);
        if (!order || order.status !== 'delivered') return;

        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});

        // Calculate delivery time in minutes
        const deliveryTime = (new Date(order.updatedAt) - new Date(order.createdAt)) / (1000 * 60);

        const mealCount = order.items.reduce((total, item) => total + (item.quantity || 1), 0);

        stats.totalMealsServed += mealCount;
        stats.totalDeliveryTime += deliveryTime > 0 ? deliveryTime : 45; // Fallback to 45 mins if timestamps are weird
        stats.totalDeliveries += 1;
        stats.lastUpdated = Date.now();

        await stats.save();
    } catch (error) {
        console.error('Failed to update stats on order:', error);
    }
};

export const updateStatsOnReview = async (review) => {
    try {
        await connectDB();
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});

        stats.totalStars += review.rating;
        stats.totalReviews += 1;
        stats.lastUpdated = Date.now();

        await stats.save();
    } catch (error) {
        console.error('Failed to update stats on review:', error);
    }
};
