import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    userData: { type: Object, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // Auto-delete after expiry using TTL
});

export default mongoose.models.PendingRegistration || mongoose.model("PendingRegistration", pendingRegistrationSchema);
