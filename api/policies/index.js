import { getPolicy } from '../../controllers/policy.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getPolicy(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
