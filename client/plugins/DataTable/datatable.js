export class DataTable {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.data = options.data || [];
        this.columns = options.columns || [];
        this.actions = options.actions || [];
        this.itemsPerPage = options.itemsPerPage || 10;
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        this.onRowClick = options.onRowClick || null;

        if (!this.container) {
            console.error('DataTable container not found');
            return;
        }

        this.init();
    }

    init() {
        this.renderLayout();
        this.renderTable();
        this.setupEventListeners();
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="datatable-container">
                <div class="datatable-header">
                    <div class="datatable-search">
                        <input type="text" placeholder="Search...">
                    </div>
                    <div class="datatable-actions-top">
                        <!-- Custom top actions can go here -->
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="datatable-table">
                        <thead></thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="datatable-pagination">
                    <div class="datatable-pagination-info"></div>
                    <div class="datatable-pagination-controls"></div>
                </div>
            </div>
        `;
    }

    getFilteredData() {
        let filtered = this.data;

        // Search
        if (this.searchQuery) {
            const lowerQuery = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                return Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerQuery)
                );
            });
        }

        // Sort
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                const valA = a[this.sortColumn];
                const valB = b[this.sortColumn];

                if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }

    getPaginatedData(filteredData) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return filteredData.slice(start, start + this.itemsPerPage);
    }

    renderTable() {
        const filteredData = this.getFilteredData();
        const paginatedData = this.getPaginatedData(filteredData);

        const thead = this.container.querySelector('thead');
        const tbody = this.container.querySelector('tbody');

        // Render Headers
        thead.innerHTML = '<tr>' +
            this.columns.map(col => `
                <th data-key="${col.key}">
                    ${col.label} 
                    ${this.sortColumn === col.key ? (this.sortDirection === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') : '<i class="fas fa-sort"></i>'}
                </th>
            `).join('') +
            (this.actions.length ? '<th>Actions</th>' : '') +
            '</tr>';

        // Render Body
        if (paginatedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${this.columns.length + (this.actions.length ? 1 : 0)}" style="text-align:center;">No data found</td></tr>`;
        } else {
            tbody.innerHTML = paginatedData.map(item => `
                <tr data-id="${item.id}">
                    ${this.columns.map(col => `
                        <td>${col.render ? col.render(item[col.key], item) : (item[col.key] || '')}</td>
                    `).join('')}
                    ${this.actions.length ? `
                        <td class="datatable-actions">
                            ${this.actions.map(action => `
                                <button class="action-btn ${action.class || ''}" data-action="${action.name}" data-id="${item.id}">
                                    ${action.icon ? `<i class="${action.icon}"></i>` : ''} ${action.label || ''}
                                </button>
                            `).join('')}
                        </td>
                    ` : ''}
                </tr>
            `).join('');
        }

        this.renderPagination(filteredData.length);
    }

    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const info = this.container.querySelector('.datatable-pagination-info');
        const controls = this.container.querySelector('.datatable-pagination-controls');

        const start = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        info.textContent = `Showing ${start} to ${end} of ${totalItems} entries`;

        let btns = '';
        btns += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev"><i class="fas fa-chevron-left"></i></button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                btns += `<button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                btns += `<span>...</span>`;
            }
        }

        btns += `<button ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} data-page="next"><i class="fas fa-chevron-right"></i></button>`;

        controls.innerHTML = btns;
    }

    setupEventListeners() {
        // Search
        const searchInput = this.container.querySelector('.datatable-search input');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1;
            this.renderTable();
        });

        // Sort
        this.container.querySelector('thead').addEventListener('click', (e) => {
            const th = e.target.closest('th');
            if (!th || !th.dataset.key) return;

            const key = th.dataset.key;
            if (this.sortColumn === key) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = key;
                this.sortDirection = 'asc';
            }
            this.renderTable();
        });

        // Pagination
        this.container.querySelector('.datatable-pagination-controls').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || btn.disabled) return;

            const page = btn.dataset.page;
            if (page === 'prev') {
                this.currentPage--;
            } else if (page === 'next') {
                this.currentPage++;
            } else {
                this.currentPage = parseInt(page);
            }
            this.renderTable();
        });

        // Actions
        this.container.querySelector('tbody').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn) {
                e.stopPropagation(); // Prevent row click
                const actionName = btn.dataset.action;
                const id = btn.dataset.id;
                const item = this.data.find(d => d.id == id || d.email == id); // Loose equality for ID

                const actionDef = this.actions.find(a => a.name === actionName);
                if (actionDef && actionDef.handler) {
                    actionDef.handler(item);
                }
                return;
            }

            // Row Click
            if (this.onRowClick) {
                const tr = e.target.closest('tr');
                if (tr) {
                    const id = tr.dataset.id;
                    const item = this.data.find(d => d.id == id || d.email == id);
                    this.onRowClick(item);
                }
            }
        });
    }

    updateData(newData) {
        this.data = newData;
        this.renderTable();
    }
}
