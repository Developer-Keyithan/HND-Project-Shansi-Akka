import mongoose from "mongoose";

const translationSchema = new mongoose.Schema({
    lang: { type: String, required: true, unique: true }, // 'en', 'ta', 'si'
    translations: { type: Map, of: String }, // Key-Value pairs
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Translation", translationSchema);
