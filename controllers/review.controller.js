import connectDB from "../lib/db.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { updateStatsOnReview } from "./stats.controller.js";

// Get reviews (filter by type, productId, for display)
export async function getReviews(req, res) {
    try {
        await connectDB();
        const { type, productId, featured, limit } = req.query;
        let query = { status: 'approved' };

        if (type) query.type = type;
        if (productId) query.productId = productId;
        if (featured === 'true') query.isFeatured = true;

        let reviews = await Review.find(query).sort({ createdAt: -1 });
        if (limit) reviews = reviews.slice(0, parseInt(limit));

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Add review
export async function addReview(req, res) {
    try {
        await connectDB();
        const { userId, userName, userAvatar, rating, comment, type, productId } = req.body;

        if (!userId || !rating || !comment || !type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newReview = new Review({
            userId,
            userName,
            userAvatar,
            rating,
            comment,
            type,
            productId,
            status: 'approved' // Defaulting to approved for now as per simple implementation
        });

        await newReview.save();

        // If it's a product review, update product rating (simple average logic could be added here)
        if (type === 'product' && productId) {
            const productReviews = await Review.find({ productId, type: 'product', status: 'approved' });
            const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            await Product.findByIdAndUpdate(productId, { rating: parseFloat(avgRating.toFixed(1)) });
        }

        // Update global stats
        updateStatsOnReview(newReview).catch(console.error);

        res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update review feature status (Admin)
export async function toggleFeatured(req, res) {
    try {
        await connectDB();
        const { reviewId, isFeatured } = req.body;

        if (!reviewId) {
            return res.status(400).json({ error: "Review ID is required" });
        }

        const review = await Review.findByIdAndUpdate(reviewId, { isFeatured }, { new: true });
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        console.error("Toggle Featured Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
