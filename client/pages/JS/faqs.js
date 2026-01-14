import { API } from "../../shared/api.js";
import { showLoading } from "../../shared/common.js";

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    try {
        showLoading(container, 'Loading answers...');

        const faqs = await API.getFaqs();

        if (faqs && faqs.length > 0) {
            container.innerHTML = faqs.map((faq, index) => `
                <div class="accordion-item ${index === 0 ? 'active' : ''}">
                    <div class="accordion-header">
                        <h3>${faq.question}</h3>
                        <div class="accordion-icon"><i class="fas fa-chevron-down"></i></div>
                    </div>
                    <div class="accordion-content">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `).join('');

            // Re-init accordion logic
            initAccordion();
        } else {
            container.innerHTML = '<p class="text-center">No FAQs found.</p>';
        }
    } catch (error) {
        console.error("FAQ load error:", error);
        container.innerHTML = '<p class="error-text">Failed to load FAQs.</p>';
    }
});

function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });
}
