import { API } from '../../shared/api.js';
import { renderMarkdown, showLoading } from '../../shared/common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.pages-content-section .container');
    if (!container) return;

    try {
        // Show loading state
        showLoading(container, 'Loading terms...');

        const termsData = await API.getTermsOfService();

        if (termsData) {
            let html = `<p style="color: var(--text-light); font-style: italic; margin-bottom: 30px;">Last updated: ${termsData.lastUpdated}</p>`;

            termsData.sections.forEach(section => {
                html += `<h2>${section.title}</h2>`;
                if (section.content) {
                    html += renderMarkdown(section.content);
                }
                if (section.list && section.list.length > 0) {
                    const listMd = section.list.map(item => `* ${item}`).join('\n');
                    html += renderMarkdown(listMd);
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
