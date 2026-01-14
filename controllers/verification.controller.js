import { sendWelcomeEmail, sendLoginNotification, transporter } from './email.controller.js';
import User from '../models/user.model.js';
import connectDB from "../lib/db.js";
import crypto from 'crypto';

import PendingRegistration from '../models/pendingRegistration.model.js';

// Temporary storage for Login OTPs
const pendingLogins = new Map();

export const sendVerificationEmail = async (email, token, type = 'registration') => {
    const subject = type === 'login' ? 'Login Verification Code - HealthyBite' : 'Verify Your Email - HealthyBite';
    const title = type === 'login' ? 'Login Verification' : 'Verify Your Email';

    try {
        const mailOptions = {
            from: `"HealthyBite Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>${title}</h2>
                    <p>Please use the following token to complete your request:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block;">${token}</h1>
                    <p>This token will expire in 10 minutes.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

export async function initiateRegistration(req, res) {
    try {
        await connectDB();
        const { name, email, password, phone, address } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Generate Token
        const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store persistently in DB (handles server restarts)
        // First clean up any old pending for this email
        await PendingRegistration.deleteMany({ email });

        await PendingRegistration.create({
            email,
            token,
            userData: { name, email, password, phone, address },
            expiresAt
        });

        // Send Email
        await sendVerificationEmail(email, token, 'registration');

        res.status(200).json({ success: true, message: "Verification email sent", email });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function verifyRegistration(req, res) {
    try {
        await connectDB();
        const { email, token } = req.body;

        const record = await PendingRegistration.findOne({ email });

        if (!record) {
            return res.status(400).json({ error: "No pending registration found or expired." });
        }

        if (Date.now() > new Date(record.expiresAt).getTime()) {
            await PendingRegistration.deleteOne({ email });
            return res.status(400).json({ error: "Token expired. Please register again.", expired: true });
        }

        if (record.token !== token) {
            return res.status(400).json({ error: "Invalid token" });
        }

        // Success - Create User
        const { userData } = record;
        const newUser = new User({
            ...userData,
            role: 'consumer',
            emailVerified: true
        });

        await newUser.save();
        await PendingRegistration.deleteOne({ email }); // Cleanup

        // Send Welcome Email
        sendWelcomeEmail(userData.email, userData.name).catch(console.error);

        // Auto Login: Return user & token so they don't have to login manually
        // Note: You need to import generateToken logic or similar if you want full auto-login here.
        // For now, let's keep it as is (redirect to login) or simpler flow.

        res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --- Login Verification Logic ---

export async function storeLoginOTP(email, token) {
    pendingLogins.set(email, {
        token,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    });
}

export async function verifyLogin(req, res) {
    try {
        const { email, token } = req.body;
        const record = pendingLogins.get(email);

        if (!record) {
            return res.status(400).json({ error: "Session expired or invalid. Try logging in again." });
        }

        if (Date.now() > record.expiresAt) {
            pendingLogins.delete(email);
            return res.status(400).json({ error: "Code expired", expired: true });
        }

        if (record.token !== token) {
            return res.status(400).json({ error: "Invalid code" });
        }

        pendingLogins.delete(email); // Cleanup

        // Return success so frontend can proceed (backend auth controller logic might be needed here 
        // if we want to issue token HERE. But `auth.controller.js` has the JWT logic.)
        // Ideally, we move JWT generation here or call a shared helper.
        // For simpler refactor: We will issue the token from HERE.

        await connectDB();
        const user = await User.findOne({ email });
        // We assume user exists because initiateLogin checked it.

        // Import createToken from auth.controller is tricky due to circular deps.
        // Let's implement basic token return or assume auth controller handles it?
        // Actually, let's look at how auth.controller does it.
        // It uses `jwt.sign`. We should do the same.

        // We need to dynamic import or duplicate simple JWT logic? 
        // Better: We return success: true. The actual token generation implies we need the secret.

        // Let's make this simple: The Auth Controller calls initiate, returns 'verification_required'.
        // Then this `verifyLogin` endpoint validates OTP. If valid, IT generates the token.

        // We need 'jsonwebtoken'
        const jwt = (await import('jsonwebtoken')).default;

        const authToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret_key_123',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: "Login verified",
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function resendVerification(req, res) {
    try {
        await connectDB();
        const { email, type } = req.body; // type: 'registration' or 'login'

        let record;
        let map;

        if (type === 'login') {
            map = pendingLogins;
            record = pendingLogins.get(email);

            // Robustness check
            if (!record) {
                // DB connection already ensured above
                const user = await User.findOne({ email });
                if (user) {
                    record = {
                        token: crypto.randomBytes(3).toString('hex').toUpperCase(),
                        expiresAt: Date.now() + 10 * 60 * 1000
                    };
                    pendingLogins.set(email, record);
                }
            }
        } else {
            // Registration mode - Use DB
            const pendingReg = await PendingRegistration.findOne({ email });
            if (!pendingReg) {
                return res.status(400).json({ error: "Session expired. Please start over." });
            }

            // New Token
            const token = crypto.randomBytes(3).toString('hex').toUpperCase();
            pendingReg.token = token;
            pendingReg.expiresAt = Date.now() + 10 * 60 * 1000;
            await pendingReg.save();

            await sendVerificationEmail(email, token, 'registration');
            res.status(200).json({ success: true, message: "New verification code sent" });
            return;
        }

        if (!record) {
            return res.status(400).json({ error: "Session expired. Please start over." });
        }

        // New Token (Login Flow)
        const token = crypto.randomBytes(3).toString('hex').toUpperCase();
        record.token = token;
        record.expiresAt = Date.now() + 10 * 60 * 1000;
        map.set(email, record);

        await sendVerificationEmail(email, token, type || 'registration');
        res.status(200).json({ success: true, message: "New verification code sent" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
