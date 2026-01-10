import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    title: String,
    content: String,
    list: [String]
}, { _id: false });

const policySchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true }, // 'privacy', 'terms'
    title: { type: String, required: true },
    content: { type: String }, // Optional: simplified string content if needed, but sections preferred
    sections: [sectionSchema], // Dynamic sections for admin editor
    version: { type: String, default: '1.0' },
    lastUpdated: { type: String, default: "January 2026" } // Using String to match seed data format, or Date if preferred
});

export default mongoose.models.Policy || mongoose.model("Policy", policySchema);
