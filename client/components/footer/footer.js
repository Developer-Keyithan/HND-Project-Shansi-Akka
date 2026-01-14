// Footer Component Loader
import { initAttributes } from '../../shared/common.js';
import { updateConfigElements } from '../../shared/app-settings.js';
import { ClientRoot } from '../../shared/env.js';

const prefix = ClientRoot || ''; // Fallback to empty if not set
const footerHTMLPath = prefix + 'components/footer/footer.html';

fetch(footerHTMLPath)
    .then(response => response.text())
    .then(data => {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;

            // Trigger initialization of custom attributes (data-config-key, etc.)
            const initCustomAttributes = () => {
                if (initAttributes) {
                    initAttributes();
                }
                if (updateConfigElements) {
                    updateConfigElements();
                }
            };

            // Call immediately and also after a small delay to ensure modules are ready
            initCustomAttributes();
            setTimeout(initCustomAttributes, 100);
            setTimeout(initCustomAttributes, 500);
        }
    })
    .catch(err => console.error('Footer load failed:', err));
