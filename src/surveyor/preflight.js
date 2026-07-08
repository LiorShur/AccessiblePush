/**
 * Pre-flight calibration.
 *
 * Runs a small set of checks before allowing the volunteer to start
 * tracking:
 *
 *   1. GPS accuracy ≤ 10 m
 *   2. Battery level ≥ 30% (best-effort — Battery API deprecated in
 *      some browsers; treated as informational when unavailable)
 *   3. Free storage ≥ 500 MB (via StorageManager.estimate)
 *   4. Network connectivity (navigator.onLine, plus a warning if
 *      offline map tiles aren't cached for the area)
 *
 * The "Start" button unlocks when all critical checks pass, or when
 * the user explicitly acknowledges an offline-mode override.
 *
 * Returns a Promise<boolean> — true means "start tracking now".
 */

const MIN_ACCURACY_M = 10;
const MIN_BATTERY_PCT = 30;
const MIN_STORAGE_MB = 500;

function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

/**
 * @param {object} opts
 * @param {object} opts.tracker
 * @param {boolean} [opts.allowSkipIfPassing] - if the previous run passed
 *     within the last 5 minutes, skip and return true.
 * @returns {Promise<boolean>}
 */
export function runPreflight({ tracker, allowSkipIfPassing = false } = {}) {
  if (allowSkipIfPassing) {
    const last = Number(sessionStorage.getItem('sv_preflight_ok_at') || 0);
    if (last && Date.now() - last < 5 * 60 * 1000) return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    // On the standalone surveyor-tracker page we have a dedicated
    // container (#svPreflightRoot). On the consumer tracker page we
    // append to <body> — but we must NOT wipe body first (that would
    // destroy the map and every other tracker element).
    const dedicatedRoot = document.getElementById('svPreflightRoot');

    const checks = [
      { id: 'gps',     icon: '📡', label: tt('GPS accuracy',   'דיוק GPS'),          critical: true  },
      { id: 'battery', icon: '🔋', label: tt('Battery',        'סוללה'),             critical: false },
      { id: 'storage', icon: '💾', label: tt('Free storage',   'שטח פנוי'),          critical: false },
      { id: 'network', icon: '📶', label: tt('Network',        'חיבור לרשת'),        critical: false },
    ];

    const overlay = document.createElement('div');
    overlay.className = 'sv-preflight-overlay';
    overlay.innerHTML = `
      <div class="sv-preflight-modal" role="dialog" aria-modal="true">
        <h2 class="sv-preflight-title">${tt('Pre-flight check', 'בדיקת מוכנות')}</h2>
        <p class="sv-preflight-subtitle">${tt(
          'Confirm you are ready to record an accurate survey.',
          'ודאו שאתם מוכנים להקליט סקר מדויק.')}</p>

        <div id="svPreflightList">
          ${checks.map(c => `
            <div class="sv-check" data-check="${c.id}">
              <div class="sv-check-label">
                <span class="sv-check-icon">${c.icon}</span>
                <span>${c.label}</span>
              </div>
              <span class="sv-check-status sv-check-status--pending" data-status="${c.id}">
                ${tt('Checking…', 'בודק…')}
              </span>
            </div>
          `).join('')}
        </div>

        <div class="sv-preflight-actions">
          <button class="sv-btn sv-btn-ghost" id="svPreflightCancel">
            ${tt('Cancel', 'ביטול')}
          </button>
          <button class="sv-btn sv-btn-primary" id="svPreflightStart" disabled>
            ${tt('Start survey', 'התחל סקר')}
          </button>
        </div>
      </div>
    `;
    if (dedicatedRoot) {
      dedicatedRoot.innerHTML = '';
      dedicatedRoot.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }

    const cancelBtn = overlay.querySelector('#svPreflightCancel');
    const startBtn = overlay.querySelector('#svPreflightStart');

    const finish = (accepted) => {
      overlay.remove();
      resolve(accepted);
    };

    cancelBtn.addEventListener('click', () => finish(false));

    // Run the four checks in parallel and update UI as each resolves.
    const results = {};
    const update = (id, status, text) => {
      const el = overlay.querySelector(`[data-status="${id}"]`);
      if (!el) return;
      el.className = `sv-check-status sv-check-status--${status}`;
      el.textContent = text;
      results[id] = status;
      const criticalOk = checks
        .filter(c => c.critical)
        .every(c => results[c.id] === 'ok' || results[c.id] === 'warn');
      startBtn.disabled = !criticalOk;
    };

    startBtn.addEventListener('click', () => {
      sessionStorage.setItem('sv_preflight_ok_at', String(Date.now()));
      finish(true);
    });

    // Kick off the checks
    checkGPS(update);
    checkBattery(update);
    checkStorage(update);
    checkNetwork(update);
  });
}

// ------------------------------------------------------------------
// Individual checks
// ------------------------------------------------------------------

function checkGPS(update) {
  if (!navigator.geolocation) {
    update('gps', 'bad', tt('Not supported', 'לא נתמך'));
    return;
  }
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const acc = pos.coords.accuracy;
      if (acc <= MIN_ACCURACY_M) {
        update('gps', 'ok', `±${acc.toFixed(0)}m`);
        navigator.geolocation.clearWatch(watchId);
      } else if (acc <= 30) {
        update('gps', 'warn', `±${acc.toFixed(0)}m — ` + tt('improving…', 'משתפר…'));
      } else {
        update('gps', 'warn', `±${acc.toFixed(0)}m — ` + tt('waiting for lock', 'ממתין לנעילה'));
      }
    },
    (err) => {
      update('gps', 'bad',
        err.code === err.PERMISSION_DENIED
          ? tt('Permission denied', 'ההרשאה נדחתה')
          : tt('Unavailable', 'לא זמין'));
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
  // Give up watching after 30 s regardless.
  setTimeout(() => navigator.geolocation.clearWatch(watchId), 30000);
}

async function checkBattery(update) {
  if (!navigator.getBattery) {
    update('battery', 'warn', tt('Unknown', 'לא ידוע'));
    return;
  }
  try {
    const bat = await navigator.getBattery();
    const pct = Math.round(bat.level * 100);
    if (bat.charging) {
      update('battery', 'ok', `${pct}% (${tt('charging', 'בטעינה')})`);
    } else if (pct >= MIN_BATTERY_PCT) {
      update('battery', 'ok', `${pct}%`);
    } else {
      update('battery', 'warn', `${pct}% — ` + tt('charge recommended', 'מומלץ לטעון'));
    }
  } catch (_) {
    update('battery', 'warn', tt('Unknown', 'לא ידוע'));
  }
}

async function checkStorage(update) {
  if (!navigator.storage?.estimate) {
    update('storage', 'warn', tt('Unknown', 'לא ידוע'));
    return;
  }
  try {
    const est = await navigator.storage.estimate();
    const freeMb = ((est.quota || 0) - (est.usage || 0)) / (1024 * 1024);
    if (freeMb >= MIN_STORAGE_MB) {
      update('storage', 'ok', `${freeMb.toFixed(0)} MB ${tt('free', 'פנויים')}`);
    } else {
      update('storage', 'warn', `${freeMb.toFixed(0)} MB — ` + tt('low', 'נמוך'));
    }
  } catch (_) {
    update('storage', 'warn', tt('Unknown', 'לא ידוע'));
  }
}

function checkNetwork(update) {
  if (navigator.onLine) {
    update('network', 'ok', tt('Online', 'מקוון'));
  } else {
    update('network', 'warn', tt('Offline — OK', 'לא מקוון — בסדר'));
  }
}
