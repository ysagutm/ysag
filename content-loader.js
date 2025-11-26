// Content Loader for YSAG Website

// --- HELPER FUNCTIONS ---

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isSafeUrl(url) {
    if (!url) return false;
    return url.startsWith('#') || 
           url.startsWith('/') || 
           url.startsWith('https://') || 
           url.startsWith('http://');
}

// --- MAIN INITIALIZATION ---

document.addEventListener('DOMContentLoaded', function() {
    loadHeroContent();
    loadAboutContent();
    loadResourcesContent();
    // loadRecommendationsContent(); // REMOVED
    // loadReportsContent(); // REMOVED
    loadFooterContent();
});

// --- SECTION LOADERS ---

// 1. Hero Section (With Background Slider)
// 1. Hero Section (Updated with Button Wrapper)
async function loadHeroContent() {
    try {
        const response = await fetch('content/hero.json');
        if (!response.ok) throw new Error('Hero file not found');
        const data = await response.json();
        
        // 1. Set Text
        document.querySelector('.hero h1').textContent = data.title;
        document.querySelector('.hero p').textContent = data.description;
        
        // 2. Handle Buttons (NEW: With Wrapper)
        const heroSection = document.querySelector('.hero');
        
        // Remove old buttons AND old button container if it exists
        const oldContainer = document.querySelector('.hero-buttons');
        if (oldContainer) oldContainer.remove();
        const existingButtons = heroSection.querySelectorAll('.btn');
        existingButtons.forEach(btn => btn.remove());
        
        // Create new wrapper
        const btnContainer = document.createElement('div');
        btnContainer.className = 'hero-buttons';
        
        data.buttons.forEach(button => {
            const btn = document.createElement('a');
            btn.href = button.link;
            btn.className = 'btn';
            btn.textContent = button.text;
            if (!button.isPrimary) {
                // Inline styles for the secondary button
                btn.style.background = 'transparent';
                btn.style.border = '2px solid white';
            }
            btnContainer.appendChild(btn);
        });

        // Append container to hero
        heroSection.appendChild(btnContainer);

        // 3. Handle Background Slider (Keep existing slider code below...)
        if (data.backgroundImages && data.backgroundImages.length > 0) {
            // ... (Same slider code as before) ...
            // Create container if it doesn't exist
            let sliderContainer = document.querySelector('.hero-bg-slider');
            if (!sliderContainer) {
                sliderContainer = document.createElement('div');
                sliderContainer.className = 'hero-bg-slider';
                heroSection.insertBefore(sliderContainer, heroSection.firstChild);
            }
            // ... rest of slider logic ...
             sliderContainer.innerHTML = '';
            data.backgroundImages.forEach((imgUrl, index) => {
                const slide = document.createElement('div');
                slide.className = 'hero-slide';
                if (index === 0) slide.classList.add('active');
                slide.style.backgroundImage = `url('${imgUrl}')`;
                sliderContainer.appendChild(slide);
            });

            if (data.backgroundImages.length > 1) {
                let currentSlide = 0;
                const slides = sliderContainer.querySelectorAll('.hero-slide');
                setInterval(() => {
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                }, 5000);
            }
        }

    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// 2. About Section
async function loadAboutContent() {
    try {
        const response = await fetch('content/about.json');
        if (!response.ok) throw new Error('About file not found');
        const data = await response.json();

        document.querySelector('.pro-tip').innerHTML = 
            `<i class="fas fa-lightbulb"></i> <strong>Did you know?</strong> ${escapeHtml(data.proTip)}`;
        
        const mvGrid = document.querySelector('.mission-vision-grid');
        mvGrid.innerHTML = '';
        data.missionVision.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'mv-card';
            cardDiv.innerHTML = `
                <i class="${escapeHtml(card.icon)}"></i>
                <h3>${escapeHtml(card.title)}</h3>
                <p>${escapeHtml(card.description)}</p>
            `;
            mvGrid.appendChild(cardDiv);
        });
        
        const teamGrid = document.querySelector('.team-grid');
        teamGrid.innerHTML = ''; 
        
        const createMemberCard = (member) => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member';
            memberDiv.innerHTML = `
                <img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}" class="team-img">
                <h4>${escapeHtml(member.name)}</h4>
                <p>${escapeHtml(member.role)}</p>
            `;
            return memberDiv;
        };

        if (data.team && data.team.length > 0) {
            data.team.forEach(member => teamGrid.appendChild(createMemberCard(member)));
            data.team.forEach(member => teamGrid.appendChild(createMemberCard(member)));
            initTeamScroll(); 
        }

    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// 3. Resources Section (Updated: WhatsApp in Middle)
async function loadResourcesContent() {
    try {
        const response = await fetch('content/resources.json');
        const data = await response.json();
        
        document.querySelector('#resources .section-title h2').textContent = data.title;
        document.querySelector('#resources .section-title p').textContent = data.subtitle;
        document.getElementById('searchInput').placeholder = data.searchPlaceholder;
        
        const resourceGrid = document.getElementById('resourceGrid');
        resourceGrid.innerHTML = '';
        
        data.courses.forEach(course => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'resource-card';
            cardDiv.setAttribute('data-category', course.category);
            
            // 1. Prepare Video Button
            let videoBtnHtml = '';
            if (course.videosLink && isSafeUrl(course.videosLink)) {
                videoBtnHtml = `<a href="${course.videosLink}" target="_blank" class="action-btn"><i class="fab fa-youtube"></i> Videos</a>`;
            } else {
                const msg = course.videosMessage || 'Videos coming soon!';
                videoBtnHtml = `<span class="action-btn" onclick="alert('${escapeHtml(msg)}')"><i class="fab fa-youtube"></i> Videos</span>`;
            }

            // 2. Prepare WhatsApp Button
            let whatsappBtnHtml = '';
            // CHECK: Button only appears if a link exists!
            if (course.whatsappLink && isSafeUrl(course.whatsappLink)) {
                whatsappBtnHtml = `
                    <a href="${course.whatsappLink}" target="_blank" class="action-btn whatsapp">
                        <i class="fab fa-whatsapp"></i> Group
                    </a>`;
            }

            // 3. Render Card (Order: Files -> WhatsApp -> Videos)
            cardDiv.innerHTML = `
                <div class="card-img" style="background-color: ${escapeHtml(course.color)}">
                    <i class="${escapeHtml(course.icon)}"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">${escapeHtml(course.title)}</div>
                    <p>${escapeHtml(course.description)}</p>
                </div>
                <div class="card-actions">
                    <a href="${isSafeUrl(course.filesLink) ? course.filesLink : '#'}" target="_blank" class="action-btn">
                        <i class="fab fa-google-drive"></i> Files
                    </a>
                    
                    ${whatsappBtnHtml}
                    
                    ${videoBtnHtml}
                </div>
            `;
            resourceGrid.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error loading resources content:', error);
    }
}

// 4. Footer Section
async function loadFooterContent() {
    try {
        const response = await fetch('content/footer.json');
        const data = await response.json();
        
        const footer = document.querySelector('footer');
        footer.querySelector('h3').textContent = data.organizationName;
        const footerParagraphs = footer.querySelectorAll('p');
        if(footerParagraphs.length >= 2) {
            footerParagraphs[0].textContent = data.fullName;
            footerParagraphs[1].textContent = data.location;
        }
        
        const socialLinks = footer.querySelector('.social-links');
        socialLinks.innerHTML = '';
        data.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = isSafeUrl(link.url) ? link.url : '#';
            a.title = escapeHtml(link.platform);
            a.innerHTML = `<i class="${escapeHtml(link.icon)}"></i>`;
            socialLinks.appendChild(a);
        });
        
        const copyrightDiv = footer.querySelector('.copyright');
        if (copyrightDiv) {
            copyrightDiv.innerHTML = `&copy; ${data.copyright}`;
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// --- TEAM SCROLLING LOGIC ---

window.teamScrollState = {
    currentPos: 0,
    isPaused: false,
    animationId: null
};

function initTeamScroll() {
    const container = document.getElementById('teamScrollContainer');
    if (!container) return;

    window.teamScrollState.currentPos = container.scrollLeft;
    window.teamScrollState.isPaused = false;
    
    if (window.teamScrollState.animationId) {
        cancelAnimationFrame(window.teamScrollState.animationId);
    }

    const speed = 0.5;

    function step() {
        if (!window.teamScrollState.isPaused) {
            window.teamScrollState.currentPos += speed;
            container.scrollLeft = window.teamScrollState.currentPos;
            
            if (window.teamScrollState.currentPos >= (container.scrollWidth / 2)) {
                window.teamScrollState.currentPos = 0;
                container.scrollLeft = 0;
            }
        }
        window.teamScrollState.animationId = requestAnimationFrame(step);
    }

    step();
    
    container.addEventListener('touchstart', () => window.teamScrollState.isPaused = true);
    container.addEventListener('touchend', () => window.teamScrollState.isPaused = false);
}

window.pauseTeamScroll = function() {
    window.teamScrollState.isPaused = true;
};

window.resumeTeamScroll = function() {
    window.teamScrollState.isPaused = false;
};

window.scrollTeam = function(direction) {
    const container = document.getElementById('teamScrollContainer');
    const jumpAmount = 300; 

    if (direction === 'left') {
        window.teamScrollState.currentPos -= jumpAmount;
        if (window.teamScrollState.currentPos < 0) window.teamScrollState.currentPos = 0;
    } else {
        window.teamScrollState.currentPos += jumpAmount;
    }

    container.scrollTo({
        left: window.teamScrollState.currentPos,
        behavior: 'smooth' 
    });
};