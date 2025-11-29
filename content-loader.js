// Content Loader for YSAG Website
// Final Version: Syntax Fixed & Logic Restored

// --- GLOBAL NAMESPACE ---
window.YSAG = {
    currentLang: 'en', // Default

    // Path Helper
    getContentPath: function (filename) {
        return `content/${this.currentLang}/${filename}`;
    },

    // UI Translation Logic
    updateStaticUI: function (uiData) {
        // 1. Text Content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = uiData;
            keys.forEach(k => value = value ? value[k] : null);

            if (value) {
                if (el.getAttribute('data-html') === 'true') {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            }
        });

        // 2. Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const keys = key.split('.');
            let value = uiData;
            keys.forEach(k => value = value ? value[k] : null);
            if (value) el.placeholder = value;
        });

        // 3. Form Options
        const topicSelect = document.getElementById('topic');
        if (topicSelect && uiData.form && uiData.form.topicOptions) {
            topicSelect.innerHTML = `<option value="">${this.currentLang === 'ar' ? 'اختر موضوعاً...' : 'Select a topic...'}</option>`;
            for (const [key, text] of Object.entries(uiData.form.topicOptions)) {
                const option = document.createElement('option');
                option.value = text;
                option.textContent = text;
                topicSelect.appendChild(option);
            }
        }
    },

    // Language Toggle
    toggleLanguage: async function () {
        this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';

        const html = document.documentElement;
        html.setAttribute('lang', this.currentLang);
        html.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');

        // Wait for content to reload
        await loadAllContent();

        // FIX: Force a scroll event to update the "Current Page" indicator immediately
        window.dispatchEvent(new Event('scroll'));
    },

    // Resources Filter
    filterResources: function () {
        const input = document.getElementById('searchInput');
        const filter = input.value.toLowerCase();
        const cards = document.getElementsByClassName('resource-card');

        for (let i = 0; i < cards.length; i++) {
            let category = cards[i].getAttribute('data-category');
            let title = cards[i].querySelector('.card-title').innerText.toLowerCase();
            let desc = cards[i].querySelector('p').innerText.toLowerCase();

            if (category.indexOf(filter) > -1 || title.indexOf(filter) > -1 || desc.indexOf(filter) > -1) {
                cards[i].style.display = "";
            } else {
                cards[i].style.display = "none";
            }
        }
    },

    // Team Scroll State (The "Triple Clone" Strategy)
    teamScroll: {
        state: {
            isPaused: false,
            isHovering: false,
            animationId: null,
            currentX: 0,
            speed: 1, 
            
            isDragging: false,
            startX: 0,
            lastTime: performance.now() 
        },

        init: function () {
            const container = document.getElementById('teamScrollContainer');
            const track = document.querySelector('.team-grid');
            if (!container || !track) return;

            const self = this;
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

            this.setupTouch(container);

            // 1. INITIALIZATION
            setTimeout(() => {
                const totalWidth = track.scrollWidth;
                const singleSetWidth = totalWidth / 3;

                // Start in middle
                self.state.currentX = -singleSetWidth;
                track.style.transform = `translate3d(${self.state.currentX}px, 0, 0)`;
            }, 100);

            // 2. THE RENDER LOOP - FIXED for smooth animation
            const step = (currentTime) => {
                const totalWidth = track.scrollWidth;
                const singleSetWidth = totalWidth / 3;

                if (singleSetWidth <= 0) {
                    self.state.animationId = requestAnimationFrame(step);
                    return;
                }

                // FIX #1: Delta time calculation for frame-rate independent movement
                const deltaTime = currentTime - self.state.lastTime;
                self.state.lastTime = currentTime;
                
                // Normalize to 60fps (16.67ms per frame)
                const normalizedSpeed = self.state.speed * (deltaTime / 16.67);

                // A. Auto-Movement (ONLY when not paused/dragging)
                if (!self.state.isDragging && !self.state.isPaused) {
                    if (isRTL) {
                        self.state.currentX += normalizedSpeed;
                    } else {
                        self.state.currentX -= normalizedSpeed;
                    }
                }

                // B. INFINITE RESET (Seamless teleport)
                if (self.state.currentX <= -(singleSetWidth * 2)) {
                    self.state.currentX += singleSetWidth;
                } else if (self.state.currentX >= 0) {
                    self.state.currentX -= singleSetWidth;
                }

                // C. RENDER - FIX #2: Remove Math.round() for smoother sub-pixel rendering
                track.style.transform = `translate3d(${self.state.currentX}px, 0, 0)`;

                self.state.animationId = requestAnimationFrame(step);
            };

            if (this.state.animationId) cancelAnimationFrame(this.state.animationId);
            self.state.lastTime = performance.now();
            step(self.state.lastTime);
        },

        setupTouch: function (container) {
            const self = this;

            container.addEventListener('pointerdown', (e) => {
                self.state.isDragging = true;
                self.state.isPaused = true;
                self.state.startX = e.pageX - self.state.currentX;
                container.style.cursor = 'grabbing';
                container.setPointerCapture(e.pointerId);
            });

            window.addEventListener('pointerup', (e) => {
                if (self.state.isDragging) {
                    self.state.isDragging = false;
                    self.state.isPaused = false; // FIX #3: Resume auto-scroll after drag
                    container.style.cursor = 'grab';
                }
            });

            container.addEventListener('pointermove', (e) => {
                if (!self.state.isDragging) return;
                e.preventDefault();
                self.state.currentX = e.pageX - self.state.startX;
            });
            
            // FIX #4: Add mouse leave handler to prevent stuck dragging
            container.addEventListener('pointerleave', () => {
                if (self.state.isDragging) {
                    self.state.isDragging = false;
                    self.state.isPaused = false;
                    container.style.cursor = 'grab';
                }
            });
        },

        // MANUAL SCROLL - FIX #5: Improved animation curve
        scroll: function (dir) {
            const self = this;
            self.state.isPaused = true;

            const jump = 300;
            let  startX = self.state.currentX;
            let endX;

            if (dir === 'left') {
                endX = startX + jump;
            } else {
                endX = startX - jump;
            }

            const duration = 400;
            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // FIX #5: Smoother easing function (ease-in-out-cubic)
                const ease = progress < 0.5 
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                self.state.currentX = startX + ((endX - startX) * ease);

                // Seamless reset during manual scroll
                const track = document.querySelector('.team-grid');
                const totalWidth = track.scrollWidth;
                const singleSetWidth = totalWidth / 3;

                if (self.state.currentX <= -(singleSetWidth * 2)) {
                    self.state.currentX += singleSetWidth;
                    startX += singleSetWidth; // Adjust start position too
                } else if (self.state.currentX >= 0) {
                    self.state.currentX -= singleSetWidth;
                    startX -= singleSetWidth;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Resume auto-scroll after manual scroll completes
                    setTimeout(() => {
                        self.state.isPaused = false;
                    }, 500); // 500ms pause before resuming
                }
            }
            requestAnimationFrame(animate);
        }
    },

    // Playlist Modal
    openModal: function (title, playlists) {
        const modal = document.getElementById('playlistModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalList = document.getElementById('modalList');

        modalTitle.textContent = title;

        modalList.innerHTML = '';
        if (playlists && playlists.length > 0) {
            playlists.forEach(pl => {
                const link = document.createElement('a');
                link.className = 'playlist-link';
                link.href = pl.url;
                link.target = "_blank";
                link.innerHTML = `<i class="fab fa-youtube"></i> ${pl.name}`;
                modalList.appendChild(link);
            });
        } else {
            modalList.innerHTML = '<p style="text-align:center; color:#666;">No playlists available yet.</p>';
        }

        modal.classList.add('open');
    },

    closeModal: function () {
        const modal = document.getElementById('playlistModal');
        modal.classList.remove('open');
    },

    // Mobile Menu Logic (Syntax Fixed)
    mobileMenu: {
        hamburger: null,
        mobileNav: null,
        overlay: null,
        isOpen: false,

        init: function () {
            this.hamburger = document.getElementById('hamburgerBtn');
            this.mobileNav = document.getElementById('mobileNav');
            this.overlay = document.getElementById('mobileMenuOverlay');

            if (!this.hamburger || !this.mobileNav || !this.overlay) return;

            // Toggle
            this.hamburger.addEventListener('click', () => this.toggle());
            this.overlay.addEventListener('click', () => this.close());

            // Close on link click
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            // Close on ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });
        },

        toggle: function () {
            this.isOpen ? this.close() : this.open();
        },

        open: function () {
            this.hamburger.classList.add('active');
            this.mobileNav.classList.add('active');
            this.overlay.classList.add('active');
            document.body.classList.add('menu-open');
            this.isOpen = true;
        },

        close: function () {
            this.hamburger.classList.remove('active');
            this.mobileNav.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.classList.remove('menu-open');
            this.isOpen = false;
        }
    }
};

// --- HELPER FUNCTIONS ---
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isSafeUrl(url) {
    if (!url) return false;
    return url.startsWith('#') || url.startsWith('/') || url.startsWith('http');
}

function showLoadingState(element, message = 'Loading...') {
    element.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 60px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #B22222;"></i>
            <p style="margin-top: 20px; color: #666;">${escapeHtml(message)}</p>
        </div>
    `;
}

function showErrorState(element, message = 'Content Unavailable') {
    element.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 60px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
            <p style="color: #666;">${escapeHtml(message)}</p>
        </div>
    `;
}

// --- LOADER INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function () {
    loadAllContent();
    YSAG.mobileMenu.init(); // Initialize Mobile Menu here
});

// Expose close function globally for HTML onclick
window.closeModal = function () {
    YSAG.closeModal();
};

// Updated to be Async to ensure order
async function loadAllContent() {
    // 1. UI must load first so Navbar has correct text
    await loadUI();

    // 2. Load rest in parallel
    loadHeroContent();
    loadAboutContent();
    loadResourcesContent();
    loadFooterContent();
}

async function loadUI() {
    try {
        const response = await fetch(YSAG.getContentPath('ui.json'));
        const data = await response.json();
        YSAG.updateStaticUI(data);
    } catch (e) { console.error('UI Load Error:', e); }
}

// 1. Hero Section (Smart Responsive Slider)
async function loadHeroContent() {
    try {
        const response = await fetch(YSAG.getContentPath('hero.json'));
        const data = await response.json();

        // Set Text
        const hero = document.querySelector('.hero');
        hero.querySelector('h1').textContent = data.title;
        hero.querySelector('p').textContent = data.description;

        const container = hero.querySelector('.hero-buttons');
        if (container) {
            container.innerHTML = '';
            data.buttons.forEach(btn => {
                const a = document.createElement('a');
                a.className = 'btn';
                a.href = btn.link;
                a.innerHTML = `<i class="${btn.icon || ''}"></i> ${btn.text}`;
                if (!btn.isPrimary) {
                    a.style.background = 'transparent';
                    a.style.border = '2px solid white';
                }
                container.appendChild(a);
            });
        }

        // --- SMART BACKGROUND SLIDER LOGIC ---
        if (data.backgroundImages && data.backgroundImages.length > 0) {
            let slider = hero.querySelector('.hero-bg-slider');
            if (!slider) {
                slider = document.createElement('div');
                slider.className = 'hero-bg-slider';
                hero.insertBefore(slider, hero.firstChild);
            }

            // Function to render images based on CURRENT screen width
            const renderImages = () => {
                slider.innerHTML = ''; // Clear existing
                const isMobile = window.innerWidth <= 768; // Check width

                data.backgroundImages.forEach((imgObj, i) => {
                    const d = document.createElement('div');
                    d.className = `hero-slide ${i === 0 ? 'active' : ''}`;

                    // Pick the correct URL
                    let url = '';
                    if (typeof imgObj === 'string') {
                        url = imgObj; // Old format fallback
                    } else {
                        url = isMobile ? imgObj.mobile : imgObj.desktop;
                    }

                    d.style.backgroundImage = `url('${url}')`;
                    slider.appendChild(d);
                });
            };

            // 1. Run initially
            renderImages();

            // 2. Add Resize Listener (Debounced for performance)
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    renderImages();
                }, 200); // Only re-render if resize stops for 200ms
            });

            // 3. Start Animation Loop
            if (data.backgroundImages.length > 1) {
                if (window.heroInterval) clearInterval(window.heroInterval);
                let current = 0;

                window.heroInterval = setInterval(() => {
                    const slides = slider.querySelectorAll('.hero-slide');
                    if (slides.length > 0) {
                        slides[current].classList.remove('active');
                        current = (current + 1) % slides.length;
                        slides[current].classList.add('active');
                    }
                }, 5000);
            }
        }
    } catch (e) { console.error('Hero Load Error:', e); }
}

async function loadAboutContent() {
    try {
        const response = await fetch(YSAG.getContentPath('about.json'));
        const data = await response.json();

        document.querySelector('.pro-tip').innerHTML = `<i class="fas fa-lightbulb"></i> <strong>${YSAG.currentLang === 'ar' ? 'هل تعلم؟' : 'Did you know?'}</strong> ${data.proTip}`;

        const mvGrid = document.querySelector('.mission-vision-grid');
        mvGrid.innerHTML = '';
        data.missionVision.forEach(c => {
            mvGrid.innerHTML += `
                <div class="mv-card">
                    <i class="${c.icon}"></i>
                    <h3>${c.title}</h3>
                    <p>${c.description}</p>
                </div>`;
        });

        const teamGrid = document.querySelector('.team-grid');
        if (teamGrid) {
            teamGrid.innerHTML = '';

            // Helper to create HTML string
            const createCard = (m) => `
                <div class="team-member">
                    <img src="${m.image}" class="team-img" alt="${m.name}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Crect fill=%22%23ddd%22 width=%22140%22 height=%22140%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                    <h4>${m.name}</h4>
                    <p>${m.role}</p>
                </div>`;

            if (data.team) {
                let html = '';
                data.team.forEach(m => html += createCard(m)); // Set A (Left Buffer)
                data.team.forEach(m => html += createCard(m)); // Set B (Middle/Start)
                data.team.forEach(m => html += createCard(m)); // Set C (Right Buffer)

                teamGrid.innerHTML = html;

                YSAG.teamScroll.init();
            }
        }
    } catch (e) { console.error('About Load Error:', e); }
}

async function loadResourcesContent() {
    const grid = document.getElementById('resourceGrid');
    try {
        const response = await fetch(YSAG.getContentPath('resources.json'));
        const data = await response.json();

        document.querySelector('#resources .section-title h2').textContent = data.title;
        document.querySelector('#resources .section-title p').textContent = data.subtitle;
        document.getElementById('searchInput').placeholder = data.searchPlaceholder;

        grid.innerHTML = '';

        data.courses.forEach(c => {

            // 1. Files Button Logic (NEW: Now Optional)
            let filesBtnHtml = '';
            if (c.filesLink && isSafeUrl(c.filesLink)) {
                filesBtnHtml = `
                    <a href="${c.filesLink}" target="_blank" class="action-btn files">
                        <i class="fab fa-google-drive"></i> ${YSAG.currentLang === 'ar' ? 'ملفات' : 'Files'}
                    </a>`;
            }

            // 2. Video Button Logic
            let videoBtnHtml = '';
            if (c.playlists && c.playlists.length > 0) {
                const playlistData = encodeURIComponent(JSON.stringify(c.playlists));
                const courseTitle = encodeURIComponent(c.title);

                videoBtnHtml = `
                    <button class="action-btn youtube" onclick="
                        const data = JSON.parse(decodeURIComponent('${playlistData}'));
                        const title = decodeURIComponent('${courseTitle}');
                        YSAG.openModal(title, data);
                    ">
                        <i class="fab fa-youtube"></i> ${YSAG.currentLang === 'ar' ? 'فيديو' : 'Videos'}
                    </button>`;
            }
            else if (c.videosLink) {
                videoBtnHtml = `<a href="${c.videosLink}" target="_blank" class="action-btn youtube"><i class="fab fa-youtube"></i> ${YSAG.currentLang === 'ar' ? 'فيديو' : 'Videos'}</a>`;
            }
            else {
                const msg = c.videosMessage || (YSAG.currentLang === 'ar' ? 'قريباً' : 'Coming Soon');
                videoBtnHtml = `<span class="action-btn youtube disabled" onclick="alert('${escapeHtml(msg)}')"><i class="fab fa-youtube"></i> ${YSAG.currentLang === 'ar' ? 'فيديو' : 'Videos'}</span>`;
            }

            // 3. WhatsApp Button Logic
            let wa = c.whatsappLink ?
                `<a href="${c.whatsappLink}" target="_blank" class="action-btn whatsapp"><i class="fab fa-whatsapp"></i> ${YSAG.currentLang === 'ar' ? 'مجموعة' : 'Group'}</a>` : '';

            // 4. Render Card
            grid.innerHTML += `
                <div class="resource-card" data-category="${c.category}">
                    <div class="card-img" style="background-color:${c.color}"><i class="${c.icon}"></i></div>
                    <div class="card-content">
                        <div class="card-title">${c.title}</div>
                        <p>${c.description}</p>
                    </div>
                    <div class="card-actions">
                        ${filesBtnHtml}
                        ${wa}
                        ${videoBtnHtml} 
                    </div>
                </div>`;
        });

        addTooltipStyles();
    } catch (e) {
        console.error('Resource Load Error:', e);
        showErrorState(grid, 'Resources Unavailable');
    }
}

async function loadFooterContent() {
    try {
        const response = await fetch(YSAG.getContentPath('footer.json'));
        const data = await response.json();

        document.querySelector('footer h3').textContent = data.organizationName;
        const ps = document.querySelectorAll('footer p');
        if (ps.length > 1) {
            ps[0].textContent = data.fullName;
            ps[1].textContent = data.location;
        }
        document.querySelector('.copyright').textContent = `© ${data.copyright}`;

        const links = document.querySelector('.social-links');
        links.innerHTML = '';
        data.socialLinks.forEach(l => {
            links.innerHTML += `<a href="${l.url}" target="_blank" class="${l.platform.toLowerCase()}"><i class="${l.icon}"></i></a>`;
        });
    } catch (e) { console.error(e); }
}

function addTooltipStyles() {
    if (document.getElementById('tooltip-styles')) return;
    const style = document.createElement('style');
    style.id = 'tooltip-styles';
    style.textContent = `
        .action-btn.disabled { opacity: 0.5; cursor: not-allowed; position: relative; }
    `;
    document.head.appendChild(style);
}