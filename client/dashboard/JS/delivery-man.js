import { Auth } from "../../shared/auth.js";

document.addEventListener('DOMContentLoaded', function () {
    // Auth Check
    if (!Auth.requireRole('delivery-man')) return;

    const user = Auth.getCurrentUser();
    if (user) {
        const userNameElem = document.getElementById('user-name');
        if (userNameElem) userNameElem.textContent = user.name;
    }

    // Logout Link
    const logoutLink = document.querySelector('.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logoutUser();
        });
    }

    // View Route Button
    const viewRouteBtn = document.querySelector('.task-actions .btn-primary');
    if (viewRouteBtn) {
        viewRouteBtn.addEventListener('click', () => {
            window.location.href = '/pages/delivery-tracking.html?orderId=HB9823';
        });
    }
});
