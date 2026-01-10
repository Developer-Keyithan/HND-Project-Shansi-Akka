import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 'salads'
    name: { type: String, required: true },
    icon: { type: String }, // 'fas fa-leaf'
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model("Category", categorySchema);
