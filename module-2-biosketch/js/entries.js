// The twelve sections nothing can fetch are typed in, one entry per line, year first:
//   2019-2023 Associate Professor, Radiology      a range
//   2021 Best paper award                         one year
//   2022-present Chair, IRB                       still running
// Entries use the { start, end, text } shape that render-cv.js already prints.

const YEAR = '(?:19|20)\\d{2}';
// Hyphen, en dash, em dash or "to" between years: Word converts hyphens as people paste.
const DASH = '\\s*(?:-|\\u2013|\\u2014|to)\\s*';
const LINE = new RegExp(
  `^(${YEAR})(?:${DASH}(${YEAR}|present|current|now))?(?:\\s*[:,.\\-]\\s*|\\s+)(.+)$`, 'i');

function parseLine(line) {
  const m = line.match(LINE);
  if (!m) return { start: '', end: '', text: line };
  const [, start, end, text] = m;
  // No second year means a single year, which must not render as "2021-present".
  if (end === undefined) return { start, end: start, text: text.trim() };
  return { start, end: /^\d/.test(end) ? end : '', text: text.trim() };
}

export function parseEntries(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(parseLine);
}

function formatLine({ start = '', end = '', text = '' }) {
  if (!start) return text;
  if (!end) return `${start}-present ${text}`;
  if (end === start) return `${start} ${text}`;
  return `${start}-${end} ${text}`;
}

export function formatEntries(entries) {
  return (entries ?? []).map(formatLine).join('\n');
}
