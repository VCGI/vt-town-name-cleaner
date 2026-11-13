import { LookupData, MatchStatus, ProcessedRow } from '../types';
import type { MatchResult } from './matching';

export { jaroWinkler } from './matching';

export const toTitleCase = (str: string): string => {
  if (!str) return "";
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
};

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

    const worker = new Worker(new URL('./matchWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (e: MessageEvent<Record<string, MatchResult>>) => {
      const resultsMap = e.data;

      const processed: ProcessedRow[] = rows.map((row, index) => {
        const originalValue = row[colIdx];
        const res: MatchResult = resultsMap[originalValue] || {
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
