const scriptMap = [
    { name: 'navbar-functions', pathRoot: 'components/navbar/' },
    { name: 'navbar', pathRoot: 'components/navbar/' },
    { name: 'footer', pathRoot: 'components/footer/' },
];

const styles = [
    { href: 'style.css', rel: 'stylesheet' },
    { href: 'plugins/fontawesome-free-7.1.0-web/css/all.min.css', rel: 'stylesheet' },
    { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&display=swap', rel: 'stylesheet' },
    { href: 'components/navbar/navbar.css', rel: 'stylesheet' },
    { href: 'components/footer/footer.css', rel: 'stylesheet' },
    // Responsive Styles (Order Matters)
    { href: 'style.md.css', rel: 'stylesheet' },
    { href: 'style.sm.css', rel: 'stylesheet' },
    { href: 'style.xs.css', rel: 'stylesheet' },
    { href: 'style.lg.css', rel: 'stylesheet' },
    { href: 'style.xl.css', rel: 'stylesheet' },
    { href: 'style.2xl.css', rel: 'stylesheet' }
];

const sharedScripts = [
    'shared/data.js',
    'shared/api.js',
    'shared/utils.js',
    'shared/auth.js',
    // 'shared/router.js' // Disabled
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
        const s = document.createElement('script');
        s.src = prefix + script.pathRoot + script.name + '.js';
        s.type = 'module';
        s.defer = true;
        document.body.appendChild(s);
    });
}

// Inject shared scripts and styles
function injectShared() {
    const prefix = window.ClientRoot;

    styles.forEach(s => {
        // Check if style is absolute URL
        const href = s.href.startsWith('http') ? s.href : prefix + s.href;

        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = s.rel;
            link.href = href;
            document.head.appendChild(link);
        }
    });

    sharedScripts.forEach(src => {
        const fullSrc = prefix + src;
        // Avoid duplicates
        if (!document.querySelector(`script[src="${fullSrc}"]`)) {
            const s = document.createElement('script');
            s.src = fullSrc;
            // s.type = 'module'; // Shared scripts currently not modules in many HTMLs, but let's keep consistent if they are written as such. 
            // Most shared scripts (auth, data) shown previously are regular scripts or have global exposure.
            // Let's load them as regular scripts to ensure availability.
            s.defer = true;
            document.head.appendChild(s);
        }
    });
}

// Execute
injectShared();
injectScripts();
