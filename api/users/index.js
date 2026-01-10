import { getUsers, saveUser, deleteUser } from '../../controllers/user.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getUsers(req, res);
    }
    if (req.method === 'POST') {
        return saveUser(req, res);
    }
    if (req.method === 'DELETE') {
        return deleteUser(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
