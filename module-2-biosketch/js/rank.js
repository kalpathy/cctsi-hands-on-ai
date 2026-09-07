// Deliberately simple and deliberately visible. This is the transparent baseline that
// Tier 1's model output gets compared against, so it must never be a black box.

const STOP = new Set([
  'the','and','for','with','from','that','this','these','those','are','was','were','has','have',
  'had','not','but','its','their','our','your','which','who','whom','into','onto','over','under',
  'between','among','during','after','before','than','then','also','such','can','may','will',
  'study','studies','research','aim','aims','specific','using','use','used','based','approach',
  'novel','new','role','effect','effects','analysis','results','data','patients','clinical','screening',
]);

export function tokenize(text) {
  return String(text ?? '').toLowerCase().match(/[a-z][a-z0-9]*(?:-[a-z0-9]+)*/g) ?? [];
}

export function termSet(text) {
  return new Set(tokenize(text).filter(t => t.length >= 3 && !STOP.has(t)));
}

export function scorePublication(pub, aimsTerms) {
  const haystack = [pub.title, pub.journal, (pub.keywords ?? []).join(' ')].join(' ');
  const matched = [...termSet(haystack)].filter(t => aimsTerms.has(t)).sort();
  return { score: matched.length, matched };
}

export function rankPublications(pubs, aimsText) {
  const aimsTerms = termSet(aimsText);
  return pubs
    .map(p => ({ ...p, ...scorePublication(p, aimsTerms) }))
    .sort((a, b) => (b.score - a.score) || ((b.year ?? 0) - (a.year ?? 0)));
}
