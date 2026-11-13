import { LookupData } from '../types';

export type AliasValue = string | { type: 'ambiguous'; options: string[] };

export interface MatchResult {
  baseStatus: 'exact' | 'alias' | 'fuzzy' | 'ambiguous' | 'not_found';
  baseOfficial: string;
  baseGeoid: string;
  baseOptions: string[] | null;
}

export const FUZZY_THRESHOLD = 0.85;

/** Generic names that must never be matched (or fuzzy-matched) to a town. */
export const BLOCKLIST = [
  'portland', 'boston', 'orlando', 'west', 'north', 'east', 'south',
  'ave', 'bedford', 'benn', 'bradenton', 'che'
];

export const jaroWinkler = (s1: string, s2: string): number => {
  let m = 0;

  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1 === s2) return 1;

  const range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  for (let i = 0; i < s1.length; i++) {
    const low = (i >= range) ? i - range : 0;
    const high = (i + range <= s2.length - 1) ? i + range : s2.length - 1;

    for (let j = low; j <= high; j++) {
      if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
        m++;
        s1Matches[i] = s2Matches[j] = true;
        break;
      }
    }
  }

  if (m === 0) return 0;

  let k = 0;
  let numTrans = 0;

  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i] === true) {
      for (let j = k; j < s2.length; j++) {
        if (s2Matches[j] === true) {
          k = j + 1;
          if (s1[i] !== s2[j]) {
            numTrans++;
          }
          break;
        }
      }
    }
  }

  let weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
  let l = 0;
  const p = 0.1;

  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4) {
      l++;
    }
    weight = weight + l * p * (1 - weight);
  }
  return weight;
};

const NOISE_WORDS = [
  'apt', 'unit', 'ste', 'suite', 'box', 'po box', 'bx', 'b0x', 'rd', 'rr',
  'rfd', 'rt', 'lot', 'bldg', 'rm', 'pmb', 'star rt', 'unt', 'un', 'u', 'smc',
  'condo', 'flr', 'floor', 'garage', 'garage apt'
];

// A noise word, then a unit identifier: either something containing a digit
// ("apt 4b", "box 12") or a single letter ("unit b"). Requiring a word
// boundary and an identifier keeps real town names like "Underhill" intact.
const NOISE_PREFIX = new RegExp(`^(?:${NOISE_WORDS.join('|')})\\b\\s*#?\\s*(?:\\d[a-z0-9-]*|[a-z]\\b)\\s*`);

// Noise glued to its number, e.g. "apt101", "box12".
const CONCATENATED_NOISE = /^(?:apt|unit|un|unt|bx|ste|box|po box|b0x)\d+[a-z]?\s*/;

/**
 * Normalizes messy address-like input toward a bare place name
 * (e.g. "105 Main St Peru VT 05152" -> "peru"). Expects any casing.
 */
export const preprocess = (str: string): string => {
  if (!str) return '';
  let s = str.trim().toLowerCase();

  // 1. Saint / Mount / Village / Fort / Junction / directional expansions
  s = s.replace(/\bst(\.|\s+)/g, 'saint ');
  s = s.replace(/\bmt(\.|\s+)/g, 'mount ');
  s = s.replace(/\bvtg(\.|\s+)/g, 'village ');
  s = s.replace(/\bft(\.|\s+)/g, 'fort ');
  s = s.replace(/\bjct(\.|\s+)/g, 'junction ');

  s = s.replace(/^n(\.|\s+|$)/, 'north ');
  s = s.replace(/^s(\.|\s+|$)/, 'south ');
  s = s.replace(/^e(\.|\s+|$)/, 'east ');
  s = s.replace(/^w(\.|\s+|$)/, 'west ');

  // 2. Remove state and ZIP (e.g. "peru vt 05152" -> "peru")
  s = s.replace(/\bvt\s*\d{5}(-\d{4})?\b/g, '');

  // 3. Address noise prefixes (APT, UNIT, PO BOX, RR, ...)
  s = s.trim().replace(NOISE_PREFIX, '');
  s = s.replace(CONCATENATED_NOISE, '');

  // 4. Remove a leading house number (e.g. "105 island pond" -> "island pond")
  s = s.replace(/^\d[\w-]*\s+/, '');

  // 5. Remove care-of markers (e.g. "%bolin rutland" -> "rutland")
  s = s.replace(/^%[a-z]+\s+/, '');

  // 6. Remove street suffixes and the word before them (e.g. "bixby rd")
  s = s.replace(/\b\w+\s+(rd|ave|dr|ln|ct|pl|blvd|pkwy|hwy|rte|route)\b/g, '');

  return s.replace(/\s+/g, ' ').trim();
};

const NOT_FOUND: MatchResult = { baseStatus: 'not_found', baseOfficial: '', baseGeoid: '', baseOptions: null };

/**
 * Builds a matcher bound to a lookup table. Alias keys are computed once, so
 * create one matcher and reuse it for many values.
 */
export const createMatcher = (lookupData: LookupData) => {
  const aliases = lookupData.aliases;
  const aliasKeys = Object.keys(aliases);
  const has = (key: string): boolean => Object.prototype.hasOwnProperty.call(aliases, key);

  const resolve = (key: string, value: AliasValue, status: 'exact' | 'alias' | 'fuzzy'): MatchResult | null => {
    if (typeof value === 'object' && value !== null && value.type === 'ambiguous') {
      return { baseStatus: 'ambiguous', baseOfficial: '', baseGeoid: '', baseOptions: value.options };
    }
    if (typeof value === 'string') {
      return {
        baseStatus: status === 'fuzzy' ? 'fuzzy' : (key === value.toLowerCase() ? 'exact' : 'alias'),
        baseOfficial: value,
        baseGeoid: lookupData.towns[value]?.geoid || '',
        baseOptions: null
      };
    }
    return null;
  };

  const findBestMatch = (input: string) => {
    let bestMatch: string | null = null;
    let maxScore = 0;
    for (const alias of aliasKeys) {
      if (Math.abs(alias.length - input.length) > 5) continue;
      const score = jaroWinkler(input, alias);
      if (score > maxScore) {
        maxScore = score;
        bestMatch = alias;
      }
      if (score === 1) break;
    }
    return { bestMatch, maxScore };
  };

  return (value: unknown): MatchResult => {
    const raw = (value === undefined || value === null ? '' : String(value)).trim().toLowerCase();
    if (BLOCKLIST.includes(raw)) return NOT_FOUND;

    // 1. Exact alias lookup on the raw input. Preprocessing only runs when this
    //    misses, so a name that already matches can never be altered into a miss.
    if (has(raw)) {
      const hit = resolve(raw, aliases[raw], 'alias');
      if (hit) return hit;
    }

    const clean = preprocess(raw);
    if (BLOCKLIST.includes(clean)) return NOT_FOUND;

    // 2. Lookup on the normalized input.
    if (clean && has(clean)) {
      const hit = resolve(clean, aliases[clean], 'alias');
      if (hit) return hit;
    }

    // 3. Trailing-words fallback for "street name + town" ("main st peru").
    if (clean.includes(' ')) {
      const parts = clean.split(' ');
      for (let i = 1; i < parts.length; i++) {
        const tail = parts.slice(i).join(' ');
        if (has(tail)) {
          const hit = resolve(tail, aliases[tail], 'alias');
          if (hit) return hit;
        }
      }
    }

    // 4. Fuzzy match against all alias keys.
    if (clean.length > 2) {
      const { bestMatch, maxScore } = findBestMatch(clean);
      if (bestMatch && maxScore > FUZZY_THRESHOLD) {
        const hit = resolve(bestMatch, aliases[bestMatch], 'fuzzy');
        if (hit) return hit;
      }
    }

    return NOT_FOUND;
  };
};

export const matchValue = (value: unknown, lookupData: LookupData): MatchResult =>
  createMatcher(lookupData)(value);
