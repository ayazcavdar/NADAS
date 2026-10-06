/**
 * NADAS Restaurant - Main JavaScript
 * Handles: Tab-Based Page Switching, Hero Image Slider,
 * Mobile Drawer, Gallery Lightbox, and History State Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabNavigation();
    initHeroSlider();
    initMobileDrawer();
    initGalleryLightbox();
    updateCopyrightYears();
});

/* ==========================================================================
   1. Tab-Based Page Navigation (5 Pages: Anasayfa, Hakkımızda, Menü, Galeri, İletişim)
   ========================================================================== */
const VALID_TABS = ['anasayfa', 'hakkimizda', 'menu', 'galeri', 'iletisim'];

function switchTab(tabId, updateHistory = true) {
    if (!VALID_TABS.includes(tabId)) {
        tabId = 'anasayfa';
    }

    // 1. Update Body Classes for Transparent vs Sticky Header styling
    if (tabId === 'anasayfa') {
        document.body.classList.add('page-anasayfa-active');
        document.body.classList.remove('page-sub-active');
    } else {
        document.body.classList.remove('page-anasayfa-active');
        document.body.classList.add('page-sub-active');
    }

    // 2. Activate target tab page, deactivate others
    const tabPages = document.querySelectorAll('.tab-page');
    tabPages.forEach(page => {
        if (page.id === `tab-${tabId}`) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // 3. Update active states on desktop & mobile navigation links
    const tabLinks = document.querySelectorAll('.nav-tab-link');
    tabLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 5. Update browser URL hash for seamless back/forward navigation
    if (updateHistory) {
        if (tabId === 'anasayfa') {
            if (window.location.hash) {
                history.pushState(null, '', window.location.pathname + window.location.search);
            }
        } else {
            history.pushState(null, '', `#${tabId}`);
        }
    }
}

function initTabNavigation() {
    // Listen to clicks on all tab links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-tab-link, .logo-link');
        if (!link) return;

        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        if (tabId) {
            switchTab(tabId, true);

            // Close mobile drawer if open
            closeMobileDrawer();
        }
    });

    // Check initial hash on page load
    const initialHash = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_TABS.includes(initialHash)) {
        switchTab(initialHash, false);
    } else {
        switchTab('anasayfa', false);
    }

    // Handle browser Back / Forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (VALID_TABS.includes(hash)) {
            switchTab(hash, false);
        } else {
            switchTab('anasayfa', false);
        }
    });
}

/* ==========================================================================
   2. Hero Fullscreen Slider (Anasayfa)
   ========================================================================== */
function initHeroSlider() {
    const sliderContainer = document.getElementById('heroSlider');
    if (!sliderContainer) return;

    const slides = sliderContainer.querySelectorAll('.hero-slide');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    
    if (!slides.length) return;

    let currentIndex = 0;
    let autoSlideInterval = null;
    const intervalDuration = 6500; // 6.5s per slide

    const goToSlide = (index) => {
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        slides.forEach((slide, i) => {
            if (i === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, intervalDuration);
    };

    const stopAutoSlide = () => {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    };

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    // Touch Swipe Support for Tablets & Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) > 40) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoSlide();
    }, { passive: true });

    // Start auto slide
    startAutoSlide();
}

/* ==========================================================================
   3. Mobile Drawer Navigation
   ========================================================================== */
function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

function initMobileDrawer() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const closeBtn = document.getElementById('drawer-close-btn');
    const overlay = drawer ? drawer.querySelector('.drawer-overlay') : null;

    if (!menuBtn || !drawer) return;

    const openDrawer = () => {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    menuBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
    if (overlay) overlay.addEventListener('click', closeMobileDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeMobileDrawer();
        }
    });
}

/* ==========================================================================
   4. Gallery Lightbox Modal
   ========================================================================== */
function initGalleryLightbox() {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-card, .gallery-item'));
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');

    if (!modal || !galleryItems.length) return;

    let currentIndex = 0;

    const openModalByIndex = (index) => {
        if (index < 0) index = galleryItems.length - 1;
        if (index >= galleryItems.length) index = 0;
        currentIndex = index;

        const item = galleryItems[currentIndex];
        const src = item.getAttribute('data-src') || (item.querySelector('img') ? item.querySelector('img').src : '');
        const caption = item.getAttribute('data-caption') || '';

        modalImg.src = src;
        modalCaption.textContent = caption;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            modalImg.src = '';
            modalCaption.textContent = '';
        }, 200);
    };

    galleryItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openModalByIndex(index);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('lightbox-content')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowRight') {
            openModalByIndex(currentIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            openModalByIndex(currentIndex - 1);
        }
    });
}

/* ==========================================================================
   5. Dynamic Copyright Year
   ========================================================================== */
function updateCopyrightYears() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = year;
    });
}
