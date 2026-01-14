import { confirmPayment } from '../../controllers/payment.controller.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return confirmPayment(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
