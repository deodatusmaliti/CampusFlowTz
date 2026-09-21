# CampusFlow TZ - Deployment Guide

This repository contains both the **Vite + React frontend** and the optional **Express full-stack backend** (`server.ts`).

---

## 1. Deploying Frontend to GitHub Pages

GitHub Pages serves static files (`HTML`, `CSS`, `JavaScript`). Because GitHub Pages does NOT automatically run `npm run build`, your repository's raw files will show a blank screen or a 404 unless built.

### Method A: Automated GitHub Actions (Recommended)
Add this workflow in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Then in GitHub:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.

### Method B: Deploy using `gh-pages` package
1. Install: `npm install -D gh-pages`
2. In `package.json`, add:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`
4. In GitHub **Settings** > **Pages**, set source to `gh-pages` branch.

---

## 2. Deploying Full-Stack (with Express Server & Cloud Gemini API)

If you want the live backend (`/api/chat` and `/api/parse-timetable` with Gemini API):

### Deploy to Render.com / Railway / Koyeb:
1. Connect your GitHub repository.
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Add `GEMINI_API_KEY` in the hosting dashboard.

### Deploy to Google Cloud Run:
Click the **Deploy to Cloud Run** button directly in Google AI Studio to host the full-stack container.
