// Common head elements for all pages
// This ensures consistent CSS and script loading

(function() {
    // Add common CSS links
    const commonStyles = [
        { href: '/style.css', rel: 'stylesheet' },
        { href: '/plugins/fontawesome-free-7.1.0-web/css/all.min.css', rel: 'stylesheet' },
        { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&display=swap', rel: 'stylesheet' }
    ];

    commonStyles.forEach(style => {
        if (!document.querySelector(`link[href="${style.href}"]`)) {
            const link = document.createElement('link');
            link.rel = style.rel;
            link.href = style.href;
            document.head.appendChild(link);
        }
    });

    // Add common scripts
    const commonScripts = [
        '/shared/config.js',
        '/shared/data.js',
        '/shared/utils.js',
        '/shared/auth.js',
        '/shared/router.js',
        '/shared/emailjs.js',
        '/shared/googledrive.js',
        '/shared/socialauth.js',
        '/shared/logger.js'
    ];

    commonScripts.forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            document.head.appendChild(script);
        }
    });
})();


