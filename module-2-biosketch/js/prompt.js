// Builds the text a participant pastes into CU ChatGPT Edu or Google Workspace Gemini.
// Everything the model is allowed to cite is in the prompt, so any other citation is
// a fabrication the participant can catch by eye. That check is the point of the module.

export const LIMITS = {
  personalStatement: 3500,
  contribution: 2000,
  contributionCount: 5,
  honors: 15,
};

function pubLine(p, i) {
  const bits = [
    p.journal ? p.journal : '',
    p.year ? String(p.year) : '',
    p.doi ? `doi:${p.doi}` : '',
    p.pmid ? `PMID:${p.pmid}` : '',
  ].filter(Boolean).join('. ');
  return `[${i + 1}] ${p.title}. ${bits}`;
}

export function buildPrompt({ record, selected, aims }) {
  if (!selected || selected.length === 0) {
    throw new Error('Select at least one publication before building the prompt.');
  }
  const id = record?.identity ?? {};
  const honors = (record?.honors ?? []).map(h => `- ${h.start ? h.start + ' ' : ''}${h.text}`).join('\n');

  const parts = [];
  parts.push(
`You are helping draft the NIH Biographical Sketch Supplement. Write in the first person, in plain
scientific prose, for a reviewer who is a scientist but not in this exact subfield.`);

  parts.push(
`ABOUT ME
Name: ${id.name || '(not given)'}
Position: ${id.title || '(not given)'}
Organization: ${id.org || '(not given)'}
ORCID: ${id.orcid || '(not given)'}`);

  parts.push(
`MY PUBLICATIONS, and the only works you may cite
${selected.map(pubLine).join('\n')}`);

  if (honors) parts.push(`MY HONORS\n${honors}`);

  if (aims && aims.trim()) {
    parts.push(`THE PROJECT, from my specific aims\n${aims.trim()}`);
  }

  parts.push(
`WHAT TO WRITE
1. A Personal Statement of at most ${LIMITS.personalStatement.toLocaleString('en-US')} characters,
   saying why I am suited to my role on this project.
2. Up to ${LIMITS.contributionCount} Contributions to Science, each at most
   ${LIMITS.contribution.toLocaleString('en-US')} characters. Each one states the problem, what I
   did, and why it mattered, with the relevant works referenced in the text.`);

  parts.push(
`RULES
- Cite only the works in the list above. Do not add any other paper, and do not invent a DOI, a
  PMID, a journal or a year. If you think something is missing, say so instead of supplying it.
- Refer to a work in the text in parentheses by its PMID, for example (PMID: 12345678). If it
  has no PMID, use its number from the list, for example (ref 3), and I will replace it.
- No full citations, no reference list, and no hyperlinks. NIH allows only short in-text
  references, and only to the works listed above.
- Do not describe work that is not evidenced by the list above.
- Do not exceed the character limits. Report the character count after each section.
- Where you are unsure of a fact about me, leave a clearly marked [GAP] rather than guessing.`);

  return parts.join('\n\n');
}
