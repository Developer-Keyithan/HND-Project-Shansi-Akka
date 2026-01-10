import connectDB from "../lib/db.js";
import TeamMember from "../models/teammember.model.js";

export async function getTeamMembers(req, res) {
    try {
        await connectDB();
        const members = await TeamMember.find({ isActive: true }).sort({ displayOrder: 1 });
        return res.status(200).json({ success: true, members });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
