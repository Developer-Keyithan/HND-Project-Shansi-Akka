import { AppConfig } from "../../app.config.js";
import { currentNav, getParameterByName } from "../../shared/common.js";
import { showNotification } from "../../actions.js";
import { Popover } from "../../plugins/Modal/modal.js";
import { API } from "../../shared/api.js";

let globalUser = null;

// Navigation Functions
export function initNavigation() {
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
    // Check auth on init
    checkAuth();
}

export function setGlobalUser(user) {
    globalUser = user;
}

export async function checkAuth() {
    const token = localStorage.getItem('healthybite-token');
    console.log(token);
    if (token) {
        try {
            const res = await API.getCurrentUser();
            if (res && res.success) {
                globalUser = res.user;
            } else {
                localStorage.removeItem('healthybite-token');
                globalUser = null;
            }
        } catch (e) {
            console.error("Auth check failed", e);
            if (e.status === 401) {
                localStorage.removeItem('healthybite-token');
                globalUser = null;
            }
        }
    } else {
        globalUser = null;
    }
    updateUserMenu();
}

// Search toggle
export function toggleSearchBar() {
    const toggleSearch = document.getElementById('toggle-search');
    const searchContainer = document.getElementById('foods-search');

    if (toggleSearch && searchContainer) {
        // Force show if on menu page with search param
        if (currentNav() === 'menu.html' && getParameterByName('search')) {
            searchContainer.style.display = 'flex';
        }

        toggleSearch.onclick = function () {
            searchContainer.style.display = (searchContainer.style.display === 'flex') ? 'none' : 'flex';
        };
    }
}

export function updateUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    // Use globalUser fetched from API
    const currentUser = globalUser;

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
                    <a href="/dashboard/consumer.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="/pages/profile.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="/pages/cart.html"><i class="fas fa-shopping-cart"></i> Cart</a>
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

                const isHome = currentNav() === 'index.html' || currentNav() === '';

                if (isHome) {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        const content = loginModal.querySelector('.modal-content');
                        // Use Popover Plugin to open the modal content
                        if (content) {
                            // Extract content but keep the original intact if needed (clone)
                            // However, since we are doing delegation in script.js, we can just use the HTML string.
                            // But better to use the innerHTML.
                            // Remove the close-modal button from the string if Popover adds one, 
                            // or keep it if Popover allows custom content fully.
                            // Popover adds its own close button (x).

                            // Let's filter out the close button from the HTML if possible or just hide it via CSS in Popover
                            let htmlContent = content.innerHTML;
                            // A simple hack to remove the duplicate close button if present in HTML
                            // htmlContent = htmlContent.replace(/<span class="close-modal">.*?<\/span>/, '');
                            Popover.content({
                                title: 'Login to ' + AppConfig.app.name,
                                content: htmlContent,
                                width: { max: '450px' },
                                buttons: [],
                                type: 'content'
                            });

                            // Re-bind close button action if the internal close button is clicked (the one from HTML)
                            // Since it's dynamic HTML now, we can use delegation or rely on Popover's close.
                            // The specialized close button in the HTML <span class="close-modal"> might need a listener if not removed.
                            // But usually Popover has its own.
                            // Let's rely on Popover's close button.
                        }
                    }
                } else {
                    // Redirect on other pages
                    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
                    window.location.href = appUrl + '/auth/login.html';
                }
            });
        }


        if (newRegisterBtn) {
            newRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
                window.location.href = appUrl + '/auth/register.html';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
    // Re-initialize dropdowns after DOM update
    initDropdowns();
}

// Dropdown Functions
export function initDropdowns() {
    const userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) return;

    const userProfileBtn = userDropdown.querySelector('.user-profile-btn');
    const dropdownMenu = userDropdown.querySelector('.dropdown-menu');

    if (userProfileBtn && dropdownMenu) {
        userProfileBtn.onclick = function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        };

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

export function setActiveNav() {
    const links = document.querySelectorAll('.nav-menu a');
    if (!links.length) return;

    const file = currentNav() || (window.location.pathname.split('/').pop() || 'index.html');
    const hash = window.location.hash;

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        link.classList.remove('active');

        if (hash && href.includes(hash)) {
            link.classList.add('active');
            return;
        }

        const linkFile = href.split('/').pop().split('#')[0];

        if (linkFile === file && !href.includes('#')) {
            link.classList.add('active');
        }
    });
}

export function handleCartIconDisplay() {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;

    if (window.location.pathname.endsWith('cart.html')) {
        cartIcon.style.display = 'none';
    } else {
        cartIcon.style.display = 'block';
    }
}

// Logout
export function logout() {
    localStorage.removeItem('healthybite-token');
    globalUser = null;
    updateUserMenu();
    showNotification('Logged out successfully!', 'success');
    const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
    window.location.href = appUrl + '/index.html';
}

export async function initMenuSearch() {
    const searchQuery = getParameterByName('search') || null;

    if (searchQuery) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = searchQuery;
            setTimeout(() => performMenuSearch(), 100);
        }
    }
}

// Search Functionality
export function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performMenuSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMenuSearch();
            }
        });
    }
}

export function performMenuSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const query = searchInput.value.trim();

    if (!query) {
        showNotification('Please enter a search term', 'error');
        return;
    }

    if (currentNav() === 'menu.html') {
        // Update URL without reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('search', query);
        window.history.pushState({}, '', newUrl);

        // Trigger search logic in menu.js
        document.dispatchEvent(new CustomEvent('menu-search', { detail: { query } }));
    } else {
        const appUrl = (AppConfig?.app?.url || AppConfig?.appUrl || '').replace(/\/$/, '');
        window.location.href = appUrl + `/pages/menu.html?search=${encodeURIComponent(query)}`;
    }
}

// Combined export object
export const Navbar = {
    initNavigation,
    toggleSearchBar,
    updateUserMenu,
    initDropdowns,
    logout,
    setActiveNav,
    handleCartIconDisplay,
    initMenuSearch,
    initSearch,
    showNotification,
    setGlobalUser,
    checkAuth
};
