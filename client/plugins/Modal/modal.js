/**
 * Custom Modal/Popover Module
 * A fully customizable UI component for alerts, confirms, and rich content popovers.
 */

let activeModal = null;

/**
 * Main rendering function for the modal system.
 * Processes all customization options including positioning, layout, and styling.
 */
export function show(options = {}) {
    const {
        title = 'Notification',
        message = '',
        content = null,
        type = 'info', // info, warning, danger, success, error
        icon = null,
        confirm = options.type === 'content' ? null : { text: 'Confirm', color: null, backgroundColor: null, onClick: () => { } },
        cancel = null, // { text, color, backgroundColor, onClick }
        buttons = [], // [{ text, type, color, backgroundColor, onClick }]
        position = 'center', // center, top, bottom, left, right
        buttonPositions = 'right', // left, center, right
        background = null,
        width = { width: null, max: '450px', min: null },
        height = { height: null, max: null, min: null },
        overflow = { both: 'auto', x: null, y: null },
        blur = { blur: true, spread: '4px' },
        drag = false,
        onClose = () => { }
    } = options;

    // Default icon selection based on type
    let iconClass = icon;
    if (!iconClass) {
        switch (type) {
            case 'danger':
            case 'error': iconClass = 'fas fa-exclamation-triangle'; break;
            case 'warning': iconClass = 'fas fa-exclamation-circle'; break;
            case 'success': iconClass = 'fas fa-check-circle'; break;
            default: iconClass = 'fas fa-info-circle'; break;
        }
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = `modal-overlay ${position} ${content ? 'popover-mode' : ''}`;

    // Apply blur
    if (blur.blur) {
        overlay.style.backdropFilter = `blur(${blur.spread || '4px'})`;
        overlay.style.webkitBackdropFilter = `blur(${blur.spread || '4px'})`;
    }

    // Container styles
    let style = '';
    if (width.width) style += `width: ${width.width}; `;
    if (width.max) style += `max-width: ${width.max}; `;
    if (width.min) style += `min-width: ${width.min}; `;
    if (height.height) style += `height: ${height.height}; `;
    if (height.max) style += `max-height: ${height.max}; `;
    if (height.min) style += `min-height: ${height.min}; `;
    if (background) style += `background: ${background}; `;

    const overflowX = overflow.x || overflow.both || 'auto';
    const overflowY = overflow.y || overflow.both || 'auto';
    style += `overflow-x: ${overflowX}; overflow-y: ${overflowY}; `;

    overlay.innerHTML = `
        <div class="modal-container" style="${style}" ${drag ? 'draggable="true"' : ''}>
            <button class="modal-close-x" aria-label="Close">&times;</button>
            ${!content ? `
                <div class="modal-icon ${type === 'error' ? 'danger' : type}">
                    <i class="${iconClass}"></i>
                </div>
            ` : ''}
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                ${content ? content : `<p>${message}</p>`}
            </div>
            ${type !== 'content' || (type === 'content' && (confirm || cancel || (buttons && buttons.length > 0))) ? `
                <div class="modal-footer" style="justify-content: ${buttonPositions === 'right' ? 'flex-end' : (buttonPositions === 'left' ? 'flex-start' : 'center')}">
                </div>
            ` : ''}
        </div>
    `;

    document.body.appendChild(overlay);
    activeModal = overlay;
    setTimeout(() => overlay.classList.add('active'), 10);

    const footer = overlay.querySelector('.modal-footer');
    const closeBtn = overlay.querySelector('.modal-close-x');
    const container = overlay.querySelector('.modal-container');

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) document.body.removeChild(overlay);
            if (activeModal === overlay) activeModal = null;
            onClose();
        }, 300);
    };

    const createBtn = (opts, defType = 'confirm') => {
        const btn = document.createElement('button');
        const theme = opts.type || (defType === 'cancel' ? 'cancel' : (type === 'danger' || type === 'error' ? 'danger' : 'confirm'));
        btn.className = `btn modal-btn modal-btn-${theme}`;
        btn.textContent = opts.text || (defType === 'cancel' ? 'Cancel' : 'Confirm');
        if (opts.color) btn.style.color = opts.color;
        if (opts.backgroundColor) btn.style.backgroundColor = opts.backgroundColor;
        btn.addEventListener('click', () => {
            if (opts.onClick) opts.onClick();
            closeModal();
        });
        return btn;
    };

    if (type !== 'content' || (type === 'content' && (confirm || cancel || (buttons && buttons.length > 0)))) {
        console.log('Adding buttons to footer', confirm, cancel, buttons);
        if (cancel) footer.appendChild(createBtn(cancel, 'cancel'));
        if (buttons && buttons.length > 0) {
            buttons.forEach(b => footer.appendChild(createBtn(b, 'confirm')));
        } else if (confirm) {
            footer.appendChild(createBtn(confirm, 'confirm'));
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    if (drag) {
        let isDragging = false, offset = { x: 0, y: 0 };
        container.style.cursor = 'grab';
        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.modal-btn, .modal-close-x')) return;
            isDragging = true;
            offset.x = e.clientX - container.offsetLeft;
            offset.y = e.clientY - container.offsetTop;
            container.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            container.style.position = 'absolute'; container.style.margin = '0';
            container.style.left = (e.clientX - offset.x) + 'px';
            container.style.top = (e.clientY - offset.y) + 'px';
        });
        document.addEventListener('mouseup', () => { isDragging = false; container.style.cursor = 'grab'; });
    }

    return { close: closeModal };
}

/**
 * The Popover object as a Module Export
 * Provides convenient shorthand methods for common UI patterns.
 */
export const Popover = {
    alert: (options) => show({ ...options, type: options.type || 'info', cancel: null }),
    error: (options) => show({ ...options, type: 'error', cancel: null }),
    warning: (options) => show({ ...options, type: 'warning', cancel: null }),
    info: (options) => show({ ...options, type: 'info', cancel: null }),
    success: (options) => show({ ...options, type: 'success', cancel: null }),
    confirm: (options) => show({ ...options, cancel: options.cancel || { text: 'Cancel' } }),
    content: (options) => show({ ...options, content: options.content || options.message }),

    /**
     * Specialized method for loading content from an API
     */
    apiContent: async (options) => {
        const loader = show({
            title: options.title || 'Loading...',
            content: '<div class="loading-spinner-container"><i class="fas fa-spinner fa-spin"></i><p>Loading content...</p></div>',
            confirm: null, cancel: null
        });

        try {
            const api = options.apiConfig || {};
            const res = await fetch(api.url, {
                method: api.method || 'GET',
                headers: api.headers || {},
                body: (api.body && api.method !== 'GET') ? JSON.stringify(api.body) : null
            });
            const html = await res.text();
            loader.close();
            return show({ ...options, content: html });
        } catch (err) {
            loader.close();
            return show({ title: 'Error', message: 'Failed to connect to the server.', type: 'error' });
        }
    }
};