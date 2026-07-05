/**
 * Trail assignments — surveyor-side.
 *
 * Fetches documents from `/trail_assignments` where surveyorEmail matches
 * the current volunteer. Later commits add claim / status update / admin
 * review flow.
 *
 * @typedef {object} Assignment
 * @property {string} id
 * @property {string} name          - Trail name
 * @property {string} location      - Short location (city, region)
 * @property {'assigned'|'in-progress'|'submitted'|'approved'|'needs-fixes'} status
 * @property {string} surveyorEmail - Assigned volunteer's email
 */

import { db } from '../../firebase-setup.js';
import {
  collection, query, where, getDocs, orderBy, limit
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

export async function listAssignmentsForSurveyor(profile) {
  if (!profile?.email) return [];
  try {
    const q = query(
      collection(db, 'trail_assignments'),
      where('surveyorEmail', '==', profile.email.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Missing index / collection is fine — return empty and let the UI hide.
    console.warn('[Surveyor] Assignments query failed (safe to ignore if collection is empty):', err.message);
    return [];
  }
}
