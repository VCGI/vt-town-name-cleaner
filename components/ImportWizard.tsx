import React, { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, ArrowRight, Table, AlertCircle, X } from 'lucide-react';
import { VT_GREEN, VT_BLUE } from '../constants';

interface ImportWizardProps {
  workbook: any;
  fileName: string;
  onConfirm: (data: any[][]) => void;
  onCancel: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ workbook, fileName, onConfirm, onCancel }) => {
  const [selectedSheet, setSelectedSheet] = useState<string>(workbook.SheetNames[0]);
  const [headerRow, setHeaderRow] = useState<number>(1); 
  const [previewData, setPreviewData] = useState<any[][]>([]);

  useEffect(() => {
    if (!workbook || !selectedSheet) return;
    const ws = workbook.Sheets[selectedSheet];
    const data = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    setPreviewData(data.slice(0, 15)); 
  }, [workbook, selectedSheet]);

  const handleConfirm = () => {
    const ws = workbook.Sheets[selectedSheet];
    const fullData = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    
    const cleanData = fullData.slice(headerRow - 1);
    
    if (cleanData.length < 2) {
      alert("Please select a header row that has data below it.");
      return;
    }
    
    onConfirm(cleanData);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in duration-500 bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <Settings2Icon className="text-emerald-700" />
            Import Settings
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Configure how your file is read before processing.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Select Worksheet</label>
            <div className="relative">
              <select 
                value={selectedSheet}
                onChange={(e) => {
                  setSelectedSheet(e.target.value);
                  setHeaderRow(1); 
                }}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-0 cursor-pointer transition-all"
              >
                {workbook.SheetNames.map((name: string) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FileSpreadsheet size={18} />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <AlertCircle size={12} />
              If your file has multiple tabs, choose the one with address data.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Header Row Number</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="1" 
                max={previewData.length || 1}
                value={headerRow}
                onChange={(e) => setHeaderRow(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 rounded-xl border-2 border-gray-200 bg-gray-50 py-3 px-4 text-sm font-bold text-gray-800 focus:border-emerald-500 focus:ring-0 transition-all text-center"
              />
              <span className="text-sm text-gray-500 font-medium">
                Row <strong>{headerRow}</strong> contains column names.
              </span>
            </div>
             <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <Table size={12} />
              Rows above this number will be ignored (e.g., titles, metadata).
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">File Preview (First 15 Rows)</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              GREEN ROW = HEADERS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <tbody>
                {previewData.map((row, idx) => {
                  const rowNum = idx + 1;
                  const isHeader = rowNum === headerRow;
                  const isIgnored = rowNum < headerRow;
                  
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => setHeaderRow(rowNum)}
                      className={`cursor-pointer transition-colors border-b border-gray-100 last:border-0
                        ${isHeader ? 'bg-emerald-50 border-emerald-100' : isIgnored ? 'bg-gray-50 opacity-40 grayscale' : 'bg-white hover:bg-gray-50'}
                      `}
                    >
                      <td className={`w-12 px-4 py-3 text-xs font-mono font-bold text-right border-r border-gray-200 select-none
                         ${isHeader ? 'text-emerald-600 bg-emerald-100/50' : 'text-gray-400'}
                      `}>
                        {rowNum}
                      </td>
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className={`px-4 py-2 border-r border-gray-100 max-w-[200px] truncate
                          ${isHeader ? 'font-bold text-emerald-900' : 'text-gray-600'}
                        `}>
                          {cell?.toString()}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-end gap-4">
        <button 
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          style={{ backgroundColor: VT_BLUE }}
          className="px-8 py-3 rounded-xl font-bold text-sm text-white hover:brightness-110 shadow-md transition-all flex items-center gap-2"
        >
          LOAD DATA <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Settings2Icon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);