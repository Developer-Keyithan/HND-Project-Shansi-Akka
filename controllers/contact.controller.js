import connectDB from "../lib/db.js";
import Contact from "../models/contact.model.js";

export async function submitContactForm(req, res) {
    try {
        await connectDB();
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();

        return res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function getContactMessages(req, res) {
    try {
        await connectDB();
        // This would typically be admin only
        const messages = await Contact.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
