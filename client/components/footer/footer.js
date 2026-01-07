// Footer Component Loader
// Uses window.ClientRoot set by load-scripts.js for correct path resolution

const prefix = window.ClientRoot || ''; // Fallback to empty if not set
const footerHTMLPath = prefix + 'components/footer/footer.html';

fetch(footerHTMLPath)
    .then(response => response.text())
    .then(data => {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder) {
            placeholder.innerHTML = data;
        }
    })
    .catch(err => console.error('Footer load failed:', err));
