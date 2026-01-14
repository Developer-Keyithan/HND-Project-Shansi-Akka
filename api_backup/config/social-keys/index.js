import { getSocialKeys } from '../../../controllers/config.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getSocialKeys(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
