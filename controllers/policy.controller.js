import connectDB from "../lib/db.js";
import Policy from "../models/policy.model.js";

// Get Policy by Type (privacy or terms)
export async function getPolicy(req, res) {
    try {
        await connectDB();
        const { type } = req.query; // 'privacy' or 'terms'

        if (!type) {
            return res.status(400).json({ error: "Policy type is required" });
        }

        const policy = await Policy.findOne({ type });

        if (!policy) {
            return res.status(404).json({ success: false, error: "Policy not found" });
        }

        return res.status(200).json({ success: true, policy });

    } catch (error) {
        console.error("Get Policy Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
