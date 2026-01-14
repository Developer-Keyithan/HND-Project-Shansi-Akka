import connectDB from '../../lib/db.js';
import { login, logout, googleLogin, facebookLogin, registerUser, getCurrentUser } from '../../controllers/auth.controller.js';
import { initiateRegistration, verifyRegistration, verifyLogin, resendVerification } from '../../controllers/verification.controller.js';
import { Auth } from '../../middlewares/auth.middleware.js';

export default async function handler(req, res) {
    await connectDB();
    const { action } = req.query;

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    try {
        switch (action) {
            case 'login': return login(req, res);
            case 'register': return registerUser(req, res);
            case 'logout': return logout(req, res);
            case 'google': return googleLogin(req, res);
            case 'facebook': return facebookLogin(req, res);
            case 'me': return new Auth().middleware()(req, res, () => getCurrentUser(req, res));
            case 'register-init': return initiateRegistration(req, res);
            case 'verify': return verifyRegistration(req, res);
            case 'verify-login': return verifyLogin(req, res);
            case 'resend-verify': return resendVerification(req, res);
            default: return res.status(404).json({ error: `Auth action '${action}' not found` });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
