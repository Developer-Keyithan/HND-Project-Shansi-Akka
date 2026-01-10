import User from "../models/user.model.js";
import connectDB from "../lib/db.js";
import bcrypt from "bcrypt";

export async function getUsers(req, res) {
    try {
        await connectDB();
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateUserCart(req, res) {
    try {
        await connectDB();
        const { userId, cart } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findByIdAndUpdate(userId, { cart }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getUserById(req, res) {
    try {
        await connectDB();

        const userId = req.query.id;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateUserProfile(req, res) {
    try {
        await connectDB();
        const { userId, name, email, phone, address } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email, phone, address },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function saveUser(req, res) {
    try {
        await connectDB();
        const { id, name, email, password, role } = req.body;

        if (id) {
            // Update
            const updateData = { name, email, role };
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }
            const user = await User.findByIdAndUpdate(id, updateData, { new: true });
            if (!user) return res.status(404).json({ error: "User not found" });
            return res.status(200).json({ success: true, user });
        } else {
            // Create
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({ name, email, password: hashedPassword, role });
            await user.save();
            return res.status(201).json({ success: true, user });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteUser(req, res) {
    try {
        await connectDB();
        const { id } = req.query;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}