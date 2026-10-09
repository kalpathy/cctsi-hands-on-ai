// The 17 sections of the CU School of Medicine CV template, in its prescribed order.
// Source: medschool.cuanschutz.edu faculty-mentoring-and-promotion cv-template.docx,
// pulled 2026-09-04. `auto` records how much of the section public APIs can fill.

export const SECTIONS = [
  { key: 'education',        auto: 'partial', title: 'EDUCATION' },
  { key: 'postdoc',          auto: 'partial', title: 'POST-DOCTORAL TRAINING AND RESIDENCY' },
  { key: 'appointments',     auto: 'partial', title: 'ACADEMIC APPOINTMENTS' },
  { key: 'otherPositions',   auto: 'none',    title: 'HOSPITAL, GOVERNMENT OR OTHER PROFESSIONAL POSITIONS' },
  { key: 'honors',           auto: 'none',    title: 'HONORS, SPECIAL RECOGNITIONS AND AWARDS' },
  { key: 'memberships',      auto: 'none',    title: 'MEMBERSHIP IN PROFESSIONAL ORGANIZATIONS' },
  { key: 'service',          auto: 'none',    title: 'MAJOR COMMITTEE AND SERVICE RESPONSIBILITIES' },
  { key: 'communityService', auto: 'none',    title: 'COMMUNITY SERVICE' },
  { key: 'licensure',        auto: 'none',    title: 'LICENSURE AND BOARD CERTIFICATION' },
  { key: 'lectures',         auto: 'none',    title: 'INVITED EXTRAMURAL LECTURES, PRESENTATIONS AND VISITING PROFESSORSHIPS' },
  { key: 'refereeWork',      auto: 'none',    title: 'REVIEW AND REFEREE WORK' },
  { key: 'teaching',         auto: 'none',    title: 'TEACHING RECORD' },
  { key: 'courses',          auto: 'none',    title: 'COURSES TAUGHT' },
  { key: 'mentees',          auto: 'none',    title: 'MENTEES' },
  { key: 'grants',           auto: 'most',    title: 'GRANTS' },
  { key: 'presentations',    auto: 'none',    title: 'PRESENTATIONS' },
  { key: 'publications',     auto: 'full',    title: 'PUBLICATIONS' },
];

export function emptyRecord() {
  const r = { identity: { name: '', title: '', orcid: '', email: '', org: '' } };
  for (const s of SECTIONS) r[s.key] = [];
  return r;
}

export function sectionByKey(key) {
  return SECTIONS.find(s => s.key === key);
}
