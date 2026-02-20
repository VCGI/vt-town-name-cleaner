import { LookupData, MatchStatus, ProcessedRow } from '../types';

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

export const toTitleCase = (str: string): string => {
  if (!str) return "";
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
};

const WORKER_SCRIPT = `
const jaroWinkler = (s1, s2) => {
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

const preprocess = (str) => {
  if (!str) return "";
  let s = str.trim().toLowerCase();

  // 1. Saint/Mount/Directional expansions
  s = s.replace(/\\\\bst(\\\\.|\\\\s+)/g, "saint ");
  s = s.replace(/\\\\bmt(\\\\.|\\\\s+)/g, "mount ");
  s = s.replace(/\\\\bvtg(\\\\.|\\\\s+)/g, "village ");
  s = s.replace(/\\\\bft(\\\\.|\\\\s+)/g, "fort ");
  s = s.replace(/\\\\bjct(\\\\.|\\\\s+)/g, "junction ");
  
  s = s.replace(/^n(\\\\.|\\\\s+|$)/, "north ");
  s = s.replace(/^s(\\\\.|\\\\s+|$)/, "south ");
  s = s.replace(/^e(\\\\.|\\\\s+|$)/, "east ");
  s = s.replace(/^w(\\\\.|\\\\s+|$)/, "west ");

  // 2. Remove state and zip (e.g., "peru vt 05152" -> "peru")
  s = s.replace(/\\\\bvt\\\\s*\\\\d{5}(-\\\\d{4})?\\\\b/g, "");

  // 3. Address noise prefixes (APT, UNIT, SMC, RR, etc.)
  const noiseWords = [
    'apt', 'unit', 'ste', 'suite', 'box', 'po box', 'bx', 'b0x', 'rd', 'rr', 
    'rfd', 'rt', 'lot', 'bldg', 'rm', 'pmb', 'star rt', 'unt', 'un', 'u', 'smc',
    'condo', 'flr', 'floor', 'garage', 'garage apt'
  ];
  const noiseRegex = new RegExp('^(' + noiseWords.join('|') + ')\\\\s*#?\\\\s*[a-z0-9-]+\\\\b', 'g');
  s = s.replace(noiseRegex, "");
  
  // Handle concatenated noise like "APT101"
  s = s.replace(/^(apt|unit|un|unt|bx|ste|box|po box|b0x)\\\\d+[a-z]?/, "");

  // 4. Remove leading numbers or street fragments (e.g., "105 ISLAND POND")
  s = s.replace(/^[a-z0-9-]+\\\\s+/, " ");
  
  // 5. Remove care-of markers (e.g., "%BOLIN RUTLAND")
  s = s.replace(/^%[a-z]+\\\\s+/, "");

  // 6. Remove street suffixes and the word immediately before them (e.g., "BIXBY RD")
  s = s.replace(/\\\\b\\\\w+\\\\s+(rd|ave|dr|ln|ct|pl|blvd|pkwy|hwy|rte|route)\\\\b/g, "");

  return s.replace(/\\\\s+/g, ' ').trim();
};

const BLOCKLIST = [
  'portland', 'boston', 'orlando', 'west', 'north', 'east', 'south', 
  'ave', 'bedford', 'benn', 'bradenton', 'che'
];

self.onmessage = (e) => {
  const { uniqueValues, lookupData } = e.data;
  const aliasKeys = Object.keys(lookupData.aliases);
  const results = {};

  const findBestMatch = (input) => {
    let bestMatch = null;
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

  uniqueValues.forEach(val => {
    const original = val === undefined || val === null ? "" : String(val);
    const rawNormalized = original.trim().toLowerCase();
    const cleanName = preprocess(rawNormalized);
    
    let baseStatus = "not_found";
    let baseOfficial = "";
    let baseGeoid = "";
    let baseOptions = null;

    // Blocklist check
    if (BLOCKLIST.includes(cleanName) || BLOCKLIST.includes(rawNormalized)) {
      results[original] = { baseStatus, baseOfficial, baseGeoid, baseOptions };
      return;
    }

    // Attempt direct match
    let match = lookupData.aliases[cleanName];
    
    // Fallback: Check if string ends with a known alias (useful for "Street Name Town")
    if (!match && cleanName.includes(' ')) {
      const parts = cleanName.split(' ');
      for (let i = 1; i < parts.length; i++) {
        const potential = parts.slice(i).join(' ');
        if (lookupData.aliases[potential]) {
          match = lookupData.aliases[potential];
          break;
        }
      }
    }

    if (!match && cleanName !== rawNormalized) {
        match = lookupData.aliases[rawNormalized];
    }

    if (match) {
      if (typeof match === 'object' && match.type === 'ambiguous') {
        baseStatus = "ambiguous";
        baseOptions = match.options;
      } else if (typeof match === 'string') {
        baseStatus = (cleanName === match.toLowerCase()) ? "exact" : "alias";
        baseOfficial = match;
        baseGeoid = lookupData.towns[match]?.geoid || "";
      }
    } else if (cleanName.length > 2) {
      const { bestMatch, maxScore } = findBestMatch(cleanName);
      if (bestMatch && maxScore > 0.85) {
        const fuzzyMatch = lookupData.aliases[bestMatch];
        if (typeof fuzzyMatch === 'string') {
          baseStatus = "fuzzy";
          baseOfficial = fuzzyMatch;
          baseGeoid = lookupData.towns[fuzzyMatch]?.geoid || "";
        } else if (typeof fuzzyMatch === 'object' && fuzzyMatch.type === 'ambiguous') {
          baseStatus = "ambiguous";
          baseOptions = fuzzyMatch.options;
        }
      }
    }

    results[original] = { baseStatus, baseOfficial, baseGeoid, baseOptions };
  });

  self.postMessage(results);
};
`;

export const processRows = (
  fileData: any[][],
  selectedColumn: string,
  lookupData: LookupData,
  manualOverrides: Record<number, string> = {},
  ambiguousChoices: Record<number, string> = {}
): Promise<ProcessedRow[]> => {
  return new Promise((resolve, reject) => {
    if (!fileData || fileData.length < 2) {
      resolve([]);
      return;
    }

    const headers = fileData[0];
    const colIdx = headers.indexOf(selectedColumn);
    
    if (colIdx === -1) {
      reject(new Error("Selected column not found"));
      return;
    }

    const rows = fileData.slice(1);
    const uniqueValues = Array.from(new Set(rows.map(r => r[colIdx])));

    const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      const resultsMap = e.data;

      const processed: ProcessedRow[] = rows.map((row, index) => {
        const originalValue = row[colIdx];
        const res = resultsMap[originalValue] || { 
            baseStatus: 'not_found', 
            baseOfficial: '', 
            baseGeoid: '', 
            baseOptions: null 
        };

        let status: MatchStatus = res.baseStatus;
        let official = res.baseOfficial;
        let geoid = res.baseGeoid;
        
        if (manualOverrides[index]) {
            status = 'manual';
            official = manualOverrides[index];
            geoid = lookupData.towns[official]?.geoid || "";
        } else if (ambiguousChoices[index]) {
            status = 'resolved';
            official = ambiguousChoices[index];
            geoid = lookupData.towns[official]?.geoid || "";
        }

        return {
          index,
          originalRow: row,
          originalValue: String(originalValue || ""),
          status,
          official,
          geoid,
          options: res.baseOptions,
          baseStatus: res.baseStatus,
          baseOfficial: res.baseOfficial,
          baseGeoid: res.baseGeoid,
          baseOptions: res.baseOptions
        };
      });

      worker.terminate();
      resolve(processed);
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    worker.postMessage({ uniqueValues, lookupData });
  });
};