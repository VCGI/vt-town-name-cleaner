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
  county?: string;
  latitude?: number;
  longitude?: number;
  ct_code?: string;
  mcode?: string;
  aoe_code?: string;
  rpc?: string;
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

declare global {
  interface Window {
    XLSX: any;
  }
}