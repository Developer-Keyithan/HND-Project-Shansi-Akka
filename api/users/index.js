import { getUsers } from '../../controllers/user.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getUsers(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
