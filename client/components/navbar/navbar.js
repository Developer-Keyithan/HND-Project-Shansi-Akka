let navbarHTMLPath = '';

if (
    window.location.pathname.includes('/pages/') ||
    window.location.pathname.includes('/dashboards/')
) {
    navbarHTMLPath = '../components/navbar/navbar.html';
} else {
    navbarHTMLPath = 'components/navbar/navbar.html';
}

fetch(navbarHTMLPath)
    .then(res => res.text())
    .then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;

        // 🔥 INIT AFTER HTML EXISTS
        if (window.Navbar) {
            Navbar.initNavigation();
            Navbar.toggleSearchBar();
            Navbar.updateUserMenu();
            Navbar.initDropdowns();
            Navbar.setActiveNav();
        }

        if (window.HelthyBite?.updateCartCount) {
            window.HelthyBite.updateCartCount();
        }
    })
    .catch(err => console.error('Navbar load failed:', err));
