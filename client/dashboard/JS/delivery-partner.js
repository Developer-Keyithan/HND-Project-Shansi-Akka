import { Auth } from "../../shared/auth.js";

document.addEventListener('DOMContentLoaded', function () {
    initDashboard();
    initEventListeners();
});

function initDashboard() {
    // Auth Check
    if (!Auth || !Auth.requireRole('delivery-partner')) return;

    const user = API.getCurrentUser();
    if (user) {
        const userNameElem = document.getElementById('user-name');
        if (userNameElem) userNameElem.textContent = user.name;
    }

    const dateElem = document.getElementById('dashboard-date');
    if (dateElem) dateElem.textContent = new Date().toDateString();
}

function initEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logoutUser();
        });
    }

    // Nav links
    const overviewLink = document.getElementById('nav-overview');
    if (overviewLink) {
        overviewLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSection('overview');
        });
    }

    const availableLink = document.getElementById('nav-available');
    if (availableLink) {
        availableLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSection('available');
        });
    }

    const historyLink = document.getElementById('nav-history');
    if (historyLink) {
        historyLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSection('history');
        });
    }
}

function loadSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    const sec = document.getElementById(`${sectionId}-section`);
    if (sec) sec.classList.add('active');

    const navLink = document.getElementById(`nav-${sectionId}`);
    if (navLink) navLink.classList.add('active');
}
