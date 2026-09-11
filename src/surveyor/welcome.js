/**
 * First-survey welcome checklist.
 *
 * Shown once (on the volunteer's first tap of "Start Survey"). It's a
 * short practical-readiness check — everything a coordinator would ask
 * before someone heads out on trail. Not a tutorial (that's already
 * available separately); a pre-flight the surveyor confirms before
 * they leave civilisation.
 *
 * Persists a `sv_welcomed` flag in localStorage. Skippable via a
 * "Show again next time" link so the volunteer can dismiss it once
 * they know the drill.
 *
 * Returns a Promise<boolean> — true means "OK, proceed with Start".
 */

function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

const WELCOMED_KEY = 'sv_welcomed';

const CHECKS = [
  {
    id: 'battery',
    en: 'Phone battery ≥ 70% and a power bank in the pack',
    he: 'הסוללה מעל 70% וסוללת גיבוי בתיק',
  },
  {
    id: 'told',
    en: 'Someone knows my planned route and expected return time',
    he: 'מישהו יודע על המסלול שלי ומועד החזרה הצפוי',
  },
  {
    id: 'tutorial',
    en: 'I have watched (or replayed) the 6-slide tutorial',
    he: 'צפיתי במדריך של 6 השקפים (או חזרתי עליו)',
  },
  {
    id: 'brief',
    en: 'I have read the 1-page volunteer brief',
    he: 'קראתי את התדריך של עמוד אחד למתנדב',
  },
  {
    id: 'gear',
    en: 'Suitable clothing, footwear, water, and weather-appropriate gear',
    he: 'ביגוד מתאים, נעליים, מים וציוד המתאים למזג האוויר',
  },
];

export function runWelcomeChecklist() {
  return new Promise((resolve) => {
    // If already welcomed, skip immediately and proceed.
    if (localStorage.getItem(WELCOMED_KEY) === '1') {
      resolve(true);
      return;
    }

    const isHe = document.documentElement.lang === 'he';

    const overlay = document.createElement('div');
    overlay.className = 'sv-welcome-overlay';
    overlay.innerHTML = `
      <div class="sv-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="svWelcomeTitle">
        <h2 id="svWelcomeTitle" class="sv-welcome-title">
          ${isHe ? '🧭 לפני שיוצאים לשטח' : '🧭 Before you head out'}
        </h2>
        <p class="sv-welcome-body">
          ${isHe
            ? 'זהו רגע לוודא שהכל מוכן. סמנו כל פריט כדי להמשיך.'
            : 'A moment to make sure everything is ready. Tick each item to continue.'}
        </p>
        <div class="sv-welcome-checks" id="svWelcomeChecks">
          ${CHECKS.map(c => `
            <label class="sv-check-input sv-welcome-check">
              <input type="checkbox" data-welcome="${c.id}">
              <span>${c[isHe ? 'he' : 'en']}</span>
            </label>
          `).join('')}
        </div>
        <div class="sv-btn-row" style="margin-top:18px">
          <button class="sv-btn sv-btn-ghost" id="svWelcomeCancel">
            ${isHe ? 'לא עכשיו' : 'Not now'}
          </button>
          <button class="sv-btn sv-btn-primary" id="svWelcomeGo" disabled>
            ${isHe ? 'מוכן, בואו נתחיל' : "I'm ready, let's start"}
          </button>
        </div>
        <div style="text-align:center;margin-top:12px">
          <a href="#" id="svWelcomeSkip" style="color:var(--sv-text-dim);font-size:0.82rem">
            ${isHe ? "אל תראה לי שוב" : "Don't show me again"}
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const checks = Array.from(overlay.querySelectorAll('[data-welcome]'));
    const goBtn = overlay.querySelector('#svWelcomeGo');
    const cancelBtn = overlay.querySelector('#svWelcomeCancel');
    const skipLink = overlay.querySelector('#svWelcomeSkip');

    const refresh = () => {
      goBtn.disabled = !checks.every(c => c.checked);
    };
    checks.forEach(c => c.addEventListener('change', refresh));

    const finish = (proceed, remember) => {
      if (remember) {
        try { localStorage.setItem(WELCOMED_KEY, '1'); } catch (_) {}
      }
      overlay.remove();
      resolve(proceed);
    };

    goBtn.addEventListener('click', () => finish(true, true));
    cancelBtn.addEventListener('click', () => finish(false, false));
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      finish(true, true);
    });
  });
}
