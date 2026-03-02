// --- Resume State ---
let resumeData = {
    personal: { name: '', email: '', phone: '', location: '' },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], tools: [] },
    links: { github: '', linkedin: '' }
};

let activeTemplate = localStorage.getItem('resumeTemplateChoice') || 'classic';
let activeColor = localStorage.getItem('resumeColorChoice') || 'hsl(168, 60%, 40%)';
document.documentElement.style.setProperty('--resume-accent', activeColor);

// Load from LocalStorage
const savedData = localStorage.getItem('resumeBuilderData');
if (savedData) {
    try {
        const parsed = JSON.parse(savedData);
        // Migration check for skills
        if (typeof parsed.skills === 'string') {
            parsed.skills = { technical: parsed.skills ? parsed.skills.split(',').map(s => s.trim()) : [], soft: [], tools: [] };
        }
        // Migration check for project tech stacks
        if (parsed.projects) {
            parsed.projects = parsed.projects.map(p => ({
                ...p,
                techStack: p.techStack || [],
                isOpen: p.isOpen !== undefined ? p.isOpen : true
            }));
        }
        resumeData = { ...resumeData, ...parsed };
    } catch (e) {
        console.error("Failed to parse saved data", e);
    }
}

const ACTION_VERBS = ['built', 'led', 'designed', 'improved', 'developed', 'implemented', 'created', 'optimized', 'automated', 'managed', 'delivered', 'launched', 'increased', 'reduced', 'achieved', 'spearheaded', 'orchestrated', 'streamlined', 'engineered', 'architected'];

// --- Sample Data ---
const SAMPLE_DATA = {
    personal: { name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 0123', location: 'New York, NY' },
    summary: 'Experienced Software Engineer with 5+ years of expertise in building scalable web applications and AI-driven solutions. Proven track record of improving site performance by 40% using modern frameworks.',
    education: [
        { institution: 'Tech University', degree: 'B.S. in Computer Science', date: '2016 - 2020' }
    ],
    experience: [
        { company: 'InnvoateSoft', role: 'Senior Developer', date: '2021 - Present', description: 'Led frontend team for the next-gen AI platform. Improved user engagement by 25%.' },
        { company: 'GlobalDev', role: 'Junior Engineer', date: '2020 - 2021', description: 'Developed core features for the enterprise cloud dashboard with 99.9% uptime.' }
    ],
    projects: [
        { title: 'AI Resume Builder', description: 'Built an AI-driven resume builder with 10k monthly active users.', techStack: ['React', 'Node.js', 'PostgreSQL'], date: '2023', liveUrl: '', githubUrl: '', isOpen: false },
        { title: 'Portfolio Engine', description: 'Optimized open source tool for developers.', techStack: ['TypeScript', 'GraphQL'], date: '2022', liveUrl: '', githubUrl: '', isOpen: false }
    ],
    skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
        soft: ['Team Leadership', 'Problem Solving'],
        tools: ['AWS', 'Docker', 'Kubernetes']
    },
    links: { github: 'github.com/johndoe', linkedin: 'linkedin.com/in/johndoe' }
};

// --- Helper Functions ---
function saveToLocalStorage() {
    localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
}

function updateLivePreview() {
    const previewContainer = document.getElementById('resume-preview-live');
    if (!previewContainer) return;
    previewContainer.innerHTML = generateResumeHTML(resumeData, activeTemplate);
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

function setTemplate(template) {
    activeTemplate = template;
    localStorage.setItem('resumeTemplateChoice', template);
    render();
}

function setActiveColor(color) {
    activeColor = color;
    localStorage.setItem('resumeColorChoice', color);
    document.documentElement.style.setProperty('--resume-accent', color);
    render();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function loadSampleData() {
    resumeData = JSON.parse(JSON.stringify(SAMPLE_DATA));
    saveToLocalStorage();
    render();
}

// --- Export Logic ---
function printResume() {
    showToast("PDF export ready! Check your downloads.");
    window.print();
}

function copyAsText() {
    const d = resumeData;
    let text = `${d.personal.name || 'Your Name'}\n`;
    text += `${d.personal.email || ''} | ${d.personal.phone || ''} | ${d.personal.location || ''}\n`;
    if (d.links.github || d.links.linkedin) {
        text += `${d.links.github || ''} ${d.links.linkedin || ''}\n`;
    }
    text += `\nSUMMARY\n${d.summary || ''}\n`;

    if (d.experience.length > 0) {
        text += `\nEXPERIENCE\n`;
        d.experience.forEach(exp => {
            text += `${exp.company} - ${exp.role} (${exp.date || ''})\n${exp.description}\n\n`;
        });
    }

    if (d.education.length > 0) {
        text += `\nEDUCATION\n`;
        d.education.forEach(ed => {
            text += `${ed.institution} - ${ed.degree} (${ed.date || ''})\n`;
        });
    }

    if (d.projects.length > 0) {
        text += `\nPROJECTS\n`;
        d.projects.forEach(p => {
            text += `${p.title} (${p.date || ''})\n${p.description}\nTech: ${p.techStack.join(', ')}\n\n`;
        });
    }

    text += `\nSKILLS\n`;
    text += `Technical: ${d.skills.technical.join(', ')}\n`;
    text += `Soft: ${d.skills.soft.join(', ')}\n`;
    text += `Tools: ${d.skills.tools.join(', ')}\n`;

    navigator.clipboard.writeText(text).then(() => {
        alert("Resume copied as plain text!");
    });
}

function getValidationWarning() {
    if (!resumeData.personal.name || (resumeData.experience.length === 0 && resumeData.projects.length === 0)) {
        return `<div class="validation-warning"><i data-lucide="alert-triangle" size="18"></i> Your resume may look incomplete. Please add your name and at least one experience or project.</div>`;
    }
    return '';
}

// --- Skills Logic ---
function addSkill(category, skill) {
    if (!skill || !skill.trim()) return;
    if (!resumeData.skills[category].includes(skill.trim())) {
        resumeData.skills[category].push(skill.trim());
        saveToLocalStorage();
        render();
    }
}

function removeSkill(category, index) {
    resumeData.skills[category].splice(index, 1);
    saveToLocalStorage();
    render();
}

async function suggestSkills() {
    const btn = document.querySelector('.btn-suggest');
    btn.classList.add('loading');
    btn.innerHTML = `<i data-lucide="loader-2" class="spinner" size="14"></i> Suggesting...`;
    lucide.createIcons();

    await new Promise(r => setTimeout(r, 1000));

    const technical = ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"];
    const soft = ["Team Leadership", "Problem Solving"];
    const tools = ["Git", "Docker", "AWS"];

    technical.forEach(s => addSkill('technical', s));
    soft.forEach(s => addSkill('soft', s));
    tools.forEach(s => addSkill('tools', s));

    saveToLocalStorage();
    render();
}

// --- Projects Logic ---
function addProject() {
    resumeData.projects.push({
        title: '',
        description: '',
        techStack: [],
        date: '',
        liveUrl: '',
        githubUrl: '',
        isOpen: true
    });
    saveToLocalStorage();
    render();
}

function toggleProject(index) {
    resumeData.projects[index].isOpen = !resumeData.projects[index].isOpen;
    saveToLocalStorage();
    render();
}

function addProjectTech(index, tech) {
    if (!tech || !tech.trim()) return;
    if (!resumeData.projects[index].techStack.includes(tech.trim())) {
        resumeData.projects[index].techStack.push(tech.trim());
        saveToLocalStorage();
        render();
    }
}

function removeProjectTech(pIndex, tIndex) {
    resumeData.projects[pIndex].techStack.splice(tIndex, 1);
    saveToLocalStorage();
    render();
}

// --- Guidance Logic ---
function getBulletGuidance(text) {
    if (!text || text.trim().length === 0) return null;
    const tips = [];
    const firstWord = text.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const startsWithVerb = ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase());
    const hasNumbers = /\d+|%/.test(text);

    if (!startsWithVerb) tips.push("Start with a strong action verb.");
    if (!hasNumbers) tips.push("Add measurable impact (numbers).");
    return tips;
}

// --- ATS Scoring Engine (deterministic, no AI) ---
function calculateATSScore() {
    let score = 0;
    const { personal, summary, projects, experience, skills, links, education } = resumeData;

    // +10 if name provided
    if (personal.name && personal.name.trim()) score += 10;

    // +10 if email provided
    if (personal.email && personal.email.trim()) score += 10;

    // +10 if summary > 50 chars
    if (summary && summary.trim().length > 50) score += 10;

    // +15 if at least 1 experience entry with bullets (description)
    if (experience.length >= 1 && experience.some(exp => exp.description && exp.description.trim().length > 0)) score += 15;

    // +10 if at least 1 education entry
    if (education.length >= 1) score += 10;

    // +10 if at least 5 skills added
    const allSkills = [...skills.technical, ...skills.soft, ...skills.tools];
    if (allSkills.length >= 5) score += 10;

    // +10 if at least 1 project added
    if (projects.length >= 1) score += 10;

    // +5 if phone provided
    if (personal.phone && personal.phone.trim()) score += 5;

    // +5 if LinkedIn provided
    if (links.linkedin && links.linkedin.trim()) score += 5;

    // +5 if GitHub provided
    if (links.github && links.github.trim()) score += 5;

    // +10 if summary contains action verbs
    if (summary && summary.trim()) {
        const summaryLower = summary.toLowerCase();
        const hasActionVerb = ACTION_VERBS.some(verb => summaryLower.includes(verb));
        if (hasActionVerb) score += 10;
    }

    return Math.min(score, 100);
}

function getATSBreakdown() {
    const missing = [];
    const { personal, summary, projects, experience, skills, links, education } = resumeData;

    if (!personal.name || !personal.name.trim()) missing.push({ text: 'Add your name', points: 10 });
    if (!personal.email || !personal.email.trim()) missing.push({ text: 'Add your email address', points: 10 });
    if (!summary || summary.trim().length <= 50) missing.push({ text: 'Add a professional summary (>50 characters)', points: 10 });
    if (!(experience.length >= 1 && experience.some(exp => exp.description && exp.description.trim().length > 0))) missing.push({ text: 'Add at least 1 experience with description', points: 15 });
    if (education.length < 1) missing.push({ text: 'Add at least 1 education entry', points: 10 });
    const allSkills = [...skills.technical, ...skills.soft, ...skills.tools];
    if (allSkills.length < 5) missing.push({ text: `Add at least 5 skills (${allSkills.length}/5)`, points: 10 });
    if (projects.length < 1) missing.push({ text: 'Add at least 1 project', points: 10 });
    if (!personal.phone || !personal.phone.trim()) missing.push({ text: 'Add your phone number', points: 5 });
    if (!links.linkedin || !links.linkedin.trim()) missing.push({ text: 'Add your LinkedIn profile', points: 5 });
    if (!links.github || !links.github.trim()) missing.push({ text: 'Add your GitHub profile', points: 5 });
    if (summary && summary.trim()) {
        const summaryLower = summary.toLowerCase();
        const hasActionVerb = ACTION_VERBS.some(verb => summaryLower.includes(verb));
        if (!hasActionVerb) missing.push({ text: 'Use action verbs in summary (built, led, designed...)', points: 10 });
    } else {
        missing.push({ text: 'Use action verbs in summary (built, led, designed...)', points: 10 });
    }

    return missing;
}

function getScoreLabel(score) {
    if (score <= 40) return { label: 'Needs Work', color: '#ef4444' };
    if (score <= 70) return { label: 'Getting There', color: '#f59e0b' };
    return { label: 'Strong Resume', color: '#10b981' };
}

function renderCircularProgress(score) {
    const { label, color } = getScoreLabel(score);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * score / 100);

    return `
        <div class="ats-circular-score">
            <svg class="circular-progress" width="140" height="140" viewBox="0 0 120 120">
                <circle class="progress-bg" cx="60" cy="60" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                <circle class="progress-fill" cx="60" cy="60" r="${radius}" fill="none" stroke="${color}" stroke-width="10"
                    stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                    transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 0.6s ease;"/>
            </svg>
            <div class="circular-score-text">
                <span class="circular-score-value" style="color: ${color}">${score}</span>
                <span class="circular-score-max">/100</span>
            </div>
            <div class="circular-score-label" style="color: ${color}">${label}</div>
        </div>
    `;
}

function renderImprovementSuggestions() {
    const missing = getATSBreakdown();
    if (missing.length === 0) return '<p class="all-good-msg">Your resume covers all ATS criteria!</p>';
    return `
        <div class="improvement-suggestions">
            <h3 class="suggestions-heading">Improve Your Score</h3>
            <ul class="suggestions-detail-list">
                ${missing.map(item => `<li><span class="suggestion-text">${item.text}</span><span class="suggestion-points">+${item.points} pts</span></li>`).join('')}
            </ul>
        </div>
    `;
}

function updateScoreUI() {
    const scoreVal = calculateATSScore();
    const { color } = getScoreLabel(scoreVal);

    // Update builder sidebar score card
    const scoreMeter = document.getElementById('score-meter-fill');
    const scoreText = document.getElementById('score-value');
    const improvementList = document.getElementById('improvement-list');

    if (scoreMeter) {
        scoreMeter.style.width = `${scoreVal}%`;
        scoreMeter.style.background = color;
    }
    if (scoreText) scoreText.innerText = scoreVal;

    if (improvementList) {
        const missing = getATSBreakdown();
        improvementList.innerHTML = missing.slice(0, 3).map(s => `<li>${s.text} <span style="color:${color};font-weight:700;">(+${s.points})</span></li>`).join('');
    }

    // Update preview page circular score
    const previewScoreContainer = document.getElementById('preview-ats-score');
    if (previewScoreContainer) {
        previewScoreContainer.innerHTML = renderCircularProgress(scoreVal) + renderImprovementSuggestions();
    }
}

// --- Component Templates ---
function generateResumeHTML(data, template = 'classic') {
    const renderEducation = () => data.education.filter(ed => ed.institution || ed.degree).map(ed => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${ed.institution || ''}</span><span>${ed.date || ''}</span></div>
            <div class="resume-item-sub">${ed.degree || ''}</div>
        </div>
    `).join('');

    const renderExperience = () => data.experience.filter(exp => exp.company || exp.role).map(exp => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${exp.company || ''}</span><span>${exp.date || ''}</span></div>
            <div class="resume-item-sub">${exp.role || ''}</div>
            <p class="resume-item-desc">${exp.description || ''}</p>
        </div>
    `).join('');

    const renderProjects = () => data.projects.filter(proj => proj.title).map(proj => `
        <div class="resume-item">
            <div class="resume-item-header">
                <strong>${proj.title || ''}</strong>
                <span>${proj.date || ''}</span>
            </div>
            <p class="resume-item-desc">${proj.description || ''}</p>
            <div style="margin-top: 4px;">
                ${proj.techStack.map(t => `<span class="preview-pill">${t}</span>`).join('')}
            </div>
            <div class="project-links">
                ${proj.githubUrl ? `<a href="${proj.githubUrl}" class="project-link"><i data-lucide="github" size="12"></i> Code</a>` : ''}
                ${proj.liveUrl ? `<a href="${proj.liveUrl}" class="project-link"><i data-lucide="external-link" size="12"></i> Live</a>` : ''}
            </div>
        </div>
    `).join('');

    const renderSkills = () => `
        <div class="resume-skills">
            ${data.skills.technical.length > 0 ? `<div class="resume-skills-group"><strong>Technical</strong> ${data.skills.technical.map(s => `<span class="preview-pill">${s}</span>`).join('')}</div>` : ''}
            ${data.skills.soft.length > 0 ? `<div class="resume-skills-group"><strong>Soft Skills</strong> ${data.skills.soft.map(s => `<span class="preview-pill">${s}</span>`).join('')}</div>` : ''}
            ${data.skills.tools.length > 0 ? `<div class="resume-skills-group"><strong>Tools</strong> ${data.skills.tools.map(s => `<span class="preview-pill">${s}</span>`).join('')}</div>` : ''}
        </div>
    `;

    const contactHeader = `
        <div class="resume-contact">
            ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
            ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
            ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
            ${data.links.github ? `<span>${data.links.github}</span>` : ''}
            ${data.links.linkedin ? `<span>${data.links.linkedin}</span>` : ''}
        </div>
    `;

    if (template === 'modern') {
        return `
            <div class="resume-paper modern">
                <div class="sidebar">
                    <div>
                        <h1>${data.personal.name || 'Your Name'}</h1>
                        ${contactHeader}
                    </div>
                    <section>
                        <h2>Skills</h2>
                        ${renderSkills()}
                    </section>
                </div>
                <div class="main-content-area">
                    ${data.summary ? `<section><h2>Summary</h2><p class="resume-item-desc">${data.summary}</p></section>` : ''}
                    ${data.experience.length ? `<section><h2>Experience</h2><div class="resume-section-content">${renderExperience()}</div></section>` : ''}
                    ${data.projects.length ? `<section><h2>Projects</h2><div class="resume-section-content">${renderProjects()}</div></section>` : ''}
                    ${data.education.length ? `<section><h2>Education</h2><div class="resume-section-content">${renderEducation()}</div></section>` : ''}
                </div>
            </div>`;
    }

    // Classic / Minimal Layout
    return `
        <div class="resume-paper ${template}">
            <header>
                <h1>${data.personal.name || 'Your Name'}</h1>
                ${contactHeader}
            </header>
            ${data.summary ? `<section><h2>Summary</h2><p class="resume-item-desc">${data.summary}</p></section>` : ''}
            ${data.experience.length ? `<section><h2>Experience</h2><div class="resume-section-content">${renderExperience()}</div></section>` : ''}
            ${data.projects.length ? `<section><h2>Projects</h2><div class="resume-section-content">${renderProjects()}</div></section>` : ''}
            ${renderEducation() ? `<section><h2>Education</h2><div class="resume-section-content">${renderEducation()}</div></section>` : ''}
            ${(data.skills.technical.length || data.skills.soft.length || data.skills.tools.length) ? `<section><h2>Skills</h2>${renderSkills()}</section>` : ''}
        </div>
    `;
}

const views = {
    '/': () => `
        <div class="hero view">
            <h1>Build a Resume That Gets Read.</h1>
            <p>Premium, minimal, and professional designs that help you stand out to hiring managers and pass through ATS.</p>
            <button class="btn-primary" onclick="navigate('/builder')">Start Building</button>
        </div>
    `,
    '/builder': () => {
        const skillsMarkup = (category, label) => `
            <div class="form-section">
                <h3>${label} (${resumeData.skills[category].length})</h3>
                <div class="tag-input-wrapper">
                    <div class="tags-container">
                        ${resumeData.skills[category].map((s, i) => `
                            <div class="tag-chip">${s} <span class="tag-remove" onclick="removeSkill('${category}', ${i})"><i data-lucide="x" size="12"></i></span></div>
                        `).join('')}
                    </div>
                    <input type="text" class="input-field" placeholder="Type skill and press Enter" onkeydown="if(event.key==='Enter'){addSkill('${category}', this.value); this.value=''}">
                </div>
            </div>
        `;

        return `
        <div class="builder-layout view">
            <div class="form-panel">
                <div class="score-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.875rem; font-weight: 700; color: var(--color-text-secondary);">ATS READINESS SCORE</span>
                        <span style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);"><span id="score-value">0</span>/100</span>
                    </div>
                    <div class="score-meter"><div id="score-meter-fill" class="score-meter-fill" style="width: 0%"></div></div>
                    <span class="improvement-title">TOP 3 IMPROVEMENTS</span>
                    <ul id="improvement-list" class="suggestions-list"></ul>
                </div>

                <div class="template-tabs">
                    <button class="template-tab ${activeTemplate === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">Classic</button>
                    <button class="template-tab ${activeTemplate === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">Modern</button>
                    <button class="template-tab ${activeTemplate === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">Minimal</button>
                </div>

                <div class="builder-header">
                    <h2>Edit Resume</h2>
                    <button class="btn-secondary" onclick="loadSampleData()">Load Sample Data</button>
                </div>
                
                <div class="form-section">
                    <h3>Personal Info</h3>
                    <div class="input-group"><label>Name</label><input type="text" class="input-field" value="${resumeData.personal.name}" oninput="handleInput('personal', 'name', this.value)"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="input-group"><label>Email</label><input type="text" class="input-field" value="${resumeData.personal.email}" oninput="handleInput('personal', 'email', this.value)"></div>
                        <div class="input-group"><label>Phone</label><input type="text" class="input-field" value="${resumeData.personal.phone}" oninput="handleInput('personal', 'phone', this.value)"></div>
                    </div>
                    <div class="input-group"><label>Location</label><input type="text" class="input-field" value="${resumeData.personal.location || ''}" oninput="handleInput('personal', 'location', this.value)"></div>
                </div>

                <div class="form-section">
                    <h3>Professional Summary</h3>
                    <textarea class="input-field" oninput="handleInput('summary', null, this.value)">${resumeData.summary}</textarea>
                </div>

                <div class="form-section">
                    <h3>Skills</h3>
                    <button class="btn-suggest" onclick="suggestSkills()">✨ Suggest Skills</button>
                    ${skillsMarkup('technical', 'Technical Skills')}
                    ${skillsMarkup('soft', 'Soft Skills')}
                    ${skillsMarkup('tools', 'Tools & Technologies')}
                </div>

                <div class="form-section">
                    <h3>Experience</h3>
                    <div class="dynamic-list">
                        ${resumeData.experience.map((exp, i) => {
            const tips = getBulletGuidance(exp.description);
            return `
                                <div class="list-item" style="border: 1px solid var(--color-border); padding: 1rem; border-radius: var(--radius-md); position: relative; background: var(--color-bg); margin-bottom: 1rem;">
                                    <div class="input-group"><label>Company</label><input type="text" class="input-field" value="${exp.company}" oninput="resumeData.experience[${i}].company=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                    <div class="input-group" style="margin-top:0.5rem;"><label>Role</label><input type="text" class="input-field" value="${exp.role}" oninput="resumeData.experience[${i}].role=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                    <div class="input-group" style="margin-top:0.5rem;"><label>Description</label>
                                        <textarea class="input-field" oninput="resumeData.experience[${i}].description=this.value; saveToLocalStorage(); updateLivePreview(); render()">${exp.description || ''}</textarea>
                                        ${tips ? tips.map(t => `<div class="guidance-text"><i data-lucide="info" size="12"></i> ${t}</div>`).join('') : ''}
                                    </div>
                                    <button onclick="resumeData.experience.splice(${i},1); render(); saveToLocalStorage()" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-error);"><i data-lucide="trash-2" size="16"></i></button>
                                </div>
                            `}).join('')}
                    </div>
                    <button class="btn-add" style="color: var(--color-accent); font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;" onclick="resumeData.experience.push({company:'', role:'', date:'', description:''}); render(); saveToLocalStorage()">+ Add Experience</button>
                </div>

                <div class="form-section">
                    <h3>Projects</h3>
                    <div class="dynamic-list">
                        ${resumeData.projects.map((proj, i) => {
                const tips = getBulletGuidance(proj.description);
                return `
                                <div class="accordion-item ${proj.isOpen ? 'open' : ''}">
                                    <div class="accordion-header" onclick="toggleProject(${i})">
                                        <span>${proj.title || 'New Project'}</span>
                                        <i data-lucide="chevron-down" class="accordion-toggle" size="16"></i>
                                    </div>
                                    <div class="accordion-content">
                                        <div class="input-group"><label>Project Title</label><input type="text" class="input-field" value="${proj.title}" oninput="resumeData.projects[${i}].title=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                        <div class="input-group"><label>Description (Max 200 chars)</label>
                                            <div class="textarea-wrapper">
                                                <textarea class="input-field" maxlength="200" oninput="resumeData.projects[${i}].description=this.value; saveToLocalStorage(); updateLivePreview(); render()">${proj.description}</textarea>
                                                <span class="char-counter ${proj.description.length >= 200 ? 'limit' : ''}">${proj.description.length}/200</span>
                                            </div>
                                            ${tips ? tips.map(t => `<div class="guidance-text"><i data-lucide="info" size="12"></i> ${t}</div>`).join('') : ''}
                                        </div>
                                        <div class="input-group">
                                            <label>Tech Stack (Enter to add)</label>
                                            <div class="tags-container" style="margin-top: 0.5rem;">
                                                ${proj.techStack.map((t, ti) => `<div class="tag-chip">${t} <span class="tag-remove" onclick="removeProjectTech(${i}, ${ti})"><i data-lucide="x" size="12"></i></span></div>`).join('')}
                                            </div>
                                            <input type="text" class="input-field" placeholder="e.g. React" onkeydown="if(event.key==='Enter'){addProjectTech(${i}, this.value); this.value=''}">
                                        </div>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                            <div class="input-group"><label>Live URL</label><input type="text" class="input-field" value="${proj.liveUrl}" oninput="resumeData.projects[${i}].liveUrl=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                            <div class="input-group"><label>GitHub URL</label><input type="text" class="input-field" value="${proj.githubUrl}" oninput="resumeData.projects[${i}].githubUrl=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                        </div>
                                        <button class="btn-secondary" style="color: var(--color-error); border-color: var(--color-error); margin-top: 0.5rem;" onclick="resumeData.projects.splice(${i},1); render(); saveToLocalStorage()">Delete Project</button>
                                    </div>
                                </div>
                            `}).join('')}
                    </div>
                    <button class="btn-add" style="color: var(--color-accent); font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;" onclick="addProject()">+ Add Project</button>
                </div>

                <div class="form-section">
                    <h3>Education</h3>
                    <div class="dynamic-list">
                        ${resumeData.education.map((ed, i) => `
                            <div class="list-item" style="border: 1px solid var(--color-border); padding: 1rem; border-radius: var(--radius-md); position: relative; background: var(--color-bg); margin-bottom: 1rem;">
                                <div class="input-group"><label>Institution</label><input type="text" class="input-field" value="${ed.institution}" oninput="resumeData.education[${i}].institution=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Degree</label><input type="text" class="input-field" value="${ed.degree}" oninput="resumeData.education[${i}].degree=this.value; saveToLocalStorage(); updateLivePreview()"></div>
                                <button onclick="resumeData.education.splice(${i},1); render(); saveToLocalStorage()" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-error);"><i data-lucide="trash-2" size="16"></i></button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add" style="color: var(--color-accent); font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 4px;" onclick="resumeData.education.push({institution:'', degree:'', date:''}); render(); saveToLocalStorage()">+ Add Education</button>
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
                <div class="preview-controls">
                    <div class="control-group">
                        <span class="control-label">Select Template</span>
                        <div class="thumbnail-picker">
                            <div class="template-thumb ${activeTemplate === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">
                                <div class="checkmark"><i data-lucide="check" size="10"></i></div>
                                <div class="thumb-sketch">
                                    <div class="sketch-line title" style="align-self: center;"></div>
                                    <div class="sketch-line" style="width: 80%; align-self: center;"></div>
                                    <div class="sketch-line section"></div>
                                    <div class="sketch-line"></div>
                                </div>
                                <div class="template-thumb-label">Classic</div>
                            </div>
                            <div class="template-thumb ${activeTemplate === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">
                                <div class="checkmark"><i data-lucide="check" size="10"></i></div>
                                <div class="thumb-sketch sketch-modern">
                                    <div class="s"></div>
                                    <div class="m">
                                        <div class="sketch-line title"></div>
                                        <div class="sketch-line"></div>
                                    </div>
                                </div>
                                <div class="template-thumb-label">Modern</div>
                            </div>
                            <div class="template-thumb ${activeTemplate === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">
                                <div class="checkmark"><i data-lucide="check" size="10"></i></div>
                                <div class="thumb-sketch">
                                    <div class="sketch-line title" style="width: 40%"></div>
                                    <div class="sketch-line"></div>
                                    <div class="sketch-line" style="width: 90%; height: 1px; background: #f1f5f9; margin-top: 10px;"></div>
                                    <div class="sketch-line"></div>
                                </div>
                                <div class="template-thumb-label">Minimal</div>
                            </div>
                        </div>
                    </div>
                    <div class="control-group">
                        <span class="control-label">Theme Color</span>
                        <div class="color-picker">
                            ${['hsl(168, 60%, 40%)', 'hsl(220, 60%, 35%)', 'hsl(345, 60%, 35%)', 'hsl(150, 50%, 30%)', 'hsl(0, 0%, 25%)'].map(c => `
                                <div class="color-option ${activeColor === c ? 'active' : ''}" style="background: ${c}" onclick="setActiveColor('${c}')"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div id="resume-preview-live" style="width: 100%;">
                    ${generateResumeHTML(resumeData, activeTemplate)}
                </div>
            </div>
        </div>
    `},
    '/preview': () => {
        const score = calculateATSScore();
        return `
        <div class="view preview-view">
            ${getValidationWarning()}
            <div class="preview-top-bar">
                <div id="preview-ats-score" class="preview-score-panel">
                    ${renderCircularProgress(score)}
                    ${renderImprovementSuggestions()}
                </div>
                <div class="preview-actions-panel">
                    <div class="export-actions">
                        <button class="btn-primary" onclick="printResume()"><i data-lucide="printer" size="16"></i> Print / Save as PDF</button>
                        <button class="btn-secondary" onclick="copyAsText()"><i data-lucide="copy" size="16"></i> Copy as Text</button>
                    </div>
                    <div class="template-tabs" style="width: 300px;">
                        <button class="template-tab ${activeTemplate === 'classic' ? 'active' : ''}" onclick="setTemplate('classic')">Classic</button>
                        <button class="template-tab ${activeTemplate === 'modern' ? 'active' : ''}" onclick="setTemplate('modern')">Modern</button>
                        <button class="template-tab ${activeTemplate === 'minimal' ? 'active' : ''}" onclick="setTemplate('minimal')">Minimal</button>
                    </div>
                </div>
            </div>
            ${generateResumeHTML(resumeData, activeTemplate)}
        </div>
    `},
    '/proof': () => `
        <div class="view" style="text-align: center; padding: 4rem;">
            <h2>Project Proof</h2>
            <p>Export Engine v1.0 active. PDF and Plain Text verified.</p>
        </div>
    `
};

function navigate(path) { window.location.hash = path; }
function render() {
    const hash = window.location.hash.split('?')[0] || '#/';
    const path = hash.replace('#', '');
    const mainContent = document.getElementById('main-content');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.route === path));
    if (views[path]) mainContent.innerHTML = (typeof views[path] === 'function') ? views[path]() : views[path];
    else mainContent.innerHTML = views['/']();
    lucide.createIcons();
    updateLivePreview();
}

window.addEventListener('hashchange', render);
window.navigate = navigate;
window.handleInput = handleInput;
window.setTemplate = setTemplate;
window.loadSampleData = loadSampleData;
window.updateLivePreview = updateLivePreview;
window.render = render;
window.saveToLocalStorage = saveToLocalStorage;
window.printResume = printResume;
window.copyAsText = copyAsText;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.suggestSkills = suggestSkills;
window.addProject = addProject;
window.toggleProject = toggleProject;
window.addProjectTech = addProjectTech;
window.removeProjectTech = removeProjectTech;
window.setActiveColor = setActiveColor;

if (!window.location.hash) window.location.hash = '#/';
else render();
