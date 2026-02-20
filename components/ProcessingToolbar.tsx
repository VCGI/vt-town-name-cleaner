import React from 'react';
import { ChevronDown, ArrowRight, Settings2, Download, Check, Plus, Type } from 'lucide-react';
import { VT_GREEN, VT_BLUE, EXTRA_FIELDS } from '../constants';

interface ProcessingToolbarProps {
  headers: string[];
  selectedColumn: string;
  setSelectedColumn: (col: string) => void;
  processFile: () => void;
  processing: boolean;
  resultsAvailable: boolean;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  downloadFile: () => void;
  extraFields: string[];
  toggleExtraField: (field: string) => void;
  casing: 'UPPER' | 'MIXED';
  setCasing: (casing: 'UPPER' | 'MIXED') => void;
}

export const ProcessingToolbar: React.FC<ProcessingToolbarProps> = ({
  headers,
  selectedColumn,
  setSelectedColumn,
  processFile,
  processing,
  resultsAvailable,
  showSettings,
  setShowSettings,
  downloadFile,
  extraFields,
  toggleExtraField,
  casing,
  setCasing
}) => {
  return (
    <div className="flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 ml-1">Column to Clean</label>
            <div className="relative">
              <select 
                value={selectedColumn} 
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none cursor-pointer transition-all min-w-[240px]"
              >
                {headers.map((h, i) => <option key={i} value={h}>{h || `Column ${i+1}`}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex flex-col self-end">
            <button 
              onClick={processFile}
              disabled={processing}
              style={{ backgroundColor: VT_GREEN }}
              className="rounded-xl px-8 py-3 text-sm font-bold tracking-widest text-white hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md flex items-center gap-2 h-[46px]"
            >
              {processing ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> PROCESSING...</>
              ) : (
                <>CLEAN DATA <ArrowRight size={16}/></>
              )}
            </button>
          </div>
        </div>

        {resultsAvailable && (
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`rounded-xl px-4 py-3 text-sm font-bold tracking-widest transition-all border flex items-center justify-center gap-2 h-[46px] ${showSettings ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title="Export Settings"
            >
              <Settings2 size={18} />
              <span className="hidden lg:inline uppercase">Settings</span>
            </button>
            
            <button 
              onClick={downloadFile} 
              style={{ backgroundColor: VT_BLUE }} 
              className="flex-1 md:flex-none rounded-xl px-8 py-3 text-sm font-bold tracking-widest text-white hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2 h-[46px]"
            >
              <Download size={18} /> EXPORT CLEANED
            </button>
          </div>
        )}
      </div>

      {resultsAvailable && showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-gray-800">Enrichment Options</span>
                <span className="text-[10px] font-semibold text-gray-500">Append state data to export</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXTRA_FIELDS.map(f => {
                  const isActive = extraFields.includes(f.id);
                  return (
                    <button 
                      key={f.id} 
                      onClick={() => toggleExtraField(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center gap-1.5 ${isActive ? 'bg-[#003865]/10 border-[#003865]/30 text-[#003865]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      {isActive ? <Check size={14} /> : <Plus size={14} className="opacity-50" />}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-gray-800">Text Formatting</span>
                <span className="text-[10px] font-semibold text-gray-500">Output text style</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCasing('MIXED')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center gap-2 ${casing === 'MIXED' ? 'bg-[#003865]/10 border-[#003865]/30 text-[#003865]' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                >
                  <Type size={14} />
                  Mixed Case
                </button>
                <button 
                  onClick={() => setCasing('UPPER')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center gap-2 ${casing === 'UPPER' ? 'bg-[#003865]/10 border-[#003865]/30 text-[#003865]' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                >
                  <Type size={14} />
                  UPPER CASE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};