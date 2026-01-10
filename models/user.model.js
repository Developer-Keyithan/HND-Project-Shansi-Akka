import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || 10);

const cartItemSchema = new mongoose.Schema({
    id: String, // Product ID (can be string or number from frontend)
    quantity: { type: Number, default: 1 },
    name: String,
    price: Number,
    image: String
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ['consumer', 'seller', 'admin', 'administrator', 'technical-supporter', 'delivery-partner', 'delivery-man'],
        default: 'consumer'
    },
    phone: String,
    address: String,
    cart: [cartItemSchema], // Persistent cart
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save: hash password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
