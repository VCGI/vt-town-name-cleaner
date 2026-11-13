export type MatchStatus = 
  | 'exact' 
  | 'alias' 
  | 'fuzzy' 
  | 'ambiguous' 
  | 'not_found' 
  | 'manual' 
  | 'resolved';

export interface TownData {
  geoid: string;
  official_name?: string;
  county?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ct_code?: string | null;
  mcode?: string | null;
  aoe_code?: string | null;
  rpc?: string | null;
  [key: string]: any;
}

export interface LookupData {
  towns: Record<string, TownData>;
  aliases: Record<string, string | { type: 'ambiguous'; options: string[] }>;
}

export interface ProcessedRow {
  index: number;
  originalRow: any[];
  originalValue: string;
  status: MatchStatus;
  official: string;
  geoid: string;
  options: string[] | null;
  baseStatus: MatchStatus;
  baseOfficial: string;
  baseGeoid: string;
  baseOptions: string[] | null;
}

export interface ExtraField {
  id: string;
  label: string;
}
