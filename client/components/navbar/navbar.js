// Navbar Component Loader
// Uses window.ClientRoot set by load-scripts.js for correct path resolution

const prefix = window.ClientRoot || ''; // Fallback to empty if not set
const navbarHTMLPath = prefix + 'components/navbar/navbar.html';

fetch(navbarHTMLPath)
    .then(res => res.text())
    .then(html => {
        const placeholder = document.getElementById('navbar-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;

            // Initialize Navbar Logic
            // We need to wait a tick for DOM or check if Navbar global is available
            // navbar-functions.js should have been loaded by load-scripts.js

            const checkNavbar = setInterval(() => {
                if (window.Navbar) {
                    clearInterval(checkNavbar);
                    Navbar.initNavigation();
                    Navbar.toggleSearchBar();
                    Navbar.setActiveNav();
                    Navbar.updateUserMenu();
                    Navbar.initDropdowns();
                    Navbar.handleCartIconDisplay();

                    // Cart Count
                    if (window.healthybite?.updateCartCount) {
                        window.healthybite.updateCartCount();
                    }
                }
            }, 100);

            // Timeout to clear interval if something fails
            setTimeout(() => clearInterval(checkNavbar), 5000);
        }
    })
    .catch(err => console.error('Navbar load failed:', err));
