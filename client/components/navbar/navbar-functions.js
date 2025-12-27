let currentUser = JSON.parse(localStorage.getItem('user')) || null;


// Navigation Functions
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Search toggle
function toggleSearchBar() {
    const toggleSearch = document.getElementById('toggle-search');
    const searchContainer = document.getElementById('foods-search');
    if (toggleSearch && searchContainer) {
        toggleSearch.addEventListener('click', function () {
            searchContainer.style.display = (searchContainer.style.display === 'flex') ? 'none' : 'flex';
        });
    }
}

// User Menu
function updateUserMenu() {
    
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;
    
    const userData = localStorage.getItem('helthybite-user');
    const currentUser = userData ? JSON.parse(userData) : null;
    userMenu.innerHTML = '';
    if (currentUser) {
        // Logged in user dropdown
        userMenu.innerHTML = `
            <div class="user-dropdown">
                <button class="user-profile-btn">
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="dashboard/consumer.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="pages/profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="pages/cart.html"><i class="fas fa-shopping-cart"></i> Cart</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;

    } else {
        // Not logged in buttons
        userMenu.innerHTML = `
            <button class="btn btn-login" id="login-btn">Login</button>
            <button class="btn btn-register" id="register-btn">Sign Up</button>
        `;

        const newLoginBtn = userMenu.querySelector('#login-btn');
        const newRegisterBtn = userMenu.querySelector('#register-btn');
        const closeModal = document.querySelector('.close-modal');

        if (newLoginBtn) {
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const isHome =
                    window.location.pathname === '/' ||
                    window.location.pathname.endsWith('index.html');

                if (isHome) {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                } else {
                    // Redirect on other pages
                    window.location.href = '../auth/login.html';
                }
            });
        }


        if (newRegisterBtn) {
            newRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'auth/register.html';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
    }
}

// Dropdown Functions
function initDropdowns() {
    const userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) return;

    const userProfileBtn = userDropdown.querySelector('.user-profile-btn');
    const dropdownMenu = userDropdown.querySelector('.dropdown-menu');

    if (userProfileBtn && dropdownMenu) {
        userProfileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }

        dropdownMenu.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                userDropdown.classList.remove('active');
            }
        });
    }
}

function setActiveNav() {
    const links = document.querySelectorAll('.nav-menu a');
    if (!links.length) return;

    const path = window.location.pathname.replace(/\/$/, '');
    const file = path.split('/').pop() || 'index.html';
    const hash = window.location.hash; // 👈 IMPORTANT

    links.forEach(link => {
        const href = link.getAttribute('href');

        link.classList.remove('active');

        // Case 1: hash-based navigation (About)
        if (hash && href.includes(hash)) {
            link.classList.add('active');
            return;
        }

        // Case 2: normal page navigation
        const linkFile = href.split('/').pop().split('#')[0];

        if (
            linkFile === file &&
            !href.includes('#') // prevents Home staying active
        ) {
            link.classList.add('active');
        }
    });
}


function handleHomeAboutActive() {
    const aboutSection = document.getElementById('about');
    const homeLink = document.getElementById('nav-home');
    const aboutLink = document.getElementById('nav-about');

    if (!aboutSection || !homeLink || !aboutLink) return;

    const rect = aboutSection.getBoundingClientRect();

    // About section visible on screen
    const isVisible =
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2;

    if (isVisible) {
        homeLink.classList.remove('active');
        aboutLink.classList.add('active');
    } else {
        aboutLink.classList.remove('active');
        homeLink.classList.add('active');
    }
}

window.addEventListener('scroll', () => {
    if (
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/'
    ) {
        handleHomeAboutActive();
    }
});


// Logout
function logout() {
    localStorage.removeItem('helthybite-user');
    currentUser = null;
    updateUserMenu();
    alert('Logged out successfully!');
}

// Export navbar functions if needed
window.Navbar = {
    initNavigation,
    toggleSearchBar,
    updateUserMenu,
    initDropdowns,
    logout,
    setActiveNav
};
