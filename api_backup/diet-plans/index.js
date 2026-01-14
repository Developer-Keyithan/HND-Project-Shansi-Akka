import { getDietPlans } from '../../controllers/dietplan.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getDietPlans(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
