import { getProducts, createProduct } from '../../controllers/product.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getProducts(req, res);
    }
    if (req.method === 'POST') {
        return createProduct(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
