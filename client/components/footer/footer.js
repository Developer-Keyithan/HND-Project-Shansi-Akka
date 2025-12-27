let footerHTMLPath = '';

if (window.location.pathname.includes('/pages/') || window.location.pathname.includes('/dashboards/')) {
    footerHTMLPath = '../components/footer/footer.html';
} else {
    footerHTMLPath = 'components/footer/footer.html';
}

fetch(footerHTMLPath)
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(err => console.error('footer load failed:', err));
