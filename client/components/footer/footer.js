// Footer Component Loader
// Uses window.ClientRoot set by load-scripts.js for correct path resolution

const prefix = window.ClientRoot || ''; // Fallback to empty if not set
const footerHTMLPath = prefix + 'components/footer/footer.html';

fetch(footerHTMLPath)
    .then(response => response.text())
    .then(data => {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;

            // Trigger initialization of custom attributes (data-config-key, etc.)
            const initCustomAttributes = () => {
                if (window.Common && window.Common.initAttributes) {
                    window.Common.initAttributes();
                }
                if (window.updateConfigElements) {
                    window.updateConfigElements();
                }
            };

            // Call immediately and also after a small delay to ensure modules are ready
            initCustomAttributes();
            setTimeout(initCustomAttributes, 100);
            setTimeout(initCustomAttributes, 500);
        }
    })
    .catch(err => console.error('Footer load failed:', err));
