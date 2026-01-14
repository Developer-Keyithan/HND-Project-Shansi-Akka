
// Mock Email Service Implementation
export class EmailService {

    async sendEmail(templateId, templateParams) {
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
