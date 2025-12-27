// Client-side Router for HealthyBite Platform
// Handles path normalization and active navigation for multi-page HTML site

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Fix all relative paths to absolute paths on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.fixAllLinks();
                this.updateActiveNav();
            });
        } else {
            this.fixAllLinks();
            this.updateActiveNav();
        }

        // Listen for navigation changes
        window.addEventListener('popstate', () => {
            this.updateActiveNav();
        });

        // Fix links when DOM changes
        const observer = new MutationObserver(() => {
            this.fixAllLinks();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Fix all relative links to use absolute paths from root
    fixAllLinks() {
        const rootPath = this.getRootPath();
        
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip if already absolute, external, anchor, or javascript
            if (!href || 
                href.startsWith('http://') || 
                href.startsWith('https://') || 
                href.startsWith('//') ||
                href.startsWith('#') ||
                href.startsWith('javascript:')) {
                return;
            }
            
            // Convert to absolute path from root
            const absolutePath = this.resolveToAbsolute(href, rootPath);
            if (absolutePath !== href) {
                link.setAttribute('href', absolutePath);
            }
        });
    }

    // Resolve relative path to absolute path from root
    resolveToAbsolute(href, rootPath) {
        // If already absolute from root, return as is
        if (href.startsWith('/')) {
            return this.normalizePath(href);
        }
        
        // Remove ./ prefix if present
        if (href.startsWith('./')) {
            href = href.substring(2);
        }
        
        // Handle ../ paths
        if (href.startsWith('../')) {
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            
            let path = currentDir;
            let remaining = href;
            
            while (remaining.startsWith('../')) {
                // Go up one directory
                const lastSlash = path.lastIndexOf('/', path.length - 2);
                path = lastSlash >= 0 ? path.substring(0, lastSlash + 1) : '/';
                remaining = remaining.substring(3);
            }
            
            return this.normalizePath(path + remaining);
        }
        
        // Regular relative path - resolve from root
        // If href is "pages/menu.html" and we're at root, result is "/pages/menu.html"
        // If href is "menu.html" and we're in /pages/, result is "/pages/menu.html"
        const currentPath = window.location.pathname;
        
        // If we're in a subdirectory and href doesn't include a subdirectory path
        if (currentPath.includes('/pages/') && !href.includes('/')) {
            // Link is relative to current directory
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            return this.normalizePath(currentDir + href);
        } else if (currentPath.includes('/auth/') && !href.includes('/')) {
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            return this.normalizePath(currentDir + href);
        } else if (currentPath.includes('/dashboard/') && !href.includes('/')) {
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            return this.normalizePath(currentDir + href);
        }
        
        // Default: resolve from root
        return this.normalizePath(rootPath + href);
    }

    // Get root path of the application
    getRootPath() {
        const path = window.location.pathname;
        
        // If at root or index.html, root is /
        if (path === '/' || path === '/index.html') {
            return '/';
        }
        
        // Find root by looking for project structure
        // Root is before /pages/, /auth/, or /dashboard/
        const subdirs = ['/pages/', '/auth/', '/dashboard/'];
        for (const subdir of subdirs) {
            const index = path.indexOf(subdir);
            if (index > 0) {
                return path.substring(0, index);
            }
        }
        
        // Default: assume root is /
        return '/';
    }

    // Normalize path (remove double slashes, ensure starts with /)
    normalizePath(path) {
        if (!path) return '/';
        
        // Remove double slashes
        path = path.replace(/\/+/g, '/');
        
        // Remove trailing slash except for root
        if (path.length > 1 && path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        
        // Ensure it starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        return path;
    }

    // Update active navigation item based on current path
    updateActiveNav() {
        const currentPath = this.normalizePath(window.location.pathname);
        
        document.querySelectorAll('.nav-menu a, .footer a').forEach(link => {
            link.classList.remove('active');
            
            try {
                const href = link.getAttribute('href');
                if (!href) return;
                
                // Skip external links and anchors
                if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
                    return;
                }
                
                // Resolve link path
                const rootPath = this.getRootPath();
                const linkPath = this.normalizePath(this.resolveToAbsolute(href, rootPath));
                
                // Check if current path matches
                if (linkPath === currentPath) {
                    link.classList.add('active');
                } else if (linkPath === '/index.html' && (currentPath === '/' || currentPath === '/index.html')) {
                    link.classList.add('active');
                } else if (currentPath === '/index.html' && linkPath === '/') {
                    link.classList.add('active');
                }
            } catch (e) {
                // Ignore errors
                console.debug('Navigation update error:', e);
            }
        });
    }

    // Register a route (for future SPA functionality)
    route(path, handler) {
        this.routes[path] = handler;
    }

    // Navigate to a route (uses browser navigation for HTML files)
    navigate(path) {
        const normalizedPath = this.normalizePath(path);
        if (normalizedPath !== window.location.pathname) {
            window.location.href = normalizedPath;
        }
    }
}

// Initialize router
const router = new Router();

// Export for use in other modules
window.Router = router;

