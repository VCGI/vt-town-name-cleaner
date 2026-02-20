import { LookupData, MatchStatus, ProcessedRow } from '../types';

export interface AppState {
  lookupData: LookupData | null;
  xlsxReady: boolean;
  loading: boolean;
  error: string | null;

  workbook: any;
  fileData: any[][] | null;
  fileName: string;
  selectedColumn: string;

  processing: boolean;
  results: ProcessedRow[] | null;
  filterType: MatchStatus | null;

  manualOverrides: Record<number, string>;
  ambiguousChoices: Record<number, string>;

  extraFields: string[];
  casing: 'UPPER' | 'MIXED';
  showSettings: boolean;
  currentView: 'app' | 'about' | 'import';
}

export const initialState: AppState = {
  lookupData: null,
  xlsxReady: false,
  loading: true,
  error: null,
  workbook: null,
  fileData: null,
  fileName: "",
  selectedColumn: "",
  processing: false,
  results: null,
  filterType: null,
  manualOverrides: {},
  ambiguousChoices: {},
  extraFields: [],
  casing: 'MIXED',
  showSettings: false,
  currentView: 'app'
};

export type AppAction =
  | { type: 'INIT_DATA_LOADED'; payload: LookupData }
  | { type: 'XLSX_READY' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_FILE_PREVIEW'; payload: { workbook: any; fileName: string } }
  | { type: 'CONFIRM_IMPORT'; payload: { data: any[][]; selectedColumn: string } }
  | { type: 'SET_SELECTED_COLUMN'; payload: string }
  | { type: 'START_PROCESSING' }
  | { type: 'FINISH_PROCESSING'; payload: ProcessedRow[] }
  | { type: 'SET_FILTER'; payload: MatchStatus | null }
  | { type: 'APPLY_OVERRIDE'; payload: { index: number; townName: string; type: 'manual' | 'resolved' } }
  | { type: 'CLEAR_OVERRIDE'; payload: { index: number } }
  | { type: 'TOGGLE_EXTRA_FIELD'; payload: string }
  | { type: 'SET_CASING'; payload: 'UPPER' | 'MIXED' }
  | { type: 'SET_SHOW_SETTINGS'; payload: boolean }
  | { type: 'SET_VIEW'; payload: 'app' | 'about' | 'import' }
  | { type: 'RESET_SESSION' };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INIT_DATA_LOADED':
      return { 
        ...state, 
        lookupData: action.payload,
        loading: !state.xlsxReady 
      };
    case 'XLSX_READY':
      return { 
        ...state, 
        xlsxReady: true,
        loading: !state.lookupData 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_FILE_PREVIEW':
      return {
        ...state,
        workbook: action.payload.workbook,
        fileName: action.payload.fileName,
        currentView: 'import',
        error: null
      };
    case 'CONFIRM_IMPORT':
      return {
        ...state,
        fileData: action.payload.data,
        selectedColumn: action.payload.selectedColumn,
        results: null,
        manualOverrides: {},
        ambiguousChoices: {},
        currentView: 'app'
      };
    case 'SET_SELECTED_COLUMN':
      return { ...state, selectedColumn: action.payload };
    case 'START_PROCESSING':
      return { ...state, processing: true, error: null };
    case 'FINISH_PROCESSING':
      return { ...state, processing: false, results: action.payload };
    case 'SET_FILTER':
      return { ...state, filterType: action.payload };
    case 'APPLY_OVERRIDE': {
      const { index, townName, type } = action.payload;
      const geoid = state.lookupData?.towns[townName]?.geoid || "";

      const newManual = { ...state.manualOverrides };
      const newAmbiguous = { ...state.ambiguousChoices };
      
      if (type === 'manual') newManual[index] = townName;
      else if (type === 'resolved') newAmbiguous[index] = townName;

      const newResults = state.results ? state.results.map(r => {
        if (r.index === index) {
          return {
            ...r,
            status: type,
            official: townName,
            geoid: geoid
          };
        }
        return r;
      }) : null;

      return {
        ...state,
        manualOverrides: newManual,
        ambiguousChoices: newAmbiguous,
        results: newResults
      };
    }
    case 'CLEAR_OVERRIDE': {
      const { index } = action.payload;
      
      const newManual = { ...state.manualOverrides };
      delete newManual[index];
      
      const newAmbiguous = { ...state.ambiguousChoices };
      delete newAmbiguous[index];

      const newResults = state.results ? state.results.map(r => {
        if (r.index === index) {
          return {
            ...r,
            status: r.baseStatus || 'not_found',
            official: r.baseOfficial || '',
            geoid: r.baseGeoid || '',
            options: r.baseOptions || null
          };
        }
        return r;
      }) : null;

      return {
        ...state,
        manualOverrides: newManual,
        ambiguousChoices: newAmbiguous,
        results: newResults
      };
    }
    case 'TOGGLE_EXTRA_FIELD':
      const field = action.payload;
      const exists = state.extraFields.includes(field);
      return {
        ...state,
        extraFields: exists 
          ? state.extraFields.filter(f => f !== field) 
          : [...state.extraFields, field]
      };
    case 'SET_CASING':
      return { ...state, casing: action.payload };
    case 'SET_SHOW_SETTINGS':
      return { ...state, showSettings: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'RESET_SESSION':
      return {
        ...state,
        fileData: null,
        workbook: null,
        fileName: "",
        results: null,
        filterType: null,
        manualOverrides: {},
        ambiguousChoices: {},
        currentView: 'app',
        error: null
      };
    default:
      return state;
  }
};