// EmailJS wrapper
export const EmailJS = window.emailjs;

export const sendEmail = (templateId, params) => {
    if (!EmailJS) {
        console.warn('EmailJS not loaded yet');
        return Promise.reject('EmailJS not loaded');
    }
    return EmailJS.send("service_hb", templateId, params);
};
