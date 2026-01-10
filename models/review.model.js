import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userAvatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    type: { type: String, enum: ['product', 'app'], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Only if type is product
    isFeatured: { type: Boolean, default: false }, // For app reviews to show on landing page
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
