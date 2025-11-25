// Content Loader for YSAG Website
// Updated: fixes scrolling stop issues, slow speed, and enables manual buttons

// --- HELPER FUNCTIONS ---

// Prevent XSS attacks
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate URL safety
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
    loadRecommendationsContent();
    loadReportsContent();
    loadFooterContent();
});

// --- SECTION LOADERS ---

// 1. Hero Section
async function loadHeroContent() {
    try {
        const response = await fetch('content/hero.json');
        if (!response.ok) throw new Error('Hero file not found');
        const data = await response.json();
        
        document.querySelector('.hero h1').textContent = data.title;
        document.querySelector('.hero p').textContent = data.description;
        
        const heroSection = document.querySelector('.hero');
        const existingButtons = heroSection.querySelectorAll('.btn');
        existingButtons.forEach(btn => btn.remove());
        
        data.buttons.forEach(button => {
            const btn = document.createElement('a');
            btn.href = button.link;
            btn.className = 'btn';
            btn.textContent = button.text;
            if (!button.isPrimary) {
                btn.style.background = 'transparent';
                btn.style.border = '2px solid white';
                btn.style.marginLeft = '10px';
            }
            heroSection.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// 2. About Section (Includes Team Scroll Logic)
async function loadAboutContent() {
    try {
        const response = await fetch('content/about.json');
        if (!response.ok) throw new Error('About file not found');
        const data = await response.json();

        // Pro Tip & Mission
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
        
        // Team Members
        const teamGrid = document.querySelector('.team-grid');
        teamGrid.innerHTML = ''; // Clear "Loading..." text
        
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

        // Render TWICE for infinite loop illusion
        if (data.team && data.team.length > 0) {
            // Set 1
            data.team.forEach(member => teamGrid.appendChild(createMemberCard(member)));
            // Set 2 (Clone)
            data.team.forEach(member => teamGrid.appendChild(createMemberCard(member)));
            
            // Start the scrolling logic only after content is loaded
            initTeamScroll(); 
        }

    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// 3. Resources Section
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
            
            // Video Button Logic
            let videoBtnHtml = '';
            if (course.videosLink && isSafeUrl(course.videosLink)) {
                videoBtnHtml = `<a href="${course.videosLink}" target="_blank" class="action-btn"><i class="fab fa-youtube"></i> Videos</a>`;
            } else {
                // Use a safe onclick handler setup
                const msg = course.videosMessage || 'Videos coming soon!';
                videoBtnHtml = `<span class="action-btn" onclick="alert('${escapeHtml(msg)}')"><i class="fab fa-youtube"></i> Videos</span>`;
            }

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
                    ${videoBtnHtml}
                </div>
            `;
            resourceGrid.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error loading resources content:', error);
    }
}

// 4. Recommendations Section
async function loadRecommendationsContent() {
    try {
        const response = await fetch('content/recommendations.json');
        const data = await response.json();
        
        // Only run if the section exists in HTML
        if(document.querySelector('#recommendations')) {
             document.querySelector('#recommendations .section-title h2').textContent = data.title;
             document.querySelector('#recommendations .section-title p').textContent = data.subtitle;
             
             const recGrid = document.querySelector('.rec-grid');
             recGrid.innerHTML = '';
             data.recommendations.forEach(rec => {
                 const cardDiv = document.createElement('div');
                 cardDiv.className = 'rec-card';
                 cardDiv.innerHTML = `
                     <p>"${escapeHtml(rec.text)}"</p>
                     <div style="margin-top:10px; font-weight:bold;">- ${escapeHtml(rec.author)}</div>
                 `;
                 recGrid.appendChild(cardDiv);
             });
        }
    } catch (error) {
        // Silent fail if section doesn't exist or file missing
    }
}

// 5. Reports Section
async function loadReportsContent() {
    try {
        const response = await fetch('content/reports.json');
        const data = await response.json();
        
        document.querySelector('#reports .section-title h2').textContent = data.title;
        document.querySelector('#reports .section-title p').textContent = data.subtitle;
        
        const reportList = document.querySelector('.report-list');
        reportList.innerHTML = '';
        data.reports.forEach(report => {
            const reportDiv = document.createElement('div');
            reportDiv.className = 'report-item';
            reportDiv.innerHTML = `
                <div class="report-date">
                    <div style="font-size: 1.5rem; font-weight: bold;">${escapeHtml(report.day)}</div>
                    <div>${escapeHtml(report.month)}</div>
                </div>
                <div>
                    <h3>${escapeHtml(report.title)}</h3>
                    <p>${escapeHtml(report.description)}</p>
                    <a href="${escapeHtml(report.link)}" style="color: var(--primary); font-size: 0.9rem;">Read more &rarr;</a>
                </div>
            `;
            reportList.appendChild(reportDiv);
        });
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// 6. Footer Section
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

// --- TEAM SCROLLING LOGIC (The Fix) ---

// We attach state to 'window' so HTML buttons can access the logic easily
window.teamScrollState = {
    currentPos: 0,    // Stores precise float value
    isPaused: false,  // Controls pausing
    animationId: null // Stores animation frame ID
};

function initTeamScroll() {
    const container = document.getElementById('teamScrollContainer');
    if (!container) return;

    // Reset state
    window.teamScrollState.currentPos = container.scrollLeft;
    window.teamScrollState.isPaused = false;
    
    // Clean up old loops
    if (window.teamScrollState.animationId) {
        cancelAnimationFrame(window.teamScrollState.animationId);
    }

    const speed = 0.5; // Very slow, smooth speed

    function step() {
        if (!window.teamScrollState.isPaused) {
            // 1. Update Float
            window.teamScrollState.currentPos += speed;
            
            // 2. Apply to Container
            container.scrollLeft = window.teamScrollState.currentPos;

            // 3. Check Infinite Loop
            // If we scrolled past half the width (the first set of team members)
            if (window.teamScrollState.currentPos >= (container.scrollWidth / 2)) {
                // Snap back to start instantly
                window.teamScrollState.currentPos = 0;
                container.scrollLeft = 0;
            }
        }
        window.teamScrollState.animationId = requestAnimationFrame(step);
    }

    step();
    
    // Touch support for mobile (Hold to pause)
    container.addEventListener('touchstart', () => window.teamScrollState.isPaused = true);
    container.addEventListener('touchend', () => window.teamScrollState.isPaused = false);
}

// EXPOSED FUNCTIONS (For HTML OnClick/OnHover)
window.pauseTeamScroll = function() {
    window.teamScrollState.isPaused = true;
};

window.resumeTeamScroll = function() {
    window.teamScrollState.isPaused = false;
};

window.scrollTeam = function(direction) {
    const container = document.getElementById('teamScrollContainer');
    const jumpAmount = 300; // Distance per click

    if (direction === 'left') {
        window.teamScrollState.currentPos -= jumpAmount;
        if (window.teamScrollState.currentPos < 0) window.teamScrollState.currentPos = 0;
    } else {
        window.teamScrollState.currentPos += jumpAmount;
    }

    // Apply change immediately
    container.scrollTo({
        left: window.teamScrollState.currentPos,
        behavior: 'smooth' 
    });
};