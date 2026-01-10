let NODE_ENV = "development";

export const setEnv = (env) => {
    NODE_ENV = env;
}

export const isDev = () => NODE_ENV === "development";
export const isProduction = () => NODE_ENV === "production"
const path = window.location.pathname;
const baseUrl = (NODE_ENV === "development") ? path.includes("client") ? window.location.origin + "/client" : window.location.origin : "https://healthybite-three.vercel.app";

export const AppConfig = {
    version: "1.4.2",
    app: {
        version: "1.4.2",
        name: "Healthybite",
        url: baseUrl,
        logo: baseUrl + "/logo.png",
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
        url: baseUrl
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
        requireAuth: true,
        requireAdmin: false,
        requireLogin: true,
        requireLogout: true
    },
    notifications: {
        enabled: true,
        default: "en",
        supported: ["en", "ta", "sh", "es", "fr", "de", "it", "pt", "ru", "ja", "zh", "ko"]
    },
    logging: {
        enabled: true,
        level: "info",
        file: "app.log"
    },
    tax: 5,
    deliveryFee: 200
};