import connectDB from '../../lib/db.js';
import { getConfig, getStripeKey, getSocialKeys, getCTAOffer } from '../../controllers/config.controller.js';
import { getReviews, addReview, toggleFeatured } from '../../controllers/review.controller.js';
import { getFaqs } from '../../controllers/faq.controller.js';
import { getTeamMembers } from '../../controllers/teammember.controller.js';
import { submitContactForm, getContactMessages } from '../../controllers/contact.controller.js';
import { getDietPlans } from '../../controllers/dietplan.controller.js';
import { getPolicy } from '../../controllers/policy.controller.js';
import { getTranslations } from '../../controllers/translation.controller.js';
import { handleLogs } from '../../controllers/log.controller.js';
import { getStats } from '../../controllers/stats.controller.js';
import { getCategories } from '../../controllers/category.controller.js';

export default async function handler(req, res) {
    await connectDB();
    const { endpoint } = req.query;

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    try {
        switch (endpoint) {
            case 'config': return getConfig(req, res);
            case 'stripe-key': return getStripeKey(req, res);
            case 'social-keys': return getSocialKeys(req, res);
            case 'cta-offer': return getCTAOffer(req, res);
            case 'reviews':
                if (req.body.reviewId !== undefined) return toggleFeatured(req, res);
                if (req.method === 'POST') return addReview(req, res);
                return getReviews(req, res);
            case 'faqs': return getFaqs(req, res);
            case 'team-members': return getTeamMembers(req, res);
            case 'contact':
                if (req.method === 'POST') return submitContactForm(req, res);
                return getContactMessages(req, res);
            case 'diet-plans': return getDietPlans(req, res);
            case 'policies': return getPolicy(req, res);
            case 'translations': return getTranslations(req, res);
            case 'logs': return handleLogs(req, res);
            case 'stats': return getStats(req, res);
            case 'categories': return getCategories(req, res);
            default: return res.status(404).json({ error: `Common endpoint '${endpoint}' not found` });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
