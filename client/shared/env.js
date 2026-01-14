// Environment utilities
export const getClientRoot = () => {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        const src = script.getAttribute('src');
        if (src && src.includes('load-scripts.js')) {
            return src.replace('load-scripts.js', '');
        }
    }
    return '';
};

export const ClientRoot = getClientRoot();
