/**
 * Offline map tile pre-download.
 *
 * Full implementation coming in a later commit. For now this is a stub
 * so the home page's "Offline maps" button doesn't blow up when tapped.
 */

import { tt } from './index.js';

export async function openOfflineTiles() {
  alert(tt(
    'Offline maps setup will ship in the next update. For now, load the survey area over Wi-Fi before heading out — the tiles you view will be cached automatically.',
    'הגדרת מפות לא-מקוונות תושק בעדכון הבא. בינתיים, טענו את איזור הסקר ברשת Wi-Fi לפני היציאה — האריחים שתראו יישמרו במטמון אוטומטית.'
  ));
}
