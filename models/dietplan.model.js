import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    calories: Number,
    duration: String, // e.g., "4 Weeks"
    price: Number,
    features: [String],
    image: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.DietPlan || mongoose.model("DietPlan", dietPlanSchema);
