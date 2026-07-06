/**
 * Surveyor home page.
 *
 * Volunteer's main screen after auth. Shows:
 *  - Hero "Start Survey" card
 *  - My contributions summary
 *  - Tutorial / Help
 *  - Offline maps setup (Phase 2)
 *  - Assignments (Phase 3, if any exist for this user)
 *  - Sign out
 */

import { tt, svSignOut } from './index.js';

const TUTORIAL_KEY = 'sv_tutorial_seen';

export function renderHome(profile) {
  const displayName = profile.name || profile.email;
  const firstLaunch = !localStorage.getItem(TUTORIAL_KEY);

  // Hide the boot splash and reveal the app container. renderHome writes
  // directly into #svApp instead of going through showApp(), so it has to
  // clear the boot classes itself.
  document.getElementById('svBoot')?.classList.add('hidden');
  const app = document.getElementById('svApp');
  if (!app) return;
  app.hidden = false;
  app.innerHTML = `
    <div class="sv-app">
      <div class="sv-header">
        <h1>${tt('Surveyor', 'סוקר')}</h1>
        <div class="sv-user">${displayName}</div>
      </div>

      <div class="sv-card sv-card-hero">
        <div class="sv-card-title">${tt('Start a new survey', 'התחל סקר חדש')}</div>
        <div class="sv-card-body">
          ${tt('Pre-flight check will run before tracking begins.',
               'בדיקת מוכנות תתבצע לפני תחילת המעקב.')}
        </div>
        <div class="sv-btn-row">
          <button class="sv-btn sv-btn-primary" id="svStartBtn">
            ${tt('▶ Start Survey', '▶ התחל סקר')}
          </button>
        </div>
      </div>

      <div class="sv-card">
        <div class="sv-card-title">${tt('Get ready', 'התכוננו')}</div>
        <ul class="sv-list">
          <li>
            <span>${tt('Tutorial walkthrough', 'הדרכה מודרכת')}</span>
            <button class="sv-btn sv-btn-ghost" style="width:auto;min-height:36px;padding:0 14px" id="svTutorialBtn">
              ${firstLaunch ? tt('Start', 'התחל') : tt('Replay', 'שחזר')}
            </button>
          </li>
          <li>
            <span>${tt('Offline map area', 'איזור מפה לא מקוונת')}</span>
            <button class="sv-btn sv-btn-ghost" style="width:auto;min-height:36px;padding:0 14px" id="svOfflineBtn">
              ${tt('Setup', 'הגדר')}
            </button>
          </li>
        </ul>
      </div>

      <div class="sv-card" id="svAssignmentsCard" hidden>
        <div class="sv-card-title">${tt('Your assignments', 'המשימות שלך')}</div>
        <ul class="sv-list" id="svAssignmentsList"></ul>
      </div>

      <div class="sv-card">
        <div class="sv-card-title">${tt('Your contributions', 'התרומות שלך')}</div>
        <ul class="sv-list" id="svContribList">
          <li>
            <span>${tt('Surveys submitted', 'סקרים שהוגשו')}</span>
            <span class="sv-status sv-status-neutral" id="svContribCount">—</span>
          </li>
          <li>
            <span>${tt('Awaiting review', 'ממתין לביקורת')}</span>
            <span class="sv-status sv-status-neutral" id="svPendingCount">—</span>
          </li>
          <li>
            <span>${tt('Approved', 'אושרו')}</span>
            <span class="sv-status sv-status-neutral" id="svApprovedCount">—</span>
          </li>
        </ul>
      </div>

      <div class="sv-btn-row" style="margin-top:auto">
        <button class="sv-btn sv-btn-ghost" id="svSignOutBtn">
          ${tt('Sign out', 'התנתק')}
        </button>
      </div>
    </div>
  `;

  document.getElementById('svSignOutBtn')?.addEventListener('click', () => svSignOut());

  document.getElementById('svStartBtn')?.addEventListener('click', () => {
    // The pre-flight sequence lives in the tracker page. Passing a flag so
    // the tracker knows to open pre-flight immediately on load.
    window.location.href = 'surveyor-tracker.html?preflight=1';
  });

  document.getElementById('svTutorialBtn')?.addEventListener('click', async () => {
    const { openTutorial } = await import('./tutorial.js');
    await openTutorial();
    localStorage.setItem(TUTORIAL_KEY, '1');
  });

  document.getElementById('svOfflineBtn')?.addEventListener('click', async () => {
    const { openOfflineTiles } = await import('./offline-tiles.js');
    await openOfflineTiles();
  });

  // Auto-open tutorial on first launch
  if (firstLaunch) {
    setTimeout(async () => {
      const { openTutorial } = await import('./tutorial.js');
      await openTutorial();
      localStorage.setItem(TUTORIAL_KEY, '1');
    }, 400);
  }

  // Load contribution stats + assignments in the background
  loadContributions(profile).catch(err => console.warn('[Surveyor] Contrib load failed:', err));
  loadAssignments(profile).catch(err => console.warn('[Surveyor] Assignments load failed:', err));
}

/**
 * Populate the "your contributions" card by counting the user's routes
 * tagged as officialSurvey. Errors are swallowed — this is a nice-to-have.
 */
async function loadContributions(profile) {
  const { db } = await import('../../firebase-setup.js');
  const { collection, query, where, getCountFromServer } = await import(
    'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js'
  );

  const routesRef = collection(db, 'routes');
  const base = [where('surveyorId', '==', profile.uid)];

  const [total, pending, approved] = await Promise.all([
    getCountFromServer(query(routesRef, ...base)),
    getCountFromServer(query(routesRef, ...base, where('reviewStatus', '==', 'pending'))),
    getCountFromServer(query(routesRef, ...base, where('reviewStatus', '==', 'approved')))
  ]);

  const setBadge = (id, count, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count;
    el.classList.remove('sv-status-neutral');
    el.classList.add(cls);
  };

  setBadge('svContribCount', total.data().count, 'sv-status-ok');
  setBadge('svPendingCount', pending.data().count, 'sv-status-warn');
  setBadge('svApprovedCount', approved.data().count, 'sv-status-ok');
}

/**
 * Load assignments and hide the section if there are none. Full workflow
 * (claim / mark in-progress / mark done) lives in ./assignments.js.
 */
async function loadAssignments(profile) {
  const { listAssignmentsForSurveyor } = await import('./assignments.js');
  const items = await listAssignmentsForSurveyor(profile);
  if (!items || items.length === 0) return;

  const card = document.getElementById('svAssignmentsCard');
  const list = document.getElementById('svAssignmentsList');
  if (!card || !list) return;

  card.hidden = false;
  list.innerHTML = items.map(a => `
    <li>
      <div>
        <div>${escapeHtml(a.name)}</div>
        <div style="font-size:0.78rem;opacity:0.7">${escapeHtml(a.location || '')}</div>
      </div>
      <span class="sv-status ${statusClass(a.status)}">${assignmentStatusLabel(a.status)}</span>
    </li>
  `).join('');
}

function statusClass(status) {
  switch (status) {
    case 'in-progress': return 'sv-status-warn';
    case 'submitted': return 'sv-status-ok';
    case 'approved': return 'sv-status-ok';
    default: return 'sv-status-neutral';
  }
}

function assignmentStatusLabel(status) {
  switch (status) {
    case 'in-progress': return tt('In progress', 'בתהליך');
    case 'submitted': return tt('Submitted', 'הוגש');
    case 'approved': return tt('Approved', 'אושר');
    case 'needs-fixes': return tt('Needs fixes', 'דורש תיקונים');
    default: return tt('Assigned', 'הוקצה');
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
