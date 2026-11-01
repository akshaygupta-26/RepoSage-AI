/**
 * RepoSage AI - Core Application Logic
 * Integrates GitHub REST API & Google Gemini AI API
 */

// ==========================================================================
// Application State
// ==========================================================================
const state = {
    apiKey: localStorage.getItem('reposage_gemini_key') || '',
    githubToken: localStorage.getItem('reposage_github_token') || '',
    selectedAction: 'explain',
    currentModel: 'gemini-2.5-flash',
    currentRepo: null,       // { owner, repo, branch, info, tree: [] }
    activeFile: null,       // { path, content, language }
    isAnalyzing: false,
    isLoadingRepo: false,
    rawTreeNodes: []
};

// Language map for file extensions
const EXTENSION_MAP = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'mjs': 'JavaScript',
    'cjs': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'html': 'HTML',
    'htm': 'HTML',
    'css': 'CSS',
    'scss': 'CSS',
    'sass': 'CSS',
    'less': 'CSS',
    'json': 'JSON',
    'md': 'Markdown',
    'markdown': 'Markdown',
    'java': 'Java',
    'cpp': 'C++',
    'cc': 'C++',
    'cxx': 'C++',
    'c': 'C++',
    'h': 'C++',
    'hpp': 'C++',
    'go': 'Go',
    'rs': 'Rust',
    'rb': 'Ruby',
    'php': 'PHP',
    'sh': 'Bash',
    'yaml': 'YAML',
    'yml': 'YAML'
};

// ==========================================================================
// DOM Elements
// ==========================================================================
const elements = {
    // Nav & Status
    apiStatusBtn: document.getElementById('apiStatusBtn'),
    apiStatusDot: document.getElementById('apiStatusDot'),
    apiStatusText: document.getElementById('apiStatusText'),
    settingsBtn: document.getElementById('settingsBtn'),
    footerConfigLink: document.getElementById('footerConfigLink'),
    navRepoInfo: document.getElementById('navRepoInfo'),
    navRepoName: document.getElementById('navRepoName'),
    navRepoBranch: document.getElementById('navRepoBranch'),

    // Repo Search & Info
    repoUrlInput: document.getElementById('repoUrl'),
    loadRepoBtn: document.getElementById('loadRepo'),
    loadSpinner: document.getElementById('loadSpinner'),
    loadBtnText: document.getElementById('loadBtnText'),
    repoMessage: document.getElementById('repoMessage'),
    repoOverviewCard: document.getElementById('repoOverviewCard'),
    repoAvatar: document.getElementById('repoAvatar'),
    repoFullName: document.getElementById('repoFullName'),
    repoExternalLink: document.getElementById('repoExternalLink'),
    repoDescription: document.getElementById('repoDescription'),
    repoStars: document.getElementById('repoStars'),
    repoForks: document.getElementById('repoForks'),
    repoLang: document.getElementById('repoLang'),
    repoBranchBadge: document.getElementById('repoBranchBadge'),
    repoTopics: document.getElementById('repoTopics'),

    // File Explorer
    fileFilterInput: document.getElementById('fileFilterInput'),
    fileTreeContainer: document.getElementById('fileTreeContainer'),
    fileCountBadge: document.getElementById('fileCountBadge'),

    // Code Editor
    activeFileTitle: document.getElementById('activeFileTitle'),
    activeFilePath: document.getElementById('activeFilePath'),
    codeInput: document.getElementById('codeInput'),
    languageSelect: document.getElementById('language'),
    lineCount: document.getElementById('lineCount'),
    charCount: document.getElementById('charCount'),
    clearCodeBtn: document.getElementById('clearCode'),

    // AI Studio
    actionBtns: document.querySelectorAll('.action-btn'),
    geminiModelSelect: document.getElementById('geminiModelSelect'),
    customPromptContainer: document.getElementById('customPromptContainer'),
    customPromptInput: document.getElementById('customPromptInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analyzeSpinner: document.getElementById('analyzeSpinner'),
    analyzeBtnText: document.getElementById('analyzeBtnText'),

    // Output
    output: document.getElementById('output'),
    outputTitle: document.getElementById('outputTitle'),
    outputMeta: document.getElementById('outputMeta'),
    outputActions: document.getElementById('outputActions'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
    githubTokenInput: document.getElementById('githubTokenInput'),
    toggleKeyVisibility: document.getElementById('toggleKeyVisibility'),
    toggleGhKeyVisibility: document.getElementById('toggleGhKeyVisibility'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    clearKeysBtn: document.getElementById('clearKeysBtn'),
    saveKeysBtn: document.getElementById('saveKeysBtn'),
    keyValidationFeedback: document.getElementById('keyValidationFeedback'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

// ==========================================================================
// API Key & Status Management
// ==========================================================================
function updateApiStatusUI() {
    if (state.apiKey && state.apiKey.trim().length > 10) {
        elements.apiStatusDot.className = 'status-dot active';
        elements.apiStatusText.textContent = 'Gemini AI Ready';
        elements.apiStatusBtn.title = 'Gemini API Key configured and active';
    } else {
        elements.apiStatusDot.className = 'status-dot demo';
        elements.apiStatusText.textContent = 'Demo Mode (Add Key)';
        elements.apiStatusBtn.title = 'Click to add your free Google Gemini API Key';
    }
}

function openSettingsModal() {
    elements.geminiApiKeyInput.value = state.apiKey;
    elements.githubTokenInput.value = state.githubToken;
    elements.keyValidationFeedback.textContent = '';
    elements.keyValidationFeedback.className = 'validation-feedback';
    elements.settingsModal.style.display = 'flex';
    elements.geminiApiKeyInput.focus();
}

function closeSettingsModal() {
    elements.settingsModal.style.display = 'none';
}

// Toggle password field visibility
function setupPasswordToggle(button, input) {
    button.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? '🔒' : '👁️';
    });
}

setupPasswordToggle(elements.toggleKeyVisibility, elements.geminiApiKeyInput);
setupPasswordToggle(elements.toggleGhKeyVisibility, elements.githubTokenInput);

// Save keys to localStorage
elements.saveKeysBtn.addEventListener('click', () => {
    const geminiKey = elements.geminiApiKeyInput.value.trim();
    const ghToken = elements.githubTokenInput.value.trim();

    state.apiKey = geminiKey;
    state.githubToken = ghToken;

    if (geminiKey) {
        localStorage.setItem('reposage_gemini_key', geminiKey);
    } else {
        localStorage.removeItem('reposage_gemini_key');
    }

    if (ghToken) {
        localStorage.setItem('reposage_github_token', ghToken);
    } else {
        localStorage.removeItem('reposage_github_token');
    }

    updateApiStatusUI();
    showToast('Settings saved successfully!', 'success');
    closeSettingsModal();
});

// Clear keys
elements.clearKeysBtn.addEventListener('click', () => {
    state.apiKey = '';
    state.githubToken = '';
    elements.geminiApiKeyInput.value = '';
    elements.githubTokenInput.value = '';
    localStorage.removeItem('reposage_gemini_key');
    localStorage.removeItem('reposage_github_token');
    updateApiStatusUI();
    elements.keyValidationFeedback.textContent = 'Keys cleared.';
    elements.keyValidationFeedback.style.color = 'var(--text-muted)';
    showToast('Keys cleared from browser', 'info');
});

// Test Connection with Gemini API
elements.testConnectionBtn.addEventListener('click', async () => {
    const testKey = elements.geminiApiKeyInput.value.trim();
    if (!testKey) {
        elements.keyValidationFeedback.textContent = 'Please enter a Gemini API Key to test.';
        elements.keyValidationFeedback.style.color = 'var(--rose)';
        return;
    }

    elements.testConnectionBtn.disabled = true;
    elements.testConnectionBtn.textContent = 'Testing...';
    elements.keyValidationFeedback.textContent = 'Connecting to Google Gemini API...';
    elements.keyValidationFeedback.style.color = 'var(--cyan)';

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${testKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Respond with the word "CONNECTED" in all caps.' }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates.length > 0) {
            elements.keyValidationFeedback.textContent = '✓ Gemini API connection successful! Ready for live analysis.';
            elements.keyValidationFeedback.style.color = 'var(--emerald)';
        } else {
            const errorMsg = data.error?.message || 'Invalid API Key or model access denied.';
            elements.keyValidationFeedback.textContent = `✕ Error: ${errorMsg}`;
            elements.keyValidationFeedback.style.color = 'var(--rose)';
        }
    } catch (err) {
        elements.keyValidationFeedback.textContent = `✕ Network error: ${err.message}`;
        elements.keyValidationFeedback.style.color = 'var(--rose)';
    } finally {
        elements.testConnectionBtn.disabled = false;
        elements.testConnectionBtn.textContent = 'Test Connection';
    }
});

elements.settingsBtn.addEventListener('click', openSettingsModal);
elements.apiStatusBtn.addEventListener('click', openSettingsModal);
if (elements.footerConfigLink) {
    elements.footerConfigLink.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
    });
}
elements.closeSettingsBtn.addEventListener('click', closeSettingsModal);
elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) closeSettingsModal();
});

// ==========================================================================
// Code Editor Mechanics
// ==========================================================================
function updateCodeStats() {
    const text = elements.codeInput.value;
    const lines = text ? text.split('\n').length : 0;
    const chars = text.length;

    elements.lineCount.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    elements.charCount.textContent = `${chars.toLocaleString()} chars`;
}

elements.codeInput.addEventListener('input', updateCodeStats);

elements.clearCodeBtn.addEventListener('click', () => {
    elements.codeInput.value = '';
    updateCodeStats();
    elements.activeFileTitle.textContent = 'Active Code Workspace';
    elements.activeFilePath.textContent = 'Manual input mode';
    elements.codeInput.focus();
    showToast('Code workspace cleared', 'info');
});

// Auto-detect language by filename extension
function detectLanguageFromPath(path) {
    const ext = path.split('.').pop().toLowerCase();
    return EXTENSION_MAP[ext] || 'JavaScript';
}

function selectLanguageInDropdown(lang) {
    for (let i = 0; i < elements.languageSelect.options.length; i++) {
        if (elements.languageSelect.options[i].value.toLowerCase() === lang.toLowerCase()) {
            elements.languageSelect.selectedIndex = i;
            return;
        }
    }
}

// ==========================================================================
// GitHub API Repository Explorer
// ==========================================================================
function parseRepoInput(input) {
    const trimmed = input.trim().replace(/\/+$/, '');
    if (!trimmed) return null;

    // Match https://github.com/owner/repo or owner/repo
    const fullUrlMatch = trimmed.match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i);
    if (fullUrlMatch) {
        return { owner: fullUrlMatch[1], repo: fullUrlMatch[2].replace(/\.git$/, '') };
    }

    const shorthandMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
    if (shorthandMatch) {
        return { owner: shorthandMatch[1], repo: shorthandMatch[2].replace(/\.git$/, '') };
    }

    return null;
}

// Helper to fetch with GitHub authorization if token present
async function fetchGithubApi(url) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (state.githubToken) {
        headers['Authorization'] = `token ${state.githubToken}`;
    }
    const res = await fetch(url, { headers });
    return res;
}

// Load Repository
async function loadRepository(targetRepo) {
    let repoTarget = targetRepo;
    if (!repoTarget) {
        const parsed = parseRepoInput(elements.repoUrlInput.value);
        if (!parsed) {
            elements.repoMessage.textContent = 'Please enter a valid GitHub repository URL or owner/repo format.';
            elements.repoMessage.className = 'message error';
            return;
        }
        repoTarget = parsed;
    }

    setLoadingState(true);
    elements.repoMessage.textContent = `Connecting to GitHub API for ${repoTarget.owner}/${repoTarget.repo}...`;
    elements.repoMessage.className = 'message info';

    try {
        // 1. Fetch Repository Metadata
        const repoRes = await fetchGithubApi(`https://api.github.com/repos/${repoTarget.owner}/${repoTarget.repo}`);

        if (repoRes.status === 404) {
            throw new Error('Repository not found. Please verify the owner and repository name, or ensure it is public.');
        } else if (repoRes.status === 403) {
            throw new Error('GitHub API rate limit exceeded. You can add a GitHub Personal Access Token in Settings to get 5,000 requests/hr.');
        } else if (!repoRes.ok) {
            throw new Error(`GitHub API error: ${repoRes.statusText}`);
        }

        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || 'main';

        // 2. Fetch Repository Tree (Recursive)
        elements.repoMessage.textContent = `Fetching file tree (${defaultBranch} branch)...`;
        const treeRes = await fetchGithubApi(`https://api.github.com/repos/${repoTarget.owner}/${repoTarget.repo}/git/trees/${defaultBranch}?recursive=1`);

        let treeNodes = [];
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            // Filter to blob (files) only, exclude heavy/binary/git files
            treeNodes = (treeData.tree || []).filter(item => {
                if (item.type !== 'blob') return false;
                const path = item.path.toLowerCase();
                const ext = path.split('.').pop();
                const ignoredExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'pdf', 'zip', 'gz', 'tar', 'exe', 'dll', 'woff', 'woff2', 'ttf', 'eot', 'mp4', 'mov', 'lock'];
                if (ignoredExts.includes(ext)) return false;
                if (path.startsWith('.git/')) return false;
                return true;
            });
        }

        // Save state
        state.currentRepo = {
            owner: repoTarget.owner,
            repo: repoTarget.repo,
            branch: defaultBranch,
            info: repoData,
            tree: treeNodes
        };
        state.rawTreeNodes = treeNodes;

        // Render Overview & Tree
        renderRepoOverview(repoData, defaultBranch);
        renderFileTree(treeNodes);

        elements.repoMessage.textContent = `✓ Successfully loaded repository with ${treeNodes.length} source files!`;
        elements.repoMessage.className = 'message success';
        showToast(`Repository ${repoData.full_name} loaded!`, 'success');

        // Look for README or package.json or main file to open by default
        const defaultFile = treeNodes.find(n => /^readme\.md$/i.test(n.path)) ||
                            treeNodes.find(n => /package\.json$/i.test(n.path)) ||
                            treeNodes.find(n => /index\.(js|ts|py|html)$/i.test(n.path)) ||
                            treeNodes[0];

        if (defaultFile) {
            loadFileContent(defaultFile.path);
        }

    } catch (err) {
        console.error('Repo load failed:', err);
        elements.repoMessage.textContent = `✕ ${err.message}`;
        elements.repoMessage.className = 'message error';
        showToast(err.message, 'error', 5000);
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    state.isLoadingRepo = loading;
    elements.loadRepoBtn.disabled = loading;
    elements.loadSpinner.style.display = loading ? 'inline-block' : 'none';
    elements.loadBtnText.textContent = loading ? 'Loading...' : 'Load Repository';
}

function renderRepoOverview(data, branch) {
    elements.repoOverviewCard.style.display = 'block';

    if (data.owner?.avatar_url) {
        elements.repoAvatar.src = data.owner.avatar_url;
        elements.repoAvatar.style.display = 'block';
    } else {
        elements.repoAvatar.style.display = 'none';
    }

    elements.repoFullName.textContent = data.full_name;
    elements.repoExternalLink.href = data.html_url;
    elements.repoDescription.textContent = data.description || 'No description provided for this repository.';
    elements.repoStars.textContent = (data.stargazers_count || 0).toLocaleString();
    elements.repoForks.textContent = (data.forks_count || 0).toLocaleString();
    elements.repoLang.textContent = data.language || 'Multi-Language';
    elements.repoBranchBadge.textContent = branch;

    // Navbar pill
    elements.navRepoInfo.style.display = 'flex';
    elements.navRepoName.textContent = data.full_name;
    elements.navRepoBranch.textContent = branch;

    // Topics
    elements.repoTopics.innerHTML = '';
    const topics = data.topics || [];
    topics.slice(0, 6).forEach(topic => {
        const chip = document.createElement('span');
        chip.className = 'topic-chip';
        chip.textContent = `#${topic}`;
        elements.repoTopics.appendChild(chip);
    });
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
        case 'mjs': return '🟨';
        case 'ts':
        case 'tsx': return '🔷';
        case 'py': return '🐍';
        case 'html': return '🌐';
        case 'css':
        case 'scss': return '🎨';
        case 'json': return '📋';
        case 'md': return '📝';
        case 'java': return '☕';
        case 'go': return '🐹';
        case 'rs': return '🦀';
        case 'cpp':
        case 'c': return '⚙️';
        case 'sh': return '💻';
        default: return '📄';
    }
}

function renderFileTree(nodes) {
    elements.fileTreeContainer.innerHTML = '';
    elements.fileCountBadge.textContent = `${nodes.length} files`;

    if (!nodes || nodes.length === 0) {
        elements.fileTreeContainer.innerHTML = `
            <div class="tree-empty-state">
                <span class="tree-empty-icon">📂</span>
                <p>No matching files found.</p>
            </div>
        `;
        return;
    }

    // Limit rendered nodes for performance if repository is massive
    const displayNodes = nodes.slice(0, 150);

    displayNodes.forEach(node => {
        const item = document.createElement('div');
        item.className = 'tree-node';
        item.dataset.path = node.path;
        if (state.activeFile && state.activeFile.path === node.path) {
            item.classList.add('active');
        }

        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        icon.textContent = getFileIcon(node.path);

        const name = document.createElement('span');
        name.className = 'tree-node-name';
        name.textContent = node.path;
        name.title = node.path;

        item.appendChild(icon);
        item.appendChild(name);

        item.addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            loadFileContent(node.path);
        });

        elements.fileTreeContainer.appendChild(item);
    });

    if (nodes.length > 150) {
        const overflowNotice = document.createElement('div');
        overflowNotice.style.padding = '10px';
        overflowNotice.style.fontSize = '11px';
        overflowNotice.style.color = 'var(--text-faint)';
        overflowNotice.style.textAlign = 'center';
        overflowNotice.textContent = `Showing 150 of ${nodes.length} files. Use filter above to refine.`;
        elements.fileTreeContainer.appendChild(overflowNotice);
    }
}

// Search / Filter files
elements.fileFilterInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!state.rawTreeNodes) return;

    if (!term) {
        renderFileTree(state.rawTreeNodes);
        return;
    }

    const filtered = state.rawTreeNodes.filter(node => node.path.toLowerCase().includes(term));
    renderFileTree(filtered);
});

// Fetch File Content from Raw GitHub or API
async function loadFileContent(filePath) {
    if (!state.currentRepo) return;
    const { owner, repo, branch } = state.currentRepo;

    elements.activeFileTitle.textContent = filePath.split('/').pop();
    elements.activeFilePath.textContent = `${owner}/${repo}/${filePath}`;

    const originalVal = elements.codeInput.value;
    elements.codeInput.value = `// Fetching content for ${filePath}...`;
    elements.codeInput.disabled = true;

    try {
        // Try raw.githubusercontent first for speed and avoiding rate limits
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
        const rawRes = await fetch(rawUrl);

        let content = '';
        if (rawRes.ok) {
            content = await rawRes.text();
        } else {
            // Fallback to GitHub Contents API
            const apiRes = await fetchGithubApi(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`);
            if (!apiRes.ok) throw new Error(`Could not load ${filePath}`);
            const data = await apiRes.json();
            content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        }

        elements.codeInput.value = content;
        elements.codeInput.disabled = false;

        const lang = detectLanguageFromPath(filePath);
        selectLanguageInDropdown(lang);

        state.activeFile = {
            path: filePath,
            content: content,
            language: lang
        };

        updateCodeStats();
        showToast(`Loaded ${filePath.split('/').pop()}`, 'success', 2500);

    } catch (err) {
        console.error('File fetch failed:', err);
        elements.codeInput.disabled = false;
        elements.codeInput.value = originalVal;
        showToast(`Failed to load file: ${err.message}`, 'error');
    }
}

// Quick Sample Chips
document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const repoStr = chip.dataset.repo;
        elements.repoUrlInput.value = repoStr;
        loadRepository(parseRepoInput(repoStr));
    });
});

elements.loadRepoBtn.addEventListener('click', () => loadRepository());
elements.repoUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadRepository();
});

// ==========================================================================
// AI Assistant Action Selector & Custom Prompt
// ==========================================================================
elements.actionBtns.forEach(button => {
    button.addEventListener('click', () => {
        elements.actionBtns.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        state.selectedAction = button.dataset.action;

        if (state.selectedAction === 'custom') {
            elements.customPromptContainer.style.display = 'block';
            elements.customPromptInput.focus();
        } else {
            elements.customPromptContainer.style.display = 'none';
        }
    });
});

elements.geminiModelSelect.addEventListener('change', (e) => {
    state.currentModel = e.target.value;
    showToast(`Switched model to ${state.currentModel}`, 'info', 2000);
});

// ==========================================================================
// Gemini AI API Engine & Prompts
// ==========================================================================
function constructSystemPrompt(action, code, lang, repoContext) {
    const repoInfoSnippet = repoContext 
        ? `Repository: ${repoContext.owner}/${repoContext.repo} (Branch: ${repoContext.branch})`
        : 'User Provided Code';

    const baseContext = `You are RepoSage AI, a world-class senior software architect, security researcher, and code reviewer.
Analyze the following ${lang} code.
Context: ${repoInfoSnippet}

\`\`\`${lang.toLowerCase()}
${code}
\`\`\`
`;

    switch (action) {
        case 'explain':
            return `${baseContext}
Please provide an in-depth code explanation structured with these sections:
1. **Executive Summary**: High-level overview of what this code accomplishes.
2. **Key Components & Logic**: Breakdown of the main functions, classes, and logic flow.
3. **Data Flow & Dependencies**: How data travels through this snippet and any external requirements.
4. **Time & Space Complexity**: Computational complexity analysis with Big-O notation.
5. **Architectural Patterns**: Design patterns or programming paradigms utilized.

Format your response in clean, professional GitHub-flavored Markdown.`;

        case 'bugs':
            return `${baseContext}
Perform a rigorous code review and security audit on this snippet.
Identify potential bugs, security vulnerabilities (OWASP top 10), edge-case crashes, memory leaks, concurrency issues, or error handling gaps.
Structure your report as:
1. **Security & Bug Audit Summary**: Overall risk rating (Low / Medium / High / Critical).
2. **Identified Issues & Vulnerabilities**: Bulleted list with Severity, Explanation, and Impact.
3. **Recommended Fixes**: Provide corrected code snippets showing precisely how to remediate each issue.
4. **Defensive Best Practices**: Suggestions to harden the codebase for production.`;

        case 'improve':
            return `${baseContext}
Provide an intelligent refactoring and optimization proposal for this code.
Structure your response as:
1. **Refactoring Opportunities**: Code smells, performance bottlenecks, or obsolete patterns.
2. **Optimized Drop-in Implementation**: Clean, modern, idiomatic ${lang} code that outperforms and simplifies the original.
3. **Detailed Changes & Benchmarks**: Explanations of why each modification improves maintainability, readability, or runtime speed.`;

        case 'tests':
            return `${baseContext}
Generate a comprehensive, production-ready unit test suite for this code.
- Use the standard test framework for ${lang} (e.g., Jest/Vitest for JS/TS, pytest for Python, JUnit for Java, etc.).
- Include tests for happy paths, boundary values, error states, and invalid inputs.
- Include mock fixtures if required.
- Add clear descriptive test case names.`;

        case 'readme':
            return `${baseContext}
Generate a complete, production-grade \`README.md\` documentation for this project or component.
Include:
- Project Title, Description, and Badges
- Features list
- Architecture / How It Works
- Installation & Setup instructions
- Usage examples with code snippets
- API / Interface documentation
- Contributing & License guidelines`;

        case 'custom':
            const customQuery = elements.customPromptInput.value.trim() || 'Provide a helpful review of this code.';
            return `${baseContext}
User Query: "${customQuery}"
Answer the query specifically, accurately, and thoroughly with code examples where helpful.`;

        default:
            return `${baseContext}
Provide a thorough code analysis and helpful insights for this code.`;
    }
}

// Fallback high-quality demo response when no API key is provided
function generateFallbackResponse(action, code, lang, repoContext) {
    const lines = code.split('\n').length;
    const repoTitle = repoContext ? `${repoContext.owner}/${repoContext.repo}` : 'Active File';

    if (action === 'explain') {
        return `## ✦ RepoSage AI Analysis: Code Explanation
> **Target:** \`${repoTitle}\` | **Language:** ${lang} | **Size:** ${lines} lines | **Mode:** Demo Simulation

### 1. Executive Summary
This ${lang} implementation defines core functional logic designed to handle data transformation and execution flow. The code contains **${lines} lines** with structured operations.

### 2. Logic Flow & Components
${code.includes('function') || code.includes('const ') || code.includes('def ') 
    ? '- **Modular Declarations**: Encapsulates behavior into discrete callable units to maintain single-responsibility principles.\n- **Control Flow**: Manages input execution and returns evaluated outcomes.' 
    : '- **Execution Sequence**: Linear statement execution evaluating expressions sequentially.'}
- **Input Handling**: Consumes parameters and executes logic against received arguments.

### 3. Complexity & Performance
- **Time Complexity:** $O(n)$ or $O(1)$ based on input parameters.
- **Memory Footprint:** Minimal heap allocation for standard execution.

---
💡 *Tip: Add your free Google Gemini API Key in **Config ⚙️** (top right) to receive live, real-time AI reasoning for any codebase!*`;
    } else if (action === 'bugs') {
        const issues = [];
        if (code.includes('==') && !code.includes('===')) {
            issues.push('**Type Coercion Risk:** Detected loose equality \`==\`. Use strict equality \`===\` to prevent unexpected JavaScript type casting bugs.');
        }
        if (code.includes('var ')) {
            issues.push('**Variable Scoping Risk:** Found \`var\` declaration. Refactor to block-scoped \`let\` or immutable \`const\`.');
        }
        if (code.includes('eval(')) {
            issues.push('**High Severity Vulnerability:** \`eval()\` usage opens code injection vectors.');
        }
        if (issues.length === 0) {
            issues.push('**General Review:** No immediate high-risk syntax anti-patterns detected in basic static scan.');
        }

        return `## ✦ RepoSage AI: Security & Bug Audit
> **Target:** \`${repoTitle}\` | **Language:** ${lang} | **Mode:** Demo Simulation

### Audit Summary
- **Risk Rating:** ${issues.length > 1 ? '⚠️ Medium' : '✅ Low'}
- **Static Findings:**
${issues.map(i => `- ${i}`).join('\n')}

### Best Practice Checklist
1. Implement input sanitization and boundary checks.
2. Ensure asynchronous calls handle rejected promises with \`try/catch\`.
3. Protect against null/undefined dereferencing.

---
💡 *Configure your Gemini API Key in Settings to run comprehensive LLM security audits with deep vulnerability reasoning.*`;
    } else if (action === 'improve') {
        return `## ✦ RepoSage AI: Optimization & Refactoring
> **Language:** ${lang} | **Status:** Evaluated

### Recommendations
1. **Modernize Syntax**: Leverage ES6+ or modern ${lang} idioms for cleaner, declarative logic.
2. **Error Boundary**: Wrap critical I/O or state mutations in robust error handling blocks.
3. **Immutability**: Avoid mutating parameters directly; prefer returning fresh transformed objects.

\`\`\`${lang.toLowerCase()}
// Optimized structure pattern
export function processOptimizedData(input) {
  if (!input) return null;
  return Object.freeze({ ...input, processedAt: Date.now() });
}
\`\`\`

---
💡 *Connect a Gemini API key for automated drop-in rewrites tailored to this exact file.*`;
    } else if (action === 'tests') {
        return `## ✦ RepoSage AI: Generated Unit Tests
> **Framework:** Jest / Vitest | **Language:** ${lang}

\`\`\`javascript
describe('${repoTitle} Test Suite', () => {
  it('should process valid inputs correctly', () => {
    const input = { valid: true };
    expect(input).toBeDefined();
  });

  it('should handle edge cases and invalid parameters safely', () => {
    expect(() => {
      // test boundary execution
    }).not.toThrow();
  });
});
\`\`\`

---
💡 *Set up your Gemini API key to generate complete mock fixtures and boundary test suites automatically!*`;
    } else {
        return `## ✦ RepoSage AI: README Documentation

# ${repoTitle}

A high-performance ${lang} module analyzed with RepoSage AI.

## Installation
\`\`\`bash
# Clone the repository
git clone https://github.com/${repoTitle}.git
cd ${repoTitle.split('/').pop()}
\`\`\`

## Features
- Modular ${lang} architecture
- Clean separation of concerns
- Production-ready error handling

---
*Generated by RepoSage AI Assistant.*`;
    }
}

// Execute Analysis
async function runAnalysis() {
    const code = elements.codeInput.value.trim();
    if (!code) {
        showToast('Please paste code or select a file from the repository first.', 'error');
        elements.codeInput.focus();
        return;
    }

    state.isAnalyzing = true;
    elements.analyzeBtn.disabled = true;
    elements.analyzeSpinner.style.display = 'inline-block';
    elements.analyzeBtnText.textContent = 'Generating AI Insights...';

    elements.output.innerHTML = `
        <div class="empty-state">
            <div class="btn-spinner" style="width: 32px; height: 32px; border-width: 3px; margin: 0 auto 16px;"></div>
            <h3>Analyzing code with ${state.apiKey ? state.currentModel : 'Demo Engine'}...</h3>
            <p>Evaluating logic, security, and structure. Results arriving shortly.</p>
        </div>
    `;

    // Scroll to results section smoothly
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        let markdownContent = '';

        if (state.apiKey && state.apiKey.trim().length > 10) {
            // Live Gemini API Call
            const prompt = constructSystemPrompt(
                state.selectedAction,
                code,
                elements.languageSelect.value,
                state.currentRepo
            );

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${state.currentModel}:generateContent?key=${state.apiKey}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2500
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errDetail = data.error?.message || response.statusText;
                throw new Error(`Gemini API Error: ${errDetail}`);
            }

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                markdownContent = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('No generated text received from the Gemini model.');
            }
        } else {
            // Simulated local fallback
            await new Promise(resolve => setTimeout(resolve, 800));
            markdownContent = generateFallbackResponse(
                state.selectedAction,
                code,
                elements.languageSelect.value,
                state.currentRepo
            );
        }

        renderOutputMarkdown(markdownContent);
        showToast('Analysis complete!', 'success');

    } catch (err) {
        console.error('Analysis error:', err);
        elements.output.innerHTML = `
            <div style="color: var(--rose); padding: 12px; background: rgba(244, 63, 94, 0.1); border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.3);">
                <strong>✕ Analysis Failed:</strong> ${err.message}
                <div style="margin-top: 12px;">
                    <button id="openConfigFromError" class="btn-ghost" style="border-color: var(--rose); color: #fff;">Open Settings ⚙️</button>
                </div>
            </div>
        `;
        document.getElementById('openConfigFromError')?.addEventListener('click', openSettingsModal);
        showToast(err.message, 'error', 5000);
    } finally {
        state.isAnalyzing = false;
        elements.analyzeBtn.disabled = false;
        elements.analyzeSpinner.style.display = 'none';
        elements.analyzeBtnText.textContent = 'Analyze with Gemini AI';
    }
}

function renderOutputMarkdown(markdown) {
    elements.outputActions.style.display = 'flex';
    elements.outputMeta.textContent = `Generated using ${state.apiKey ? state.currentModel : 'Built-in Engine'} • ${new Date().toLocaleTimeString()}`;

    // Use marked if available, otherwise fallback
    let html = '';
    if (window.marked) {
        html = marked.parse(markdown);
    } else {
        html = `<pre style="white-space: pre-wrap;">${markdown}</pre>`;
    }

    elements.output.innerHTML = `<div class="markdown-body">${html}</div>`;

    // Apply syntax highlighting
    if (window.hljs) {
        elements.output.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    // Save current markdown for export
    elements.output.dataset.rawMarkdown = markdown;
}

elements.analyzeBtn.addEventListener('click', runAnalysis);

// Copy Output
elements.copyBtn.addEventListener('click', async () => {
    const rawMarkdown = elements.output.dataset.rawMarkdown || elements.output.innerText;
    try {
        await navigator.clipboard.writeText(rawMarkdown);
        elements.copyBtn.innerHTML = `<span>✓ Copied!</span>`;
        setTimeout(() => {
            elements.copyBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Markdown</span>
            `;
        }, 2000);
        showToast('Results copied to clipboard', 'success');
    } catch (err) {
        showToast('Clipboard access denied', 'error');
    }
});

// Download Output as Markdown
elements.downloadBtn.addEventListener('click', () => {
    const rawMarkdown = elements.output.dataset.rawMarkdown || elements.output.innerText;
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `reposage-${state.selectedAction}-${Date.now()}.md`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Saved as ${fileName}`, 'success');
});

// ==========================================================================
// Initialization
// ==========================================================================
function init() {
    updateApiStatusUI();
    updateCodeStats();

    // Check if initial URL has query param for repo
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    if (repoParam) {
        elements.repoUrlInput.value = repoParam;
        loadRepository(parseRepoInput(repoParam));
    }
}

init();
