import { API } from "./api.js";

// Social Auth Utility
export class SocialAuthService {
    constructor() {
        this.googleSDKLoaded = false;
        this.facebookSDKLoaded = false;
        this.googleClientId = null;
        this.facebookAppId = null;
    }

    async init() {
        if (this.googleSDKLoaded && this.facebookSDKLoaded) return;

        try {
            const keys = await API.getSocialKeys();
            this.googleClientId = keys.googleClientId;
            this.facebookAppId = keys.facebookAppId;

            const promises = [];

            if (this.googleClientId && !this.googleSDKLoaded) {
                promises.push(this.loadScript('https://accounts.google.com/gsi/client').then(() => {
                    this.googleSDKLoaded = true;
                }));
            }

            if (this.facebookAppId && !this.facebookSDKLoaded) {
                promises.push(this.loadScript('https://connect.facebook.net/en_US/sdk.js').then(() => {
                    window.fbAsyncInit = () => {
                        FB.init({
                            appId: this.facebookAppId,
                            cookie: true,
                            xfbml: true,
                            version: 'v18.0'
                        });
                        this.facebookSDKLoaded = true;
                    };
                }));
            }

            await Promise.all(promises);
        } catch (error) {
            console.error('Failed to initialize SocialAuth:', error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async signInWithGoogle() {
        await this.init();

        if (!this.googleSDKLoaded || !this.googleClientId) {
            throw new Error('Google SocialAuth not properly initialized');
        }

        return new Promise((resolve, reject) => {
            try {
                google.accounts.id.initialize({
                    client_id: this.googleClientId,
                    callback: async (response) => {
                        try {
                            const result = await API.googleLogin(response.credential);
                            if (result.success) {
                                resolve(result);
                            } else {
                                reject(new Error(result.error || 'Google login failed'));
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
                google.accounts.id.prompt();
            } catch (error) {
                reject(error);
            }
        });
    }

    async signInWithFacebook() {
        await this.init();

        if (!this.facebookSDKLoaded) {
            // Wait a bit more for fbAsyncInit
            await new Promise(r => setTimeout(r, 1000));
            if (!this.facebookSDKLoaded) throw new Error('Facebook SocialAuth not properly initialized');
        }

        return new Promise((resolve, reject) => {
            FB.login(async (response) => {
                if (response.authResponse) {
                    try {
                        const result = await API.facebookLogin(response.authResponse.accessToken);
                        if (result.success) {
                            resolve(result);
                        } else {
                            reject(new Error(result.error || 'Facebook login failed'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User cancelled login or did not fully authorize.'));
                }
            }, { scope: 'public_profile,email' });
        });
    }

    renderGoogleButton(containerId) {
        if (!this.googleSDKLoaded) return;
        google.accounts.id.renderButton(
            document.getElementById(containerId),
            { theme: "outline", size: "large", width: "100%" }
        );
    }
}

export const SocialAuth = new SocialAuthService();
