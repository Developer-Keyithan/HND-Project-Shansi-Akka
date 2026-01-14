import connectDB from '../../lib/db.js';
import { getUsers, saveUser } from '../../controllers/user.controller.js';

export default async function handler(req, res) {
    await connectDB();
    if (req.method === 'GET') return getUsers(req, res);
    if (req.method === 'POST') return saveUser(req, res);
    res.status(405).json({ error: 'Method not allowed' });
}
