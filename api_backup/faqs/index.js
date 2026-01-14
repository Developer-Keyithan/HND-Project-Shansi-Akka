import { getFaqs } from '../../controllers/faq.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getFaqs(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
