import React, { useState, useRef } from 'react';
import { Activity, X, Edit3 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProcessedRow, MatchStatus, LookupData } from '../types';
import { StatusBadge } from './StatusBadge';
import { EXTRA_FIELDS } from '../constants';
import { toTitleCase } from '../services/matchingService';

interface DataTableProps {
  results: ProcessedRow[];
  lookupData: LookupData;
  filterType: MatchStatus | null;
  clearFilter: () => void;
  extraFields: string[];
  fileHeaders: string[];
  targetColIdx: number;
  onTownSelection: (index: number, townName: string, type: 'manual' | 'resolved') => void;
  onClearSelection: (index: number) => void;
  casing: 'UPPER' | 'MIXED';
}

export const DataTable: React.FC<DataTableProps> = ({
  results,
  lookupData,
  filterType,
  clearFilter,
  extraFields,
  fileHeaders,
  targetColIdx,
  onTownSelection,
  onClearSelection,
  casing
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredTowns = Object.keys(lookupData.towns).sort();

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 54, 
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalHeight - virtualItems[virtualItems.length - 1].end : 0;

  const totalColumns = 4 + extraFields.length + fileHeaders.length;

  const formatText = (text: string | null | undefined) => {
    if (!text) return "";
    return casing === 'UPPER' ? text.toUpperCase() : toTitleCase(text);
  };

  const formatValue = (val: any) => {
    if (typeof val === 'string') {
        return casing === 'UPPER' ? val.toUpperCase() : val;
    }
    return val;
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col h-[700px]">
      <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-gray-400" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
            {filterType ? (
              <span className="flex items-center gap-2">
                FILTERED VIEW: <StatusBadge status={filterType} />
              </span>
            ) : 'PREVIEWING CLEANED DATA'} 
          </h3>
          <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {results.length.toLocaleString()} rows
          </span>
        </div>
        {filterType && (
          <button 
            onClick={clearFilter} 
            className="text-[11px] font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-md transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            <X size={12} /> Clear Filter
          </button>
        )}
      </div>
      
      <div 
        ref={parentRef} 
        className="overflow-auto relative flex-1 custom-scrollbar"
        style={{ contain: 'strict' }}
      >
        <table className="w-full text-left text-[13px] border-collapse min-w-max relative">
          <thead className="bg-gray-50 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 z-30 border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Status</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">Official Town</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">Input Value</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">GEOID</th>
              
              {extraFields.map(fieldId => (
                <th key={fieldId} className="px-5 py-4 font-bold uppercase tracking-wider text-[#003865] bg-[#003865]/5 border-b border-gray-200">
                  {EXTRA_FIELDS.find(f => f.id === fieldId)?.label}
                </th>
              ))}

              {fileHeaders.map((header, idx) => (
                <th key={idx} className={`px-5 py-4 font-bold uppercase tracking-wider border-b border-gray-200 ${idx === targetColIdx ? 'text-emerald-700 bg-emerald-50/50' : 'text-gray-400'}`}>
                  {header || `Column ${idx+1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td colSpan={totalColumns} style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            
            {virtualItems.map((virtualRow) => {
              const res = results[virtualRow.index];
              return (
                <tr 
                  key={res.index} 
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-5 py-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <StatusBadge status={res.status} />
                  </td>

                  <td className="px-5 py-2 relative min-w-[220px]">
                    {editingRow === res.index ? (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setEditingRow(null); }}>
                        <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-2xl flex flex-col w-[360px]" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Manual Override</span>
                            <button onClick={() => setEditingRow(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"><X size={16} /></button>
                          </div>
                          <div className="flex-1 overflow-y-auto max-h-[220px] rounded-xl border border-gray-100 mb-4 shadow-inner bg-gray-50/50">
                            {filteredTowns.map(t => (
                              <button key={t} onClick={(e) => { e.stopPropagation(); onTownSelection(res.index, t, 'manual'); setEditingRow(null); }}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-emerald-50 hover:text-emerald-700 font-bold text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
                              > {t} </button>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button onClick={(e) => { e.stopPropagation(); onTownSelection(res.index, '', 'manual'); setEditingRow(null); }}
                              className="w-full py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200"
                            > Set as Blank (No Match) </button>
                            
                            {(res.status === 'manual' || res.status === 'resolved') && (
                              <button onClick={(e) => { e.stopPropagation(); onClearSelection(res.index); setEditingRow(null); }}
                                className="w-full py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
                              > Reset to Original Match </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setEditingRow(res.index)} className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 -mx-3 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group/cell">
                        {res.status === 'ambiguous' && res.options ? (
                          <div className="flex flex-wrap gap-1.5">
                            {res.options.map(opt => (
                              <button key={opt} onClick={(e) => { e.stopPropagation(); onTownSelection(res.index, opt, 'resolved'); }}
                                className="rounded-md border border-[#FFB81C] bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-[#FFB81C] hover:text-white transition-colors shadow-sm"
                              > {formatText(opt)} </button>
                            ))}
                          </div>
                        ) : (
                          <>
                            <span className={`font-bold tracking-tight text-[13px] ${res.status === 'exact' ? 'text-gray-900' : res.status === 'fuzzy' ? 'text-blue-700 underline decoration-blue-200 underline-offset-2' : res.status === 'not_found' ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                              {formatText(res.official) || "Click to set manually..."}
                            </span>
                            <div className="opacity-0 group-hover/cell:opacity-100 text-gray-400 transition-opacity bg-gray-100 p-1 rounded">
                              <Edit3 size={14} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3 font-semibold text-gray-600 bg-gray-50/50 min-w-[160px]">
                    {res.originalValue}
                  </td>

                  <td className="px-5 py-3 font-mono text-[11px] font-bold text-gray-500 min-w-[100px]">
                    {res.geoid || "—"}
                  </td>

                  {extraFields.map(fieldId => {
                    const val = lookupData.towns[res.official]?.[fieldId];
                    return (
                      <td key={fieldId} className="px-5 py-3 font-medium text-gray-700 bg-[#003865]/[0.02]">
                        {(val !== undefined && val !== null && val !== "") ? formatValue(val) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}

                  {res.originalRow.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-5 py-3 text-gray-500 truncate max-w-[200px] ${cIdx === targetColIdx ? 'bg-emerald-50/30 text-gray-800 font-medium' : ''}`} title={cell?.toString()}>
                      {cell?.toString() || ""}
                    </td>
                  ))}
                </tr>
              );
            })}
            
            {paddingBottom > 0 && (
              <tr>
                <td colSpan={totalColumns} style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};