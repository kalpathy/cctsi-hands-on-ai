// ORCID's public API sends access-control-allow-origin: *, verified 2026-09-04,
// so this runs in the browser with no key and no server.

const BASE = 'https://pub.orcid.org/v3.0';

export function isValidOrcid(id) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(String(id ?? '').trim());
}

function extId(summary, type) {
  const ids = summary?.['external-ids']?.['external-id'] ?? [];
  const hit = ids.find(i => (i['external-id-type'] ?? '').toLowerCase() === type);
  return hit?.['external-id-value'] ?? '';
}

export function normalizeWorks(payload) {
  const groups = payload?.group ?? [];
  return groups.map(g => {
    const s = g['work-summary']?.[0] ?? {};
    const yearRaw = s['publication-date']?.year?.value;
    return {
      title: s.title?.title?.value ?? '',
      year: yearRaw ? Number(yearRaw) : null,
      journal: s['journal-title']?.value ?? '',
      doi: extId(s, 'doi'),
      pmid: extId(s, 'pmid'),
      source: 'orcid',
    };
  }).filter(w => w.title);
}

export function normalizePerson(payload) {
  const n = payload?.name;
  const given = n?.['given-names']?.value ?? '';
  const family = n?.['family-name']?.value ?? '';
  return { name: [given, family].filter(Boolean).join(' ').trim() };
}

// SciENcv can pull positions from ORCID, so stale employment here becomes a stale form.
export function normalizeEmployments(payload) {
  const year = d => d?.year?.value ?? '';
  return (payload?.['affiliation-group'] ?? [])
    .flatMap(g => g.summaries ?? [])
    .map(s => s['employment-summary'] ?? {})
    .map(e => ({
      org: e.organization?.name ?? '',
      role: e['role-title'] ?? '',
      department: e['department-name'] ?? '',
      start: year(e['start-date']),
      end: year(e['end-date']),
    }))
    .filter(e => e.org);
}

export async function fetchOrcid(id, fetchFn = globalThis.fetch) {
  const clean = String(id ?? '').trim();
  if (!isValidOrcid(clean)) {
    throw new Error(`"${clean}" is not a valid ORCID iD. It looks like 0000-0001-2345-6789.`);
  }
  const get = async (path) => {
    const res = await fetchFn(`${BASE}/${clean}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`ORCID returned ${res.status} for ${path}. Try again in a moment.`);
    return res.json();
  };
  // null means "could not check", which the diagnostic skips. An empty list would read as
  // "no employment listed" and tell someone their ORCID is wrong when it is not.
  const [works, person, jobs] = await Promise.all([
    get('/works'), get('/person'), get('/employments').catch(() => null),
  ]);
  return {
    publications: normalizeWorks(works),
    identity: normalizePerson(person),
    employments: jobs ? normalizeEmployments(jobs) : null,
  };
}
