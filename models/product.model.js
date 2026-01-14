import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    calories: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    ingredients: [String],
    nutrients: {
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number
    },
    badge: String,
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Popularity Metrics
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    cartAdditions: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 }
});

export default mongoose.model("Product", productSchema);