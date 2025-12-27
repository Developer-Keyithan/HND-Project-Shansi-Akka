// Comprehensive script to fix all routing issues in HTML files
const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'pages/menu.html',
    'pages/cart.html',
    'pages/payment.html',
    'pages/payment-success.html',
    'pages/product-view.html',
    'pages/profile.html',
    'pages/about.html',
    'pages/contact.html',
    'pages/faqs.html',
    'pages/diet-planning.html',
    'pages/delivery-tracking.html',
    'auth/login.html',
    'auth/register.html',
    'auth/forgot-password.html',
    'dashboard/admin.html',
    'dashboard/consumer.html',
    'dashboard/seller.html',
    'dashboard/delivery-partner.html',
    'dashboard/delivery-man.html'
];

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        const baseDir = path.dirname(filePath);
        
        // Determine root path based on file location
        let rootPath = '/';
        if (baseDir.includes('pages')) {
            rootPath = '/';
        } else if (baseDir.includes('auth')) {
            rootPath = '/';
        } else if (baseDir.includes('dashboard')) {
            rootPath = '/';
        }
        
        // Fix CSS links
        const cssFixes = [
            { pattern: /href="\.\.\/style\.css"/g, replacement: 'href="/style.css"' },
            { pattern: /href="style\.css"/g, replacement: 'href="/style.css"' },
            { pattern: /href="pages\.css"/g, replacement: 'href="/pages/pages.css"' },
            { pattern: /href="\.\.\/pages\/pages\.css"/g, replacement: 'href="/pages/pages.css"' },
            { pattern: /href="\.\.\/plugins\//g, replacement: 'href="/plugins/' },
            { pattern: /href="plugins\//g, replacement: 'href="/plugins/' }
        ];
        
        cssFixes.forEach(fix => {
            if (content.match(fix.pattern)) {
                content = content.replace(fix.pattern, fix.replacement);
                modified = true;
            }
        });
        
        // Fix JavaScript links
        const jsFixes = [
            { pattern: /src="\.\.\/shared\//g, replacement: 'src="/shared/' },
            { pattern: /src="shared\//g, replacement: 'src="/shared/' },
            { pattern: /src="\.\.\/pages\//g, replacement: 'src="/pages/' },
            { pattern: /src="pages\//g, replacement: 'src="/pages/' },
            { pattern: /src="\.\.\/auth\//g, replacement: 'src="/auth/' },
            { pattern: /src="auth\//g, replacement: 'src="/auth/' },
            { pattern: /src="\.\.\/dashboard\//g, replacement: 'src="/dashboard/' },
            { pattern: /src="dashboard\//g, replacement: 'src="/dashboard/' }
        ];
        
        jsFixes.forEach(fix => {
            if (content.match(fix.pattern)) {
                content = content.replace(fix.pattern, fix.replacement);
                modified = true;
            }
        });
        
        // Fix navigation links
        const navFixes = [
            // Home links
            { pattern: /href="\.\.\/index\.html"/g, replacement: 'href="/index.html"' },
            { pattern: /href="index\.html"/g, replacement: 'href="/index.html"' },
            // Pages links
            { pattern: /href="\.\.\/pages\/([^"]+)"/g, replacement: 'href="/pages/$1"' },
            { pattern: /href="pages\/([^"]+)"/g, replacement: 'href="/pages/$1"' },
            { pattern: /href="menu\.html"/g, replacement: 'href="/pages/menu.html"' },
            { pattern: /href="cart\.html"/g, replacement: 'href="/pages/cart.html"' },
            { pattern: /href="payment\.html"/g, replacement: 'href="/pages/payment.html"' },
            { pattern: /href="about\.html"/g, replacement: 'href="/pages/about.html"' },
            { pattern: /href="contact\.html"/g, replacement: 'href="/pages/contact.html"' },
            { pattern: /href="faqs\.html"/g, replacement: 'href="/pages/faqs.html"' },
            { pattern: /href="diet-planning\.html"/g, replacement: 'href="/pages/diet-planning.html"' },
            { pattern: /href="delivery-tracking\.html"/g, replacement: 'href="/pages/delivery-tracking.html"' },
            { pattern: /href="product-view\.html/g, replacement: 'href="/pages/product-view.html' },
            { pattern: /href="profile\.html"/g, replacement: 'href="/pages/profile.html"' },
            // Auth links
            { pattern: /href="\.\.\/auth\/([^"]+)"/g, replacement: 'href="/auth/$1"' },
            { pattern: /href="auth\/([^"]+)"/g, replacement: 'href="/auth/$1"' },
            { pattern: /href="login\.html"/g, replacement: 'href="/auth/login.html"' },
            { pattern: /href="register\.html"/g, replacement: 'href="/auth/register.html"' },
            // Dashboard links
            { pattern: /href="\.\.\/dashboard\/([^"]+)"/g, replacement: 'href="/dashboard/$1"' },
            { pattern: /href="dashboard\/([^"]+)"/g, replacement: 'href="/dashboard/$1"' }
        ];
        
        navFixes.forEach(fix => {
            if (content.match(fix.pattern)) {
                content = content.replace(fix.pattern, fix.replacement);
                modified = true;
            }
        });
        
        // Ensure router.js is included
        if (!content.includes('shared/router.js') && content.includes('</body>')) {
            const beforeBody = content.lastIndexOf('</body>');
            content = content.slice(0, beforeBody) + 
                '\n    <script src="/shared/router.js"></script>\n' + 
                content.slice(beforeBody);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`✗ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Process all files
let fixedCount = 0;
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        if (fixFile(filePath)) {
            fixedCount++;
        }
    } else {
        console.log(`⚠ File not found: ${file}`);
    }
});

console.log(`\n✓ Fixed ${fixedCount} files`);


