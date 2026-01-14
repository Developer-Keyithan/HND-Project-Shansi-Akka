import { API } from "../../shared/api.js";
import { showNotification } from "../../actions.js";
import { Toast } from "../../plugins/Toast/toast.js";

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Get form data
    const contactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
    };

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        const result = await API.submitContact(contactData);
        if (result.success) {
            Toast({
                icon: 'success',
                title: 'Message Sent',
                message: 'Thank you for your message! We will get back to you soon.'
            });
            form.reset();
        }
    } catch (error) {
        console.error("Contact submit error:", error);
        showNotification(error.message || "Failed to send message. Please try again.", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
