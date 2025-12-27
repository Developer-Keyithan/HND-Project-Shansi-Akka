// Social Authentication Integration

class SocialAuth {
    constructor() {
        this.config = window.Config?.socialAuth || {};
        this.loadProviders();
    }

    loadProviders() {
        // Load Google Sign-In
        this.loadGoogleSignIn();
        
        // Load Facebook SDK
        // this.loadFacebookSDK();
        
        // Load Twitter SDK
        // this.loadTwitterSDK();
    }

    // Google Sign-In
    loadGoogleSignIn() {
        if (document.getElementById('google-signin-script')) return;

        const script = document.createElement('script');
        script.id = 'google-signin-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    async signInWithGoogle() {
        return new Promise((resolve, reject) => {
            if (!window.google) {
                reject(new Error('Google Sign-In SDK not loaded'));
                return;
            }

            window.google.accounts.id.initialize({
                client_id: this.config.google?.clientId,
                callback: async (response) => {
                    try {
                        const userData = await this.verifyGoogleToken(response.credential);
                        resolve(userData);
                    } catch (error) {
                        reject(error);
                    }
                }
            });

            window.google.accounts.id.prompt();
        });
    }

    async verifyGoogleToken(token) {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();
            if (data.success) {
                return data.user;
            }
            throw new Error(data.error || 'Google authentication failed');
        } catch (error) {
            throw error;
        }
    }

    // Facebook Sign-In
    loadFacebookSDK() {
        if (window.FB) return;

        window.fbAsyncInit = function() {
            FB.init({
                appId: window.Config?.socialAuth?.facebook?.appId,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };

        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    async signInWithFacebook() {
        return new Promise((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }

            window.FB.login(async (response) => {
                if (response.authResponse) {
                    try {
                        const userData = await this.verifyFacebookToken(response.authResponse.accessToken);
                        resolve(userData);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Facebook login cancelled'));
                }
            }, { scope: 'email,public_profile' });
        });
    }

    async verifyFacebookToken(accessToken) {
        try {
            const response = await fetch('/api/auth/facebook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accessToken })
            });

            const data = await response.json();
            if (data.success) {
                return data.user;
            }
            throw new Error(data.error || 'Facebook authentication failed');
        } catch (error) {
            throw error;
        }
    }

    // Twitter/X Sign-In
    loadTwitterSDK() {
        // Twitter OAuth 2.0 implementation
        // Note: Twitter API requires server-side implementation
    }

    async signInWithTwitter() {
        // Redirect to Twitter OAuth
        const twitterAuthUrl = `/api/auth/twitter`;
        window.location.href = twitterAuthUrl;
    }

    // Instagram Sign-In
    async signInWithInstagram() {
        const instagramAuthUrl = `/api/auth/instagram?client_id=${this.config.instagram?.clientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/instagram-callback.html')}&response_type=code&scope=user_profile,user_media`;
        window.location.href = instagramAuthUrl;
    }

    // TikTok Sign-In
    async signInWithTikTok() {
        const tiktokAuthUrl = `/api/auth/tiktok?client_key=${this.config.tiktok?.clientKey}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/tiktok-callback.html')}&response_type=code&scope=user.info.basic`;
        window.location.href = tiktokAuthUrl;
    }
}

// Initialize SocialAuth
window.SocialAuth = new SocialAuth();


