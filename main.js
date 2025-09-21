function loadComponent(targetId, filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
            if (callback) callback();
        });
}

document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header', 'components/header.html');
    loadComponent('hero', 'components/hero.html');
    // loadComponent('about-us', 'components/about-us.html');
    // loadComponent('section-lavique', 'components/section-lavique.html');
    // loadComponent('footer', 'components/footer.html');

});