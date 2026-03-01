// --- Resume State ---
let resumeData = {
    personal: { name: '', email: '', phone: '', location: '' },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: '',
    links: { github: '', linkedin: '' }
};

// Load from LocalStorage
const savedData = localStorage.getItem('resumeBuilderData');
if (savedData) {
    try {
        resumeData = JSON.parse(savedData);
    } catch (e) {
        console.error("Failed to parse saved data", e);
    }
}

// --- Sample Data ---
const SAMPLE_DATA = {
    personal: { name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 0123', location: 'New York, NY' },
    summary: 'Experienced Software Engineer with 5+ years of expertise in building scalable web applications and AI-driven solutions. Proven track record of improving site performance by 40% using modern frameworks.',
    education: [
        { institution: 'Tech University', degree: 'B.S. in Computer Science', date: '2016 - 2020' }
    ],
    experience: [
        { company: 'InnvoateSoft', role: 'Senior Developer', date: '2021 - Present', description: 'Leading frontend team for the next-gen AI platform. Increased user engagement by 25%.' },
        { company: 'GlobalDev', role: 'Junior Engineer', date: '2020 - 2021', description: 'Developed core features for the enterprise cloud dashboard with 99.9% uptime.' }
    ],
    projects: [
        { name: 'AI Resume Builder', date: '2023', description: 'Built an AI-driven resume builder with 10k monthly active users.' },
        { name: 'Portfolio Engine', date: '2022', description: 'Open source tool for developers.' }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes',
    links: { github: 'github.com/johndoe', linkedin: 'linkedin.com/in/johndoe' }
};

// --- Helper Functions ---
function saveToLocalStorage() {
    localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
}

function updateLivePreview() {
    const previewContainer = document.getElementById('resume-preview-live');
    if (!previewContainer) return;
    previewContainer.innerHTML = generateResumeHTML(resumeData);
    updateScoreUI();
}

function handleInput(section, field, value) {
    if (field) {
        resumeData[section][field] = value;
    } else {
        resumeData[section] = value;
    }
    saveToLocalStorage();
    updateLivePreview();
}

function loadSampleData() {
    resumeData = JSON.parse(JSON.stringify(SAMPLE_DATA));
    saveToLocalStorage();
    render();
}

// --- ATS Scoring Engine ---
function calculateATSScore() {
    let score = 0;
    const { summary, projects, experience, skills, links, education } = resumeData;

    // 1) Summary length 40-120 words (+15)
    const summaryWords = summary.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (summaryWords >= 40 && summaryWords <= 120) score += 15;

    // 2) At least 2 projects (+10)
    if (projects.length >= 2) score += 10;

    // 3) At least 1 experience entry (+10)
    if (experience.length >= 1) score += 10;

    // 4) Skills list has >= 8 items (+10)
    const skillsList = (skills || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (skillsList.length >= 8) score += 10;

    // 5) GitHub or LinkedIn link exists (+10)
    if ((links.github && links.github.trim()) || (links.linkedin && links.linkedin.trim())) score += 10;

    // 6) Any experience/project bullet contains a number (+15)
    const hasNumbers = [...experience, ...projects].some(item =>
        /\d+|%/.test(item.description || '')
    );
    if (hasNumbers) score += 15;

    // 7) Education section has complete fields (+10)
    const edComplete = education.length > 0 && education.every(ed =>
        ed.institution && ed.institution.trim() && ed.degree && ed.degree.trim() && ed.date && ed.date.trim()
    );
    if (edComplete) score += 10;

    return Math.min(score, 100);
}

function getSuggestions() {
    const suggestions = [];
    const { summary, projects, experience, skills, links, education } = resumeData;

    const summaryWords = summary.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (summaryWords < 40 || summaryWords > 120) suggestions.push("Write a stronger summary (40–120 words).");

    if (projects.length < 2) suggestions.push("Add at least 2 projects.");

    const hasNumbers = [...experience, ...projects].some(item => /\d+|%/.test(item.description || ''));
    if (!hasNumbers) suggestions.push("Add measurable impact (numbers) in bullets.");

    const skillsList = (skills || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (skillsList.length < 8) suggestions.push("Add more skills (target 8+).");

    return suggestions.slice(0, 3);
}

function updateScoreUI() {
    const scoreVal = calculateATSScore();
    const scoreMeter = document.getElementById('score-meter-fill');
    const scoreText = document.getElementById('score-value');
    const suggestionsList = document.getElementById('suggestions-list');

    if (scoreMeter) scoreMeter.style.width = `${scoreVal}%`;
    if (scoreText) scoreText.innerText = scoreVal;

    if (suggestionsList) {
        const suggestions = getSuggestions();
        suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }
}

// --- Component Templates ---
function generateResumeHTML(data) {
    const educationHTML = data.education.filter(ed => ed.institution || ed.degree).map(ed => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${ed.institution || ''}</span><span>${ed.date || ''}</span></div>
            <div class="resume-item-sub">${ed.degree || ''}</div>
        </div>
    `).join('');

    const experienceHTML = data.experience.filter(exp => exp.company || exp.role).map(exp => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${exp.company || ''}</span><span>${exp.date || ''}</span></div>
            <div class="resume-item-sub">${exp.role || ''}</div>
            <p class="resume-item-desc">${exp.description || ''}</p>
        </div>
    `).join('');

    const projectsHTML = data.projects.filter(proj => proj.name).map(proj => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${proj.name || ''}</span><span>${proj.date || ''}</span></div>
            <p class="resume-item-desc">${proj.description || ''}</p>
        </div>
    `).join('');

    return `
        <div class="resume-paper">
            <header>
                <h1>${data.personal.name || 'Your Name'}</h1>
                <div class="resume-contact">
                    ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
                </div>
                <div class="resume-contact" style="margin-top: 4px;">
                    ${data.links.github ? `<span>${data.links.github}</span>` : ''}
                    ${data.links.linkedin ? `<span>${data.links.linkedin}</span>` : ''}
                </div>
            </header>

            ${data.summary ? `
                <section>
                    <h2>Summary</h2>
                    <p class="resume-item-desc">${data.summary}</p>
                </section>
            ` : ''}

            ${experienceHTML ? `
                <section>
                    <h2>Experience</h2>
                    <div class="resume-section-content">${experienceHTML}</div>
                </section>
            ` : ''}

            ${educationHTML ? `
                <section>
                    <h2>Education</h2>
                    <div class="resume-section-content">${educationHTML}</div>
                </section>
            ` : ''}

            ${projectsHTML ? `
                <section>
                    <h2>Projects</h2>
                    <div class="resume-section-content">${projectsHTML}</div>
                </section>
            ` : ''}

            ${data.skills ? `
                <section>
                    <h2>Skills</h2>
                    <p class="resume-item-desc">${data.skills}</p>
                </section>
            ` : ''}

            ${(!data.summary && !experienceHTML && !educationHTML && !projectsHTML && !data.skills) ? `
                <div style="height: 400px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
                    Start entering data on the left to see your resume.
                </div>
            ` : ''}
        </div>
    `;
}

// --- Dynamic Route Handlers ---
const views = {
    '/': () => `
        <div class="hero view">
            <h1>Build a Resume That Gets Read.</h1>
            <p>Premium, minimal, and professional designs that help you stand out to hiring managers and pass through ATS.</p>
            <button class="btn-primary" onclick="navigate('/builder')">Start Building</button>
        </div>
    `,
    '/builder': () => `
        <div class="builder-layout view">
            <div class="form-panel">
                <div class="score-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.875rem; font-weight: 700; color: var(--color-text-secondary);">ATS READINESS SCORE</span>
                        <span style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);"><span id="score-value">0</span>/100</span>
                    </div>
                    <div class="score-meter"><div id="score-meter-fill" class="score-meter-fill" style="width: 0%"></div></div>
                    <ul id="suggestions-list" class="suggestions-list"></ul>
                </div>

                <div class="builder-header">
                    <h2>Edit Resume</h2>
                    <button class="btn-secondary" onclick="loadSampleData()">Load Sample Data</button>
                </div>
                
                <div class="form-section">
                    <h3>Personal Info</h3>
                    <div class="input-group">
                        <label>Name</label>
                        <input type="text" class="input-field" value="${resumeData.personal.name}" oninput="handleInput('personal', 'name', this.value)">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group"><label>Email</label><input type="text" class="input-field" value="${resumeData.personal.email}" oninput="handleInput('personal', 'email', this.value)"></div>
                        <div class="input-group"><label>Phone</label><input type="text" class="input-field" value="${resumeData.personal.phone}" oninput="handleInput('personal', 'phone', this.value)"></div>
                    </div>
                    <div class="input-group">
                        <label>Location</label>
                        <input type="text" class="input-field" value="${resumeData.personal.location || ''}" oninput="handleInput('personal', 'location', this.value)">
                    </div>
                </div>

                <div class="form-section">
                    <h3>Professional Summary</h3>
                    <textarea class="input-field" oninput="handleInput('summary', null, this.value)">${resumeData.summary}</textarea>
                </div>

                <div class="form-section">
                    <h3>Experience</h3>
                    <div class="dynamic-list" id="experience-list">
                        ${resumeData.experience.map((exp, i) => `
                            <div class="list-item">
                                <div class="input-group"><label>Company</label><input type="text" class="input-field" value="${exp.company}" oninput="resumeData.experience[${i}].company=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Role</label><input type="text" class="input-field" value="${exp.role}" oninput="resumeData.experience[${i}].role=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Date</label><input type="text" class="input-field" placeholder="e.g. 2021 - Present" value="${exp.date || ''}" oninput="resumeData.experience[${i}].date=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Description</label><textarea class="input-field" oninput="resumeData.experience[${i}].description=this.value; saveToLocalStorage(); updateLivePreview()">${exp.description || ''}</textarea></div>
                                <button onclick="resumeData.experience.splice(${i},1); render(); saveToLocalStorage()" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-error);"><i data-lucide="trash-2" size="16"></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add" onclick="resumeData.experience.push({company:'', role:'', date:'', description:''}); render(); saveToLocalStorage()">+ Add Experience</button>
                </div>

                <div class="form-section">
                    <h3>Education</h3>
                    <div class="dynamic-list" id="education-list">
                        ${resumeData.education.map((ed, i) => `
                            <div class="list-item">
                                <div class="input-group"><label>Institution</label><input type="text" class="input-field" value="${ed.institution}" oninput="resumeData.education[${i}].institution=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Degree</label><input type="text" class="input-field" value="${ed.degree}" oninput="resumeData.education[${i}].degree=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Date</label><input type="text" class="input-field" value="${ed.date}" oninput="resumeData.education[${i}].date=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <button onclick="resumeData.education.splice(${i},1); render(); saveToLocalStorage()" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-error);"><i data-lucide="trash-2" size="16"></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add" onclick="resumeData.education.push({institution:'', degree:'', date:''}); render(); saveToLocalStorage()">+ Add Education</button>
                </div>

                <div class="form-section">
                    <h3>Projects</h3>
                    <div class="dynamic-list" id="projects-list">
                        ${resumeData.projects.map((proj, i) => `
                            <div class="list-item">
                                <div class="input-group"><label>Project Name</label><input type="text" class="input-field" value="${proj.name}" oninput="resumeData.projects[${i}].name=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Description</label><textarea class="input-field" oninput="resumeData.projects[${i}].description=this.value; saveToLocalStorage(); updateLivePreview()">${proj.description || ''}</textarea></div>
                                <button onclick="resumeData.projects.splice(${i},1); render(); saveToLocalStorage()" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-error);"><i data-lucide="trash-2" size="16"></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add" onclick="resumeData.projects.push({name:'', description:'', date:''}); render(); saveToLocalStorage()">+ Add Project</button>
                </div>

                <div class="form-section">
                    <h3>Skills</h3>
                    <input type="text" class="input-field" placeholder="JavaScript, Python, React..." value="${resumeData.skills || ''}" oninput="handleInput('skills', null, this.value)">
                </div>

                <div class="form-section">
                    <h3>Links</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group"><label>GitHub</label><input type="text" class="input-field" value="${resumeData.links.github || ''}" oninput="handleInput('links', 'github', this.value)"></div>
                        <div class="input-group"><label>LinkedIn</label><input type="text" class="input-field" value="${resumeData.links.linkedin || ''}" oninput="handleInput('links', 'linkedin', this.value)"></div>
                    </div>
                </div>
            </div>

            <div class="preview-panel">
                <div id="resume-preview-live" style="width: 100%;">
                    ${generateResumeHTML(resumeData)}
                </div>
            </div>
        </div>
    `,
    '/preview': () => `
        <div class="view" style="display: flex; justify-content: center; background: #fff; padding: 4rem;">
            ${generateResumeHTML(resumeData)}
        </div>
    `,
    '/proof': () => `
        <div class="view" style="text-align: center; padding: 4rem;">
            <h2>Project Proof</h2>
            <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                <div style="padding: 1rem; background: var(--color-primary-light); border-radius: var(--radius-md); border: 1px solid var(--color-border); width: 100%; max-width: 400px;">
                    <div style="font-weight: 700;">ATS Persistence Active</div>
                    <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Data saved in localStorage</div>
                </div>
                <div style="padding: 1rem; background: var(--color-primary-light); border-radius: var(--radius-md); border: 1px solid var(--color-border); width: 100%; max-width: 400px;">
                    <div style="font-weight: 700;">Scoring Engine v1</div>
                    <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Deterministic calculation active</div>
                </div>
            </div>
        </div>
    `
};

// --- Routing Engine ---
function navigate(path) {
    window.location.hash = path;
}

function render() {
    const hash = window.location.hash.split('?')[0] || '#/';
    const path = hash.replace('#', '');
    const mainContent = document.getElementById('main-content');

    // Update Nav Activity
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.route === path);
    });

    if (views[path]) {
        mainContent.innerHTML = views[path]();
    } else {
        mainContent.innerHTML = views['/']();
    }

    lucide.createIcons();
    updateLivePreview();
}

window.addEventListener('hashchange', render);
window.navigate = navigate;
window.handleInput = handleInput;
window.loadSampleData = loadSampleData;
window.updateLivePreview = updateLivePreview;
window.render = render;
window.saveToLocalStorage = saveToLocalStorage;

// Initial Draw
if (!window.location.hash) {
    window.location.hash = '#/';
} else {
    render();
}
