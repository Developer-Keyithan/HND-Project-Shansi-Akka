import { getTeamMembers } from '../../controllers/teammember.controller.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getTeamMembers(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
