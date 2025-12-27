// EmailJS Integration for HealthyBite Platform

class EmailService {
    constructor() {
        this.serviceId = window.Config?.emailjs?.serviceId || '';
        this.publicKey = window.Config?.emailjs?.publicKey || '';
        this.templates = window.Config?.emailjs?.templates || {};
        
        // Load EmailJS SDK
        this.loadEmailJS();
    }

    async loadEmailJS() {
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                if (this.publicKey) {
                    emailjs.init(this.publicKey);
                }
            };
            document.head.appendChild(script);
        }
    }

    async sendEmail(templateName, templateParams) {
        try {
            if (typeof emailjs === 'undefined') {
                console.warn('EmailJS not loaded yet');
                return { success: false, error: 'EmailJS SDK not loaded' };
            }

            const templateId = this.templates[templateName];
            if (!templateId) {
                console.error(`Template ${templateName} not configured`);
                return { success: false, error: 'Template not found' };
            }

            const response = await emailjs.send(
                this.serviceId,
                templateId,
                templateParams
            );

            return { success: true, response };
        } catch (error) {
            console.error('EmailJS error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send login notification
    async notifyLogin(userEmail, deviceInfo, ipAddress) {
        const templateParams = {
            to_email: userEmail,
            user_email: userEmail,
            login_time: new Date().toLocaleString(),
            device: deviceInfo.device || 'Unknown',
            browser: deviceInfo.browser || 'Unknown',
            ip_address: ipAddress || 'Unknown',
            location: deviceInfo.location || 'Unknown'
        };

        return await this.sendEmail('login', templateParams);
    }

    // Send transaction notification
    async notifyTransaction(userEmail, orderData) {
        const templateParams = {
            to_email: userEmail,
            user_email: userEmail,
            order_id: orderData.orderId,
            order_total: `LKR ${orderData.total.toFixed(2)}`,
            order_date: new Date(orderData.date || Date.now()).toLocaleString(),
            items: orderData.items.map(item => `${item.name} x${item.quantity}`).join(', '),
            payment_status: orderData.paymentStatus || 'pending'
        };

        return await this.sendEmail('transaction', templateParams);
    }

    // Send delivery notification
    async notifyDelivery(userEmail, deliveryData) {
        const templateParams = {
            to_email: userEmail,
            user_email: userEmail,
            order_id: deliveryData.orderId,
            delivery_status: deliveryData.status,
            estimated_delivery: deliveryData.estimatedTime || 'N/A',
            delivery_address: deliveryData.address,
            tracking_link: `${window.location.origin}/pages/delivery-tracking.html?orderId=${deliveryData.orderId}`
        };

        return await this.sendEmail('delivery', templateParams);
    }

    // Send forgot password email
    async sendForgotPassword(userEmail, resetToken, resetLink) {
        const templateParams = {
            to_email: userEmail,
            user_email: userEmail,
            reset_token: resetToken,
            reset_link: resetLink,
            expiry_time: '24 hours'
        };

        return await this.sendEmail('forgotPassword', templateParams);
    }
}

// Initialize EmailService
window.EmailService = new EmailService();


