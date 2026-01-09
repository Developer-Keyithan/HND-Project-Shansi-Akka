document.addEventListener('DOMContentLoaded', function () {
    initDashboard();
    initEventListeners();
});

function initDashboard() {
    // Auth Check
    if (!window.Auth || !window.Auth.requireRole('delivery-partner')) return;

    const user = window.Auth.getCurrentUser();
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('dashboard-date').textContent = new Date().toDateString();
}

function initEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.Auth.logoutUser();
    });
}

function loadSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    const sec = document.getElementById(`${sectionId}-section`);
    if (sec) sec.classList.add('active');
}

// Global scope
window.loadSection = loadSection;
