import connectDB from "../../lib/db.js";
import Order from "../../models/order.model.js";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();
        // check both _id and orderId
        const order = await Order.findOne({
            $or: [
                { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
                { orderId: id }
            ].filter(q => q._id || q.orderId)
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
