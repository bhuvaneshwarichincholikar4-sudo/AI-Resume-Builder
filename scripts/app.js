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

// --- Sample Data ---
const SAMPLE_DATA = {
    personal: { name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 0123', location: 'New York, NY' },
    summary: 'Experienced Software Engineer with a passion for building scalable web applications and AI-driven solutions.',
    education: [
        { institution: 'Tech University', degree: 'B.S. in Computer Science', date: '2016 - 2020' }
    ],
    experience: [
        { company: 'InnvoateSoft', role: 'Senior Developer', date: '2021 - Present', description: 'Leading frontend team for the next-gen AI platform.' },
        { company: 'GlobalDev', role: 'Junior Engineer', date: '2020 - 2021', description: 'Developed core features for the enterprise cloud dashboard.' }
    ],
    projects: [
        { name: 'AI Resume Builder', date: '2023', description: 'Built an AI-driven resume builder with premium layouts.' }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker',
    links: { github: 'github.com/johndoe', linkedin: 'linkedin.com/in/johndoe' }
};

// --- Helper Functions ---
function updateLivePreview() {
    const previewContainer = document.getElementById('resume-preview-live');
    if (!previewContainer) return;

    previewContainer.innerHTML = generateResumeHTML(resumeData);
}

function handleInput(section, field, value) {
    if (field) {
        resumeData[section][field] = value;
    } else {
        resumeData[section] = value;
    }
    updateLivePreview();
}

function loadSampleData() {
    resumeData = JSON.parse(JSON.stringify(SAMPLE_DATA));
    navigate('/builder');
    render();
}

// --- Component Templates ---
function generateResumeHTML(data) {
    const educationHTML = data.education.map(ed => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${ed.institution || ''}</span><span>${ed.date || ''}</span></div>
            <div class="resume-item-sub">${ed.degree || ''}</div>
        </div>
    `).join('');

    const experienceHTML = data.experience.map(exp => `
        <div class="resume-item">
            <div class="resume-item-header"><span>${exp.company || ''}</span><span>${exp.date || ''}</span></div>
            <div class="resume-item-sub">${exp.role || ''}</div>
            <p class="resume-item-desc">${exp.description || ''}</p>
        </div>
    `).join('');

    const projectsHTML = data.projects.map(proj => `
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
                    <span>${data.personal.email || ''}</span>
                    <span>${data.personal.phone || ''}</span>
                    <span>${data.personal.location || ''}</span>
                </div>
                <div class="resume-contact" style="margin-top: 4px;">
                    <span>${data.links.github || ''}</span>
                    <span>${data.links.linkedin || ''}</span>
                </div>
            </header>

            ${data.summary ? `
                <section>
                    <h2>Professional Summary</h2>
                    <p class="resume-item-desc">${data.summary}</p>
                </section>
            ` : ''}

            ${data.experience.length > 0 ? `
                <section>
                    <h2>Experience</h2>
                    <div class="resume-section-content">${experienceHTML}</div>
                </section>
            ` : ''}

            ${data.education.length > 0 ? `
                <section>
                    <h2>Education</h2>
                    <div class="resume-section-content">${educationHTML}</div>
                </section>
            ` : ''}

            ${data.projects.length > 0 ? `
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
                                <div class="input-group"><label>Company</label><input type="text" class="input-field" value="${exp.company}" oninput="resumeData.experience[${i}].company=this.value; updateLivePreview()"></div>
                                <div class="input-group" style="margin-top:0.5rem;"><label>Role</label><input type="text" class="input-field" value="${exp.role}" oninput="resumeData.experience[${i}].role=this.value; updateLivePreview()"></div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-add" onclick="resumeData.experience.push({company:'', role:'', date:'', description:''}); render()">+ Add Experience</button>
                </div>

                <div class="form-section">
                    <h3>Skills</h3>
                    <input type="text" class="input-field" placeholder="JavaScript, Python, React..." value="${resumeData.skills}" oninput="handleInput('skills', null, this.value)">
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
            <p style="color: grey; margin-top: 1rem;">Placeholder for screenshots and build artifacts.</p>
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

// Initial Draw
if (!window.location.hash) {
    window.location.hash = '#/';
} else {
    render();
}
