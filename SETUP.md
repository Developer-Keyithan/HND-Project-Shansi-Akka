# Vercel Hosting Setup Guide for HealthyBite Platform

This guide will walk you through deploying the HealthyBite platform on Vercel.

## 📋 Prerequisites

Before starting, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
4. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## 🔧 Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Cluster

1. Log in to MongoDB Atlas
2. Click "Create" to create a new cluster
3. Choose a cloud provider and region (closest to your users)
4. Select the free tier (M0) for development
5. Click "Create Cluster"

### 1.2 Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set user privileges to "Atlas admin" (or custom role)
6. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add specific IPs or Vercel IP ranges
5. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `healthybite`)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthybite?retryWrites=true&w=majority
```

## 💳 Step 2: Set Up Stripe

### 2.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Go to Dashboard

### 2.2 Get API Keys

1. In Stripe Dashboard, go to "Developers" > "API keys"
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_`)

**Note**: For production, use live keys (starts with `pk_live_` and `sk_live_`)

### 2.3 Configure Webhooks (Optional but Recommended)

1. Go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Add your Vercel URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret

## 🚀 Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: "Other"
   - Root Directory: `./` (or leave default)
   - Build Command: Leave empty (or `echo 'No build step'`)
   - Output Directory: Leave empty

3. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthybite?retryWrites=true&w=majority
   STRIPE_SECRET_KEY = sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY = pk_test_your_stripe_publishable_key
   ```

   **Important**: 
   - Use "Production", "Preview", and "Development" environments
   - For production, use live Stripe keys
   - Keep secrets secure and never commit them to Git

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `https://your-project.vercel.app`

### 3.3 Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGODB_URI
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY

# Deploy to production
vercel --prod
```

## 🔐 Step 4: Configure Environment Variables in Vercel

### 4.1 Add Environment Variables

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add each variable:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `MONGODB_URI` | Your MongoDB connection string | All |
   | `STRIPE_SECRET_KEY` | Your Stripe secret key | All |
   | `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | All |

4. Select environments (Production, Preview, Development)
5. Click "Save"

### 4.2 Verify Configuration

After adding variables, redeploy your project:
- Go to "Deployments"
- Click the three dots on latest deployment
- Select "Redeploy"

## 🌐 Step 5: Configure Custom Domain (Optional)

1. Go to "Settings" > "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## ✅ Step 6: Verify Deployment

### 6.1 Test API Endpoints

1. Test authentication:
   ```bash
   curl https://your-domain.vercel.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

2. Test products:
   ```bash
   curl https://your-domain.vercel.app/api/products
   ```

### 6.2 Test Frontend

1. Visit your deployed site
2. Test user registration
3. Test product browsing
4. Test cart functionality
5. Test payment flow (use Stripe test cards)

## 🔍 Step 7: Monitor and Debug

### 7.1 View Logs

1. Go to "Deployments" in Vercel Dashboard
2. Click on a deployment
3. Click "Functions" tab to view serverless function logs
4. Check for any errors

### 7.2 Common Issues

**Issue**: MongoDB connection fails
- **Solution**: Check network access in MongoDB Atlas allows Vercel IPs
- Verify connection string is correct
- Ensure database user has proper permissions

**Issue**: Stripe payment fails
- **Solution**: Verify API keys are correct
- Check Stripe dashboard for error logs
- Ensure currency is set to 'lkr' in payment intent

**Issue**: Environment variables not working
- **Solution**: Redeploy after adding variables
- Check variable names match exactly
- Verify variables are set for correct environment

## 📊 Step 8: Production Checklist

Before going live:

- [ ] Use production Stripe keys
- [ ] Set up MongoDB production cluster
- [ ] Configure proper CORS settings
- [ ] Set up custom domain with SSL
- [ ] Enable error logging
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Test all payment flows
- [ ] Test all user roles
- [ ] Set up backup strategy for database
- [ ] Configure rate limiting
- [ ] Set up email notifications
- [ ] Test on multiple devices/browsers

## 🔄 Step 9: Continuous Deployment

Vercel automatically deploys on:
- Push to main/master branch (production)
- Push to other branches (preview)
- Pull requests (preview)

To disable auto-deployment:
1. Go to "Settings" > "Git"
2. Configure deployment settings

## 📝 Step 10: Update Stripe Keys in Frontend

The frontend needs the Stripe publishable key. Update `pages/payment.js`:

```javascript
// Option 1: Fetch from API (recommended)
const keyResponse = await fetch('/api/config/stripe-key');
const keyData = await keyResponse.json();
stripe = Stripe(keyData.publishableKey);

// Option 2: Use environment variable (if using build-time injection)
stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
```

## 🆘 Troubleshooting

### Deployment Fails

1. Check build logs in Vercel Dashboard
2. Verify `package.json` has correct dependencies
3. Check `vercel.json` configuration
4. Ensure Node.js version is compatible (18+)

### API Functions Not Working

1. Check function logs in Vercel Dashboard
2. Verify environment variables are set
3. Test endpoints directly with curl/Postman
4. Check MongoDB connection
5. Verify Stripe API keys

### Database Connection Issues

1. Whitelist Vercel IP ranges in MongoDB Atlas
2. Check connection string format
3. Verify database user permissions
4. Test connection string locally

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Stripe Documentation](https://stripe.com/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs)

## 🎉 Success!

Your HealthyBite platform should now be live on Vercel! 

Visit your deployment URL and start using the platform.

---

**Need Help?** Contact support at info@helthybite.com

