import { submitContactForm, getContactMessages } from '../../controllers/contact.controller.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return submitContactForm(req, res);
    } else if (req.method === 'GET') {
        return getContactMessages(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
