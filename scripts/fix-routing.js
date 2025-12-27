// Script to fix routing in all HTML files
// Run with: node scripts/fix-routing.js

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

// Patterns to fix
const routingFixes = [
    // Fix relative paths to absolute
    { pattern: /href="(?!http|https|#|javascript:|mailto:)([^"]+)"/g, replacement: (match, p1) => {
        if (p1.startsWith('/')) return match; // Already absolute
        if (p1.startsWith('../')) return match; // Keep relative for parent directories
        return `href="/${p1}"`;
    }},
    // Fix script src paths
    { pattern: /src="(?!http|https)([^"]+)"/g, replacement: (match, p1) => {
        if (p1.startsWith('/')) return match;
        return `src="/${p1}"`;
    }},
    // Fix link href paths
    { pattern: /href='(?!http|https|#|javascript:|mailto:)([^']+)'/g, replacement: (match, p1) => {
        if (p1.startsWith('/')) return match;
        if (p1.startsWith('../')) return match;
        return `href="/${p1}"`;
    }}
];

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        routingFixes.forEach(fix => {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        });
        
        // Ensure router.js and other shared files are included
        if (!content.includes('shared/router.js')) {
            const beforeClosingBody = content.lastIndexOf('</body>');
            if (beforeClosingBody > 0) {
                content = content.slice(0, beforeClosingBody) + 
                    '\n    <script src="/shared/router.js"></script>\n' + 
                    content.slice(beforeClosingBody);
                modified = true;
            }
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


