import { StudyMaterial } from '../types';
import { ActiveTab } from '../components/Navigation';

/**
 * Builds a robust share URL that works seamlessly across:
 * - GitHub Pages subpaths (e.g., https://username.github.io/repo/?tab=materials&materialId=xxx)
 * - Custom domains & Vercel (e.g., https://app.com/?tab=materials&materialId=xxx)
 * - Localhost development
 */
export function buildMaterialShareUrl(materialId: string): string {
  try {
    const loc = window.location;
    // Strip trailing filenames like index.html
    let pathname = loc.pathname.replace(/\/index\.html$/i, '');
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    const origin = loc.origin;
    const url = new URL(pathname, origin);
    url.searchParams.set('tab', 'materials');
    url.searchParams.set('materialId', materialId);
    return url.toString();
  } catch {
    const cleanBase = window.location.href.split('?')[0].split('#')[0];
    const slash = cleanBase.endsWith('/') ? '' : '/';
    return `${cleanBase}${slash}?tab=materials&materialId=${encodeURIComponent(materialId)}`;
  }
}

/**
 * Parses deep-linked parameters from search query string and hash fragments.
 */
export function parseIncomingRoute(): { tab?: ActiveTab; materialId?: string } {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    let tab = searchParams.get('tab');
    let materialId = searchParams.get('materialId') || searchParams.get('id');

    // Also support hash-based routing: #/materials?id=xxx or #materials&materialId=xxx
    const hash = window.location.hash;
    if (hash) {
      const cleanHash = hash.replace(/^#[/]?/, '');
      const [hashPath, hashQuery] = cleanHash.split('?');
      if (hashPath && !tab) {
        if (hashPath === 'materials') tab = 'materials';
        else if (hashPath === 'timetable') tab = 'timetable';
        else if (hashPath === 'courses') tab = 'courses';
        else if (hashPath === 'gpa') tab = 'gpa';
        else if (hashPath === 'tasks') tab = 'tasks';
      }
      if (hashQuery) {
        const hashParams = new URLSearchParams(hashQuery);
        if (!materialId) {
          materialId = hashParams.get('materialId') || hashParams.get('id');
        }
        if (!tab && hashParams.get('tab')) {
          tab = hashParams.get('tab');
        }
      }
    }

    if (materialId) {
      return { tab: 'materials', materialId };
    }

    const validTabs: ActiveTab[] = [
      'dashboard', 'profile', 'timetable', 'attendance', 'calendar', 'courses',
      'course-enrollment', 'materials', 'discussions', 'study', 'tasks', 'gpa',
      'network', 'leisure', 'opportunities', 'community', 'alerts', 'users',
      'social', 'payments', 'share', 'architecture', 'settings'
    ];

    if (tab && validTabs.includes(tab as ActiveTab)) {
      return { tab: tab as ActiveTab, materialId: materialId || undefined };
    }
  } catch (err) {
    console.error('Failed to parse incoming route:', err);
  }
  return {};
}

/**
 * Prints a study material document using an invisible iframe to avoid browser popup blockers.
 */
export async function printStudyMaterial(
  material: StudyMaterial,
  rawText?: string | null,
  blobUrl?: string | null
): Promise<void> {
  return new Promise((resolve) => {
    // Create temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Fallback: standard window.print()
      window.print();
      resolve();
      return;
    }

    const title = material.title;
    const course = `${material.courseCode} - ${material.courseTitle}`;
    const institution = material.institution || 'University of Dar es Salaam';
    const author = material.uploadedBy;
    const date = material.uploadDate;
    const fileName = material.fileName;
    const fileSize = material.fileSize;
    const description = material.description || 'No additional description provided.';

    let bodyContentHtml = '';

    if (material.fileType === 'image' && (blobUrl || material.contentDataUrl)) {
      const imgSrc = blobUrl || material.contentDataUrl;
      bodyContentHtml = `
        <div class="visual-container">
          <img src="${imgSrc}" class="print-img" alt="${title}" />
        </div>
      `;
    } else if (rawText) {
      const safeText = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      bodyContentHtml = `
        <div class="text-document-block">
          <pre>${safeText}</pre>
        </div>
      `;
    } else {
      // For office files or summaries
      bodyContentHtml = `
        <div class="summary-card">
          <h3>Academic Resource File Summary</h3>
          <p>This document is registered in the CampusFlow TZ University Repository as an authentic course asset.</p>
          <table class="meta-table">
            <tr><th>File Name:</th><td>${fileName}</td></tr>
            <tr><th>File Type:</th><td>${material.fileType.toUpperCase()} Document</td></tr>
            <tr><th>Size:</th><td>${fileSize}</td></tr>
            <tr><th>Repository ID:</th><td><code>${material.id}</code></td></tr>
            <tr><th>Status:</th><td>${material.isOfficial ? 'Official Department Material' : 'Peer-Verified Student Contribution'}</td></tr>
          </table>
          <div class="notes-box">
            <strong>Resource Notes:</strong>
            <p>${description}</p>
          </div>
        </div>
      `;
    }

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print: ${title} (${material.courseCode})</title>
  <style>
    @page {
      margin: 15mm 15mm 15mm 15mm;
      size: auto;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      background: #fff;
    }
    .header-bar {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .org-title {
      font-size: 11px;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .main-title {
      font-size: 20px;
      font-weight: 800;
      margin: 4px 0 2px 0;
      color: #0f172a;
    }
    .sub-meta {
      font-size: 12px;
      color: #475569;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .sub-meta span {
      display: inline-block;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    .summary-card h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #0369a1;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 12px;
    }
    .meta-table th {
      text-align: left;
      padding: 6px 12px 6px 0;
      color: #64748b;
      width: 140px;
      vertical-align: top;
    }
    .meta-table td {
      padding: 6px 0;
      color: #1e293b;
      font-weight: 600;
    }
    .notes-box {
      margin-top: 16px;
      padding: 12px;
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      font-size: 12px;
    }
    .text-document-block pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
    }
    .visual-container {
      text-align: center;
      margin: 16px 0;
    }
    .print-img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
    .footer-bar {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="org-title">CampusFlow TZ • Academic Learning Repository</div>
    <h1 class="main-title">${title}</h1>
    <div class="sub-meta">
      <span><strong>Course:</strong> ${course}</span>
      <span><strong>Institution:</strong> ${institution}</span>
      <span><strong>Uploaded by:</strong> ${author} (${date})</span>
    </div>
  </div>

  ${bodyContentHtml}

  <div class="footer-bar">
    <span>Printed via CampusFlow TZ Academic Suite</span>
    <span>Document Ref: ${material.id} • Verified University Asset</span>
  </div>
</body>
</html>`;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // Small delay to allow images and styles to render before triggering print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print trigger error:', e);
        window.print();
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve();
      }, 1500);
    }, 400);
  });
}
