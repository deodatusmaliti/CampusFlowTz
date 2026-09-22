# CampusFlow TZ - GitHub Pages & Deployment Guide

This project is configured to run smoothly across **GitHub Pages**, **Vercel**, and **Full-Stack Container environments**.

---

## 🚀 GitHub Pages Setup (Why it was blank & How to activate)

### The Cause of Blank Page:
When a Vite/React application is deployed directly from the `main` branch root without a build step, GitHub Pages tries to serve the raw `index.html` referencing `<script src="/src/main.tsx"></script>`. Browsers cannot run raw TypeScript, resulting in:
`Failed to load resource: net::ERR_FILE_NOT_FOUND` or 404.

### The Solution:
We have configured automated dual-build deployment in `.github/workflows/deploy.yml`:
1. It builds the static production bundle into `dist/` with relative asset paths (`./assets/...`).
2. It generates `.nojekyll` and `404.html` SPA routing fallbacks.
3. It deploys via **GitHub Actions** AND commits the compiled build to the **`gh-pages` branch**.

---

### Step-by-Step GitHub Settings Setup:

1. Open your repository on GitHub: `https://github.com/deodatusmaliti/CampusFlowTz`
2. Click **Settings** (top right tab of your repository).
3. In the left sidebar, click **Pages** (under "Code and automation").
4. Under **Build and deployment** > **Source**:
   - **Option 1 (Recommended)**: Select **"GitHub Actions"**.
     The workflow will automatically build and publish the site whenever you push.
   - **Option 2 (Standard Branch Deployment)**:
     If you prefer "Deploy from a branch":
     - Set **Branch** to `gh-pages` (created automatically by the workflow on your first run).
     - Set **Folder** to `/ (root)`.
     - Click **Save**.

Your live URL: **`https://deodatusmaliti.github.io/CampusFlowTz/`** will load the application.

---

## 📱 Mobile Screen & Smartphone Readability Updates
- **High-Contrast Typography**: Upgraded all text, secondary labels, and icon colors to deep slate (`text-slate-900` / `text-slate-800`), eliminating faint grey rendering under smartphone sunlight or small screens.
- **No Edge Clipping**: Added safe padding (`px-3 sm:px-6`) and `min-w-0` on cards and containers.
- **Mobile Quick Bottom Bar**: Added a bottom navigation bar with one-tap access to **Overview**, **Timetable**, **Feeds**, **Chat**, and **Tasks**.
- **Responsive Faculty Filters**: Added horizontal scroll pills with faculty badges for Law, Medicine, Engineering, Science, Business, and Humanities.
- **Full Story Reader**: Clicking any academic breakthrough or news item opens the full article modal with discussion prompts, citations, upvoting, and course chat sharing.

---

## 🌐 Vercel & Netlify Deployment
Vercel automatically detects Vite from `package.json` and runs `npm run build` with output directory `dist`. No configuration needed.
