import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g. 'app_settings'
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    stripePublishableKey: { type: String },
    stripeSecretKey: { type: String }, // Should be kept secure, maybe not sent to client
    currencyRates: { type: Map, of: Number }, // Base LKR check
    maintenanceMode: { type: Boolean, default: false },
    ctaOffer: {
        discountRate: { type: Number, default: 0 },
        validTill: { type: Date },
        minimumOrderValue: { type: Number, default: 0 },
        maxDiscount: { type: Number, default: 0 }
    },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Config", configSchema);
