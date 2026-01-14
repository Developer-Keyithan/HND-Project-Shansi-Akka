import connectDB from "../lib/db.js";
import DietPlan from "../models/dietplan.model.js";

// Get diet plans
export async function getDietPlans(req, res) {
    try {
        await connectDB();
        const plans = await DietPlan.find({ isActive: true });
        return res.status(200).json({ success: true, plans });
    } catch (error) {
        console.error("Get Diet Plans Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
