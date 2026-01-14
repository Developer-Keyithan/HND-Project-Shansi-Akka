import connectDB from "../lib/db.js";
import Faq from "../models/faq.model.js";

export async function getFaqs(req, res) {
    try {
        await connectDB();
        const faqs = await Faq.find({ isActive: true }).sort({ displayOrder: 1 });
        return res.status(200).json({ success: true, faqs });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
