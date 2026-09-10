/**
 * Report a problem modal.
 *
 * Simple in-app feedback channel for volunteers on trail. Writes to
 * /beta_feedback (already whitelisted in firestore.rules — anyone can
 * create, only admins can read).
 *
 * We include useful context automatically (email, device, screen,
 * app version, current URL, whether tracking is active) so the
 * coordinator can debug without a follow-up question.
 */

import { db } from '../../firebase-setup.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

const CATEGORIES = [
  { id: 'bug', en: '🐛 Bug — something broke', he: '🐛 באג — משהו נשבר' },
  { id: 'confusion', en: '❓ Confusion — I do not know what to do', he: '❓ בלבול — לא ברור לי מה לעשות' },
  { id: 'suggestion', en: '💡 Suggestion — nice-to-have', he: '💡 הצעה — כדאי להוסיף' },
  { id: 'safety', en: '🚨 Safety — this is urgent', he: '🚨 בטיחות — זה דחוף' },
];

export function openReportModal({ profile } = {}) {
  return new Promise((resolve) => {
    const isHe = document.documentElement.lang === 'he';

    const overlay = document.createElement('div');
    overlay.className = 'sv-report-overlay';
    overlay.innerHTML = `
      <div class="sv-report-modal" role="dialog" aria-modal="true" aria-labelledby="svReportTitle">
        <button class="sv-report-close" id="svReportCancel" aria-label="Close">×</button>
        <h2 id="svReportTitle" class="sv-report-title">
          ${isHe ? '📮 דיווח על תקלה' : '📮 Report a problem'}
        </h2>
        <p class="sv-report-body">
          ${isHe
            ? 'ספרו לרכז מה קרה. הפרטים הטכניים ייצורפו אוטומטית.'
            : "Tell the coordinator what happened. Device details are attached automatically."}
        </p>

        <label class="sv-report-label" for="svReportCategory">${isHe ? 'קטגוריה' : 'Category'}</label>
        <select id="svReportCategory" class="sv-report-input">
          ${CATEGORIES.map(c => `<option value="${c.id}">${isHe ? c.he : c.en}</option>`).join('')}
        </select>

        <label class="sv-report-label" for="svReportText">${isHe ? 'מה קרה?' : 'What happened?'}</label>
        <textarea id="svReportText" class="sv-report-input" rows="5"
          placeholder="${isHe ? 'תארו במילים שלכם. ככל שיותר מפורט, יותר קל לתקן.' : 'Describe it in your own words. The more detail, the faster it gets fixed.'}"></textarea>

        <div class="sv-report-ctx" id="svReportCtx"></div>

        <div class="sv-btn-row" style="margin-top:14px">
          <button class="sv-btn sv-btn-ghost" id="svReportCancel2">
            ${isHe ? 'ביטול' : 'Cancel'}
          </button>
          <button class="sv-btn sv-btn-primary" id="svReportSend" disabled>
            ${isHe ? 'שלח' : 'Send'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const catEl = overlay.querySelector('#svReportCategory');
    const textEl = overlay.querySelector('#svReportText');
    const sendBtn = overlay.querySelector('#svReportSend');
    const cancel1 = overlay.querySelector('#svReportCancel');
    const cancel2 = overlay.querySelector('#svReportCancel2');
    const ctxEl = overlay.querySelector('#svReportCtx');

    const ctx = collectContext(profile);
    ctxEl.textContent = (isHe ? 'יצורף: ' : 'Attached: ')
      + [ctx.surveyorEmail, ctx.deviceLabel, ctx.currentUrl].filter(Boolean).join(' · ');

    const refresh = () => {
      sendBtn.disabled = textEl.value.trim().length < 5;
    };
    textEl.addEventListener('input', refresh);

    const close = (submitted) => {
      overlay.remove();
      resolve({ submitted });
    };
    cancel1.addEventListener('click', () => close(false));
    cancel2.addEventListener('click', () => close(false));

    sendBtn.addEventListener('click', async () => {
      sendBtn.disabled = true;
      sendBtn.textContent = isHe ? 'שולח…' : 'Sending…';
      try {
        await addDoc(collection(db, 'beta_feedback'), {
          source: 'surveyor',
          category: catEl.value,
          text: textEl.value.trim(),
          ...ctx,
          submittedAt: serverTimestamp(),
        });
        overlay.remove();
        alert(isHe
          ? 'תודה — הדיווח נשלח. אם זה דחוף, פנו לרכז ישירות (WhatsApp).'
          : 'Thanks — report sent. If it is urgent, reach the coordinator directly (WhatsApp).');
        resolve({ submitted: true });
      } catch (err) {
        console.error('[Surveyor] Report submit failed:', err);
        sendBtn.disabled = false;
        sendBtn.textContent = isHe ? 'נסה שוב' : 'Retry';
        alert((isHe ? 'שליחה נכשלה: ' : 'Send failed: ') + err.message);
      }
    });
  });
}

function collectContext(profile) {
  const nav = navigator || {};
  const isTracking = document.body.classList.contains('tracking-active');
  return {
    surveyorEmail: profile?.email || null,
    surveyorName: profile?.name || profile?.displayName || null,
    surveyorUid: profile?.uid || null,
    deviceLabel: shortDeviceLabel(nav.userAgent),
    userAgent: nav.userAgent || null,
    language: document.documentElement.lang || nav.language || null,
    screen: `${window.screen?.width || '?'}x${window.screen?.height || '?'}`,
    online: nav.onLine === true,
    currentUrl: location.href,
    isTrackingWhenReported: isTracking,
    swVersion: getSwVersion(),
  };
}

function shortDeviceLabel(ua) {
  if (!ua) return 'unknown device';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/iPhone/i.test(ua)) return 'iPhone';
  const androidMatch = ua.match(/Android[\s\/]?([\d.]+)?/i);
  if (androidMatch) return `Android ${androidMatch[1] || ''}`.trim();
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh/i.test(ua)) return 'Mac';
  return ua.split(' ')[0] || 'unknown';
}

function getSwVersion() {
  // The CACHE_VERSION string is baked into sw.js. Not easily readable
  // from the client without an extra fetch — best-effort via a global
  // set by the tracker page.
  return window.__SV_APP_VERSION__ || null;
}
