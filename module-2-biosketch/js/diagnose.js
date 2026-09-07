// The compliance check. NIH requires an ORCID linked to eRA Commons and builds the
// Products list from ORCID and My Bibliography, so a thin record here is thin on the form.

import { SECTIONS } from './schema.js';

export function diagnose(record) {
  const findings = [];
  const pubs = record.publications ?? [];

  if (!record.identity?.orcid) {
    findings.push({
      code: 'no-orcid', level: 'blocker', section: 'identity',
      message: 'No ORCID iD. NIH requires every senior/key person to have one linked to their eRA Commons account.',
    });
  }

  if (pubs.length === 0) {
    findings.push({
      code: 'no-publications', level: 'blocker', section: 'publications',
      message: 'ORCID returned no works. SciENcv builds your Products list from this, so it will be empty.',
    });
  } else if (pubs.length < 10) {
    findings.push({
      code: 'thin-publications', level: 'warn', section: 'publications', count: pubs.length,
      message: `ORCID has ${pubs.length} works. The Common Form allows ten Products, so you may not be able to fill it.`,
    });
  }

  const missing = pubs.filter(p => !p.doi && !p.pmid);
  if (missing.length > 0) {
    findings.push({
      code: 'missing-identifiers', level: 'warn', section: 'publications',
      count: missing.length, titles: missing.map(p => p.title),
      message: `${missing.length} publication(s) have no DOI and no PMID. NIH wants identifiers.`,
    });
  }

  const emptyManual = SECTIONS
    .filter(s => s.auto === 'none' && (record[s.key] ?? []).length === 0)
    .map(s => s.title);
  if (emptyManual.length > 0) {
    findings.push({
      code: 'empty-sections', level: 'info', sections: emptyManual,
      message: `${emptyManual.length} section(s) nothing can fill for you are still empty. These are the ones that make a CV go stale.`,
    });
  }

  return findings;
}
