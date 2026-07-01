/**
 * POI Vision Service
 *
 * Posts a captured POI photo to a backend endpoint that runs Claude's
 * vision model to guess which POI category best matches the image.
 *
 * The endpoint is expected to accept:
 *   POST { image: <data-url or base64>, categories: [{ id, label }, ...] }
 * and return:
 *   { top: <categoryId>, confidence: 0..1, alternates: [{ id, confidence }] }
 *
 * If the endpoint URL is missing or the request fails, this module
 * returns null so the caller can silently skip the AI suggestion.
 * The default endpoint targets a Firebase Cloud Function named
 * `identifyPOI` in the same project as this app. See
 * `functions/identifyPOI.js` for the server-side implementation.
 */

class POIVisionService {
  constructor() {
    // Configurable at runtime (e.g. via localStorage) so different
    // environments can point at their own deployed function without a
    // code change.
    this.endpoint = this.resolveEndpoint();
    this.timeoutMs = 15000;
  }

  resolveEndpoint() {
    const override = localStorage.getItem('poi_ai_endpoint');
    if (override) return override;
    // Best-effort default derived from Firebase config, if the app
    // exposes it on window. Otherwise leave null and the service is
    // effectively a no-op.
    const region = window.__FIREBASE_REGION__ || 'us-central1';
    const projectId = window.__FIREBASE_PROJECT_ID__
      || window.firebaseConfig?.projectId
      || null;
    if (!projectId) return null;
    return `https://${region}-${projectId}.cloudfunctions.net/identifyPOI`;
  }

  /**
   * Identify the POI type in the given image.
   *
   * @param {string} imageDataUrl - `data:image/jpeg;base64,…` style URL.
   * @param {Array<{id:string,label:string}>} categories - candidate types.
   * @returns {Promise<null | { top: string, confidence: number|null, alternates: Array }>}
   */
  async identifyPOI(imageDataUrl, categories) {
    if (!this.endpoint) {
      console.warn('[POIVision] No endpoint configured — skipping AI suggestion');
      return null;
    }
    if (!imageDataUrl || !Array.isArray(categories) || !categories.length) {
      return null;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, categories }),
        signal: controller.signal
      });
      if (!res.ok) {
        console.warn(`[POIVision] Endpoint returned ${res.status}`);
        return null;
      }
      const data = await res.json();
      if (!data || typeof data.top !== 'string') return null;
      return {
        top: data.top,
        confidence: typeof data.confidence === 'number' ? data.confidence : null,
        alternates: Array.isArray(data.alternates) ? data.alternates : []
      };
    } catch (err) {
      if (err?.name === 'AbortError') {
        console.warn('[POIVision] Timed out');
      } else {
        console.warn('[POIVision] Request failed:', err?.message || err);
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const poiVisionService = new POIVisionService();
