import { updateUserCart } from '../../controllers/user.controller.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return updateUserCart(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
