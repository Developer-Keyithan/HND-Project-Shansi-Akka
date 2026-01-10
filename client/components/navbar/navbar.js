// Navbar Component Loader
import { Navbar } from './navbar-functions.js';
import { initAttributes } from '../../shared/common.js';
import { updateConfigElements } from '../../shared/app-settings.js';
import { ClientRoot } from '../../shared/env.js';
import { updateCartCount } from '../../actions.js';

const prefix = ClientRoot || ''; // Fallback to empty if not set
const navbarHTMLPath = prefix + 'components/navbar/navbar.html';

fetch(navbarHTMLPath)
    .then(res => res.text())
    .then(html => {
        const placeholder = document.getElementById('navbar-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;

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

            // Initialize Navbar Logic
            Navbar.initNavigation();
            Navbar.toggleSearchBar();
            Navbar.setActiveNav();
            Navbar.updateUserMenu();
            Navbar.handleCartIconDisplay();
            Navbar.initMenuSearch();
            Navbar.initSearch();
            updateCartCount();
        }
    })
    .catch(err => console.error('Navbar load failed:', err));
