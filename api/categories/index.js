import { getCategories } from '../../controllers/category.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getCategories(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
