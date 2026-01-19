import connectDB from '../../lib/db.js';
import { getProductById } from '../../controllers/product.controller.js';

export default async function handler(req, res) {
    await connectDB();
    const { id } = req.query;
    req.params = { id };

    if (req.method === 'GET') return getProductById(req, res);

    res.status(405).json({ error: 'Method not allowed' });
}
