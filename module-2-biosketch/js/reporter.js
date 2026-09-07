// api.reporter.nih.gov sends NO access-control-allow-origin header (verified 2026-09-04),
// so the browser cannot call it. Participants export from the RePORTER web UI and drop it here.

function splitCsvLine(line) {
  const out = [];
  let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

const COLUMNS = {
  'project number': 'projectNum', 'project num': 'projectNum',
  'project title': 'title',
  'fiscal year': 'year',
  'award amount': 'amount',
  'administering ic': 'agency', 'agency': 'agency',
};

export function parseReporterCsv(text) {
  const lines = String(text).split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map(h => COLUMNS[h.toLowerCase()] ?? null);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    const g = { projectNum: '', title: '', year: null, amount: 0, agency: '', source: 'reporter' };
    header.forEach((key, i) => {
      if (!key) return;
      const v = cells[i] ?? '';
      if (key === 'amount') g.amount = Number(String(v).replace(/[^0-9.]/g, '')) || 0;
      else if (key === 'year') g.year = Number(v) || null;
      else g[key] = v;
    });
    return g;
  });
}

export function parseReporterJson(payload) {
  const results = payload?.results ?? [];
  return results.map(r => ({
    projectNum: r.project_num ?? '',
    title: r.project_title ?? '',
    year: r.fiscal_year ?? null,
    amount: Number(r.award_amount) || 0,
    agency: r.agency_ic_admin?.abbreviation ?? '',
    start: r.project_start_date ?? '',
    end: r.project_end_date ?? '',
    source: 'reporter',
  }));
}

export function parseReporterExport(text) {
  const trimmed = String(text ?? '').trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parseReporterJson(Array.isArray(parsed) ? { results: parsed } : parsed);
    } catch {
      throw new Error('That file does not look like a RePORTER export. It is not valid JSON.');
    }
  }
  const first = trimmed.split(/\r?\n/)[0]?.toLowerCase() ?? '';
  if (first.includes('project number') || first.includes('project title')) {
    return parseReporterCsv(trimmed);
  }
  throw new Error('That file does not look like a RePORTER export. Export from RePORTER as CSV or JSON and try again.');
}
