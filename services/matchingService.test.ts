import { describe, it, expect } from 'vitest';
import { jaroWinkler, toTitleCase } from './matchingService';

describe('jaroWinkler', () => {
  it('returns 1 for identical strings', () => {
    expect(jaroWinkler('montpelier', 'montpelier')).toBe(1);
  });

  it('returns 0 when either string is empty', () => {
    expect(jaroWinkler('', 'montpelier')).toBe(0);
    expect(jaroWinkler('montpelier', '')).toBe(0);
  });

  it('scores minor typos above the 0.85 fuzzy-match threshold', () => {
    expect(jaroWinkler('burlington', 'burlingten')).toBeGreaterThan(0.85);
  });

  it('scores unrelated names below 0.7', () => {
    expect(jaroWinkler('stowe', 'rutland')).toBeLessThan(0.7);
  });
});

describe('toTitleCase', () => {
  it('converts upper case to title case', () => {
    expect(toTitleCase('MONTPELIER')).toBe('Montpelier');
  });

  it('capitalizes each word', () => {
    expect(toTitleCase('SAINT GEORGE')).toBe('Saint George');
  });

  it('capitalizes after hyphens', () => {
    expect(toTitleCase('wells-river')).toBe('Wells-River');
  });

  it('returns an empty string for empty input', () => {
    expect(toTitleCase('')).toBe('');
  });
});
