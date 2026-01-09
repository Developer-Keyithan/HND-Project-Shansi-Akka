document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.pages-content-section .container');
    if (!container) return;

    try {
        // Wait for Common and API
        let attempts = 0;
        while ((!window.Common || !window.API) && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.Common || !window.API) {
            container.innerHTML = '<p class="error-text text-center">Failed to load system components.</p>';
            return;
        }

        // Show loading state
        window.Common.showLoading(container, 'Loading terms...');

        const termsData = await window.API.getTermsOfService();

        if (termsData) {
            let html = `<p style="color: var(--text-light); font-style: italic; margin-bottom: 30px;">Last updated: ${termsData.lastUpdated}</p>`;

            termsData.sections.forEach(section => {
                html += `<h2>${section.title}</h2>`;
                if (section.content) {
                    html += window.Common.renderMarkdown(section.content);
                }
                if (section.list && section.list.length > 0) {
                    const listMd = section.list.map(item => `* ${item}`).join('\n');
                    html += window.Common.renderMarkdown(listMd);
                }
            });

            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-center">No terms of service available.</p>';
        }
    } catch (error) {
        console.error('Error loading terms:', error);
        container.innerHTML = '<p class="error-text text-center">An error occurred while loading content.</p>';
    }
});
