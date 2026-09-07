// participant-site/module-2-biosketch/js/app.js
import { emptyRecord } from './schema.js';
import { fetchOrcid } from './orcid.js';
import { enrichPublications } from './enrich.js';
import { parseReporterExport } from './reporter.js';
import { diagnose } from './diagnose.js';
import { rankPublications } from './rank.js';
import { renderCV, escapeHtml } from './render-cv.js';
import { buildPrompt } from './prompt.js';
import { saveRecord, loadRecord } from './store.js';

const $ = id => document.getElementById(id);
// Merge onto a fresh record: a stored value from an older version may be missing section keys.
let record = { ...emptyRecord(), ...(loadRecord() ?? {}) };
let selected = [];

function say(msg, kind = '') {
  $('status').textContent = msg;
  $('status').className = `cv-status ${kind}`;
}

function persist() { saveRecord(record); }

// Tag each publication with its position so enrichment can write back precisely.
function indexed() { return record.publications.map((p, idx) => ({ ...p, idx })); }

// Strip the transient ranking and indexing fields before anything is stored or exported.
function bare({ idx, score, matched, ...rest }) { return rest; }

// A record can have dozens of publications missing identifiers. Printing them all inline
// pushes the grants, ranking and output sections off the screen, so long lists collapse.
function list(items) {
  if (!items || items.length === 0) return '';
  const ul = `<ul>${items.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
  if (items.length <= 5) return ul;
  return `<details><summary>Show all ${items.length}</summary>${ul}</details>`;
}

function showDiagnosis() {
  const findings = diagnose(record);
  if (findings.length === 0) {
    $('diagnosis').innerHTML = '<p class="cv-ok">Nothing missing that this page can detect.</p>';
    return;
  }
  $('diagnosis').innerHTML = findings.map(f => {
    const extra = list(f.titles ?? f.sections);
    return `<div class="cv-find cv-${f.level}"><strong>${f.level.toUpperCase()}</strong> ${escapeHtml(f.message)}${extra}</div>`;
  }).join('');
}

$('fetch').addEventListener('click', async () => {
  const btn = $('fetch'); btn.disabled = true;
  say('Asking ORCID…');
  try {
    const { publications, identity } = await fetchOrcid($('orcid').value);
    record.publications = publications;
    record.identity = { ...record.identity, ...identity, orcid: $('orcid').value.trim() };
    persist();
    say(`ORCID returned ${publications.length} work(s).`, 'cv-ok');
    showDiagnosis();
  } catch (e) {
    say(e.message, 'cv-bad');
  } finally {
    btn.disabled = false;
  }
});

// Only the publications that will go on the form need identifiers. A full ORCID record can hold
// hundreds of works and enriching all of them would eat the hands-on block.
$('enrich').addEventListener('click', async () => {
  if (record.publications.length === 0) return say('Fetch your ORCID record first.', 'cv-bad');
  const targets = selected.length ? selected : indexed().slice(0, 10);
  const btn = $('enrich'); btn.disabled = true;
  try {
    say(`Looking up missing identifiers for ${targets.length} publication(s)…`);
    const filled = await enrichPublications(targets, { limit: 10, delayMs: 350 });
    // Write back by index. Titles repeat on a real record, so keying this on the title stamped
    // one paper's identifiers onto every entry that happened to share its title.
    for (const p of filled) {
      if (Number.isInteger(p.idx)) record.publications[p.idx] = bare(p);
    }
    selected = filled;
    persist();
    const failed = filled.filter(p => p.enrichFailed).length;
    say(failed ? `Done. ${failed} lookup(s) failed and were left blank.` : 'Done.', failed ? 'cv-bad' : 'cv-ok');
    showDiagnosis();
  } finally {
    btn.disabled = false;
  }
});

$('drop').addEventListener('click', () => $('file').click());
$('drop').addEventListener('dragover', e => { e.preventDefault(); $('drop').classList.add('over'); });
$('drop').addEventListener('dragleave', () => $('drop').classList.remove('over'));
$('drop').addEventListener('drop', e => {
  e.preventDefault(); $('drop').classList.remove('over');
  if (e.dataTransfer.files[0]) readGrants(e.dataTransfer.files[0]);
});
$('file').addEventListener('change', e => { if (e.target.files[0]) readGrants(e.target.files[0]); });

async function readGrants(file) {
  try {
    record.grants = parseReporterExport(await file.text());
    persist();
    say(`Loaded ${record.grants.length} grant(s).`, 'cv-ok');
    showDiagnosis();
  } catch (e) {
    say(e.message, 'cv-bad');
  }
}

$('rank').addEventListener('click', () => {
  const ranked = rankPublications(indexed(), $('aims').value);
  selected = ranked.slice(0, 10);
  $('ranked').innerHTML = ranked.map((p, i) => `
    <div class="cv-rank">
      <span class="cv-score">${p.score}</span>
      <span class="cv-t">${escapeHtml(p.title)}</span>
      ${p.matched.length ? `<span class="cv-matched">${p.matched.map(escapeHtml).join(', ')}</span>` : '<span class="cv-matched">no shared terms</span>'}
    </div>${i === 9 ? '<hr class="cv-cut">' : ''}`).join('');
});

$('mkcv').addEventListener('click', () => {
  $('out').innerHTML = `<div class="cv-render">${renderCV(record)}</div>`;
});

$('mkprompt').addEventListener('click', () => {
  const use = selected.length ? selected : record.publications.slice(0, 10);
  try {
    const text = buildPrompt({ record, selected: use, aims: $('aims').value });
    $('out').innerHTML = `<textarea class="fld cv-prompt" rows="20" readonly></textarea>`;
    $('out').querySelector('textarea').value = text;
  } catch (e) {
    say(e.message, 'cv-bad');
  }
});

$('save').addEventListener('click', () => {
  const clean = { ...record, publications: record.publications.map(bare) };
  const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'career-record.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

if (record.identity.orcid) $('orcid').value = record.identity.orcid;
if (record.publications.length) showDiagnosis();
