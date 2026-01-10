import { DataTable } from "../../plugins/DataTable/datatable.js";
import { Auth } from "../../shared/auth.js";
import { Logger } from "../../shared/logger.js"; // Importing the singleton instance
import { showNotification } from "../../actions.js";
import { API } from "../../shared/api.js"; // In a real app, API might emit events we can listen to, or we wrap it.

document.addEventListener('DOMContentLoaded', async () => {
    // Check Access
    if (!Auth.isAuthenticated()) {
        window.location.href = '/auth/login.html';
        return;
    }

    const currentUser = Auth.getCurrentUser();
    if (currentUser.role !== 'technical-supporter') {
        window.location.href = '/pages/errors/403.html';
        return;
    }

    // Set user name
    document.getElementById('admin-name').textContent = currentUser.name || 'Tech Support';
    document.getElementById('logout-btn').addEventListener('click', Auth.logoutUser);

    // Initialize API Requests DataTable
    const apiTable = new DataTable('api-requests-datatable', {
        columns: [
            { key: 'timestamp', label: 'Time', render: (val) => new Date(val).toLocaleTimeString() },
            { key: 'method', label: 'Method', render: (val) => `<span style="font-weight:bold; color:${getMethodColor(val)}">${val}</span>` },
            { key: 'endpoint', label: 'Endpoint' },
            { key: 'status', label: 'Status', render: (val) => `<span class="badge ${val >= 400 ? 'badge-danger' : 'badge-success'}">${val}</span>` },
            { key: 'duration', label: 'Duration', render: (val) => `${val}ms` }
        ],
        data: [],
        itemsPerPage: 5
    });

    // Initial Load
    renderLogs();
    renderApiStats();

    // Event Listeners
    document.getElementById('btn-refresh-logs').addEventListener('click', () => {
        renderLogs();
        showNotification('Logs refreshed', 'success');
    });

    document.getElementById('btn-clear-logs').addEventListener('click', () => {
        Logger.clearLogs();
        renderLogs();
        showNotification('Logs cleared locally', 'info');
    });

    // Periodic Update (Mock "Live" feel)
    setInterval(() => {
        if (Math.random() > 0.7) {
            simulateApiRequest();
        }
    }, 2000);

    function renderLogs() {
        const logs = Logger.getLogs(null, 50).reverse(); // Get latest 50
        const container = document.getElementById('log-terminal');

        if (logs.length === 0) {
            container.innerHTML = '<div style="opacity:0.5;">No logs available.</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-entry">
                <span style="opacity:0.5;">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span class="log-${log.level}" style="text-transform:uppercase; font-weight:bold; margin-right:5px;">${log.level}</span>
                <span>${log.message}</span>
                ${log.data && Object.keys(log.data).length ? `<span style="color:#888; font-size:0.8em;">${JSON.stringify(log.data)}</span>` : ''}
            </div>
        `).join('');
    }

    // Mock API Stats Data
    let mockApiRequests = [];

    function renderApiStats() {
        // Hydrate with some initial mock data if empty
        if (mockApiRequests.length === 0) {
            for (let i = 0; i < 5; i++) simulateApiRequest(false);
        }
        apiTable.updateData([...mockApiRequests].sort((a, b) => b.timestamp - a.timestamp));
    }

    function simulateApiRequest(update = true) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const endpoints = ['/api/products', '/api/users', '/api/orders', '/api/auth/login', '/api/stats'];
        const statuses = [200, 200, 200, 201, 400, 401, 500];

        const req = {
            id: Date.now(),
            timestamp: Date.now(),
            method: methods[Math.floor(Math.random() * methods.length)],
            endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            duration: Math.floor(Math.random() * 200) + 20
        };

        mockApiRequests.unshift(req);
        if (mockApiRequests.length > 50) mockApiRequests.pop(); // Keep last 50

        // Also Log it if error
        if (req.status >= 400) {
            Logger.error(`API Request Failed: ${req.method} ${req.endpoint}`, null, { status: req.status });
            if (update) renderLogs();
        } else if (Math.random() > 0.8) {
            Logger.info(`API Request: ${req.method} ${req.endpoint}`, { status: req.status });
            if (update) renderLogs();
        }

        if (update) apiTable.updateData([...mockApiRequests]);
    }

    function getMethodColor(method) {
        switch (method) {
            case 'GET': return '#61affe';
            case 'POST': return '#49cc90';
            case 'PUT': return '#fca130';
            case 'DELETE': return '#f93e3e';
            default: return '#ccc';
        }
    }
});
