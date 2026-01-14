import connectDB from '../../lib/db.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../controllers/product.controller.js';

export default async function handler(req, res) {
    await connectDB();
    if (req.method === 'GET') return getProducts(req, res);
    if (req.method === 'POST') return createProduct(req, res);
    if (req.method === 'PUT') return updateProduct(req, res); // Support PUT on root with id query? Or strictly ID param?
    // Controller `updateProduct` uses `req.query.id`. So PUT /api/products?id=... works here.
    if (req.method === 'DELETE') return deleteProduct(req, res);
    res.status(405).json({ error: 'Method not allowed' });
}
