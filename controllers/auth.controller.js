import connectDB from "../lib/db.js";
import User from '../models/user.model.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from "jsonwebtoken";


let tokenBlacklist = [];

export async function registerUser(req, res) {
    try {
        await connectDB();

        const { email, password, name, role, phone, address } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const newUser = new User({
            email: email.toLowerCase(),
            password,
            name,
            role: role || 'consumer',
            phone,
            address,
            cart: req.body.cart || [] // Accept initial cart
        });

        await newUser.save();

        // Send Welcome Email (Non-blocking)
        sendWelcomeEmail(email, name).catch(console.error);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const userData = {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone,
            address: newUser.address,
            cart: newUser.cart
        };

        res.status(201).json({
            success: true,
            user: userData,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

import { storeLoginOTP, sendVerificationEmail } from "./verification.controller.js";
import crypto from 'crypto';

export async function login(req, res) {
    try {
        await connectDB();

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        console.log('Login Attempt for:', email);
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: "User not found" });
        }

        console.log('User found. Comparing passwords...');
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ error: "Invalid password" });
        }

        // --- NEW LOGIC: Trigger Verification ---

        // Generate Code
        const token = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Store Code
        await storeLoginOTP(user.email, token);

        // Send Email
        await sendVerificationEmail(user.email, token, 'login');

        // Generate JWT token
        const loginToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const userData = {
            email: user.email,
            name: user.name,
            role: user.role,
            cart: user.cart.length
        };

        res.status(201).json({
            success: true,
            user: userData,
            token: loginToken
        });

        // Return status telling frontend to redirect
        res.status(200).json({
            success: true,
            verificationRequired: true,
            email: user.email,
            message: "Verification code sent to email"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export function logout(req, res) {
    console.log(req.headers)
    const authHeader = req.headers["authorization"];
    console.log(authHeader)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "Token required" });
    }

    const token = authHeader.split(" ")[1];
    tokenBlacklist.push(token); // add to blacklist

    res.status(200).json({ success: true, message: "Logged out" });
}

export async function facebookLogin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { accessToken } = req.body;
        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;

        if (!accessToken || !appId) {
            return res.status(400).json({ error: 'Missing access token or app ID' });
        }

        // Verify token with Facebook Graph API
        const verifyResponse = await fetch(
            `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
        );
        const userInfo = await verifyResponse.json();

        if (userInfo.error) {
            return res.status(401).json({ error: 'Invalid Facebook token' });
        }

        await connectDB();

        // Find or create user
        let user = await User.findOne({
            email: userInfo.email?.toLowerCase() || `fb_${userInfo.id}@facebook.com`
        });

        if (!user) {
            user = new User({
                email: userInfo.email?.toLowerCase() || `fb_${userInfo.id}@facebook.com`,
                name: userInfo.name,
                authProvider: 'facebook',
                providerId: userInfo.id,
                avatar: userInfo.picture?.data?.url,
                role: 'consumer'
            });
            await user.save();
        } else {
            user.authProvider = 'facebook';
            user.providerId = userInfo.id;
            user.avatar = userInfo.picture?.data?.url;
            user.name = userInfo.name;
            await user.save();
        }

        const userData = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider
        };

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Facebook auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

export async function googleLogin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token } = req.body;
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (!token || !clientId) {
            return res.status(400).json({ error: 'Missing token or client ID' });
        }

        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        await connectDB();

        // Find or create user
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            user = new User({
                email: email.toLowerCase(),
                name: name,
                authProvider: 'google',
                providerId: sub,
                avatar: picture,
                role: 'consumer'
            });
            await user.save();
        } else {
            // Update user info
            user.authProvider = 'google';
            user.providerId = sub;
            user.avatar = picture;
            user.name = name;
            await user.save();
        }

        const userData = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider
        };

        // Send login notification
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        sendLoginNotification(user.email, { device: 'Unknown', os: 'Unknown', browser: 'Unknown' }, ip).catch(console.error);

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

export async function getCurrentUser(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userData = {
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            avatar: user.avatar,
            permissions: user.permissions || [],
        };

        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        console.error('Get Current User Error:', error);
        res.status(500).json({ error: 'Failed to get current user' });
    }
}
