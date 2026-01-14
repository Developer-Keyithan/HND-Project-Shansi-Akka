// Privacy Policy JavaScript
import { API } from '../../shared/api.js';
import { showLoading, renderMarkdown } from '../../shared/common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.pages-content-section .container');
    if (!container) return;

    try {
        // Show loading state
        showLoading(container, 'Loading privacy policy...');

        const privacyData = await API.getPrivacyPolicy();

        if (privacyData) {
            let html = `<p style="color: var(--text-light); font-style: italic; margin-bottom: 30px;">Last updated: ${privacyData.lastUpdated}</p>`;

            privacyData.sections.forEach(section => {
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
            container.innerHTML = '<p class="text-center">No privacy policy available.</p>';
        }
    } catch (error) {
        console.error('Error loading privacy policy:', error);
        container.innerHTML = '<p class="error-text text-center">An error occurred while loading content.</p>';
    }
});
