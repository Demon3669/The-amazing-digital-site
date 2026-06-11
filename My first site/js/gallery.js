/* =========================================== */
/* gallery.js - Динамическая галерея + факты   */
/* =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('gallery.js загружен');
    renderGallery();
    renderFacts();
    initGallery();
    // initEasterEggs(); // Удалено по требованию (пасхалки не используются)
});

let currentCards = [];

function renderGallery() {
    const galleryContainer = document.getElementById('image-gallery');
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    galleryItems.forEach(item => {
        const card = document.createElement('article');
        card.className = 'image-card';
        card.setAttribute('data-category', item.category);
        card.setAttribute('data-id', item.id);

        card.innerHTML = `
            <div class="card-image">
                <img src="${item.imgSrc}" alt="${item.imgAlt}" class="gallery-img" loading="lazy">
                <div class="image-overlay">
                    <button class="like-btn"><i class="far fa-heart"></i><span class="likes">0</span></button>
                    <button class="zoom-btn" aria-label="Увеличить изображение"><i class="fas fa-expand"></i></button>
                </div>
            </div>
            <div class="card-content">
                <h3 class="image-title">${item.title}</h3>
                <p class="image-date"><i class="far fa-calendar"></i> ${item.date}</p>
                <div class="image-description">${item.description}</div>
                <div class="image-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        const img = card.querySelector('.gallery-img');
        img.onerror = function() {
            this.onerror = null;
            this.src = getPlaceholderImage(item.imgAlt);
        };

        galleryContainer.appendChild(card);
    });

    currentCards = document.querySelectorAll('.image-card');
    restoreLikes();
}

function renderFacts() {
    const factsContainer = document.querySelector('.facts-grid');
    if (!factsContainer) return;
    factsContainer.innerHTML = '';
    factsList.forEach(fact => {
        const factCard = document.createElement('div');
        factCard.className = 'fact-card';
        factCard.innerHTML = `
            <div class="fact-icon"><i class="fas ${fact.icon}"></i></div>
            <div class="fact-content">
                <h4>${fact.title}</h4>
                <p>${fact.text}</p>
            </div>
        `;
        factsContainer.appendChild(factCard);
    });
}

function restoreLikes() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        const card = btn.closest('.image-card');
        const cardId = card?.dataset.id;
        if (cardId !== undefined) {
            const saved = localStorage.getItem(`likes_${cardId}`);
            if (saved !== null) {
                const likesSpan = btn.querySelector('.likes');
                const heartIcon = btn.querySelector('i');
                const likes = parseInt(saved) || 0;
                likesSpan.textContent = likes;
                if (likes > 0) {
                    btn.classList.add('liked');
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                }
            }
        }
    });
    updateTotalLikes();
}

function updateTotalLikes() {
    const totalEl = document.getElementById('total-likes');
    if (!totalEl) return;
    let total = 0;
    document.querySelectorAll('.likes').forEach(span => {
        total += parseInt(span.textContent) || 0;
    });
    totalEl.textContent = total;
}

function initGallery() {
    setupLikes();
    setupViewToggle();
    setupFilters();
    setupZoom();
    countPhotos();
}

function countPhotos() {
    const visible = document.querySelectorAll('.image-card:not([style*="display: none"])');
    const counterLogo = document.getElementById('count');
    const counterStats = document.getElementById('count-stats');
    if (counterLogo) counterLogo.textContent = visible.length;
    if (counterStats) counterStats.textContent = visible.length;
}

function setupLikes() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const likesSpan = this.querySelector('.likes');
            const heartIcon = this.querySelector('i');
            const card = this.closest('.image-card');
            const cardId = card?.dataset.id;
            if (!likesSpan || !heartIcon || cardId === undefined) return;

            let current = parseInt(likesSpan.textContent) || 0;
            const wasLiked = this.classList.contains('liked');
            if (wasLiked) {
                current--;
                this.classList.remove('liked');
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
            } else {
                current++;
                this.classList.add('liked');
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
            likesSpan.textContent = current;
            localStorage.setItem(`likes_${cardId}`, current);
            updateTotalLikes();
            this.style.transform = 'scale(1.2)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
        });
    });
}

function setupViewToggle() {
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    const galleryGrid = document.getElementById('image-gallery');
    if (!gridBtn || !listBtn || !galleryGrid) return;

    const switchView = (view) => {
        const isList = view === 'list';
        galleryGrid.classList.toggle('list-view', isList);
        gridBtn.classList.toggle('active', !isList);
        listBtn.classList.toggle('active', isList);
        localStorage.setItem('gallery-view', view);
        setTimeout(countPhotos, 50);
    };
    gridBtn.addEventListener('click', () => switchView('grid'));
    listBtn.addEventListener('click', () => switchView('list'));
    const saved = localStorage.getItem('gallery-view') || 'grid';
    switchView(saved);
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.image-card');
    if (!filterBtns.length || !cards.length) return;

    const applyFilter = (filter) => {
        filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
        cards.forEach(card => {
            const show = filter === 'all' || card.dataset.category === filter;
            card.style.display = show ? 'flex' : 'none';
        });
        localStorage.setItem('gallery-filter', filter);
        countPhotos();
    };
    filterBtns.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
    const savedFilter = localStorage.getItem('gallery-filter') || 'all';
    applyFilter(savedFilter);
}

function setupZoom() {
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = this.closest('.image-card');
            if (!card) return;
            const img = card.querySelector('.gallery-img');
            const title = card.querySelector('.image-title')?.textContent || '';
            const desc = card.querySelector('.image-description')?.innerHTML || '';
            if (!img) return;

            if (document.querySelector('.modal-overlay')) return;
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header"><h3>${title}</h3><button class="close-modal">&times;</button></div>
                    <div class="modal-body">
                        <div class="modal-image-container"><img src="${img.src}" alt="${img.alt}" class="modal-image"></div>
                        <div class="modal-text-container"><p class="modal-description">${desc}</p></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';

            const modalImg = modal.querySelector('.modal-image');
            modalImg.onerror = function() {
                this.onerror = null;
                this.src = getPlaceholderImage('Изображение не найдено');
            };

            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.setAttribute('aria-label', 'Закрыть');

            const closeModal = () => {
                modal.remove();
                document.body.style.overflow = '';
                document.removeEventListener('keydown', escapeHandler);
            };
            const escapeHandler = (e) => { if (e.key === 'Escape') closeModal(); };
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            document.addEventListener('keydown', escapeHandler);
        });
    });
}