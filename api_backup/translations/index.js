import { getTranslations } from '../../controllers/translation.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getTranslations(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
