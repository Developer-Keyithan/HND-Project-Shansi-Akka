
// Social Auth Utility (Mock)
export class SocialAuthService {
    constructor() {
        console.log('SocialAuthService initialized (Mock)');
    }

    async signInWithGoogle() {
        console.log('Mocking Google Sign-In...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    id: 'google_123456789',
                    name: 'Google User',
                    email: 'google_user@example.com',
                    role: 'consumer',
                    provider: 'google',
                    picture: 'https://lh3.googleusercontent.com/a-/AOh14Gg...'
                });
            }, 1000);
        });
    }

    async signInWithFacebook() {
        console.log('Mocking Facebook Sign-In...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    id: 'fb_987654321',
                    name: 'Facebook User',
                    email: 'facebook_user@example.com',
                    role: 'consumer',
                    provider: 'facebook',
                    picture: 'https://platform-lookaside.fbsbx.com/platform/profilepic/...'
                });
            }, 1000);
        });
    }
}

export const SocialAuth = new SocialAuthService();
