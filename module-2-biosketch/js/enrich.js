// Crossref and NCBI E-utilities both send access-control-allow-origin: *, verified 2026-09-04.
// Enrichment is best-effort: a failed lookup leaves a visible gap rather than breaking the page.
//
// Every identifier this module accepts ends up in the CV and in the prompt's "the only works you
// may cite" list, so a wrong one is a fabrication the participant would certify. Both search APIs
// return a best guess with no relevance guarantee, so nothing is accepted without a title check.

import { termSet } from './rank.js';

const TITLE_THRESHOLD = 0.7;
// A one- or two-word title ("Reply") shares its whole vocabulary with thousands of papers.
// Requiring an absolute overlap as well as a ratio is what stops those matching on coincidence.
const MIN_SHARED_TERMS = 3;

export function titleOverlap(a, b) {
  const A = termSet(a), B = termSet(b);
  if (A.size === 0 || B.size === 0) return { score: 0, shared: 0 };
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  // Divide by the LARGER set. Dividing by the smaller one scores any candidate whose terms are a
  // subset of the query at a perfect 1.0, which is how "Reply" matched a hydrology preprint.
  return { score: shared / Math.max(A.size, B.size), shared };
}

function accepts(a, b) {
  const { score, shared } = titleOverlap(a, b);
  return score >= TITLE_THRESHOLD && shared >= MIN_SHARED_TERMS;
}

export function pickCrossrefMatch(payload, title) {
  const items = payload?.message?.items ?? [];
  let best = null, bestScore = 0;
  for (const it of items) {
    const cand = Array.isArray(it.title) ? it.title[0] : it.title;
    if (!accepts(title, cand ?? '')) continue;
    const { score } = titleOverlap(title, cand ?? '');
    if (score > bestScore) { bestScore = score; best = it; }
  }
  if (!best) return null;
  return {
    doi: best.DOI ?? '',
    journal: Array.isArray(best['container-title']) ? (best['container-title'][0] ?? '') : '',
    similarity: bestScore,
  };
}

export function normalizeEsummary(payload, pmid) {
  const rec = payload?.result?.[pmid];
  if (!rec) return { pmid: '', journal: '', title: '' };
  return {
    pmid: String(rec.uid ?? pmid),
    journal: rec.fulljournalname ?? rec.source ?? '',
    title: rec.title ?? '',
  };
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
  const pmid = ((await res.json())?.esearchresult?.idlist ?? [])[0];
  if (!pmid) return '';
  // esearch always returns its best guess. Accepting it unchecked assigned an unrelated paper's
  // PMID to a work titled "Reply", so confirm the candidate's own title before taking it.
  const sum = await fetchFn(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}`);
  if (!sum.ok) throw new Error(`PubMed ${sum.status}`);
  const rec = normalizeEsummary(await sum.json(), pmid);
  return accepts(title, rec.title) ? rec.pmid : '';
}

// `limit` matters: a real ORCID record can hold hundreds of works (the one this is demoed with
// holds 339), and the lookups each would take minutes. Only the ten that go on the form need
// identifiers. `delayMs` defaults to 0 so tests stay fast; the page passes 350 to respect NCBI's
// ~3/sec guidance.
export async function enrichPublications(pubs, opts = {}) {
  const { crossrefFetch = globalThis.fetch, pubmedFetch = globalThis.fetch, limit = 25, delayMs = 0 } = opts;
  const out = [];
  let done = 0;
  for (const p of pubs) {
    if ((p.doi && p.pmid) || done >= limit) { out.push(p); continue; }
    done++;
    const next = { ...p };
    // Each lookup is wrapped separately: a Crossref outage must not also cost the PMID.
    if (!next.doi) {
      try {
        const hit = await lookupCrossref(next.title, crossrefFetch);
        if (hit) { next.doi = hit.doi; if (!next.journal) next.journal = hit.journal; }
      } catch { next.enrichFailed = true; }
    }
    if (!next.pmid) {
      try {
        const pmid = await lookupPubmed(next.title, pubmedFetch);
        if (pmid) next.pmid = pmid;
      } catch { next.enrichFailed = true; }
    }
    out.push(next);
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  }
  return out;
}
