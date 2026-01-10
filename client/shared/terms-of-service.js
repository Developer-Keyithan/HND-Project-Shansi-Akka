import { formatMobile } from "./common.js";
import { AppConfig } from "../app.config.js";

export const TermsOfService = {
    lastUpdated: "January 2026",
    get sections() {
        const phone = (AppConfig.app && AppConfig.app.phone)
            ? formatMobile(AppConfig.app.phone)
            : "N/A";
        const email = (AppConfig.app && AppConfig.app.leagal) ? AppConfig.app.leagal : 'N/A';

        return [
            {
                title: "1. Agreement to Terms",
                content: "Welcome to HealthyBite ('we', 'our', or 'us'). By accessing or using our website, mobile application, and services (collectively, the 'Service'), you agree to be bound by these Terms of Service ('Terms'). If you disagree with any part of the terms, you may not access the Service."
            },
            {
                title: "2. Eligibility and Account Registration",
                content: "You must be at least 18 years old to use our Service. When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.",
                list: [
                    "You are responsible for maintaining the confidentiality of your account and password.",
                    "You agree to accept responsibility for all activities that occur under your account.",
                    "You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account."
                ]
            },
            {
                title: "3. Products and Services",
                content: "We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Service. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.",
                list: [
                    "All products are subject to availability, and we cannot guarantee that items will be in stock.",
                    "We reserve the right to discontinue any product at any time for any reason.",
                    "Prices for all products are subject to change without notice."
                ]
            },
            {
                title: "4. Orders, Pricing, and Payments",
                content: "By placing an order, you represent that you have the legal right to use the payment method provided. All prices are listed in Sri Lankan Rupees (LKR) and are inclusive of applicable taxes unless stated otherwise.",
                list: [
                    "We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price of the product or service, or error in your order.",
                    "We may also require additional verifications or information before accepting any order.",
                    "You agree to provide current, complete, and accurate purchase and account information for all purchases made via our store."
                ]
            },
            {
                title: "5. Delivery and Logistics",
                content: "Delivery times are estimates and start from the date of shipping, rather than the date of order. Delivery times are to be used as a guide only and are subject to the acceptance and approval of your order.",
                list: [
                    "We will make every reasonable effort to deliver the products to you within the timeframe stated.",
                    "We are not responsible for any delays caused by destination clearance processes or other unforeseen circumstances.",
                    "Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier."
                ]
            },
            {
                title: "6. Cancellations, Returns, and Refunds",
                content: "Our goal is your complete satisfaction. If you are not entirely satisfied with your purchase, we're here to help.",
                list: [
                    "**Cancellations:** You may cancel your order within 5 minutes of placing it for a full refund. Orders cannot be canceled once preparation has begun.",
                    "**Refunds:** If you receive a damaged, incorrect, or incomplete order, please contact us immediately. Refunds are processed within 5-7 business days to the original method of payment.",
                    "**Non-Returnable Items:** Due to the perishable nature of food products, we generally do not accept returns. Issues will be resolved via refunds or replacements."
                ]
            },
            {
                title: "7. Intellectual Property",
                content: "The Service and its original content, features, and functionality are and will remain the exclusive property of HealthyBite and its licensors. The Service is protected by copyright, trademark, and other laws of both Sri Lanka and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of HealthyBite."
            },
            {
                title: "8. Prohibited Activities",
                content: "You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.",
                list: [
                    "Systematically retrieving data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.",
                    "Making any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means.",
                    "Circumventing, disabling, or otherwise interfering with security-related features of the Service.",
                    "Engaging in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools."
                ]
            },
            {
                title: "9. Limitation of Liability",
                content: "In no event shall HealthyBite, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:",
                list: [
                    "Your access to or use of or inability to access or use the Service;",
                    "Any conduct or content of any third party on the Service;",
                    "Any content obtained from the Service;",
                    "Unauthorized access, use, or alteration of your transmissions or content."
                ]
            },
            {
                title: "10. Changes to Terms",
                content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
            },
            {
                title: "11. Contact Us",
                content: "If you have any questions about these Terms, please contact us:",
                list: [
                    `By email: ${email}`,
                    "By visiting this page on our website: /contact.html",
                    `By phone number: ${phone}`
                ]
            }
        ];
    }
};