import { DataTable } from "../../plugins/DataTable/datatable.js";
import { Auth } from "../../shared/auth.js";
import { API } from "../../shared/api.js";
import { showNotification } from "../../js";

document.addEventListener('DOMContentLoaded', async () => {
    // Check Access
    if (!Auth.isAuthenticated()) {
        window.location.href = '/auth/login.html';
        return;
    }

    const currentUser = Auth.getCurrentUser();
    const role = currentUser.role;

    // Allowed roles for this page
    if (!['admin', 'administrator', 'delivery-partner'].includes(role)) {
        window.location.href = '/pages/errors/403.html';
        return;
    }

    // Set user name
    document.getElementById('admin-name').textContent = currentUser.name;
    document.getElementById('logout-btn').addEventListener('click', Auth.logoutUser);

    // Initialize DataTable
    const dataTable = new DataTable('users-datatable', {
        columns: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (val) => `<span class="badge badge-${val}">${val}</span>` },
            { key: 'id', label: 'ID' }
        ],
        actions: [
            { name: 'edit', label: 'Edit', icon: 'fas fa-edit', class: 'btn-edit', handler: (item) => openEditModal(item) },
            { name: 'delete', label: 'Delete', icon: 'fas fa-trash', class: 'btn-delete', handler: (item) => deleteUser(item) }
        ],
        data: []
    });

    // Load Data
    await loadUsers();

    // Event Listeners
    document.getElementById('btn-create-user').addEventListener('click', () => openCreateModal());
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('user-form').addEventListener('submit', handleFormSubmit);

    async function loadUsers() {
        const loadingContainer = document.getElementById('users-datatable');
        // loadingContainer.innerHTML = '<div class="loading-spinner"></div>'; // DataTable handles empty state, but loading indication is good. 
        // We'll just wait.

        try {
            const allUsers = await API.getUsers();
            const filteredUsers = filterUsersByRole(allUsers);
            dataTable.updateData(filteredUsers);
        } catch (error) {
            console.error('Failed to load users', error);
            showNotification('Failed to load users', 'error');
        }
    }

    function filterUsersByRole(users) {
        if (role === 'technical-supporter') {
            return users; // See all
        }

        if (role === 'administrator') {
            return users.filter(u =>
                u.role !== 'administrator' &&
                u.role !== 'technical-supporter'
            );
        }

        if (role === 'admin') {
            return users.filter(u =>
                u.role !== 'administrator' &&
                u.role !== 'technical-supporter' &&
                u.role !== 'admin'
            );
        }

        if (role === 'delivery-partner') {
            return users.filter(u => u.role === 'delivery-person');
        }

        return [];
    }

    function getCreatableRoles() {
        const roles = [];

        // Everyone can create consumers? Maybe not here, but technically possible.
        // User said: "Normally user can register only as consumer after the update as seller"
        // "Administrator can create admin, and delivery partners"
        // "Admin can create delivery partner"
        // "Delivery partner can create delivery persons"

        if (role === 'administrator') {
            roles.push('admin', 'delivery-partner', 'seller', 'consumer');
        } else if (role === 'admin') {
            roles.push('delivery-partner', 'seller', 'consumer');
        } else if (role === 'delivery-partner') {
            roles.push('delivery-person');
        }

        return roles;
    }

    function openCreateModal() {
        document.getElementById('modal-title').textContent = 'Create User';
        document.getElementById('user-id').value = '';
        document.getElementById('user-form').reset();

        populateRoleSelect();

        document.getElementById('user-modal').style.display = 'block';
    }

    function openEditModal(user) {
        document.getElementById('modal-title').textContent = 'Edit User';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = ''; // Don't show password

        populateRoleSelect(user.role);

        document.getElementById('user-modal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('user-modal').style.display = 'none';
    }

    function populateRoleSelect(selectedRole = null) {
        const select = document.getElementById('user-role');
        const roles = getCreatableRoles();

        // If editing and the user has a role not in our creatable list (e.g. legacy), add it temporarily or handle it?
        // For now, strict adherence.

        select.innerHTML = roles.map(r =>
            `<option value="${r}" ${r === selectedRole ? 'selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`
        ).join('');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;

        const userData = {
            id: id ? parseInt(id) : null, // Ensure ID is correct type if updating
            name,
            email,
            role
        };

        if (password) {
            userData.password = password;
        } else if (!id) {
            showNotification('Password is required for new users', 'error');
            return;
        }

        try {
            const result = await API.saveUser(userData);
            if (result.success) {
                showNotification('User saved successfully', 'success');
                closeModal();
                loadUsers();
            } else {
                showNotification(result.message || 'Failed to save user', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('An error occurred', 'error');
        }
    }

    async function deleteUser(user) {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            try {
                const result = await API.deleteUser(user.id);
                if (result.success) {
                    showNotification('User deleted', 'success');
                    loadUsers();
                } else {
                    showNotification(result.message || 'Failed to delete user', 'error');
                }
            } catch (error) {
                console.error(error);
                showNotification('An error occurred', 'error');
            }
        }
    }
});
