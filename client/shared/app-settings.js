import { AppConfig } from "../app.config.js";

(function () {
    // Expose config globally
    window.AppConfig = AppConfig;
    console.log('AppConfig loaded:', AppConfig.app?.name);

    // Dispatch event for components waiting for config
    window.dispatchEvent(new Event('AppConfigLoaded'));

    // Initial update
    updateConfigElements();

    function updateConfigElements() {
        if (!window.AppConfig) return;

        // Helper to get nested property
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
        };

        // Update elements with data-config-key
        document.querySelectorAll('[data-config-key]').forEach(el => {
            const key = el.getAttribute('data-config-key');
            // Try direct key first, then nested
            let value = window.AppConfig[key] || getNestedValue(window.AppConfig, key);

            // Handle legacy mapping if needed (e.g. appName -> app.name)
            if (!value && key === 'appName') value = getNestedValue(window.AppConfig, 'app.name');
            if (!value && key === 'appEmail') value = getNestedValue(window.AppConfig, 'app.email');
            if (!value && key === 'appPhone') value = getNestedValue(window.AppConfig, 'app.phone');
            if (!value && key === 'appAddress') value = getNestedValue(window.AppConfig, 'app.address');
            if (!value && key === 'appCopyright') value = getNestedValue(window.AppConfig, 'app.copyright');

            if (value) {

                if (el.tagName === 'A' && (key === 'appEmail' || key === 'app.email')) {
                    el.href = 'mailto:' + value;
                    el.textContent = value;
                } else if (el.tagName === 'A' && (key === 'appPhone' || key === 'app.phone')) {
                    el.href = 'tel:' + value;
                    el.textContent = (window.Common && window.Common.formatMobile) ? window.Common.formatMobile(value) : value;
                } else {
                    el.innerHTML = value; // Use innerHTML to allow entities like &copy;
                }
            }
        });

        // Update navigation links based on app.url
        // Priority: window.AppConfig.app.url -> window.AppConfig.appUrl -> window.AppConfig.baseUrl
        let appUrl = getNestedValue(window.AppConfig, 'app.url') || window.AppConfig.appUrl || window.AppConfig.baseUrl;

        if (appUrl) {
            appUrl = appUrl.replace(/\/$/, ''); // Remove trailing slash

            // Fix hrefs
            document.querySelectorAll('a, link').forEach(el => {
                const href = el.getAttribute('href');
                // Update internal root-relative links
                if (href && href.startsWith('/') && !href.startsWith('//') && !el.hasAttribute('data-base-auto-updated')) {
                    el.href = appUrl + href;
                    el.setAttribute('data-base-auto-updated', 'true');
                }
            });

            // Fix srcs (scripts, images)
            document.querySelectorAll('img, script, source').forEach(el => {
                const src = el.getAttribute('src');
                if (src && src.startsWith('/') && !src.startsWith('//') && !el.hasAttribute('data-base-auto-updated')) {
                    el.src = appUrl + src;
                    el.setAttribute('data-base-auto-updated', 'true');
                }
            });
        }
    }

})();
