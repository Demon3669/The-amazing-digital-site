/* =========================================== */
/* main.js - ОБЩИЙ JS ДЛЯ ВСЕХ СТРАНИЦ        */
/* =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    const yearSpans = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    yearSpans.forEach(span => span.textContent = currentYear);

    initSidenavContent();
    initSidenavVisibility();
    initSmoothScroll();
    initStaticRocket();
});

// Плавная прокрутка
function smoothScrollTo(targetY, duration = 1000) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function easing(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        const easeProgress = easing(progress);
        window.scrollTo(0, startY + distance * easeProgress);
        if (progress < 1) requestAnimationFrame(animation);
    }
    requestAnimationFrame(animation);
}

// Содержимое боковой навигации (ссылки)
function initSidenavContent() {
    const sidenavList = document.querySelector('#sidenav ul');
    if (!sidenavList) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    sidenavList.innerHTML = '';

    let links = [];
    if (currentPage === 'index.html') {
        links = [
            { href: '#planets', icon: 'fa-globe', text: 'Планеты', tooltip: 'Планеты' },
            { href: '#stars', icon: 'fa-star', text: 'Звёзды', tooltip: 'Звёзды' },
            { href: '#explorations', icon: 'fa-rocket', text: 'Исследования', tooltip: 'Исследования' },
            { href: '#wonders', icon: 'fa-meteor', text: 'Чудеса', tooltip: 'Чудеса' }
        ];
    } else {
        links = [
            { href: 'index.html', icon: 'fa-home', text: 'Главная', tooltip: 'Главная' },
            { href: 'gallery.html', icon: 'fa-camera', text: 'Галерея', tooltip: 'Галерея' },
            { href: 'contacts.html', icon: 'fa-address-book', text: 'Контакты', tooltip: 'Контакты' }
        ];
    }

    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.className = 'sidenav-link';
        a.innerHTML = `<i class="fas ${link.icon}"></i><span>${link.text}</span><span class="tooltip">${link.tooltip}</span>`;
        li.appendChild(a);
        sidenavList.appendChild(li);
    });

    const topLi = document.createElement('li');
    topLi.className = 'sidenav-to-top';
    topLi.innerHTML = `<a href="#" class="sidenav-link top-link" id="sidenav-top-btn"><i class="fas fa-arrow-up"></i><span>Наверх</span><span class="tooltip">Наверх</span></a>`;
    sidenavList.appendChild(topLi);

    const topBtn = document.getElementById('sidenav-top-btn');
    if (topBtn) {
        topBtn.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo(0, 1000);
        });
    }
}

// Показывать/скрывать боковую панель при скролле
function initSidenavVisibility() {
    const sidenav = document.getElementById('sidenav');
    if (!sidenav) return;
    const header = document.querySelector('header, .page-header');
    const threshold = header ? header.offsetHeight : 150;
    const toggle = () => {
        if (window.scrollY > threshold) sidenav.classList.add('visible');
        else sidenav.classList.remove('visible');
    };
    window.addEventListener('scroll', toggle);
    toggle();
}

// Плавная прокрутка по якорям
function initSmoothScroll() {
    const header = document.querySelector('header, .page-header');
    const headerHeight = header ? header.offsetHeight : 80;
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        if (anchor.getAttribute('href') === '#' || anchor.id === 'sidenav-top-btn') return;
        const hash = anchor.getAttribute('href');
        if (hash && hash.startsWith('#') && hash.length > 1) {
            anchor.addEventListener('click', function(e) {
                const targetId = hash.substring(1);
                let targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight - 15;
                    smoothScrollTo(offsetPosition, 1000);
                    if (history.pushState) history.pushState(null, null, hash);
                }
            });
        }
    });

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetElement = document.getElementById(hash);
        if (targetElement) {
            setTimeout(() => {
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 15;
                smoothScrollTo(offsetPosition, 1000);
            }, 100);
        }
    }
}

// ========== СТАТИЧНАЯ РАКЕТА В БОКОВОЙ ПАНЕЛИ ==========
function initStaticRocket() {
    const sidenav = document.getElementById('sidenav');
    if (!sidenav) return;

    const oldBg = sidenav.querySelector('.sidenav-bg');
    if (oldBg) oldBg.remove();

    const bgContainer = document.createElement('div');
    bgContainer.className = 'sidenav-bg';
    
    const bgImg = document.createElement('img');
    bgImg.src = 'assets/images/ракета.jpg';
    bgImg.alt = 'Ракета';
    bgImg.style.width = '100%';
    bgImg.style.height = '100%';
    bgImg.style.objectFit = 'cover';
    bgImg.style.display = 'block';
    
    // Обработчик ошибки загрузки – чтобы изображение не "ломало" вёрстку
    bgImg.onerror = function() {
        console.warn('Не удалось загрузить ракету.jpg. Проверьте путь.');
        this.style.display = 'none';
        // Можно добавить запасной цвет фона
        bgContainer.style.backgroundColor = 'rgba(13, 27, 42, 0.95)';
    };
    
    bgContainer.appendChild(bgImg);
    
    sidenav.prepend(bgContainer);
}