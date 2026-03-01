// Initialize Lucide icons
lucide.createIcons();

// --- Configuration ---
const PROJECT_STEPS = [
    { id: '01', title: 'Problem Statement', path: '/rb/01-problem', description: 'Define the core problem we are solving with the AI Resume Builder.' },
    { id: '02', title: 'Market Research', path: '/rb/02-market', description: 'Identify target audience and competitor gaps.' },
    { id: '03', title: 'Architecture Design', path: '/rb/03-architecture', description: 'High-level system design and component orchestration.' },
    { id: '04', title: 'HLD (High Level Design)', path: '/rb/04-hld', description: 'Defining APIs, database schema and major modules.' },
    { id: '05', title: 'LLD (Low Level Design)', path: '/rb/05-lld', description: 'Class structures, sequence diagrams and algorithms.' },
    { id: '06', title: 'Core Build', path: '/rb/06-build', description: 'Implementing the core resume parsing and generation logic.' },
    { id: '07', title: 'Testing & QA', path: '/rb/07-test', description: 'Ensuring output quality and edge case handling.' },
    { id: '08', title: 'Final Ship', path: '/rb/08-ship', description: 'Deploying the final build and preparing for production.' },
    { id: 'proof', title: 'Project Verification', path: '/rb/proof', description: 'Consolidation of artifacts and final submission.' }
];

// --- State Management ---
const State = {
    getArtifact(id) {
        return localStorage.getItem(`rb_step_${id}_artifact`) === 'true';
    },
    setArtifact(id, val) {
        localStorage.setItem(`rb_step_${id}_artifact`, val);
        this.sync();
    },
    getCurrentStepIdx() {
        const hash = window.location.hash.replace('#', '') || '/rb/01-problem';
        return PROJECT_STEPS.findIndex(s => s.path === hash);
    },
    canAccessStep(idx) {
        if (idx === 0) return true;
        // Check if previous step is completed
        return this.getArtifact(PROJECT_STEPS[idx - 1].id);
    },
    sync() {
        render();
    }
};

// --- Routing & Rendering ---
function navigate(path) {
    window.location.hash = path;
}

function render() {
    const idx = State.getCurrentStepIdx();
    const currentStep = PROJECT_STEPS[idx] || PROJECT_STEPS[0];
    const isProofPage = currentStep.id === 'proof';

    // Update Top Bar
    const stepLabel = isProofPage ? 'Final Submission' : `Step ${idx + 1} of 8`;
    document.getElementById('step-counter').innerText = `Project 3 — ${stepLabel}`;
    
    // Update Context Header
    document.getElementById('page-title').innerText = `${currentStep.id === 'proof' ? '' : currentStep.id + ' — '}${currentStep.title}`;
    const isCompleted = State.getArtifact(currentStep.id);
    const badge = document.getElementById('status-badge');
    badge.innerText = isCompleted ? 'Completed' : 'In-Progress';
    badge.className = `badge-status ${isCompleted ? 'active' : ''}`;

    // Update Workspace
    const workspace = document.getElementById('main-workspace');
    const buildPanel = document.getElementById('build-panel');
    
    if (isProofPage) {
        renderProofPage(workspace);
        buildPanel.classList.add('hidden');
    } else {
        renderStepWorkspace(workspace, currentStep);
        buildPanel.classList.remove('hidden');
        document.getElementById('lovable-copy-area').value = `// Prompt for Lovable: ${currentStep.title}\n\nBuild the ${currentStep.title} module for the AI Resume Builder project.\nObjectives:\n1. ${currentStep.description}\n2. Ensure premium aesthetic following the design system.\n3. Implement necessary API connectors.`;
    }

    // Update Footer Nav
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    btnPrev.disabled = idx === 0;
    btnNext.disabled = isProofPage || !isCompleted;
    
    btnPrev.onclick = () => {
        if (idx > 0) navigate(PROJECT_STEPS[idx - 1].path);
    };
    btnNext.onclick = () => {
        if (idx < PROJECT_STEPS.length - 1) {
            // Check gating if not navigating to proof
            if (State.getArtifact(currentStep.id)) {
                navigate(PROJECT_STEPS[idx + 1].path);
            }
        }
    };

    lucide.createIcons();
}

function renderStepWorkspace(container, step) {
    container.innerHTML = `
        <div class="view">
            <h2 style="font-size: 2rem; margin-bottom: 2rem; color: var(--color-primary);">${step.title}</h2>
            <div style="background: var(--color-primary-light); padding: 2rem; border-radius: var(--radius-lg); border: 1px dashed var(--color-border); margin-bottom: 2rem;">
                <p style="color: var(--color-text-secondary); line-height: 1.6;">${step.description}</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-outline" style="background: white;">
                        <i data-lucide="file-text" size="18"></i>
                        View Documentation
                    </button>
                    <button class="btn-outline" style="background: white;">
                        <i data-lucide="video" size="18"></i>
                        Watch Tutorial
                    </button>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="font-size: 1.125rem; font-weight: 700;">Requirements</h3>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary);">
                        <i data-lucide="check-square" size="16" style="color: var(--color-accent);"></i>
                        Complete the ${step.title} draft.
                    </li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary);">
                        <i data-lucide="check-square" size="16" style="color: var(--color-accent);"></i>
                        Sync with Lovable for real-time preview.
                    </li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary);">
                        <i data-lucide="check-square" size="16" style="color: var(--color-accent);"></i>
                        Upload evidence (screenshot or link).
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderProofPage(container) {
    const statuses = PROJECT_STEPS.slice(0, 8).map(s => {
        const done = State.getArtifact(s.id);
        return `
            <div class="step-card ${done ? 'completed' : ''}">
                <div class="status">${done ? 'Verified' : 'Pending'}</div>
                <div class="title">${s.id} — ${s.title}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="view" style="max-width: 900px; margin: 0 auto;">
            <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Final Proof of Build</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 2.5rem;">Verify all steps and provide deployment links for final submission.</p>
            
            <div class="proof-grid">
                ${statuses}
            </div>
            
            <div class="links-card">
                <h3 style="font-size: 1.25rem;">Submission Details</h3>
                <div class="input-group">
                    <label>Lovable Link</label>
                    <input type="text" id="link-lovable" placeholder="https://lovable.dev/projects/...">
                </div>
                <div class="input-group">
                    <label>GitHub Repository</label>
                    <input type="text" id="link-github" placeholder="https://github.com/user/repo">
                </div>
                <div class="input-group">
                    <label>Deployment URL</label>
                    <input type="text" id="link-deploy" placeholder="https://project-deployment.vercel.app">
                </div>
                
                <button class="btn-primary" style="margin-top: 1rem; width: 100%; height: 56px; font-size: 1.125rem;" id="btn-final-copy">
                    <i data-lucide="send" size="20"></i>
                    Copy Final Submission
                </button>
            </div>
        </div>
    `;

    document.getElementById('btn-final-copy').onclick = () => {
        const linkL = document.getElementById('link-lovable').value;
        const linkG = document.getElementById('link-github').value;
        const linkD = document.getElementById('link-deploy').value;
        const text = `PROJECT SUBMISSION\n\nLovable: ${linkL}\nGitHub: ${linkG}\nDeploy: ${linkD}\n\nSteps Completed: 8/8`;
        navigator.clipboard.writeText(text);
        alert('Submission copied to clipboard!');
    };
}

// --- Event Listeners ---
window.addEventListener('hashchange', render);

document.getElementById('btn-worked').onclick = () => {
    const idx = State.getCurrentStepIdx();
    const currentStep = PROJECT_STEPS[idx];
    if (currentStep && currentStep.id !== 'proof') {
        State.setArtifact(currentStep.id, 'true');
        alert(`${currentStep.title} artifact uploaded successfully.`);
    }
};

document.getElementById('btn-error').onclick = () => {
    alert('Error logged. Check browser console for details.');
};

document.getElementById('btn-copy').onclick = () => {
    const content = document.getElementById('lovable-copy-area').value;
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
};

document.getElementById('btn-open-lovable').onclick = () => {
    window.open('https://lovable.dev', '_blank');
};

// Initial Render
if (!window.location.hash) {
    navigate('/rb/01-problem');
} else {
    render();
}
