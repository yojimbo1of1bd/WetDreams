export const GENRE_LABELS = {
  stepmom: 'Stepmom',
  stepsis: 'Stepsis',
  stepdaughter: 'Stepdaughter',
  stepdad: 'Stepdad',
  stepbro: 'Stepbrother',
  mom: 'Mom / MILF',
  family: 'Family (General)',
  birthday: 'Birthday Gift',
  persuasion: 'Persuasion',
  permission: 'Permission',
  'shared-bed': 'Shared Bed',
  swap: 'Swap',
  cheating: 'Cheating / Affair',
  blackmail: 'Blackmail',
  study: 'Study Help',
  sensory: 'Sensory Play',
  siblings: 'Siblings',
  caught: 'Caught / Walk-in',
  sleepover: 'Sleepover',
  vacation: 'Vacation'
};

export const FAMILY_GENRES = new Set([
  'stepmom', 'stepsis', 'stepdaughter', 'stepdad', 'stepbro', 'mom', 'family', 'siblings', 'shared-bed', 'caught', 'swap'
]);

export const AGE_BRACKET_LABELS = {
  '18-22': '18 – 22 (Young / College)',
  '23-26': '23 – 26 (Prime Starlet)',
  '27-30': '27 – 30 (Established)',
  '31-35': '31 – 35 (Experienced)',
  '36+': '36+ (MILF / Stepmom)'
};

export function getAgeBracket(age) {
  if (!age || typeof age !== 'number') return null;
  if (age <= 22) return '18-22';
  if (age <= 26) return '23-26';
  if (age <= 30) return '27-30';
  if (age <= 35) return '31-35';
  return '36+';
}

export const NEWCOMER_YEARS = 3;
export const CURRENT_YEAR = new Date().getFullYear();

export function isFamily(r) {
  if (!r) return false;
  if ((r.genres || []).some(g => FAMILY_GENRES.has(g))) return true;
  const tiers = Array.isArray(r.tier) ? r.tier : (r.tier ? [r.tier] : []);
  if (tiers.some(t => typeof t === 'string' && /family|milf|mom|step|birthday|persuasion|permission|study|swap|bedshare/i.test(t))) return true;
  const prose = [r.notes, r.expanded, ...(r.tags || []), ...(r.badges || []), ...(r.awards || [])].filter(Boolean).join(' ').toLowerCase();
  return /\b(family|stepmom|stepsis|stepdaughter|stepdad|stepbro|milf|momswap|dadcrush|taboo|family\s*member|mom\b)/i.test(prose);
}

export function isNewcomer(r) {
  if (!r) return false;
  const from = r.active?.from;
  if (!from) return false;
  return (CURRENT_YEAR - from) <= NEWCOMER_YEARS;
}

export function realScenes(r) {
  if (!r || !r.scenes) return [];
  return r.scenes.filter(s => s && s.title && s.title.trim().length > 3 && s.isReal !== false);
}

export function getPerformerInitials(name) {
  if (!name) return '★';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
