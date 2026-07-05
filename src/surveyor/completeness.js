/**
 * Completeness score for a surveyor session.
 *
 * Returns a 0–100 score and a per-criterion breakdown so the UI can
 * show the volunteer where they can still improve before submitting.
 *
 * Weights (informal, tune later based on real data):
 *   Distance recorded (≥300 m)              10
 *   Duration (≥5 min)                       10
 *   Location points (≥30 GPS fixes)          5
 *   Photos captured (≥3 photos)             15
 *   POIs added (≥2 non-photo POIs)          15
 *   Trailhead documented (photo near start) 10
 *   Accessibility survey complete           25
 *   Notes on any interesting features       10
 *
 * Total: 100
 */

export function computeCompleteness({ routeData, accessibilityData, poiElements }) {
  const criteria = [];

  const points = (routeData || []).filter(p => p.type === 'location');
  const photos = (routeData || []).filter(p => p.type === 'photo');
  const notes  = (routeData || []).filter(p => p.type === 'text');
  const pois   = poiElements || [];
  const nonPhotoPois = pois.filter(p => p.type && p.type !== 'photo');

  // Distance & duration derived from location points
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    distanceKm += haversine(points[i - 1].coords, points[i].coords);
  }
  const durationMin = points.length > 1
    ? (points[points.length - 1].timestamp - points[0].timestamp) / 60000
    : 0;

  criteria.push({
    id: 'distance', weight: 10, ok: distanceKm >= 0.3,
    labelEn: `Distance ≥ 300 m (${(distanceKm * 1000).toFixed(0)} m)`,
    labelHe: `מרחק ≥ 300 מטר (${(distanceKm * 1000).toFixed(0)} מטר)`,
  });

  criteria.push({
    id: 'duration', weight: 10, ok: durationMin >= 5,
    labelEn: `Duration ≥ 5 min (${durationMin.toFixed(0)} min)`,
    labelHe: `משך ≥ 5 דקות (${durationMin.toFixed(0)} דקות)`,
  });

  criteria.push({
    id: 'points', weight: 5, ok: points.length >= 30,
    labelEn: `GPS points ≥ 30 (${points.length})`,
    labelHe: `נקודות GPS ≥ 30 (${points.length})`,
  });

  criteria.push({
    id: 'photos', weight: 15, ok: photos.length + pois.filter(p => p.photoDataUrl).length >= 3,
    labelEn: `Photos ≥ 3`,
    labelHe: `תמונות ≥ 3`,
  });

  criteria.push({
    id: 'pois', weight: 15, ok: nonPhotoPois.length >= 2,
    labelEn: `Trail features (POIs) ≥ 2 (${nonPhotoPois.length})`,
    labelHe: `אלמנטי שביל (POI) ≥ 2 (${nonPhotoPois.length})`,
  });

  // Trailhead photo: any photo within 50 m of the first location point.
  const start = points[0]?.coords;
  const hasTrailheadPhoto = start && (photos.some(p => p.coords && haversine(start, p.coords) * 1000 < 50) ||
    pois.some(p => (p.location || p.coords) && haversine(start, p.location || p.coords) * 1000 < 50 && p.photoDataUrl));
  criteria.push({
    id: 'trailhead', weight: 10, ok: !!hasTrailheadPhoto,
    labelEn: 'Trailhead photo captured',
    labelHe: 'תמונת כניסה לשביל צולמה',
  });

  const surveyOK = !!accessibilityData && Object.keys(accessibilityData).length >= 5;
  criteria.push({
    id: 'survey', weight: 25, ok: surveyOK,
    labelEn: 'Accessibility survey completed',
    labelHe: 'סקר נגישות הושלם',
  });

  criteria.push({
    id: 'notes', weight: 10, ok: (notes.length + nonPhotoPois.filter(p => p.notes).length) >= 1,
    labelEn: 'At least one text note',
    labelHe: 'לפחות הערה אחת',
  });

  const total = criteria.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);

  return { score: total, criteria };
}

function haversine(a, b) {
  if (!a || !b) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
