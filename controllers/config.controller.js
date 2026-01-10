import connectDB from "../lib/db.js";
import Config from "../models/config.model.js";

// Get App Configuration
export async function getConfig(req, res) {
    try {
        await connectDB();

        // Find the main config document (assuming singleton or key 'app_settings')
        let config = await Config.findOne({ key: 'app_settings' });

        // If not found, return default or empty
        if (!config) {
            return res.status(200).json({
                success: true,
                config: {
                    tax: 5,
                    deliveryFee: 200,
                    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '', // Fallback
                    maintenanceMode: false
                }
            });
        }

        // Return only public info
        return res.status(200).json({
            success: true,
            config: {
                tax: config.tax,
                deliveryFee: config.deliveryFee,
                stripePublishableKey: config.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY,
                currencyRates: config.currencyRates,
                maintenanceMode: config.maintenanceMode,
                ctaOffer: config.ctaOffer
            }
        });

    } catch (error) {
        console.error("Get Config Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


// Get Stripe Key specifically (if requested as separate endpoint)
export async function getStripeKey(req, res) {
    try {
        await connectDB();
        const config = await Config.findOne({ key: 'app_settings' });

        const publishableKey = config?.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            return res.status(404).json({ success: false, error: "Stripe key not found" });
        }

        return res.status(200).json({ success: true, publishableKey });
    } catch (error) {
        console.error("Get Stripe Key Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getSocialKeys(req, res) {
    try {
        res.status(200).json({
            success: true,
            googleClientId: process.env.GOOGLE_CLIENT_ID,
            facebookAppId: process.env.FACEBOOK_APP_ID
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getCTAOffer(req, res) {
    try {
        await connectDB();
        const config = await Config.findOne({ key: 'app_settings' });
        return res.status(200).json({ success: true, offer: config?.ctaOffer || null });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
