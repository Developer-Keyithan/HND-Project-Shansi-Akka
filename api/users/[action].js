import connectDB from '../../lib/db.js';
import { getUserById, updateUserProfile, updateUserCart, deleteUser } from '../../controllers/user.controller.js';

export default async function handler(req, res) {
    await connectDB();
    const { action } = req.query;

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    try {
        switch (action) {
            case 'profile':
                if (req.method === 'POST') return updateUserProfile(req, res); // Handle update
                return getUserById(req, res); // Handle get
            case 'update-profile': return updateUserProfile(req, res); // Explicit update
            case 'cart': return updateUserCart(req, res);
            case 'delete': return deleteUser(req, res);
            default: return res.status(404).json({ error: `User action '${action}' not found` });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
