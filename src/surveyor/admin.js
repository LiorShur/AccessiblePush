/**
 * Surveyor Admin — coordinator UI.
 *
 * Two responsibilities:
 *   1. Manage the /surveyors whitelist (add, deactivate).
 *   2. Review the queue of submitted surveys and approve or send back.
 *
 * Auth: expects the signed-in user to have a doc at /admins/{uid} with
 * { role: 'coordinator' | 'admin' }. Firestore security rules should
 * enforce this — client-side check is a UX filter, not security.
 */

import { auth, db } from '../../firebase-setup.js';
import {
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut,
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, getDocs, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

const bootEl = document.getElementById('svAdminBoot');
const appEl = document.getElementById('svAdminApp');

let state = { profile: null, tab: 'review' };

function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ------------------------------------------------------------------
// Auth + role check
// ------------------------------------------------------------------
async function isAdmin(user) {
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (err) {
    console.error('[SurveyorAdmin] Admin check failed:', err);
    return false;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return renderSignIn();
  const ok = await isAdmin(user);
  if (!ok) return renderNotAuthorized(user);
  state.profile = { uid: user.uid, email: user.email, name: user.displayName };
  render();
});

function show(html) {
  bootEl?.classList.add('hidden');
  appEl.hidden = false;
  appEl.innerHTML = html;
}

function renderSignIn() {
  show(`
    <div class="sv-app centered">
      <div class="sv-gate">
        <div class="sv-gate-icon">🔐</div>
        <h2>${tt('Coordinator sign-in', 'התחברות רכז')}</h2>
        <p>${tt('Sign in to manage the surveyor programme.', 'התחברו לניהול תכנית הסוקרים.')}</p>
        <button class="sv-btn sv-btn-primary" id="svSignInBtn">
          ${tt('Sign in with Google', 'התחבר עם Google')}
        </button>
      </div>
    </div>
  `);
  document.getElementById('svSignInBtn')?.addEventListener('click', () =>
    signInWithPopup(auth, new GoogleAuthProvider()).catch(err =>
      alert(err.message)));
}

function renderNotAuthorized(user) {
  show(`
    <div class="sv-app centered">
      <div class="sv-gate">
        <div class="sv-gate-icon">🚫</div>
        <h2>${tt('Not authorized', 'אין הרשאה')}</h2>
        <p>${tt('This account is not a coordinator.', 'החשבון הזה אינו רכז.')}</p>
        <p style="opacity:0.7; font-size:0.85rem">${esc(user.email)}</p>
        <button class="sv-btn sv-btn-ghost" id="svSignOutBtn">${tt('Sign out', 'התנתק')}</button>
      </div>
    </div>
  `);
  document.getElementById('svSignOutBtn')?.addEventListener('click', () => signOut(auth));
}

// ------------------------------------------------------------------
// Main render
// ------------------------------------------------------------------
function render() {
  show(`
    <div class="sv-admin">
      <header class="sv-admin-header">
        <h1>${tt('Surveyor Admin', 'ניהול סוקרים')}</h1>
        <div class="sv-admin-user">${esc(state.profile.email)}
          <button class="sv-admin-signout" id="svSignOutBtn">${tt('Sign out', 'התנתק')}</button>
        </div>
      </header>
      <nav class="sv-admin-tabs">
        <button class="sv-admin-tab ${state.tab === 'review' ? 'active' : ''}" data-tab="review">
          ${tt('Review queue', 'תור ביקורת')}
        </button>
        <button class="sv-admin-tab ${state.tab === 'surveyors' ? 'active' : ''}" data-tab="surveyors">
          ${tt('Surveyors', 'סוקרים')}
        </button>
      </nav>
      <main id="svAdminBody"></main>
    </div>
  `);

  document.getElementById('svSignOutBtn')?.addEventListener('click', () => signOut(auth));
  document.querySelectorAll('.sv-admin-tab').forEach(btn => {
    btn.addEventListener('click', () => { state.tab = btn.dataset.tab; render(); });
  });

  if (state.tab === 'review') renderReview();
  else renderSurveyors();
}

// ------------------------------------------------------------------
// Review queue
// ------------------------------------------------------------------
async function renderReview() {
  const body = document.getElementById('svAdminBody');
  body.innerHTML = `<p class="sv-admin-status">${tt('Loading…', 'טוען…')}</p>`;

  let items = [];
  try {
    // 1. Any route explicitly tagged as an official survey and pending.
    // 2. Plus any recent route authored by a whitelisted surveyor that
    //    hasn't been approved yet — this catches surveys done via the
    //    consumer tracker without the officialSurvey tag.
    const [tagged, surveyorEmails] = await Promise.all([
      getDocs(query(
        collection(db, 'routes'),
        where('officialSurvey', '==', true),
        limit(100),
      )).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => []),
      getDocs(query(collection(db, 'surveyors'), limit(200)))
        .then(s => s.docs.map(d => d.data().email?.toLowerCase()).filter(Boolean))
    ]);

    const bySurveyor = surveyorEmails.length > 0
      ? await Promise.all(surveyorEmails.map(email =>
          getDocs(query(
            collection(db, 'routes'),
            where('userEmail', '==', email),
            orderBy('uploadedAt', 'desc'),
            limit(20),
          )).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => [])
        )).then(arr => arr.flat())
      : [];

    const merged = new Map();
    [...tagged, ...bySurveyor].forEach(r => merged.set(r.id, r));

    // Filter to routes still awaiting review or with no review yet.
    items = Array.from(merged.values())
      .filter(r => !r.reviewStatus || r.reviewStatus === 'pending' || r.reviewStatus === 'needs-fixes')
      .sort((a, b) => {
        const ta = new Date(a.submittedAt || a.uploadedAt || 0).getTime();
        const tb = new Date(b.submittedAt || b.uploadedAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 50);
  } catch (err) {
    console.error('[SurveyorAdmin] Review query failed:', err);
    body.innerHTML = `<p class="sv-admin-status sv-admin-status--bad">${tt(
      'Could not load pending reviews. Check Firestore indices and rules.',
      'לא ניתן לטעון סקירות ממתינות. בדקו אינדקסים והרשאות Firestore.'
    )}<br><small>${esc(err.message)}</small></p>`;
    return;
  }

  if (items.length === 0) {
    body.innerHTML = `
      <div class="sv-admin-empty">
        <div style="font-size:2rem">✅</div>
        <p>${tt('No surveys awaiting review.', 'אין סקרים בהמתנה לביקורת.')}</p>
      </div>`;
    return;
  }

  body.innerHTML = items.map(r => `
    <article class="sv-admin-card" data-id="${esc(r.id)}">
      <header class="sv-admin-card-header">
        <div>
          <div class="sv-admin-card-title">${esc(r.routeName || '(untitled)')}</div>
          <div class="sv-admin-card-meta">
            ${esc(r.surveyorName || r.userDisplayName || r.userEmail || r.surveyorEmail || '?')} ·
            ${new Date(r.submittedAt || r.uploadedAt || r.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
        <div class="sv-admin-score">
          <div class="sv-admin-score-num">${r.completenessScore ?? '—'}</div>
          <div class="sv-admin-score-label">${tt('Score', 'ציון')}</div>
        </div>
      </header>
      <div class="sv-admin-card-stats">
        <span>📏 ${((r.totalDistance || 0)).toFixed(2)} km</span>
        <span>📍 ${(r.stats?.locationPoints || 0)} pts</span>
        <span>📷 ${(r.stats?.photos || 0)} photos</span>
        <span>🪧 ${(r.poiElements?.length || 0)} POIs</span>
      </div>
      ${r.accessibility?.location ? `<div class="sv-admin-card-loc">📍 ${esc(r.accessibility.location)}</div>` : ''}
      <div class="sv-admin-card-actions">
        <button class="sv-btn sv-btn-ghost" data-act="reject" data-id="${esc(r.id)}">
          ${tt('Needs fixes', 'דורש תיקונים')}
        </button>
        <button class="sv-btn sv-btn-primary" data-act="approve" data-id="${esc(r.id)}">
          ${tt('Approve &amp; publish', 'אשר ופרסם')}
        </button>
      </div>
    </article>
  `).join('');

  body.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => handleReviewAction(btn.dataset.act, btn.dataset.id));
  });
}

async function handleReviewAction(action, id) {
  if (action === 'approve') {
    if (!confirm(tt('Approve and make this trail public?', 'לאשר ולפרסם את השביל?'))) return;
    try {
      await updateDoc(doc(db, 'routes', id), {
        reviewStatus: 'approved',
        reviewedBy: state.profile.email,
        reviewedAt: serverTimestamp(),
      });
      // Also flip the linked trail_guide (if we can find it by routeId).
      const gq = query(collection(db, 'trail_guides'), where('routeId', '==', id), limit(1));
      const gs = await getDocs(gq);
      for (const g of gs.docs) {
        await updateDoc(doc(db, 'trail_guides', g.id), { isPublic: true });
      }
      renderReview();
    } catch (err) {
      alert(err.message);
    }
  }

  if (action === 'reject') {
    const reason = prompt(tt('Reason for send-back (visible to surveyor):', 'סיבה להחזרה (יוצג לסוקר):'));
    if (!reason) return;
    try {
      await updateDoc(doc(db, 'routes', id), {
        reviewStatus: 'needs-fixes',
        reviewNotes: reason,
        reviewedBy: state.profile.email,
        reviewedAt: serverTimestamp(),
      });
      renderReview();
    } catch (err) {
      alert(err.message);
    }
  }
}

// ------------------------------------------------------------------
// Surveyors whitelist
// ------------------------------------------------------------------
async function renderSurveyors() {
  const body = document.getElementById('svAdminBody');
  body.innerHTML = `
    <form class="sv-admin-form" id="svAddSurveyorForm">
      <input type="email" name="email" required placeholder="${tt('Email to whitelist', 'אימייל לרשימה')}">
      <input type="text" name="name" placeholder="${tt('Name (optional)', 'שם (רשות)')}">
      <button type="submit" class="sv-btn sv-btn-primary">${tt('Add', 'הוסף')}</button>
    </form>
    <div id="svSurveyorList"><p class="sv-admin-status">${tt('Loading…', 'טוען…')}</p></div>
  `;

  body.querySelector('#svAddSurveyorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const name = String(fd.get('name') || '').trim();
    if (!email) return;
    try {
      await setDoc(doc(db, 'surveyors', email), {
        email, name: name || null, active: true, addedBy: state.profile.email,
        addedAt: serverTimestamp(),
      }, { merge: true });
      e.target.reset();
      renderSurveyors();
    } catch (err) {
      alert(err.message);
    }
  });

  try {
    const snap = await getDocs(query(collection(db, 'surveyors'), limit(200)));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const list = body.querySelector('#svSurveyorList');
    if (items.length === 0) {
      list.innerHTML = `<p class="sv-admin-status">${tt('No surveyors yet — add one above.', 'אין סוקרים — הוסיפו למעלה.')}</p>`;
      return;
    }
    list.innerHTML = items.map(s => `
      <div class="sv-admin-surveyor" data-id="${esc(s.id)}">
        <div>
          <div class="sv-admin-surveyor-name">${esc(s.name || s.email)}</div>
          <div class="sv-admin-surveyor-email">${esc(s.email)}</div>
        </div>
        <div class="sv-admin-surveyor-actions">
          <span class="sv-status ${s.active === false ? 'sv-status-bad' : 'sv-status-ok'}">
            ${s.active === false ? tt('Inactive', 'לא פעיל') : tt('Active', 'פעיל')}
          </span>
          <button class="sv-btn sv-btn-ghost" data-toggle="${esc(s.id)}" data-active="${s.active !== false}">
            ${s.active === false ? tt('Reactivate', 'הפעל מחדש') : tt('Deactivate', 'השבת')}
          </button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const currentlyActive = btn.dataset.active === 'true';
        await updateDoc(doc(db, 'surveyors', btn.dataset.toggle), { active: !currentlyActive });
        renderSurveyors();
      });
    });
  } catch (err) {
    body.querySelector('#svSurveyorList').innerHTML =
      `<p class="sv-admin-status sv-admin-status--bad">${esc(err.message)}</p>`;
  }
}
