import { login } from '../../controllers/auth.controller.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return login(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
