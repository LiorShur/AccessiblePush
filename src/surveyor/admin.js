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

    // NOTE: no orderBy here — combining where + orderBy on different
    // fields needs a composite index. We already sort client-side below,
    // and 20 routes per surveyor is small enough that the extra data
    // over the wire is negligible. Log errors instead of silently
    // swallowing so we can see real problems.
    const bySurveyor = surveyorEmails.length > 0
      ? await Promise.all(surveyorEmails.map(email =>
          getDocs(query(
            collection(db, 'routes'),
            where('userEmail', '==', email),
            limit(20),
          )).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
            .catch(err => {
              console.warn(`[SurveyorAdmin] Routes query for ${email} failed:`, err.message);
              return [];
            })
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

  // Cache the fetched routes so we can pass the full object to the
  // detail modal without another Firestore round-trip.
  window.__svReviewCache = new Map();
  items.forEach(r => window.__svReviewCache.set(r.id, r));

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
        <button class="sv-btn sv-btn-ghost" data-act="view" data-id="${esc(r.id)}">
          👁 ${tt('Inspect', 'בדוק')}
        </button>
        <button class="sv-btn sv-btn-primary" data-act="approve" data-id="${esc(r.id)}">
          ${tt('Approve', 'אשר')}
        </button>
      </div>
    </article>
  `).join('');

  body.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleReviewAction(btn.dataset.act, btn.dataset.id);
    });
  });
  // Make the whole card open the inspector (except when clicking a button).
  body.querySelectorAll('.sv-admin-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

// ------------------------------------------------------------------
// Route detail modal — renders the linked trail guide inside an
// iframe when one exists, else falls back to a raw summary of the
// route data (map + photos + POIs + survey).
// ------------------------------------------------------------------
async function openDetail(routeId) {
  const route = window.__svReviewCache?.get(routeId);
  if (!route) return;

  const overlay = document.createElement('div');
  overlay.className = 'sv-detail-overlay';
  overlay.innerHTML = `
    <div class="sv-detail-modal">
      <header class="sv-detail-header">
        <div>
          <div class="sv-detail-title">${esc(route.routeName || '(untitled)')}</div>
          <div class="sv-detail-meta">
            ${esc(route.surveyorName || route.userDisplayName || route.userEmail || '?')} ·
            ${new Date(route.submittedAt || route.uploadedAt || Date.now()).toLocaleString()}
          </div>
        </div>
        <button class="sv-detail-close" aria-label="Close">×</button>
      </header>
      <div class="sv-detail-body" id="svDetailBody">
        <p class="sv-admin-status">${tt('Loading route data…', 'טוען נתוני מסלול…')}</p>
      </div>
      <footer class="sv-detail-footer">
        <button class="sv-btn sv-btn-ghost" data-act="reject" data-id="${esc(routeId)}">
          ${tt('Send back for fixes', 'שלח לתיקון')}
        </button>
        <button class="sv-btn sv-btn-primary" data-act="approve" data-id="${esc(routeId)}">
          ${tt('Approve & publish', 'אשר ופרסם')}
        </button>
      </footer>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.sv-detail-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await handleReviewAction(btn.dataset.act, btn.dataset.id);
      close();
    });
  });

  // Populate body — prefer the linked trail_guide's htmlContent, else
  // render a lightweight summary.
  const body = overlay.querySelector('#svDetailBody');
  try {
    const gsnap = await getDocs(query(
      collection(db, 'trail_guides'),
      where('routeId', '==', routeId),
      limit(1),
    ));
    if (!gsnap.empty && gsnap.docs[0].data().htmlContent) {
      const guide = gsnap.docs[0].data();
      const blob = new Blob([guide.htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      body.innerHTML = `
        <iframe class="sv-detail-iframe" src="${url}" title="Trail guide preview"></iframe>
        <div class="sv-detail-actions-inline">
          <a href="${url}" target="_blank" rel="noopener">${tt('Open in new tab', 'פתח בכרטיסייה חדשה')}</a>
        </div>
      `;
    } else {
      body.innerHTML = renderSummary(route);
    }
  } catch (err) {
    console.warn('[SurveyorAdmin] Failed to load trail guide:', err);
    body.innerHTML = renderSummary(route);
  }
}

function renderSummary(route) {
  const acc = route.accessibility || {};
  const stats = route.stats || {};
  const photos = (route.routeData || []).filter(p => p.type === 'photo');
  const notes = (route.routeData || []).filter(p => p.type === 'text');
  const pois = route.poiElements || [];

  return `
    <div class="sv-detail-summary">
      <section>
        <h3>${tt('Route', 'מסלול')}</h3>
        <ul class="sv-list">
          <li><span>${tt('Distance', 'מרחק')}</span><span>${(route.totalDistance || 0).toFixed(2)} km</span></li>
          <li><span>${tt('Duration', 'משך')}</span><span>${formatMs(route.elapsedTime || 0)}</span></li>
          <li><span>${tt('GPS points', 'נקודות GPS')}</span><span>${stats.locationPoints || 0}</span></li>
          <li><span>${tt('Photos', 'תמונות')}</span><span>${stats.photos || photos.length}</span></li>
          <li><span>${tt('Notes', 'הערות')}</span><span>${stats.notes || notes.length}</span></li>
          <li><span>${tt('POI markers', 'נקודות עניין')}</span><span>${pois.length}</span></li>
        </ul>
      </section>

      <section>
        <h3>${tt('Accessibility', 'נגישות')}</h3>
        <ul class="sv-list">
          <li><span>${tt('Location', 'מיקום')}</span><span>${esc(acc.location || '—')}</span></li>
          <li><span>${tt('Wheelchair access', 'נגישות לכיסא גלגלים')}</span><span>${esc(acc.wheelchairAccess || '—')}</span></li>
          <li><span>${tt('Surface', 'משטח')}</span><span>${esc(Array.isArray(acc.trailSurface) ? acc.trailSurface.join(', ') : (acc.trailSurface || '—'))}</span></li>
          <li><span>${tt('Difficulty', 'קושי')}</span><span>${esc(acc.difficulty || '—')}</span></li>
        </ul>
      </section>

      ${photos.length > 0 ? `
        <section>
          <h3>${tt('Photos', 'תמונות')} (${photos.length})</h3>
          <div class="sv-detail-photos">
            ${photos.map(p => p.content ? `
              <a href="${esc(p.content)}" target="_blank" rel="noopener">
                <img src="${esc(p.content)}" alt="">
              </a>
            ` : '').join('')}
          </div>
        </section>
      ` : ''}

      ${pois.length > 0 ? `
        <section>
          <h3>${tt('POI markers', 'נקודות עניין')} (${pois.length})</h3>
          <ul class="sv-detail-pois">
            ${pois.map(p => `
              <li>
                <span class="sv-detail-poi-type">${esc(p.type || '')}</span>
                ${p.notes ? `<span class="sv-detail-poi-note">${esc(p.notes)}</span>` : ''}
                ${p.photoDataUrl ? `<a href="${esc(p.photoDataUrl)}" target="_blank" rel="noopener"><img src="${esc(p.photoDataUrl)}" alt=""></a>` : ''}
              </li>
            `).join('')}
          </ul>
        </section>
      ` : ''}

      ${notes.length > 0 ? `
        <section>
          <h3>${tt('Notes', 'הערות')} (${notes.length})</h3>
          <ul class="sv-list">
            ${notes.map(n => `<li>${esc(n.content || '')}</li>`).join('')}
          </ul>
        </section>
      ` : ''}
    </div>
  `;
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = n => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
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
