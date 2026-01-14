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
            console.warn('Google SocialAuth not properly initialized, retrying init...');
            await this.init();
            if (!this.googleSDKLoaded) throw new Error('Google SocialAuth not properly initialized');
        }

        return new Promise((resolve, reject) => {
            try {
                // If it's a retry or button click, we need to re-initialize to attach callback?
                // Actually google.accounts.id.prompt() can be called if initialized.
                // We re-initialize to be safe with the new callback promise.
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
                    },
                    auto_select: false, // Don't auto select to allow account switching
                    cancel_on_tap_outside: true
                });

                // Show the prompt (One Tap)
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.warn("Google One Tap suppressed:", notification.getNotDisplayedReason());
                        // If suppressed, we might want to tell user or fallback.
                        // For custom button, we can't do much else with 'prompt'.
                        // Ideally we should renderButton into a hidden div and click it, 
                        // but that's blocked by browsers.
                        // The user should have the real button visible if this fails.
                    }
                });
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

    async renderGoogleButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[SocialAuth] Container #${containerId} NOT FOUND in DOM.`);
            return;
        }

        if (!this.googleSDKLoaded) {
            await this.init();
        }

        if (!this.googleSDKLoaded) {
            console.error('[SocialAuth] Failed to load Google SDK.');
            return;
        }

        // We must Initialize first to set the callback
        try {
            google.accounts.id.initialize({
                client_id: this.googleClientId,
                callback: async (response) => {
                    if (window.handleGoogleLoginResponse) {
                        window.handleGoogleLoginResponse(response);
                    } else {
                        console.error('[SocialAuth] window.handleGoogleLoginResponse is undefined');
                    }
                }
            });

            google.accounts.id.renderButton(
                container,
                { theme: "outline", size: "large", width: "100%" }
            );
        } catch (err) {
            console.error('[SocialAuth] Error rendering Google button:', err);
        }
    }
}

export const SocialAuth = new SocialAuthService();
