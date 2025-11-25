// Content Loader for YSAG Website
// This script loads content from JSON files and populates the HTML dynamically

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to validate URL safety
function isSafeUrl(url) {
    // Allow relative URLs starting with # or /
    // Allow http and https protocols
    // Allow google drive links
    return url.startsWith('#') || 
           url.startsWith('/') || 
           url.startsWith('https://') || 
           url.startsWith('http://');
}

document.addEventListener('DOMContentLoaded', function() {
    loadHeroContent();
    loadAboutContent();
    loadResourcesContent();
    loadRecommendationsContent();
    loadReportsContent();
    loadFooterContent();
});

// Load Hero Section
async function loadHeroContent() {
    try {
        const response = await fetch('content/hero.json');
        const data = await response.json();
        
        document.querySelector('.hero h1').textContent = data.title;
        document.querySelector('.hero p').textContent = data.description;
        
        // Update buttons
        const heroSection = document.querySelector('.hero');
        const existingButtons = heroSection.querySelectorAll('.btn');
        if (existingButtons.length > 0) {
            existingButtons.forEach(btn => btn.remove());
        }
        
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

// Load About Section
async function loadAboutContent() {
    try {
        const response = await fetch('content/about.json');
        const data = await response.json();
        
        // Update pro tip
        const proTip = document.querySelector('.pro-tip');
        proTip.innerHTML = `<i class="fas fa-lightbulb"></i> <strong>Did you know?</strong> ${escapeHtml(data.proTip)}`;
        
        // Update mission/vision cards
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
        
        // Update team members
        const teamGrid = document.querySelector('.team-grid');
        teamGrid.innerHTML = '';
        data.team.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member';
            memberDiv.innerHTML = `
                <img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}" class="team-img">
                <h4>${escapeHtml(member.name)}</h4>
                <p>${escapeHtml(member.role)}</p>
            `;
            teamGrid.appendChild(memberDiv);
        });
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Load Resources Section
async function loadResourcesContent() {
    try {
        const response = await fetch('content/resources.json');
        const data = await response.json();
        
        // Update section title
        document.querySelector('#resources .section-title h2').textContent = data.title;
        document.querySelector('#resources .section-title p').textContent = data.subtitle;
        
        // Update search placeholder
        document.getElementById('searchInput').placeholder = data.searchPlaceholder;
        
        // Update resource cards
        const resourceGrid = document.getElementById('resourceGrid');
        resourceGrid.innerHTML = '';
        data.courses.forEach(course => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'resource-card';
            cardDiv.setAttribute('data-category', course.category);
            
            // Create card image
            const cardImg = document.createElement('div');
            cardImg.className = 'card-img';
            cardImg.style.backgroundColor = course.color;
            cardImg.innerHTML = `<i class="${escapeHtml(course.icon)}"></i>`;
            
            // Create card content
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            cardContent.innerHTML = `
                <div class="card-title">${escapeHtml(course.title)}</div>
                <p>${escapeHtml(course.description)}</p>
            `;
            
            // Create card actions
            const cardActions = document.createElement('div');
            cardActions.className = 'card-actions';
            
            // Files link
            const filesLink = document.createElement('a');
            filesLink.href = isSafeUrl(course.filesLink) ? course.filesLink : '#';
            filesLink.target = '_blank';
            filesLink.className = 'action-btn';
            filesLink.innerHTML = '<i class="fab fa-google-drive"></i> Files';
            cardActions.appendChild(filesLink);
            
            // Videos link/button
            if (course.videosLink && isSafeUrl(course.videosLink)) {
                const videosLink = document.createElement('a');
                videosLink.href = course.videosLink;
                videosLink.target = '_blank';
                videosLink.className = 'action-btn';
                videosLink.innerHTML = '<i class="fab fa-youtube"></i> Videos';
                cardActions.appendChild(videosLink);
            } else if (course.videosMessage) {
                const videosBtn = document.createElement('span');
                videosBtn.className = 'action-btn';
                videosBtn.innerHTML = '<i class="fab fa-youtube"></i> Videos';
                videosBtn.addEventListener('click', () => {
                    alert(course.videosMessage);
                });
                cardActions.appendChild(videosBtn);
            } else {
                const videosBtn = document.createElement('span');
                videosBtn.className = 'action-btn';
                videosBtn.innerHTML = '<i class="fab fa-youtube"></i> Videos';
                cardActions.appendChild(videosBtn);
            }
            
            // Assemble card
            cardDiv.appendChild(cardImg);
            cardDiv.appendChild(cardContent);
            cardDiv.appendChild(cardActions);
            resourceGrid.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Error loading resources content:', error);
    }
}

// Load Reports Section
async function loadReportsContent() {
    try {
        const response = await fetch('content/reports.json');
        const data = await response.json();
        
        // Update section title
        document.querySelector('#reports .section-title h2').textContent = data.title;
        document.querySelector('#reports .section-title p').textContent = data.subtitle;
        
        // Update reports
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
        console.error('Error loading reports content:', error);
    }
}

// Load Footer Content
async function loadFooterContent() {
    try {
        const response = await fetch('content/footer.json');
        const data = await response.json();
        
        const footer = document.querySelector('footer');
        footer.querySelector('h3').textContent = data.organizationName;
        const footerParagraphs = footer.querySelectorAll('p');
        footerParagraphs[0].textContent = data.fullName;
        footerParagraphs[1].textContent = data.location;
        
        // Update social links
        const socialLinks = footer.querySelector('.social-links');
        socialLinks.innerHTML = '';
        data.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = isSafeUrl(link.url) ? link.url : '#';
            a.title = escapeHtml(link.platform);
            a.innerHTML = `<i class="${escapeHtml(link.icon)}"></i>`;
            socialLinks.appendChild(a);
        });
        
        // Update copyright
        const copyrightDiv = footer.querySelector('.copyright');
        if (copyrightDiv) {
            copyrightDiv.innerHTML = `&copy; ${data.copyright}`;
        }
    } catch (error) {
        console.error('Error loading footer content:', error);
    }
}
