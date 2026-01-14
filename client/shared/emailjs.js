
// Mock Email Service Implementation
export class EmailService {
    constructor() {
        console.log('EmailService initialized (Mock)');
    }

    async sendEmail(templateId, templateParams) {
        console.log(`[Mock Email] Sending template ${templateId} with params:`, templateParams);
        return Promise.resolve({ status: 200, text: 'OK' });
    }

    async sendForgotPassword(email, token, resetLink) {
        return this.sendEmail('forgot_password', {
            to_email: email,
            reset_token: token,
            reset_link: resetLink
        });
    }
}

export const EmailServiceImpl = new EmailService();
