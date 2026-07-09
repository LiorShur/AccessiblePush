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

      <div class="sv-card" id="svSubmissionsCard" hidden>
        <div class="sv-card-title">${tt('Needs your attention', 'דורש טיפול')}</div>
        <div class="sv-card-body" style="margin-bottom:10px">
          ${tt('Surveys the coordinator sent back for fixes. Read the notes, address them, and resubmit.',
               'סקרים שהרכז החזיר לתיקון. קראו את ההערות, תקנו והגישו שוב.')}
        </div>
        <div id="svSubmissionsList"></div>
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
    // Send surveyors to the battle-tested consumer tracker while we
    // stabilize/trim the standalone surveyor-tracker.html. The
    // ?surveyor=1 flag lets us layer surveyor-specific behaviour on
    // top later (pre-flight, back-to-home, auto-tagging) without
    // forking the tracker.
    window.location.href = 'tracker.html?surveyor=1';
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

  // Load contribution stats + assignments + needs-fixes list in background
  loadContributions(profile).catch(err => console.warn('[Surveyor] Contrib load failed:', err));
  loadAssignments(profile).catch(err => console.warn('[Surveyor] Assignments load failed:', err));
  loadNeedsFixesList(profile).catch(err => console.warn('[Surveyor] Needs-fixes load failed:', err));
}

/**
 * Show the surveyor any of their routes the coordinator sent back for
 * fixes, along with the reviewer's notes and a "Mark as fixed & resubmit"
 * button. That button flips reviewStatus back to 'pending' — the actual
 * "fix" happens in real life (the surveyor addresses the feedback: they
 * might revisit the trail, correct metadata, add more photos, etc.).
 * A future iteration can add in-app editing of trail name / accessibility
 * survey / POIs; for the pilot, showing the notes and letting them
 * resubmit is the workable minimum.
 */
async function loadNeedsFixesList(profile) {
  const { db } = await import('../../firebase-setup.js');
  const { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js'
  );

  const q = query(
    collection(db, 'routes'),
    where('userEmail', '==', profile.email.toLowerCase()),
    where('reviewStatus', '==', 'needs-fixes'),
  );
  const snap = await getDocs(q).catch(err => {
    console.warn('[Surveyor] Needs-fixes query failed:', err.message);
    return null;
  });
  if (!snap) return;

  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (items.length === 0) return;

  const card = document.getElementById('svSubmissionsCard');
  const list = document.getElementById('svSubmissionsList');
  if (!card || !list) return;

  card.hidden = false;
  list.innerHTML = items.map(r => `
    <div class="sv-submission" data-id="${escapeHtml(r.id)}">
      <div class="sv-submission-header">
        <strong>${escapeHtml(r.routeName || '(untitled)')}</strong>
        <span class="sv-status sv-status-warn">${tt('Needs fixes', 'דורש תיקון')}</span>
      </div>
      <div class="sv-submission-notes">${escapeHtml(r.reviewNotes || tt('No notes provided', 'לא סופקו הערות'))}</div>
      <button class="sv-btn sv-btn-ghost" data-resubmit="${escapeHtml(r.id)}">
        ${tt('Mark as fixed & resubmit', 'סמן כתוקן והגש שוב')}
      </button>
    </div>
  `).join('');

  list.querySelectorAll('[data-resubmit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(tt(
        'Confirm you have addressed the coordinator\'s notes. This will send the survey back for review.',
        'אשרו שטיפלתם בהערות הרכז. הסקר יישלח שוב לביקורת.'
      ))) return;
      try {
        await updateDoc(doc(db, 'routes', btn.dataset.resubmit), {
          reviewStatus: 'pending',
          resubmittedAt: serverTimestamp(),
        });
        loadNeedsFixesList(profile);
        loadContributions(profile);
      } catch (err) {
        alert(err.message);
      }
    });
  });
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
  // Consumer save flow writes userEmail as the surveyor's email — that's
  // what we key on. Also matches the admin queue's query so counts stay
  // consistent between what the surveyor sees and what the coordinator
  // sees.
  const emailLower = profile.email.toLowerCase();
  const base = [where('userEmail', '==', emailLower)];

  const [total, pending, approved] = await Promise.all([
    getCountFromServer(query(routesRef, ...base)).catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(query(routesRef, ...base, where('reviewStatus', '==', 'pending')))
      .catch(() => ({ data: () => ({ count: 0 }) })),
    getCountFromServer(query(routesRef, ...base, where('reviewStatus', '==', 'approved')))
      .catch(() => ({ data: () => ({ count: 0 }) })),
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
