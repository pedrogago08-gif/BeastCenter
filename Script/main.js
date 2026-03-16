// Script principal do BeastCenter
// Funções globais utilizadas em todo o website

// Função para navegação suave ao clicar em links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Função para animação ao scroll (fade in elements)
function revealOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav ul');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// Função para formatar preços
function formatPrice(price) {
    return price.toFixed(2).replace('.', ',') + '€';
}

// Função para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para mostrar notificações toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Função para carregar dados do localStorage
function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Erro ao ler localStorage:', error);
        return null;
    }
}

// Função para guardar dados no localStorage
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Erro ao guardar no localStorage:', error);
        return false;
    }
}

function getDashboardUrlForUser(user) {
    if (!user) {
        return "login.html";
    }

    return user.role === "admin" ? "admin/dashboard.html" : "cliente/dashboard.html";
}

function getRelativeUrl(path) {
    const currentPath = window.location.pathname.toLowerCase();
    const isStorePage = currentPath.includes("/pages/loja/");
    const isClientPage = currentPath.includes("/pages/cliente/");
    const isAdminPage = currentPath.includes("/pages/admin/");

    if (isStorePage || isClientPage || isAdminPage) {
        return "../" + path;
    }

    return path;
}

function updatePublicNavbar() {
    const navList = document.querySelector('.navbar nav ul');
    if (!navList) {
        return;
    }

    const user = getLocalStorage('currentUser');
    const loginButton = navList.querySelector('.login-btn');
    const loginItem = loginButton ? loginButton.closest('li') : null;
    const existingDashboardItem = document.getElementById('site-dashboard-link');
    const existingLogoutItem = document.getElementById('site-logout-item');

    if (!user) {
        if (existingDashboardItem) {
            existingDashboardItem.remove();
        }

        if (existingLogoutItem) {
            existingLogoutItem.remove();
        }

        if (loginButton) {
            loginButton.hidden = false;
            loginButton.textContent = 'Login';
            loginButton.onclick = function () {
                window.location.href = getRelativeUrl('login.html');
            };
        }

        if (loginItem) {
            loginItem.hidden = false;
        }
        return;
    }

    if (loginButton) {
        loginButton.hidden = true;
    }

    if (loginItem) {
        loginItem.hidden = true;
    }

    if (!existingDashboardItem) {
        const dashboardItem = document.createElement('li');
        dashboardItem.id = 'site-dashboard-link';
        dashboardItem.innerHTML = '<a href="#">Minha Area</a>';
        const dashboardAnchor = dashboardItem.querySelector('a');
        dashboardAnchor.href = getRelativeUrl(getDashboardUrlForUser(user));

        if (loginButton && loginButton.parentElement) {
            navList.insertBefore(dashboardItem, loginButton.parentElement);
        } else {
            navList.appendChild(dashboardItem);
        }
    } else {
        const dashboardAnchor = existingDashboardItem.querySelector('a');
        if (dashboardAnchor) {
            dashboardAnchor.href = getRelativeUrl(getDashboardUrlForUser(user));
        }
    }

    if (!existingLogoutItem) {
        const logoutItem = document.createElement('li');
        logoutItem.id = 'site-logout-item';
        logoutItem.innerHTML = '<button type="button" class="login-btn logout-nav-btn">Sair</button>';
        const logoutButton = logoutItem.querySelector('button');
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('currentUser');
            window.location.href = getRelativeUrl('Index.html');
        });
        navList.appendChild(logoutItem);
    }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('BeastCenter Website carregado!');

    // Verificar se utilizador está logado
    const user = getLocalStorage('currentUser');
    if (user) {
        console.log('Utilizador logado:', user.name);
    }

    updatePublicNavbar();
    initHeroSlider();
});

function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prevBtn = slider.querySelector('.hero-arrow-prev');
    const nextBtn = slider.querySelector('.hero-arrow-next');
    if (slides.length === 0) return;

    let index = 0;
    let intervalId = null;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = 5000;

    const showSlide = (i) => {
        slides[index].classList.remove('active');
        if (dots[index]) dots[index].classList.remove('active');

        index = (i + slides.length) % slides.length;
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
    };

    const nextSlide = () => showSlide(index + 1);
    const prevSlide = () => showSlide(index - 1);

    const stop = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    const start = () => {
        if (prefersReduced || slides.length < 2) return;
        stop();
        intervalId = setInterval(nextSlide, intervalMs);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
            start();
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            start();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            start();
        });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    showSlide(0);
    start();
}

