import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '') // Remove spaces if present
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email Server Verification Error:', error);
        console.error('Make sure EMAIL_USER and EMAIL_PASS are correct in .env');
        console.error('For Gmail, use App Password, not login password.');
    } else {
        console.log('Email Server is ready to take our messages');
    }
});

export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: `"HealthyBite" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to HealthyBite!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #4CAF50;">Welcome to HealthyBite, ${name}!</h1>
                    <p>We are thrilled to have you on board. Get ready to explore delicious and healthy meals delivered right to your doorstep.</p>
                    <p>Start exploring our menu today!</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>The HealthyBite Team</strong></p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

export const sendLoginNotification = async (email, deviceInfo, ip) => {
    try {
        const mailOptions = {
            from: `"HealthyBite Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'New Login Alert',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>New Login Detected</h2>
                    <p>We noticed a new login to your HealthyBite account.</p>
                    <ul>
                        <li><strong>Device:</strong> ${deviceInfo.device} (${deviceInfo.os} - ${deviceInfo.browser})</li>
                        <li><strong>IP Address:</strong> ${ip}</li>
                        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <p>If this was you, you can ignore this email. If not, please reset your password immediately.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending login notification:', error);
    }
};
