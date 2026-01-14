import { handleLogs } from '../../controllers/log.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET' || req.method === 'POST') {
        return handleLogs(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
