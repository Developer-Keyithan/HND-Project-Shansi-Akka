import Order from "../models/order.model.js";
import connectDB from "../lib/db.js";
import { updateStatsOnOrder } from "./stats.controller.js";

// Get orders
export async function getOrders(req, res) {
    try {
        await connectDB();
        const { userId, orderId } = req.query;
        let query = {};

        if (userId) query.userId = userId;
        if (orderId) query.orderId = orderId;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate("userId", "name email");

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Get Orders Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create order
export async function createOrder(req, res) {
    try {
        await connectDB();
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update order status
export async function updateOrder(req, res) {
    try {
        await connectDB();
        const { orderId, status } = req.body;

        const order = await Order.findOneAndUpdate(
            { orderId },
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (order && status === 'delivered') {
            updateStatsOnOrder(order._id).catch(console.error);
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Update Order Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
