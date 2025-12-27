import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    level: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    device: { type: mongoose.Schema.Types.Mixed },
    user: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Log", logSchema);
