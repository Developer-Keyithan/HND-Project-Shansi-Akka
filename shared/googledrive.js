// Google Drive Integration for Image Uploads

class GoogleDriveService {
    constructor() {
        this.apiKey = window.Config?.googleDrive?.apiKey || '';
        this.clientId = window.Config?.googleDrive?.clientId || '';
        this.folderId = window.Config?.googleDrive?.folderId || '';
        this.tokenClient = null;
        this.accessToken = null;
        
        this.loadGoogleAPI();
    }

    async loadGoogleAPI() {
        return new Promise((resolve) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client:picker', () => {
                    this.initializePicker();
                    resolve();
                });
            };
            document.head.appendChild(script);
        });
    }

    async initializePicker() {
        await gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: this.apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
        });
    }

    // Request authorization
    async requestAuth() {
        return new Promise((resolve, reject) => {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                    if (response.access_token) {
                        this.accessToken = response.access_token;
                        resolve(response);
                    } else {
                        reject(new Error('Authorization failed'));
                    }
                }
            });

            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // Upload image to Google Drive
    async uploadImage(file, fileName) {
        try {
            if (!this.accessToken) {
                await this.requestAuth();
            }

            const metadata = {
                name: fileName || file.name,
                parents: this.folderId ? [this.folderId] : []
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const fileData = await response.json();
            
            // Make file publicly accessible
            await this.makeFilePublic(fileData.id);

            return {
                success: true,
                fileId: fileData.id,
                fileName: fileData.name,
                webViewLink: fileData.webViewLink,
                webContentLink: fileData.webContentLink,
                thumbnailLink: `https://drive.google.com/thumbnail?id=${fileData.id}&sz=w1000`
            };
        } catch (error) {
            console.error('Google Drive upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Make file publicly accessible
    async makeFilePublic(fileId) {
        try {
            await gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
        } catch (error) {
            console.error('Error making file public:', error);
        }
    }

    // Get image URL from file ID
    getImageUrl(fileId, size = 'w1000') {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    }
}

// Initialize GoogleDriveService
window.GoogleDriveService = new GoogleDriveService();


