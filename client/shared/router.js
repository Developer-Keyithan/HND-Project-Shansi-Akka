// Client-side Router
// Handles navigation without .html extensions matching the folder structure

// API Check removed as it's not strictly needed for router interception logic.

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore special protocols explicitly
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // Check if it's an internal link
    let targetUrl;
    try {
        // link.href returns the full absolute URL resolved by the browser
        targetUrl = new URL(link.href, window.location.href);
    } catch (e) {
        return;
    }

    // specific check for external domains
    if (targetUrl.origin !== window.location.origin) return;

    e.preventDefault();

    let displayPath = targetUrl.pathname + targetUrl.search + targetUrl.hash;
    // Keeping .html extension to support page reloads on static server
    // if (displayPath.endsWith('.html')) {
    //    displayPath = displayPath.slice(0, -5);
    // }

    // Normalize path to absolute
    // If href is relative, resolve it against current location
    // Simply using the href directly in pushState works if it's relative

    window.history.pushState({}, "", displayPath);
    handleLocation();
});

window.onpopstate = handleLocation;

async function handleLocation() {
    let path = window.location.pathname;

    // Map root to index
    if (path === '/' || path.endsWith('/')) {
        path += 'index';
    }

    // Construct the actual file path to fetch (append .html if missing)
    let fetchPath = path;
    if (!fetchPath.endsWith('.html')) {
        fetchPath += '.html';
    }

    try {
        const response = await fetch(fetchPath);

        if (!response.ok) {
            // Handle 404
            console.warn(`Page not found: ${fetchPath}`);
            const root = window.ClientRoot || '';
            const errorPath = root + 'pages/errors/404.html';

            try {
                const errorResponse = await fetch(errorPath);
                if (errorResponse.ok) {
                    const errorHtml = await errorResponse.text();
                    replacePage(errorHtml);
                } else {
                    console.error('Error page also missing:', errorPath);
                }
            } catch (err) {
                console.error('Failed to fetch error page:', err);
            }
            return;
        }

        const html = await response.text();
        replacePage(html);

    } catch (e) {
        console.error('Router Error:', e);
    }
}

function replacePage(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Update Title
    document.title = doc.title;

    // Replace Body Content
    document.body.innerHTML = doc.body.innerHTML;

    // Re-execute scripts
    // 1. Core 'load-scripts.js' (if needed, but usually redundant if globally loaded)
    // 2. Page specific scripts found in the new body

    const scripts = doc.querySelectorAll('script');
    scripts.forEach(oldScript => {
        // Create a new script element to force execution
        const newScript = document.createElement('script');

        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        // Copy content
        if (oldScript.src) {
            // For external scripts, we might need to await loading if there are dependencies
            // But simpler for now: just append
        } else {
            newScript.textContent = oldScript.textContent;
        }

        document.body.appendChild(newScript);
    });

    // Re-initialize Global Components (Navbar, etc) because we wiped the body
    // load-scripts.js serves this purpose usually.
    // If the new page has <script src="load-scripts.js"> it will re-run.

    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle initial load
// If loaded with /menu (no extension), servers usually 404.
// This client-side router works best if we start from a valid .html page or if server rewrites to index.html
// Since we can't change server, this router mainly smoothes out navigation *after* initial load.
// Or if user opens /index.html, updates URL to /, then navigates.
