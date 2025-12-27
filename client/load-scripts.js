const scriptMap = [
    {
        name: 'navbar-functions',
        pathRoot: 'components/navbar/'
    },
    {
        name: 'navbar',
        pathRoot: 'components/navbar/'
    },
    {
        name: 'footer',
        pathRoot: 'components/footer/'
    },
    // {
    //     name: 'dashboard-utils',
    //     pathRoot: 'components/dashboard/' // example
    // }
];

// Determine folder depth
const currentPath = window.location.pathname;
let depth = 0;
currentPath.split('/').forEach(segment => {
    if(segment) depth++;
});

// Generate correct path
function getPath(pathRoot) {
    let prefix = '';
    if(depth > 1) {
        // Subfolder pages or dashboards
        prefix = '../'.repeat(depth - 1);
    }
    return prefix + pathRoot;
}

// Inject all scripts
scriptMap.forEach(script => {
    const fullPath = getPath(script.pathRoot) + script.name + '.js';
    const s = document.createElement('script');
    s.src = fullPath;
    s.type = 'module';
    s.defer = true;
    document.body.appendChild(s);
});
