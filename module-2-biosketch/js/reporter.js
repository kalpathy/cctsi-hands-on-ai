// api.reporter.nih.gov sends NO access-control-allow-origin header (verified 2026-09-04),
// so the browser cannot call it. Participants export from the RePORTER web UI and drop it here.

// Tokenize the whole export in one pass, tracking quotes ACROSS newlines. Splitting on newlines
// first shredded any row with a multi-line quoted field into a phantom grant with a garbage
// project number, which then landed in the CV with no error at all.
function splitCsvRows(text) {
  const rows = [];
  let row = [], cur = '', inQuotes = false;
  const endField = () => { row.push(cur); cur = ''; };
  const endRow = () => { endField(); if (row.some(c => c.trim())) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) endField();
    else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else cur += c;
  }
  endRow();
  return rows.map(r => r.map(cell => cell.trim()));
}

const COLUMNS = {
  'project number': 'projectNum', 'project num': 'projectNum',
  'project title': 'title',
  'fiscal year': 'year',
  'award amount': 'amount',
  'administering ic': 'agency', 'agency': 'agency',
};

export function parseReporterCsv(text) {
  const rows = splitCsvRows(String(text));
  if (rows.length === 0) return [];
  const header = rows[0].map(h => COLUMNS[h.toLowerCase()] ?? null);
  return rows.slice(1).map(cells => {
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
