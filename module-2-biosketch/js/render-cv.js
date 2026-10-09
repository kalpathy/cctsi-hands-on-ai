// Renders the record into the CU School of Medicine CV section order.
// Everything that came from a text field is escaped: participants paste from Word.

import { SECTIONS } from './schema.js';

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function formatEntry(entry) {
  const start = String(entry.start ?? '').trim();
  const end = String(entry.end ?? '').trim();
  let years = start;
  if (start && end && start !== end) years = `${start}-${end}`;
  else if (start && !end) years = `${start}-present`;
  return { years, text: entry.text ?? '' };
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-US');
}

function renderPublication(p) {
  const ids = [
    p.doi ? `doi:${escapeHtml(p.doi)}` : '',
    p.pmid ? `PMID:${escapeHtml(p.pmid)}` : '',
  ].filter(Boolean).join(' &middot; ');
  return `<li><span class="cv-t">${escapeHtml(p.title)}</span>`
    + (p.journal ? ` <span class="cv-j">${escapeHtml(p.journal)}</span>` : '')
    + (p.year ? ` <span class="cv-y">${escapeHtml(p.year)}</span>` : '')
    + (ids ? ` <span class="cv-id">${ids}</span>` : '')
    + `</li>`;
}

function renderGrant(g) {
  return `<li><span class="cv-t">${escapeHtml(g.projectNum)}</span> `
    + `<span class="cv-j">${escapeHtml(g.title)}</span> `
    + (g.agency ? `<span class="cv-y">${escapeHtml(g.agency)}</span> ` : '')
    + (g.year ? `<span class="cv-y">${escapeHtml(g.year)}</span> ` : '')
    + `<span class="cv-id">${money(g.amount)}</span></li>`;
}

function renderGeneric(e) {
  const { years, text } = formatEntry(e);
  return `<li><span class="cv-y">${escapeHtml(years)}</span> <span class="cv-t">${escapeHtml(text)}</span></li>`;
}

export function renderCV(record, opts = {}) {
  const { includeEmpty = false } = opts;
  const id = record.identity ?? {};
  const head = `<header class="cv-head">
  <h1>${escapeHtml(id.name)}</h1>
  ${id.title ? `<p>${escapeHtml(id.title)}</p>` : ''}
  ${id.org ? `<p>${escapeHtml(id.org)}</p>` : ''}
  ${id.email ? `<p>${escapeHtml(id.email)}</p>` : ''}
  ${id.orcid ? `<p>ORCID ${escapeHtml(id.orcid)}</p>` : ''}
</header>`;

  const body = SECTIONS.map(s => {
    const entries = record[s.key] ?? [];
    if (entries.length === 0 && !includeEmpty) return '';
    const items = entries.map(e =>
      s.key === 'publications' ? renderPublication(e)
      : s.key === 'grants' ? renderGrant(e)
      : renderGeneric(e)
    ).join('\n');
    const empty = entries.length === 0 ? `<li class="cv-empty">Nothing recorded yet.</li>` : '';
    return `<section class="cv-sec">\n<h2>${escapeHtml(s.title)}</h2>\n<ul>\n${items}${empty}\n</ul>\n</section>`;
  }).filter(Boolean).join('\n');

  return `${head}\n${body}`;
}
