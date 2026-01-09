export const AppConfig = {
    version: "1.4.2",
    app: {
        version: "1.4.2",
        name: "Healthybite",
        url: "http://localhost:3000",
        logo: "http://localhost:3000/logo.png",
        description: "Healthy meals for a healthy body",
        keywords: "healthy meals, healthy body, healthy food, healthy eating",
        author: "Healthybite (PVT) LTD",
        copyright: `Copyright © ${new Date().getFullYear()} Healthybite (PVT) LTD. All rights reserved.`,
        email: "office@healthybite.com",
        contact: "contact@healthybite.com",
        leagal: "legal@healthybite.com",
        phone: 771234567,
        address: "123 Main St, Anytown, USA",
        timezone: "UTC+05:30"
    },
    api: {
        version: "1.0.0",
        prefix: "/api",
        url: "http://localhost:3000/api"
    },
    currency: {
        decimalSeparator: ".",
        thousandsSeparator: ",",
        formatOptions: {
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 2,
            maximumFractionDigits: 3
        }
    },
    language: {
        default: "en",
        supported: ["en", "ta", "sh", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"]
    },
    translation: {
        enabled: false,
        default: "en",
        supported: ["en", "ta", "sh", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"]
    },
    security: {
        requireAuth: false,
        requireAdmin: false,
        requireLogin: false,
        requireLogout: false
    },
    notifications: {
        enabled: false,
        default: "en",
        supported: ["en", "ta", "sh", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"]
    },
    logging: {
        enabled: false,
        level: "info",
        file: "app.log"
    },
    tax: 5,
    deliveryFee: 200
};