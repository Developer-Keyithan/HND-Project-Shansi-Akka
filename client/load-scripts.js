const scriptMap = [
    { name: 'navbar', pathRoot: 'components/navbar/' },
    { name: 'footer', pathRoot: 'components/footer/' },
];

const styles = [
    { href: 'style.css', rel: 'stylesheet' },
    { href: 'plugins/fontawesome-free-7.1.0-web/css/all.min.css', rel: 'stylesheet' },
    { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&display=swap', rel: 'stylesheet' },
    { href: 'components/navbar/navbar.css', rel: 'stylesheet' },
    { href: 'components/footer/footer.css', rel: 'stylesheet' },
    { href: 'pages/CSS/pages.css', rel: 'stylesheet' },
    { href: 'plugins/Toast/toast.css', rel: 'stylesheet' },
    { href: 'plugins/Modal/modal.css', rel: 'stylesheet' },
    // Responsive Styles (Order Matters)
    { href: 'style.md.css', rel: 'stylesheet' },
    { href: 'style.sm.css', rel: 'stylesheet' },
    { href: 'style.xs.css', rel: 'stylesheet' },
    { href: 'style.lg.css', rel: 'stylesheet' },
    { href: 'style.xl.css', rel: 'stylesheet' },
    { href: 'style.2xl.css', rel: 'stylesheet' }
];

const sharedScripts = [
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
];

// Determine the root prefix based on the script tag src
function getPrefix() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        const src = script.getAttribute('src');
        if (src && src.includes('load-scripts.js')) {
            return src.replace('load-scripts.js', '');
        }
    }
    return '';
}

// Expose prefix globally for components
window.ClientRoot = getPrefix();

// Inject scripts dynamically
function injectScripts() {
    const prefix = window.ClientRoot;

    scriptMap.forEach(script => {
        const fullSrc = prefix + script.pathRoot + script.name + '.js';
        if (!document.querySelector(`script[src="${fullSrc}"]`)) {
            const s = document.createElement('script');
            s.src = fullSrc;
            s.type = 'module';
            s.defer = true;
            document.body.appendChild(s);
        }
    });
}

// Inject shared scripts and styles
function injectShared() {
    const prefix = window.ClientRoot;

    styles.forEach(s => {
        const href = /^https?:\/\//i.test(s.href.trim()) ? s.href.trim() : prefix + s.href;
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = s.rel;
            link.href = href;
            document.head.appendChild(link);
        }
    });

    sharedScripts.forEach(src => {
        const trimmedSrc = src.trim();
        const isAbsolute = /^https?:\/\//i.test(trimmedSrc);
        const fullSrc = isAbsolute ? trimmedSrc : prefix + trimmedSrc;

        if (!document.querySelector(`script[src="${fullSrc}"]`)) {
            const s = document.createElement('script');
            s.src = fullSrc;
            if (!isAbsolute) {
                s.type = 'module';
            }
            s.async = false;
            document.head.appendChild(s);
        }
    });
}

// Execute
injectShared();
injectScripts();
