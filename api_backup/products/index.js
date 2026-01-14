import { getProducts, createProduct, updateProduct, deleteProduct } from '../../controllers/product.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getProducts(req, res);
    }
    if (req.method === 'POST') {
        return createProduct(req, res);
    }
    if (req.method === 'PUT') {
        return updateProduct(req, res);
    }
    if (req.method === 'DELETE') {
        return deleteProduct(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
