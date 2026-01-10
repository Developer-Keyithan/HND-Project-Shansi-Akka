import connectDB from "../lib/db.js";
import Category from "../models/category.model.js";

// Get categories
export async function getCategories(req, res) {
    try {
        await connectDB();
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
