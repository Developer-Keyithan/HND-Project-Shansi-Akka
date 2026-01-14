import connectDB from "../lib/db.js";
import Translation from "../models/translation.model.js";

// Get Translations for a Language
export async function getTranslations(req, res) {
    try {
        await connectDB();
        const { lang } = req.query; // 'en', 'ta', etc.
        const targetLang = lang || 'en';

        const translation = await Translation.findOne({ lang: targetLang });

        if (!translation) {
            // Fallback to English if not found
            if (targetLang !== 'en') {
                const fallback = await Translation.findOne({ lang: 'en' });
                if (fallback) {
                    return res.status(200).json({ success: true, translations: fallback.translations });
                }
            }
            return res.status(404).json({ success: false, error: "Translations not found" });
        }

        return res.status(200).json({ success: true, translations: translation.translations });

    } catch (error) {
        console.error("Get Translations Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
