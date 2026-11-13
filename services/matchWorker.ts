import { createMatcher, MatchResult } from './matching';
import type { LookupData } from '../types';

// Web Worker entry point: matches each unique value off the main thread.
const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<{ uniqueValues: unknown[]; lookupData: LookupData }>) => {
  const { uniqueValues, lookupData } = e.data;
  const match = createMatcher(lookupData);
  const results: Record<string, MatchResult> = {};

  for (const val of uniqueValues) {
    const original = val === undefined || val === null ? '' : String(val);
    results[original] = match(original);
  }

  ctx.postMessage(results);
};
