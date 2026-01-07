import { getOrders, createOrder, updateOrder } from '../../controllers/order.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getOrders(req, res);
    }
    if (req.method === 'POST') {
        return createOrder(req, res);
    }
    if (req.method === 'PUT') {
        return updateOrder(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
