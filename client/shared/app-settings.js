import { AppConfig } from "../app.config.js";

// Expose update function for export
export { updateConfigElements };

// Initial update
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateConfigElements);
} else {
    updateConfigElements();
}

/**
 * Update elements with config data
 */
function updateConfigElements() {
    if (!AppConfig) return;

    // Helper to get nested property
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
    };

    // Update elements with data-config-key
    document.querySelectorAll('[data-config-key]').forEach(el => {
        const key = el.getAttribute('data-config-key');
        // Try direct key first, then nested
        let value = AppConfig[key] || getNestedValue(AppConfig, key);

        // Handle legacy mapping if needed (e.g. appName -> app.name)
        if (!value && key === 'appName') value = getNestedValue(AppConfig, 'app.name');
        if (!value && key === 'appEmail') value = getNestedValue(AppConfig, 'app.email');
        if (!value && key === 'appPhone') value = getNestedValue(AppConfig, 'app.phone');
        if (!value && key === 'appAddress') value = getNestedValue(AppConfig, 'app.address');
        if (!value && key === 'appCopyright') value = getNestedValue(AppConfig, 'app.copyright');

        if (value) {
            if (el.tagName === 'A' && (key === 'appEmail' || key === 'app.email')) {
                el.href = 'mailto:' + value;
                el.textContent = value;
            } else if (el.tagName === 'A' && (key === 'appPhone' || key === 'app.phone')) {
                el.href = 'tel:' + value;
                el.textContent = value; // Could use formatMobile if available
            } else {
                el.innerHTML = value; // Use innerHTML to allow entities like &copy;
            }
        }
    });

    // Update navigation links based on app.url
    let appUrl = getNestedValue(AppConfig, 'app.url') || AppConfig.appUrl || AppConfig.baseUrl;

    if (appUrl) {
        appUrl = appUrl.replace(/\/$/, ''); // Remove trailing slash

        // Fix hrefs
        document.querySelectorAll('a, link').forEach(el => {
            const href = el.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('//') && !el.hasAttribute('data-base-auto-updated')) {
                el.href = appUrl + href;
                el.setAttribute('data-base-auto-updated', 'true');
            }
        });

        // Fix srcs
        document.querySelectorAll('img, script, source').forEach(el => {
            const src = el.getAttribute('src');
            if (src && src.startsWith('/') && !src.startsWith('//') && !el.hasAttribute('data-base-auto-updated')) {
                el.src = appUrl + src;
                el.setAttribute('data-base-auto-updated', 'true');
            }
        });
    }
}
