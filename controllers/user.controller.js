import User from "../models/user.model.js";
import connectDB from "../lib/db.js";

export async function getUsers(req, res) {
    try {
        await connectDB();
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getUserById(req, res) {
    try {
        await connectDB();

        const userId = req.params.id;
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