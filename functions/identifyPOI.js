/**
 * identifyPOI — Firebase Cloud Function
 *
 * HTTPS-triggered function that receives a photo + POI category list,
 * asks Claude (Anthropic) to pick the best matching category, and
 * returns { top, confidence, alternates }.
 *
 * ==================== SETUP ====================
 *
 * 1. From the project root, initialize the functions directory if you
 *    haven't already:
 *      firebase init functions
 *    (choose JavaScript, decline extra tooling — this file is standalone)
 *
 * 2. Add a package.json inside functions/ with:
 *      {
 *        "name": "access-nature-functions",
 *        "engines": { "node": "20" },
 *        "main": "index.js",
 *        "dependencies": {
 *          "firebase-admin": "^12.0.0",
 *          "firebase-functions": "^5.0.0",
 *          "@anthropic-ai/sdk": "^0.30.0"
 *        }
 *      }
 *
 * 3. In your functions/index.js, re-export this function:
 *      exports.identifyPOI = require('./identifyPOI').identifyPOI;
 *
 * 4. Set the Anthropic API key as a Firebase secret:
 *      firebase functions:secrets:set ANTHROPIC_API_KEY
 *
 * 5. Deploy:
 *      firebase deploy --only functions:identifyPOI
 *
 * 6. Client-side, either
 *    a) let `poiVisionService.js` derive the URL from the Firebase
 *       project ID at window.__FIREBASE_PROJECT_ID__, or
 *    b) set an explicit override with
 *       localStorage.setItem('poi_ai_endpoint', 'https://…/identifyPOI').
 *
 * ==================== NOTES ====================
 *
 * - CORS is permissive (any origin). Tighten in production if desired.
 * - The function is stateless; no auth check is applied. Add App Check
 *   or a Firebase Auth guard before public release to avoid API abuse.
 * - Image payloads can be large (~200KB). Function memory is bumped to
 *   512MB to accommodate.
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

exports.identifyPOI = onRequest(
  {
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 30,
    secrets: [ANTHROPIC_API_KEY]
  },
  async (req, res) => {
    // Allow CORS preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { image, categories } = req.body || {};
      if (!image || !Array.isArray(categories) || categories.length === 0) {
        res.status(400).json({ error: 'Missing image or categories' });
        return;
      }

      const parsed = parseDataUrl(image);
      if (!parsed) {
        res.status(400).json({ error: 'Image must be a data URL or base64 string' });
        return;
      }

      const Anthropic = require('@anthropic-ai/sdk').default;
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

      const categoryList = categories
        .map(c => `- ${c.id}: ${c.label}`)
        .join('\n');

      const systemPrompt = [
        'You are helping accessible-trail volunteers categorize photos of trail features.',
        'Look at the image and choose exactly one category id from the list below that best matches the primary object or feature.',
        'Return strict JSON with keys: top (string, must be one of the category ids), confidence (0..1), alternates (array of up to 2 objects {id, confidence}).',
        'Never invent categories that are not in the list. If none is clearly applicable, use "info" and set confidence low.',
        '',
        'Categories:',
        categoryList
      ].join('\n');

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: parsed.mediaType,
                  data: parsed.base64
                }
              },
              {
                type: 'text',
                text: 'Which category from the list best matches this photo? Respond with JSON only.'
              }
            ]
          }
        ]
      });

      const textBlock = (message.content || []).find(b => b.type === 'text');
      const raw = textBlock?.text || '';
      const parsedJson = safeParseJson(raw);

      if (!parsedJson || typeof parsedJson.top !== 'string') {
        console.warn('[identifyPOI] Unparseable model response:', raw);
        res.status(200).json({ top: null, confidence: 0, alternates: [] });
        return;
      }

      // Guard: only allow known category ids through.
      const validIds = new Set(categories.map(c => c.id));
      const top = validIds.has(parsedJson.top) ? parsedJson.top : null;
      const alternates = Array.isArray(parsedJson.alternates)
        ? parsedJson.alternates
            .filter(a => a && validIds.has(a.id))
            .slice(0, 2)
        : [];

      res.status(200).json({
        top,
        confidence: typeof parsedJson.confidence === 'number' ? parsedJson.confidence : null,
        alternates
      });
    } catch (err) {
      console.error('[identifyPOI] Failed:', err);
      res.status(500).json({ error: 'Vision identification failed' });
    }
  }
);

function parseDataUrl(input) {
  if (typeof input !== 'string') return null;
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(input);
  if (match) return { mediaType: match[1].toLowerCase(), base64: match[2] };
  // Treat bare base64 as JPEG by default
  if (/^[A-Za-z0-9+/=]+$/.test(input)) return { mediaType: 'image/jpeg', base64: input };
  return null;
}

function safeParseJson(text) {
  if (!text) return null;
  // Extract JSON substring even if the model wrapped it in prose.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (_) {
    return null;
  }
}
