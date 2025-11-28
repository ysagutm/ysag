// Content Loader for YSAG Website

// --- GLOBAL NAMESPACE ---
window.YSAG = {
    currentLang: 'en', // Default

    // Path Helper
    getContentPath: function(filename) {
        return `content/${this.currentLang}/${filename}`;
    },

    // UI Translation Logic
    updateStaticUI: function(uiData) {
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
    toggleLanguage: async function() {
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
    filterResources: function() {
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

    // Team Scroll State
    // Team Scroll State
    teamScroll: { 
        state: { currentPos: 0, isPaused: false, animationId: null },
        
        pause: function() { this.state.isPaused = true; },
        resume: function() { this.state.isPaused = false; },
        
        scroll: function(dir) { 
            const container = document.getElementById('teamScrollContainer');
            if(!container) return;
            
            this.state.isPaused = true;
            const jump = 300;
            // Universal logic: Subtracting moves Left, Adding moves Right
            const target = dir === 'left' ? this.state.currentPos - jump : this.state.currentPos + jump;
            
            container.scrollTo({ left: target, behavior: 'smooth' });
            
            // Sync state after animation
            setTimeout(() => { 
                this.state.currentPos = container.scrollLeft; 
                this.state.isPaused = false; 
            }, 500);
        },
        
        init: function() {
            const container = document.getElementById('teamScrollContainer');
            if (!container) return;

            const self = this;
            if (self.state.animationId) cancelAnimationFrame(self.state.animationId);
            
            // Reset position on init to avoid jumps when switching languages
            container.scrollLeft = 0;
            self.state.currentPos = 0;

            function step() {
                if (!self.state.isPaused) {
                    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
                    const speed = 0.5;

                    if (isRTL) {
                        // RTL Logic: Scroll LEFT (Negative) to see next items
                        self.state.currentPos -= speed;
                        
                        // Infinite Loop Reset for RTL (Check absolute value)
                        if (Math.abs(self.state.currentPos) >= (container.scrollWidth / 2)) {
                            self.state.currentPos = 0;
                        }
                    } else {
                        // LTR Logic: Scroll RIGHT (Positive)
                        self.state.currentPos += speed;
                        
                        // Infinite Loop Reset for LTR
                        if (self.state.currentPos >= (container.scrollWidth / 2)) {
                            self.state.currentPos = 0;
                        }
                    }
                    
                    container.scrollLeft = self.state.currentPos;
                }
                self.state.animationId = requestAnimationFrame(step);
            }

            step();
            
            container.addEventListener('touchstart', () => self.pause());
            container.addEventListener('touchend', () => self.resume());
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

// --- LOADER ---
document.addEventListener('DOMContentLoaded', loadAllContent);

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
    } catch(e) { console.error('UI Load Error:', e); }
}

async function loadHeroContent() {
    try {
        const response = await fetch(YSAG.getContentPath('hero.json'));
        const data = await response.json();
        const hero = document.querySelector('.hero');
        hero.querySelector('h1').textContent = data.title;
        hero.querySelector('p').textContent = data.description;
        
        const container = hero.querySelector('.hero-buttons');
        if(container) {
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
        
        if (data.backgroundImages && data.backgroundImages.length > 0) {
             let slider = hero.querySelector('.hero-bg-slider');
             if(!slider) {
                 slider = document.createElement('div');
                 slider.className = 'hero-bg-slider';
                 hero.insertBefore(slider, hero.firstChild);
             }
             slider.innerHTML = '';
             data.backgroundImages.forEach((url, i) => {
                 const d = document.createElement('div');
                 d.className = `hero-slide ${i===0?'active':''}`;
                 d.style.backgroundImage = `url('${url}')`;
                 slider.appendChild(d);
             });
             
             if (data.backgroundImages.length > 1) {
                if(window.heroInterval) clearInterval(window.heroInterval);
                let current = 0;
                const slides = slider.querySelectorAll('.hero-slide');
                window.heroInterval = setInterval(() => {
                    slides[current].classList.remove('active');
                    current = (current + 1) % slides.length;
                    slides[current].classList.add('active');
                }, 5000);
             }
        }
    } catch(e) { console.error('Hero Load Error:', e); }
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
        if(teamGrid) {
            teamGrid.innerHTML = '';
            const createCard = (m) => `
                <div class="team-member">
                    <img src="${m.image}" class="team-img" alt="${m.name}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22%3E%3Crect fill=%22%23ddd%22 width=%22140%22 height=%22140%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                    <h4>${m.name}</h4>
                    <p>${m.role}</p>
                </div>`;
            
            if (data.team) {
                data.team.forEach(m => teamGrid.innerHTML += createCard(m));
                data.team.forEach(m => teamGrid.innerHTML += createCard(m));
                YSAG.teamScroll.init();
            }
        }
    } catch(e) { console.error('About Load Error:', e); }
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
            let vid = c.videosLink ? 
                `<a href="${c.videosLink}" target="_blank" class="action-btn youtube"><i class="fab fa-youtube"></i> ${YSAG.currentLang === 'ar' ? 'فيديو' : 'Videos'}</a>` : 
                `<span class="action-btn youtube" onclick="alert('${c.videosMessage}')"><i class="fab fa-youtube"></i> ${YSAG.currentLang === 'ar' ? 'فيديو' : 'Videos'}</span>`;
            
            let wa = c.whatsappLink ? 
                `<a href="${c.whatsappLink}" target="_blank" class="action-btn whatsapp"><i class="fab fa-whatsapp"></i> ${YSAG.currentLang === 'ar' ? 'مجموعة' : 'Group'}</a>` : '';

            grid.innerHTML += `
                <div class="resource-card" data-category="${c.category}">
                    <div class="card-img" style="background-color:${c.color}"><i class="${c.icon}"></i></div>
                    <div class="card-content">
                        <div class="card-title">${c.title}</div>
                        <p>${c.description}</p>
                    </div>
                    <div class="card-actions">
                        <a href="${c.filesLink}" target="_blank" class="action-btn files"><i class="fab fa-google-drive"></i> ${YSAG.currentLang === 'ar' ? 'ملفات' : 'Files'}</a>
                        ${wa}
                        ${vid}
                    </div>
                </div>`;
        });
        
        addTooltipStyles();
    } catch(e) { 
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
        if(ps.length > 1) {
            ps[0].textContent = data.fullName;
            ps[1].textContent = data.location;
        }
        document.querySelector('.copyright').textContent = `© ${data.copyright}`;
        
        const links = document.querySelector('.social-links');
        links.innerHTML = '';
        data.socialLinks.forEach(l => {
            links.innerHTML += `<a href="${l.url}" target="_blank" class="${l.platform.toLowerCase()}"><i class="${l.icon}"></i></a>`;
        });
    } catch(e) { console.error(e); }
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