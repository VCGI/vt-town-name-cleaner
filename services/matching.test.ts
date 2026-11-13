import { describe, it, expect } from 'vitest';
import data from '../data/vt-town-alias.json';
import type { LookupData } from '../types';
import { BLOCKLIST, createMatcher, matchValue, preprocess } from './matching';

const lookup = data as unknown as LookupData;
const match = createMatcher(lookup);

describe('preprocess', () => {
  it.each([
    ['St Albans', 'saint albans'],
    ['St. Johnsbury', 'saint johnsbury'],
    ['Mt Holly', 'mount holly'],
    ['N Hero', 'north hero'],
    ['Peru VT 05152', 'peru'],
    ['Peru VT 05152-1234', 'peru'],
    ['105 Island Pond', 'island pond'],
    ['Bixby Rd Danby', 'danby'],
    ['PO Box 12 Stowe', 'stowe'],
    ['Apt 4B Burlington', 'burlington'],
    ['Apt101 Burlington', 'burlington'],
    ['%Bolin Rutland', 'rutland'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(preprocess(input)).toBe(expected);
  });

  it.each(['Underhill', 'Unity', 'Rutland', 'Ludlow', 'Stowe', 'West Windsor', 'North Hero'])(
    'leaves the real place name %j unchanged',
    (name) => {
      expect(preprocess(name)).toBe(name.toLowerCase());
    }
  );
});

describe('createMatcher', () => {
  it('matches an official name exactly', () => {
    expect(match('Peru')).toMatchObject({ baseStatus: 'exact', baseOfficial: 'PERU' });
  });

  it('returns the town GEOID', () => {
    expect(match('Peru').baseGeoid).toBe(lookup.towns.PERU.geoid);
  });

  it('maps a village to its town as an alias', () => {
    expect(match('Quechee')).toMatchObject({ baseStatus: 'alias', baseOfficial: 'HARTFORD' });
  });

  it('flags ambiguous names and returns the options', () => {
    expect(match('Barre')).toMatchObject({
      baseStatus: 'ambiguous',
      baseOptions: ['BARRE CITY', 'BARRE TOWN'],
    });
  });

  it('resolves "city of" / "town of" forms', () => {
    expect(match('City of Barre')).toMatchObject({ baseOfficial: 'BARRE CITY' });
    expect(match('Town of Rutland')).toMatchObject({ baseOfficial: 'RUTLAND TOWN' });
  });

  it('expands abbreviations before matching', () => {
    expect(match('Mt Holly')).toMatchObject({ baseOfficial: 'MOUNT HOLLY' });
    expect(match('N Hero')).toMatchObject({ baseOfficial: 'NORTH HERO' });
  });

  it('strips addresses and ZIP codes around a town', () => {
    expect(match('Peru VT 05152')).toMatchObject({ baseOfficial: 'PERU' });
    expect(match('Bixby Rd Danby')).toMatchObject({ baseOfficial: 'DANBY' });
  });

  it('keeps multi-word towns intact (does not drop the first word)', () => {
    expect(match('West Windsor')).toMatchObject({ baseOfficial: 'WEST WINDSOR' });
    expect(match('Underhill')).toMatchObject({ baseOfficial: 'UNDERHILL' });
  });

  it('fuzzy-matches a misspelling', () => {
    expect(match('Burlingten')).toMatchObject({ baseStatus: 'fuzzy', baseOfficial: 'BURLINGTON' });
  });

  it('ignores case and surrounding whitespace', () => {
    expect(match('  PERU  ')).toMatchObject({ baseOfficial: 'PERU' });
  });

  it.each([...BLOCKLIST, '', 'zzzzzz'])('does not match %j', (input) => {
    expect(match(input).baseStatus).toBe('not_found');
  });

  it('treats null and undefined as not found', () => {
    expect(match(null).baseStatus).toBe('not_found');
    expect(match(undefined).baseStatus).toBe('not_found');
  });

  it('matchValue is equivalent to a one-off matcher', () => {
    expect(matchValue('Peru', lookup)).toEqual(match('Peru'));
  });
});

describe('alias table regression guard', () => {
  // Every alias in the shipped data must resolve to its own target, in any
  // casing. Guards against normalization rules rewriting a name that matches.
  const entries = Object.entries(lookup.aliases);

  it('resolves every alias key to its target', () => {
    const failures: string[] = [];
    for (const [key, target] of entries) {
      if (BLOCKLIST.includes(key)) continue;
      const result = match(key);
      if (typeof target === 'string') {
        if (result.baseOfficial !== target) failures.push(`${key} -> ${result.baseOfficial || result.baseStatus} (want ${target})`);
      } else if (result.baseStatus !== 'ambiguous') {
        failures.push(`${key} -> ${result.baseStatus} (want ambiguous)`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('is insensitive to casing for every alias key', () => {
    const failures = entries
      .filter(([key]) => !BLOCKLIST.includes(key))
      .filter(([key]) => match(key.toUpperCase()).baseStatus !== match(key).baseStatus)
      .map(([key]) => key);
    expect(failures).toEqual([]);
  });
});
