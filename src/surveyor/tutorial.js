/**
 * Surveyor tutorial walkthrough — 6 slide wizard.
 *
 * Shown once on first launch, replayable from Home. Persists a "seen" flag
 * in localStorage so it doesn't nag returning volunteers.
 *
 * Implementation is deliberately dependency-free (no framework) so it works
 * without loading the consumer app modules.
 */

import { tt } from './index.js';

const SLIDES = [
  {
    icon: '👋',
    en: {
      title: 'Welcome, surveyor',
      body: 'Thank you for volunteering to document accessible trails. This wizard walks you through the survey flow in about a minute.'
    },
    he: {
      title: 'ברוכים הבאים, סוקר',
      body: 'תודה שהתנדבת לתעד שבילים נגישים. המדריך הזה יעבור איתך על תהליך הסקר בכדקה.'
    }
  },
  {
    icon: '📍',
    en: {
      title: 'Start at the trailhead',
      body: 'Stand at the actual start of the trail. Wait for GPS accuracy under 10 m before tapping Start. Take a landmark photo of the trailhead sign.'
    },
    he: {
      title: 'התחלה בכניסה לשביל',
      body: 'עמדו בכניסה בפועל לשביל. חכו שהדיוק של ה-GPS ירד מתחת ל-10 מטר לפני הלחיצה על "התחל". צלמו תמונה של השילוט בכניסה.'
    }
  },
  {
    icon: '🚶',
    en: {
      title: 'Walk the trail steadily',
      body: 'Move at a normal walking pace. Try to stay on the main path. If the trail branches, note the junction with a POI so we can document it.'
    },
    he: {
      title: 'צעדו לאורך השביל בקצב אחיד',
      body: 'הליכו בקצב רגיל. השתדלו להישאר על השביל הראשי. אם יש הסתעפות, סמנו נקודה כדי לתעד את הצומת.'
    }
  },
  {
    icon: '📸',
    en: {
      title: 'Photograph every feature',
      body: 'Tap the blue camera FAB for one-tap POI capture — benches, water fountains, restrooms, viewpoints, hazards, ramps, gates. The AI will suggest a type; you confirm.'
    },
    he: {
      title: 'צלמו כל אלמנט חשוב',
      body: 'לחצו על ה-FAB הכחול להוספת נקודת עניין מהירה — ספסלים, מזרקות מים, שירותים, נקודות תצפית, סכנות, רמפות, שערים. ה-AI יציע סוג ואתם תאשרו.'
    }
  },
  {
    icon: '📋',
    en: {
      title: 'Complete the accessibility survey',
      body: 'At some point along the way, open the accessibility survey and fill in everything you have observed: surface, slope, shade, facilities. This becomes the trail guide.'
    },
    he: {
      title: 'מלאו את סקר הנגישות',
      body: 'במהלך הסקר, פתחו את סקר הנגישות ומלאו כל מה שראיתם: משטח, שיפוע, צל, מתקנים. זה מה שיהפוך למדריך השביל.'
    }
  },
  {
    icon: '✅',
    en: {
      title: 'Save and submit',
      body: 'When you finish, tap Stop. A checklist and completeness score will confirm you have everything. Submit — a coordinator will review and publish. That is it!'
    },
    he: {
      title: 'שמרו והגישו',
      body: 'בסיום, לחצו "עצור". רשימת בקרה וציון שלמות יוודאו שיש לכם את הכל. הגישו — הרכז יאשר ויפרסם. זהו!'
    }
  }
];

export function openTutorial() {
  return new Promise((resolve) => {
    const lang = document.documentElement.lang === 'he' ? 'he' : 'en';
    let idx = 0;

    const overlay = document.createElement('div');
    overlay.className = 'sv-tutorial-overlay';
    overlay.innerHTML = `
      <div class="sv-tutorial-modal" role="dialog" aria-modal="true" aria-labelledby="svTutorialTitle">
        <button class="sv-tutorial-skip" id="svTutorialSkip" aria-label="${tt('Skip', 'דלג')}">×</button>
        <div class="sv-tutorial-icon" id="svTutorialIcon"></div>
        <h2 class="sv-tutorial-title" id="svTutorialTitle"></h2>
        <p class="sv-tutorial-body" id="svTutorialBody"></p>
        <div class="sv-tutorial-dots" id="svTutorialDots"></div>
        <div class="sv-tutorial-actions">
          <button class="sv-btn sv-btn-ghost" id="svTutorialBack">${tt('Back', 'חזור')}</button>
          <button class="sv-btn sv-btn-primary" id="svTutorialNext">${tt('Next', 'הבא')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const iconEl = overlay.querySelector('#svTutorialIcon');
    const titleEl = overlay.querySelector('#svTutorialTitle');
    const bodyEl = overlay.querySelector('#svTutorialBody');
    const dotsEl = overlay.querySelector('#svTutorialDots');
    const backBtn = overlay.querySelector('#svTutorialBack');
    const nextBtn = overlay.querySelector('#svTutorialNext');
    const skipBtn = overlay.querySelector('#svTutorialSkip');

    const render = () => {
      const s = SLIDES[idx];
      iconEl.textContent = s.icon;
      titleEl.textContent = s[lang].title;
      bodyEl.textContent = s[lang].body;
      dotsEl.innerHTML = SLIDES.map((_, i) => `<span class="sv-tutorial-dot ${i === idx ? 'active' : ''}"></span>`).join('');
      backBtn.disabled = idx === 0;
      nextBtn.textContent = idx === SLIDES.length - 1
        ? tt('Got it', 'הבנתי')
        : tt('Next', 'הבא');
    };

    const close = () => {
      overlay.remove();
      resolve();
    };

    backBtn.addEventListener('click', () => { if (idx > 0) { idx--; render(); } });
    nextBtn.addEventListener('click', () => {
      if (idx < SLIDES.length - 1) { idx++; render(); }
      else close();
    });
    skipBtn.addEventListener('click', close);

    render();
  });
}
