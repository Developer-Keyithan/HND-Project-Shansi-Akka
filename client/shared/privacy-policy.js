export const PrivacyPolicy = {
    lastUpdated: "January 2026",
    get sections() {
        const phone = (typeof window !== 'undefined' && window.Common && window.AppData && window.AppData.phone)
            ? window.Common.formatMobile(window.AppData.phone)
            : "N/A";
        const email = (typeof window !== 'undefined' && window.AppData && window.AppData.leagal) ? window.AppData.leagal : "N/A";

        return [
            {
                title: "1. Introduction",
                content: "HealthyBite ('we', 'us', or 'our') describes how we collect, use, process, and disclose your information, including your personal information, in conjunction with your access to and use of the HealthyBite website and services. We are committed to protecting your privacy and ensuring your personal data is handled responsibly."
            },
            {
                title: "2. Information We Collect",
                content: "We collect three broad categories of information during your use of our service:",
                list: [
                    "**Information You Give Us:** Account information (name, email), Profile information (address, phone number), Payment information (billing address, payment method details via secure processor), and Communications.",
                    "**Information We Automatically Collect:** Usage data (pages viewed, time spent), Device information (IP address, browser type), and Location information.",
                    "**Information from Third Parties:** We may receive information from delivery partners or payment processors."
                ]
            },
            {
                title: "3. How We Use Information",
                content: "We use, store, and process information, including personal information, to provide, understand, improve, and develop the HealthyBite Platform.",
                list: [
                    "Process and fulfill your orders, including sending order confirmations and delivery updates.",
                    "Create and maintain a trusted and safer environment (e.g., fraud detection).",
                    "Provide customer support and resolve technical issues.",
                    "Send you promotional messages, marketing, and advertising (you can opt-out at any time)."
                ]
            },
            {
                title: "4. Sharing and Disclosure",
                content: "We maintain your trust by never selling your personal data. However, we may share information in the following circumstances:",
                list: [
                    "**With Service Providers:** We share simplified data with delivery riders, payment processors, and cloud hosting services.",
                    "**Legal Requirements:** We may disclose information if required to do so by law.",
                    "**Business Transfers:** If HealthyBite is involved in a merger, your information may be transferred as part of that deal."
                ]
            },
            {
                title: "5. Your Rights and Choices",
                content: "You have specific rights regarding your personal information under applicable data protection laws:",
                list: [
                    "**Access and Update:** You can access and update your account information directly in your profile settings.",
                    "**Data Portability and Deletion:** You have the right to request a copy of your data or request deletion of your account.",
                    "**Marketing Opt-Out:** You can unsubscribe from marketing emails at any time."
                ]
            },
            {
                title: "6. Data Security",
                content: "We implement rigorous security controls including encryption (SSL) and secure access protocols to protect your data. We retain your personal information only for as long as is necessary for the performance of the contract."
            },
            {
                title: "7. Cookies",
                content: "We use cookies and similar technologies to help provide, protect, and improve the HealthyBite Platform, such as remembering your preferences and analyzing site performance."
            },
            {
                title: "8. Children's Privacy",
                content: "Our Service is not directed to children under the age of 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately."
            },
            {
                title: "9. Changes to Policy",
                content: "We reserve the right to modify this Privacy Policy at any time. If we make changes, we will post the revised policy and update the 'Last Updated' date."
            },
            {
                title: "10. Contact Us",
                content: "If you have any questions or complaints about this Privacy Policy, please contact us:",
                list: [
                    `By email: ${email}`,
                    "By visiting this page on our website: /contact.html",
                    `By phone number: ${phone}`
                ]
            }
        ];
    }
};
