// Mudar fundo da navbar ao fazer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');

    if (window.scrollY > 50) {
        navbar.style.background = '#111';
    } else {
        navbar.style.background = '#000';
    }
});

