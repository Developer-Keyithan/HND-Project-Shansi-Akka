# Integration Guide - HealthyBite Platform

This guide explains how to configure and use all the integrated services.

## ⚙️ Application Configuration (AppConfig)

The platform uses a centralized configuration file located at `client/app.config.js`. This file controls various aspects of the application.

### Key Settings:
- `tax`: Percentage tax applied to orders (e.g., `5` for 5%).
- `deliveryFee`: Fixed delivery fee in LKR.
- `app.version`: Current version of the application.
- `api.url`: Base URL for API calls.

### Usage in Code:
```javascript
import { AppConfig } from '/app.config.js';

// Accessing settings
const taxAmount = total * (AppConfig.tax / 100);
const totalWithFee = total + AppConfig.deliveryFee;
```

---

### Setup Steps:
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create email service (Gmail, Outlook, etc.)
3. Create email templates:
   - **Login Template**: Notify users of login from new device
   - **Transaction Template**: Send order confirmation emails
   - **Delivery Template**: Send delivery status updates
   - **Forgot Password Template**: Send password reset links

### Configuration:
Update `shared/config.js`:
```javascript
emailjs: {
    serviceId: 'your_service_id',
    publicKey: 'your_public_key',
    templates: {
        login: 'your_login_template_id',
        transaction: 'your_transaction_template_id',
        delivery: 'your_delivery_template_id',
        forgotPassword: 'your_forgot_password_template_id'
    }
}
```

### Template Variables:

**Login Template:**
- `to_email` - User's email
- `user_email` - User's email
- `login_time` - Login timestamp
- `device` - Device type
- `browser` - Browser name
- `ip_address` - IP address
- `location` - Location (if available)

**Transaction Template:**
- `to_email` - User's email
- `order_id` - Order ID
- `order_total` - Total amount
- `order_date` - Order date
- `items` - Order items
- `payment_status` - Payment status

**Delivery Template:**
- `to_email` - User's email
- `order_id` - Order ID
- `delivery_status` - Delivery status
- `estimated_delivery` - Estimated delivery time
- `delivery_address` - Delivery address
- `tracking_link` - Tracking link

## 📁 Google Drive Integration

### Setup Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Create a folder in Google Drive for uploads
6. Get the folder ID from the URL

### Configuration:
Update `shared/config.js`:
```javascript
googleDrive: {
    apiKey: 'your_api_key',
    clientId: 'your_client_id',
    folderId: 'your_folder_id'
}
```

### Usage:
```javascript
// Upload image
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await window.GoogleDriveService.uploadImage(file, 'product-image.jpg');
if (result.success) {
    console.log('Image URL:', result.thumbnailLink);
}
```

## 🔐 Social Authentication

### Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Update `shared/config.js`:
```javascript
socialAuth: {
    google: {
        clientId: 'your_google_client_id'
    }
}
```

### Facebook Login:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Get App ID
5. Update `shared/config.js`:
```javascript
socialAuth: {
    facebook: {
        appId: 'your_facebook_app_id'
    }
}
```

### Twitter/X Login:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get API keys
4. Configure OAuth 2.0
5. Update `shared/config.js`:
```javascript
socialAuth: {
    twitter: {
        apiKey: 'your_twitter_api_key'
    }
}
```

### Instagram Login:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create Instagram app
3. Get Client ID
4. Update `shared/config.js`:
```javascript
socialAuth: {
    instagram: {
        clientId: 'your_instagram_client_id'
    }
}
```

### TikTok Login:
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create an app
3. Get Client Key
4. Update `shared/config.js`:
```javascript
socialAuth: {
    tiktok: {
        clientKey: 'your_tiktok_client_key'
    }
}
```

## 📊 Logging System

### Configuration:
Logging is automatically enabled. Logs are sent to `/api/logs` endpoint.

### Usage:
```javascript
// Log info
window.Logger.info('User action', { action: 'click', element: 'button' });

// Log warning
window.Logger.warn('Low stock', { productId: 123 });

// Log error
window.Logger.error('API error', error, { endpoint: '/api/products' });

// Log debug
window.Logger.debug('Debug info', { data: someData });
```

### Viewing Logs:
- Logs are stored in MongoDB `logs` collection
- Access via API: `GET /api/logs?level=error&limit=100`
- Logs include: timestamp, level, message, device info, user info

## 🔧 Fixing Routing

### Automatic Fix:
Run the routing fix script:
```bash
node scripts/fix-routing.js
```

### Manual Fix:
Ensure all links use absolute paths starting with `/`:
- ❌ `href="pages/menu.html"`
- ✅ `href="/pages/menu.html"`

### CSS Linking:
All CSS files should use absolute paths:
- ❌ `href="../style.css"`
- ✅ `href="/style.css"`

## 📝 Environment Variables

Add to Vercel environment variables:

```
MONGODB_URI=your_mongodb_uri
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 🚀 Deployment Checklist

- [ ] Configure EmailJS templates and keys
- [ ] Set up Google Drive API and folder
- [ ] Configure social auth providers
- [ ] Add environment variables to Vercel
- [ ] Run routing fix script
- [ ] Test all authentication flows
- [ ] Test email notifications
- [ ] Test image uploads
- [ ] Verify logging is working
- [ ] Test social login buttons

## 📞 Support

For issues or questions:
- Check logs: `/api/logs`
- Review browser console
- Check EmailJS dashboard
- Verify API credentials


