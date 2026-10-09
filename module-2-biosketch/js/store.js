// localStorage throws outright in some contexts (private windows, blocked site data),
// so every access is wrapped and the page must render correctly with no stored value.

import { SECTIONS, emptyRecord } from './schema.js';

export const KEY = 'cctsi-m2-record-v1';

function store(explicit) {
  if (explicit) return explicit;
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function saveRecord(record, explicit) {
  const s = store(explicit);
  if (!s) return false;
  try { s.setItem(KEY, JSON.stringify(record)); return true; }
  catch { return false; }
}

export function loadRecord(explicit) {
  const s = store(explicit);
  if (!s) return null;
  try {
    const raw = s.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (!parsed.identity) return null;
    return parsed;
  } catch { return null; }
}

export function clearRecord(explicit) {
  const s = store(explicit);
  if (!s) return false;
  try { s.removeItem(KEY); return true; }
  catch { return false; }
}

// Opens the career-record.json the page downloads. Merged onto a fresh record so a file from an
// older version still has every section, and refused outright if any section is not a list.
export function parseRecordFile(text) {
  const refuse = () => new Error('That file is not a career record. Choose the career-record.json this page downloaded.');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw refuse(); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !parsed.identity) throw refuse();
  const rec = { ...emptyRecord(), ...parsed, identity: { ...emptyRecord().identity, ...parsed.identity } };
  if (SECTIONS.some(s => !Array.isArray(rec[s.key]))) throw refuse();
  return rec;
}
