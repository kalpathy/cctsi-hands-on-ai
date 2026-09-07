// Crossref and NCBI E-utilities both send access-control-allow-origin: *, verified 2026-09-04.
// Enrichment is best-effort: a failed lookup leaves a visible gap rather than breaking the page.

import { termSet } from './rank.js';

function titleSimilarity(a, b) {
  const A = termSet(a), B = termSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / Math.min(A.size, B.size);
}

export function pickCrossrefMatch(payload, title, threshold = 0.7) {
  const items = payload?.message?.items ?? [];
  let best = null, bestScore = 0;
  for (const it of items) {
    const cand = Array.isArray(it.title) ? it.title[0] : it.title;
    const score = titleSimilarity(title, cand ?? '');
    if (score > bestScore) { bestScore = score; best = it; }
  }
  if (!best || bestScore < threshold) return null;
  return {
    doi: best.DOI ?? '',
    journal: Array.isArray(best['container-title']) ? (best['container-title'][0] ?? '') : '',
    similarity: bestScore,
  };
}

export function normalizeEsummary(payload, pmid) {
  const rec = payload?.result?.[pmid];
  if (!rec) return { pmid: '', journal: '' };
  return { pmid: String(rec.uid ?? pmid), journal: rec.fulljournalname ?? rec.source ?? '' };
}

async function lookupCrossref(title, fetchFn) {
  const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(title)}&rows=3`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`Crossref ${res.status}`);
  return pickCrossrefMatch(await res.json(), title);
}

async function lookupPubmed(title, fetchFn) {
  const search = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=1&term=${encodeURIComponent(title)}`;
  const res = await fetchFn(search);
  if (!res.ok) throw new Error(`PubMed ${res.status}`);
  const ids = (await res.json())?.esearchresult?.idlist ?? [];
  return ids[0] ?? '';
}

// `limit` matters: a real ORCID record can hold hundreds of works (the one this is demoed with
// holds 339), and two sequential lookups each would take minutes. Only the ten that go on the
// form need identifiers. `delayMs` defaults to 0 so tests stay fast; the page passes 350 to
// respect NCBI's ~3/sec guidance.
export async function enrichPublications(pubs, opts = {}) {
  const { crossrefFetch = globalThis.fetch, pubmedFetch = globalThis.fetch, limit = 25, delayMs = 0 } = opts;
  const out = [];
  let done = 0;
  for (const p of pubs) {
    if ((p.doi && p.pmid) || done >= limit) { out.push(p); continue; }
    done++;
    const next = { ...p };
    try {
      if (!next.doi) {
        const hit = await lookupCrossref(next.title, crossrefFetch);
        if (hit) { next.doi = hit.doi; if (!next.journal) next.journal = hit.journal; }
      }
      if (!next.pmid) {
        const pmid = await lookupPubmed(next.title, pubmedFetch);
        if (pmid) next.pmid = pmid;
      }
    } catch {
      next.enrichFailed = true;
    }
    out.push(next);
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  }
  return out;
}
