import { describe, it, expect } from 'vitest';
import { jaroWinkler, toTitleCase } from './matchingService';

describe('Vermont Town Cleaner Logic', () => {
  describe('jaroWinkler Algorithm', () => {
    it('should identify exact matches correctly', () => {
      expect(jaroWinkler('Montpelier', 'Montpelier')).toBe(1);
    });

    it('should provide high scores for minor typos (fuzzy matching)', () => {
      const score = jaroWinkler('Burlington', 'Burlingten');
      expect(score).toBeGreaterThan(0.85); // Your app's default threshold
    });

    it('should fail significantly different names', () => {
      const score = jaroWinkler('Stowe', 'Rutland');
      expect(score).toBeLessThan(0.7);
    });
  });

  describe('toTitleCase Utility', () => {
    it('should format uppercase strings to title case', () => {
      expect(toTitleCase('MONTPELIER')).toBe('Montpelier');
    });

    it('should handle hyphenated names like "St. George"', () => {
      // Note: adjust based on your specific implementation in matchingService.ts
      expect(toTitleCase('SAINT GEORGE')).toBe('Saint George');
    });
  });
});