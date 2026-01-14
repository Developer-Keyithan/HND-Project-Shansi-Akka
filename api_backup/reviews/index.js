import { getReviews, addReview, toggleFeatured } from '../../controllers/review.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getReviews(req, res);
    } else if (req.method === 'POST') {
        // Simple logic for toggle vs add - can check for reviewId in body
        if (req.body.reviewId !== undefined) {
            return toggleFeatured(req, res);
        }
        return addReview(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
