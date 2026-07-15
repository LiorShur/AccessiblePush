/**
 * Save-time checklist for a surveyor session.
 *
 * Shown when the volunteer taps "Stop & Submit". Presents:
 *   - Completeness score ring + per-criterion list
 *   - Confirmation checkboxes (accuracy pledge, trailhead / hazards / etc.)
 *   - Route name input
 *   - Submit / Back to route buttons
 *
 * Resolves to { submit: boolean, name: string, ... } when done.
 * The tracker only proceeds with a real save when submit is true.
 */

import { computeCompleteness } from './completeness.js';

function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

const CONFIRMATIONS = [
  { id: 'accuracy', en: 'I performed this survey accurately as trained.',
                    he: 'ביצעתי את הסקר במדויק ובהתאם להכשרה.' },
  { id: 'trailhead', en: 'Trailhead location and photo are accurate.',
                     he: 'מיקום הכניסה לשביל והתמונה מדויקים.' },
  { id: 'features', en: 'I documented visible facilities (parking, water, restrooms).',
                    he: 'תיעדתי מתקנים גלויים (חניה, מים, שירותים).' },
  { id: 'hazards', en: 'I flagged any hazards or obstacles I encountered.',
                   he: 'סימנתי סכנות או מכשולים שפגשתי.' },
  { id: 'survey', en: 'The accessibility survey reflects on-the-ground conditions.',
                  he: 'סקר הנגישות משקף את התנאים בפועל.' },
];

/**
 * @param {object} opts
 * @param {object} opts.tracker
 * @returns {Promise<{ submit: boolean, name?: string, aiAssisted?: boolean }>}
 */
export function runChecklist({ tracker }) {
  return new Promise((resolve) => {
    const routeData = tracker.state.getRouteData();
    const accessibilityData = safeParseJson(localStorage.getItem('accessibilityData'));
    const poiEls = window.AccessNatureApp?.controllers?.poiElements?.getElements?.() || [];

    const { score, criteria } = computeCompleteness({
      routeData, accessibilityData, poiElements: poiEls,
    });

    const lang = document.documentElement.lang === 'he' ? 'he' : 'en';
    const scoreCopy = score >= 80
      ? tt('Great survey! Ready to submit.', 'סקר מצוין! מוכן להגשה.')
      : score >= 50
        ? tt('Solid coverage. Fill in any missing items if you can.', 'כיסוי סביר. השלימו מה שאפשר.')
        : tt('Coverage is thin — consider recording more before submitting.', 'הכיסוי דל — שקלו לתעד עוד לפני ההגשה.');

    const overlay = document.createElement('div');
    overlay.className = 'sv-checklist-overlay';
    overlay.innerHTML = `
      <div class="sv-checklist-modal" role="dialog" aria-modal="true">
        <h2 style="margin:0 0 4px">${tt('Submit survey', 'הגשת סקר')}</h2>
        <p style="margin:0 0 16px; color:var(--sv-text-dim); font-size:0.9rem">
          ${tt('Review and confirm before publishing.', 'סקרו ואשרו לפני הפרסום.')}
        </p>

        <div class="sv-score">
          <div class="sv-score-ring" style="--p:${score}">
            <div class="sv-score-inner">${score}</div>
          </div>
          <div class="sv-score-copy">${scoreCopy}</div>
        </div>

        <details style="margin-bottom:14px">
          <summary style="cursor:pointer; color:var(--sv-text-dim); font-size:0.88rem">
            ${tt('Show breakdown', 'הצג פירוט')}
          </summary>
          <div style="margin-top:8px">
            ${criteria.map(c => `
              <div style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:0.86rem">
                <span style="width:16px; text-align:center">${c.ok ? '✓' : '·'}</span>
                <span style="flex:1; color:${c.ok ? 'var(--sv-text)' : 'var(--sv-text-dim)'}">${c[`label${cap(lang)}`]}</span>
                <span style="color:var(--sv-text-dim); font-size:0.75rem">${c.weight}</span>
              </div>
            `).join('')}
          </div>
        </details>

        <label style="display:block; margin-bottom:6px; font-size:0.88rem; color:var(--sv-text-dim)">
          ${tt('Trail name (required)', 'שם השביל (חובה)')}
        </label>
        <input type="text" id="svRouteName" style="width:100%; padding:12px; border-radius:10px; border:1px solid var(--sv-border); background:var(--sv-surface-2); color:var(--sv-text); font-size:1rem; margin-bottom:14px"
               placeholder="${tt('e.g. Ein Gedi lower loop', 'למשל: הלולאה התחתונה בעין גדי')}">

        <div style="padding:10px 0 4px; font-weight:600; font-size:0.9rem">
          ${tt('Confirm before submitting', 'אישורים לפני הגשה')}
        </div>
        <div id="svConfirmList">
          ${CONFIRMATIONS.map(c => `
            <label class="sv-check-input">
              <input type="checkbox" data-confirm="${c.id}">
              <span>${c[lang]}</span>
            </label>
          `).join('')}
        </div>

        <div class="sv-btn-row" style="margin-top:16px">
          <button class="sv-btn sv-btn-ghost" id="svChecklistBack">
            ${tt('Back to route', 'חזור למסלול')}
          </button>
          <button class="sv-btn sv-btn-primary" id="svChecklistSubmit" disabled>
            ${tt('Submit', 'הגש')}
          </button>
        </div>
      </div>
    `;

    // Attach to the dedicated container on the standalone surveyor
    // tracker page; append to body on the consumer tracker page.
    // NEVER wipe body — that would destroy the map and every other
    // tracker element.
    const dedicatedRoot = document.getElementById('svChecklistRoot');
    if (dedicatedRoot) {
      dedicatedRoot.innerHTML = '';
      dedicatedRoot.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }

    const nameInput = overlay.querySelector('#svRouteName');
    const submitBtn = overlay.querySelector('#svChecklistSubmit');
    const backBtn   = overlay.querySelector('#svChecklistBack');
    const confirms  = Array.from(overlay.querySelectorAll('[data-confirm]'));

    const refreshSubmitState = () => {
      const allChecked = confirms.every(c => c.checked);
      const hasName = nameInput.value.trim().length > 0;
      submitBtn.disabled = !(allChecked && hasName);
    };

    confirms.forEach(c => c.addEventListener('change', refreshSubmitState));
    nameInput.addEventListener('input', refreshSubmitState);

    backBtn.addEventListener('click', () => {
      overlay.remove();
      resolve({ submit: false });
    });

    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = tt('Submitting…', 'שולח…');
      const name = nameInput.value.trim();

      try {
        await saveSurveyorRoute({
          tracker,
          routeName: name,
          completenessScore: score,
        });
        // Wipe the local autosave now that Firebase has the truth.
        try {
          const { clearAutosave } = await import('./autosave.js');
          clearAutosave();
        } catch (_) { /* non-critical */ }
        // Clear surveyor-mode sessionStorage flag so future visits to
        // /tracker don't spuriously reactivate surveyor mode.
        try { sessionStorage.removeItem('sv_mode'); } catch (_) {}
        overlay.remove();
        alert(tt(
          'Thanks — your survey was submitted for review.',
          'תודה — הסקר נשלח לביקורת.'
        ));
        location.replace('surveyor.html');
        resolve({ submit: true, name });
      } catch (err) {
        console.error('[Surveyor] Submit failed:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = tt('Retry submit', 'נסה שוב');
        alert(tt('Submit failed: ', 'ההגשה נכשלה: ') + err.message);
      }
    });
  });
}

/**
 * Persist the survey via the existing offlineSync pipeline, but tag the
 * route document as an official survey so the consumer app can badge /
 * prioritize it later.
 */
async function saveSurveyorRoute({ tracker, routeName, completenessScore }) {
  const { offlineSync } = await import('../features/offlineSync.js');
  const routeData = tracker.state.getRouteData();
  const accessibilityData = safeParseJson(localStorage.getItem('accessibilityData'));
  const poiElementsData = window.AccessNatureApp?.controllers?.poiElements?.getElements?.() || [];

  const pendingData = {
    routeData,
    routeInfo: {
      name: routeName,
      totalDistance: tracker.state.getTotalDistance(),
      elapsedTime: tracker.state.getElapsedTime(),
      date: new Date().toISOString(),
      makePublic: false, // published only after coordinator approval
    },
    accessibilityData,
    poiElements: poiElementsData,
    name: routeName,
    totalDistance: tracker.state.getTotalDistance(),
    elapsedTime: tracker.state.getElapsedTime(),

    // Surveyor attribution + moderation flags
    officialSurvey: true,
    surveyorId: tracker.profile.uid,
    surveyorEmail: tracker.profile.email,
    surveyorName: tracker.profile.name || tracker.profile.displayName || tracker.profile.email,
    reviewStatus: 'pending',
    completenessScore,
    submittedAt: new Date().toISOString(),
  };

  // Fire the standard save. If online + auth, it'll upload straight away.
  await offlineSync.saveRoute(pendingData, {
    uid: tracker.profile.uid,
    email: tracker.profile.email,
    displayName: pendingData.surveyorName,
  });
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function safeParseJson(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch (_) { return null; }
}
