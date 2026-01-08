import { Toast } from "../../plugins/Toast/toast.js";

let cart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
const searchInput = document.getElementById('search-input');

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
        // Force show if on menu page with search param
        if (window.Common && window.Common.currentNav() === 'menu.html' && window.Common.getParameterByName('search')) {
            searchContainer.style.display = 'flex';
        }

        // Add click listener (ensure we don't duplicate if function called multiple times, though currently init only calls once)
        // Ideally we should remove old listener or use a flag, but for now simple add is standard unless 'init' runs repeatedly.
        // Given 'load-scripts' is idempotent, this is likely safe.
        toggleSearch.onclick = function () {
            searchContainer.style.display = (searchContainer.style.display === 'flex') ? 'none' : 'flex';
        };
    }
}

// User Menu
function updateUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    const userData = localStorage.getItem('healthybite-user');
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
                    <div class="dropdown-divider"></div>
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
                window.location.href = '../auth/register.html';
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

    const file = window.Common ? window.Common.currentNav() : (window.location.pathname.split('/').pop() || 'index.html');
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

function handleCartIconDisplay() {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;

    if (window.location.pathname.endsWith('cart.html')) {
        cartIcon.style.display = 'none';
    } else {
        cartIcon.style.display = 'block';
    }
}

// Logout
function logout() {
    localStorage.removeItem('healthybite-user');
    currentUser = null;
    updateUserMenu();
    alert('Logged out successfully!');
}

async function initMenuSearch() {
    // Check URL for search query
    const searchQuery = window.Common ? window.Common.getParameterByName('search') : null;

    if (searchQuery) {
        document.getElementById('search-input').value = await searchQuery;
        performSearch();
    }
}

// Search Functionality
function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    console.log('Performing search...');
    const searchInput = document.getElementById('search-input'); // Get element directly
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    // Redirect to menu page with search query
    if (window.location.pathname.includes('/menu.html')) {
        return;
    } else {
        const target = window.location.pathname.includes('/pages/') ? 'menu.html' : 'pages/menu.html';
        window.location.href = `${target}?search=${encodeURIComponent(query)}`;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    // Reload cart from localStorage to get fresh data
    const currentCart = JSON.parse(localStorage.getItem('healthybite-cart')) || [];

    // Update the module-level variable to stay in sync (optional but good practice)
    cart = currentCart;

    const totalItems = currentCart.reduce((total, item) => total + item.quantity, 0);

    cartCount.textContent = totalItems;

    // Hide cart count if zero
    if (totalItems === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
}


// Notification System
function showNotification(message, type = 'info') {
    console.log(message);
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    try {
        Toast({
            icon: type,
            title: capitalizedType,
            message: message
        });
    } catch (e) {
        console.error("Toast error:", e);
        alert(message);
    }
}

// Export navbar functions if needed
window.Navbar = {
    initNavigation,
    toggleSearchBar,
    updateUserMenu,
    initDropdowns,
    logout,
    setActiveNav,
    handleCartIconDisplay,
    initMenuSearch,
    showNotification,
    updateCartCount
};
