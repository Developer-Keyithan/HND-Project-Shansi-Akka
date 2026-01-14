import connectDB from '../../lib/db.js';
import { getProductById } from '../../controllers/product.controller.js';

export default async function handler(req, res) {
    await connectDB();
    const { id } = req.query; // Vercel puts param in query
    // req.params might NOT be populated in Vercel serverless same as Express?
    // In Vercel, `req.query.id` captures the path param `[id]`.
    // Controller `getProductById` uses `req.params.id`.
    // We must shim this.
    req.params = { id };

    if (req.method === 'GET') return getProductById(req, res);

    // PUT and DELETE are handled in index.js via query params in the original controller,
    // BUT RESTfully they should be here.
    // If we want /api/products/:id (PUT), we need controller to read req.params.id, not query.
    // Currently `updateProduct` reads `req.query.id`.
    // So for now, we leave PUT/DELETE in index.js or redirect here?
    // Let's keep it simple: GET /products/:id uses this.
    // PUT/DELETE use /products?id=... (handled by index.js) OR we refactor controller.
    // Since we are not refactoring controllers heavily, we rely on index.js for mutations.

    res.status(405).json({ error: 'Method not allowed' });
}
