import { getOrderById } from '../../controllers/order.controller.js';
import connectDB from '../../lib/db.js';

export default async function handler(req, res) {
    await connectDB();
    const { id } = req.query;
    req.params = { id };
    if (req.method === 'GET') return getOrderById(req, res);
    res.status(405).json({ error: 'Method not allowed' });
}
