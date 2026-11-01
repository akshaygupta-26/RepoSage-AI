# RepoSage AI – Smart GitHub Repository & Code Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-6366f1?style=for-the-badge" alt="Version 2.0" />
  <img src="https://img.shields.io/badge/Hacktoberfest-2026-ff7a00?style=for-the-badge" alt="Hacktoberfest 2026" />
  <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="License MIT" />
  <img src="https://img.shields.io/badge/AI-Google_Gemini_%26_Ollama-06b6d4?style=for-the-badge" alt="AI Engine" />
</p>

<p align="center">
  <strong>Understand Code. Build Better.</strong><br>
  An intelligent coding companion and GitHub repository explorer for open-source contributors, reviewers, and engineering teams.
</p>

---

## 🌟 Overview

**RepoSage AI** is an AI-powered developer assistant designed to help programmers understand, inspect, and enhance source code. Whether you are reviewing an unfamiliar open-source codebase or auditing your own projects, RepoSage AI bridges the gap with automated code explanations, security auditing, refactoring suggestions, test generation, and full documentation synthesis.

Built for **Hacktoberfest 2026**, RepoSage AI explores how modern developer tooling and accessible AI can make software development faster, smarter, and open to all.

---

## ✨ Features

- 🌐 **Live GitHub Repository Explorer:**
  - Load public repositories via full URL or `owner/repo` shorthand.
  - Live repository statistics: stars ⭐, forks 🍴, open issues, default branch 🌿, and topic tags.
  - Interactive recursive file tree with extension-specific icons and real-time search filtering.
  - Click-to-load source code straight from GitHub into the editor.

- 🧠 **Google Gemini AI Studio:**
  - Support for **Gemini 2.5 Flash**, **Gemini 2.0 Flash**, **Gemini 1.5 Flash**, and **Gemini 1.5 Pro**.
  - **Explain Code:** Architectural breakdowns, logic flow, and $O(n)$ time/space complexity analysis.
  - **Find Bugs & Security:** Rigorous audit detecting OWASP risks, memory leaks, and type coercion bugs.
  - **Refactor & Improve:** Clean, idiomatic, and modern drop-in replacements.
  - **Generate Tests:** Comprehensive unit test suites (Jest/Vitest, pytest, JUnit) with edge-case coverage.
  - **Generate README / Docs:** Full production documentation with usage examples and API specs.
  - **Custom AI Prompt:** Ask arbitrary questions about the loaded code or repository.

- 🔒 **Privacy-First & Zero Setup:**
  - Client-side storage: API keys stay securely inside your browser's `localStorage`. No middleman backend logging.
  - Built-in fallback demo engine allowing immediate offline exploration without an API key.

- 🎨 **Developer-Friendly UI:**
  - Sleek dark theme with glassmorphism and radiant gradients.
  - Markdown rendering with code syntax highlighting (`highlight.js`).
  - One-click **Copy Markdown** and **Download .md** export.
  - Floating toast notification system for instant feedback.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic application layout and structure |
| **CSS3** | Vanilla CSS design system, responsive grid/flexbox, animations, glassmorphism |
| **JavaScript (ES6+)** | Dynamic state management, GitHub API tree resolution, and Gemini REST API engine |
| **GitHub REST API** | Fetching repository metadata, recursive file trees, and raw file blobs |
| **Google Gemini API** | Multi-model reasoning engine (Gemini 2.5/2.0/1.5 Flash & Pro) |
| **Highlight.js & Marked** | Markdown formatting and real-time syntax highlighting |
| **Ollama / Open-Weights** | Local AI model runtime roadmap (Qwen 2.5 Coder / Llama 3) |

---

## 📁 Project Structure

```text
RepoSage-AI/
│
├── index.html       # Single-page application markup & modals
├── style.css        # Modern design system, variables, and responsive layouts
├── script.js        # Core logic: GitHub API client, Gemini engine, file tree & UI handlers
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/RepoSage-AI.git
cd RepoSage-AI
```

### 2. Run the Application

Because RepoSage AI is built with modern vanilla web standards, no complex build step or heavy `node_modules` installation is required!

You can run it using any static HTTP server or open `index.html` directly in your browser:

#### Option A: Using Python (Recommended)
```bash
python3 -m http.server 3000
```
Then visit **`http://localhost:3000`** in your browser.

#### Option B: Using Node / npx
```bash
npx serve .
```

#### Option C: Direct Browser Open
Double-click `index.html` or open it with your browser of choice (Chrome, Firefox, Safari, Edge).

---

## 🔑 Configuring Your AI Key (Optional)

RepoSage AI includes a **Demo Mode** out of the box with built-in pattern analysis. To unlock real-time live AI generation:

1. Click the **Config ⚙️** button in the top navigation bar.
2. Enter your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. *(Optional)* Add a GitHub Personal Access Token to raise the GitHub API rate limit from 60 req/hr to 5,000 req/hr.
4. Click **Test Connection** to verify, then click **Save Settings**.
5. Your keys are saved directly in your browser's private `localStorage`.

---

## 🗺️ AI Integration Roadmap & Local Open-Weights

In addition to Google Gemini, RepoSage AI is designed to support local, offline open-weight models via **Ollama**:

### Planned Ollama Setup:
```bash
# Pull an open-weight code model
ollama pull qwen2.5-coder:3b

# Start local model server
ollama serve
```

A lightweight backend connector or WebGPU / WebLLM client-side runner is planned to allow 100% offline local inference without requiring third-party cloud API keys.

---

## 💡 Why Open Innovation Matters

Open innovation makes powerful AI technology accessible to everyone. By combining open-weight models, open-source APIs, and transparent client-side software, developers can experiment, customize, and build without depending entirely on closed platforms.

RepoSage AI supports this vision by providing an open, accessible developer tool that anyone can run, modify, and improve.

---

## 🎃 Hacktoberfest 2026

This project was built for **Hacktoberfest 2026** to explore how intelligent code assistance and repository inspection can empower open-source contributors and newcomers.

---

## 🤝 Contributing

Contributions are warmly welcomed!

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`.
3. **Commit** your changes: `git commit -m 'Add amazing feature'`.
4. **Push** to the branch: `git push origin feature/amazing-feature`.
5. **Open** a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Akshay Gupta**

---

<p align="center">
  <strong>RepoSage AI – Your Intelligent Coding Companion.</strong>
</p>
