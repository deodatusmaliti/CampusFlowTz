# CampusFlow TZ - GitHub Pages & Deployment Guide

This project is configured to run across **GitHub Pages**, **Vercel**, and **Full-Stack Container environments**.

---

## 🔍 Exact Diagnostic of Your GitHub Pages Link

We inspected your live site (`https://deodatusmaliti.github.io/CampusFlowTz/`) and GitHub repository actions:

### Why the page is currently blank:
1. **GitHub Pages Source Setting**: Currently, GitHub Pages is serving files directly from the **`main` branch root (`/`)**.
2. **Serving Uncompiled Code**: When serving from `main` root, GitHub serves the raw development `index.html`, which contains `<script type="module" src="/src/main.tsx"></script>`. Web browsers cannot execute `.tsx` (TypeScript JSX) files directly, which throws an error and shows a blank screen.
3. **Previous Build Failure**: The previous GitHub Actions run on commit `4993189` failed during `npm run build` due to a JSX syntax error in `StudyMaterialsView.tsx` and type mismatches. 
4. **Current Status**: All code errors have been **100% resolved**. The project now compiles with `npm run build` cleanly in ~2 seconds with zero errors.

---

## 🚀 How to Make Your Live GitHub Link Work (2 Quick Steps)

### Step 1: Push the latest codebase to GitHub
Push these latest files (with the syntax and type fixes) to your `main` branch. This triggers the automated `.github/workflows/deploy.yml` workflow, which runs `npm run build` and produces the production bundle.

### Step 2: Set GitHub Pages Source to "GitHub Actions" (Crucial)
1. Go to your repository: [https://github.com/deodatusmaliti/CampusFlowTz](https://github.com/deodatusmaliti/CampusFlowTz)
2. Click **Settings** (top tab).
3. In the left menu under **Code and automation**, click **Pages**.
4. Under **Build and deployment** > **Source**:
   - Change the dropdown from **"Deploy from a branch"** to **"GitHub Actions"**.
   - *(Alternatively, if you prefer "Deploy from a branch", set Branch to `gh-pages` and folder to `/ (root)`, then click Save).*

Once the workflow finishes, visit:
👉 **[https://deodatusmaliti.github.io/CampusFlowTz/](https://deodatusmaliti.github.io/CampusFlowTz/)**

The compiled, interactive application with all features (timetable, study materials, QR scanner, charts) will load immediately in any browser on both mobile and desktop!

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
