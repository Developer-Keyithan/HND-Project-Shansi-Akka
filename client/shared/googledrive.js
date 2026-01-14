
// Google Drive Service for Client-side Uploads
export class GoogleDriveService {
    constructor() {
        this.apiKey = null;
        this.clientId = null;
        this.folderId = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // We'll assume these might be in AppConfig or fetched
            // For now, let's try to get them from social keys if they overlap
            const { API } = await import("./api.js");
            const keys = await API.getSocialKeys();

            this.clientId = keys.googleClientId;
            // apiKey and folderId might need to be in AppConfig or fetched separately
            // As a fallback, we'll check AppConfig
            const { AppConfig } = await import("../app.config.js");
            this.apiKey = AppConfig.googleDrive?.apiKey;
            this.folderId = AppConfig.googleDrive?.folderId;

            if (!this.clientId) {
                console.warn('Google Client ID missing for Drive integration');
                return;
            }

            await this.loadScript('https://apis.google.com/js/api.js');
            await this.loadScript('https://accounts.google.com/gsi/client');

            this.isInitialized = true;
        } catch (error) {
            console.error('Google Drive Init Error:', error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async uploadImage(file, fileName) {
        await this.init();

        // This usually requires a picker or a direct upload with a token
        // For direct upload, we need an access token with Drive scope
        return new Promise((resolve, reject) => {
            tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    reject(response);
                }

                const accessToken = response.access_token;
                try {
                    const metadata = {
                        name: fileName || file.name,
                        mimeType: file.type,
                        parents: this.folderId ? [this.folderId] : []
                    };

                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', file);

                    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,thumbnailLink,webViewLink', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + accessToken },
                        body: form
                    });

                    const result = await res.json();

                    // Make file public if needed (requires another API call or folder settings)
                    // For now, return the links
                    resolve({
                        success: true,
                        fileId: result.id,
                        thumbnailLink: result.thumbnailLink,
                        webViewLink: result.webViewLink
                    });
                } catch (err) {
                    reject(err);
                }
            };

            // Request token with Drive scope
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: '', // defined above
            });

            tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }
}

export const GoogleDrive = new GoogleDriveService();
window.GoogleDriveService = GoogleDrive; // For global access as per guide
