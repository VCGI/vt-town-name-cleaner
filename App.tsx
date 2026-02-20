import React, { useEffect, useCallback, useMemo, useReducer } from 'react';
import { MapPin } from 'lucide-react';
import { DATA_URL, VT_GREEN, EXTRA_FIELDS } from './constants';
import { processRows, toTitleCase } from './services/matchingService';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { AboutPage } from './components/AboutPage';
import { StatsOverview } from './components/StatsOverview';
import { DataTable } from './components/DataTable';
import { ProcessingToolbar } from './components/ProcessingToolbar';
import { ImportWizard } from './components/ImportWizard';
import { appReducer, initialState } from './reducers/appReducer';

const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const { 
    lookupData, xlsxReady, loading, error, 
    workbook, fileData, fileName, selectedColumn, 
    processing, results, filterType, 
    manualOverrides, ambiguousChoices, 
    extraFields, showSettings, currentView,
    casing 
  } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("Failed to load town data.");
        const data = await response.json();
        dispatch({ type: 'INIT_DATA_LOADED', payload: data });
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    };
    
    const checkXLSX = setInterval(() => {
      if (window.XLSX) {
        dispatch({ type: 'XLSX_READY' });
        clearInterval(checkXLSX);
      }
    }, 500);

    fetchData();
    return () => clearInterval(checkXLSX);
  }, []);

  const handleFile = (file: File) => {
    if (!window.XLSX || !file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        dispatch({ 
          type: 'LOAD_FILE_PREVIEW', 
          payload: { workbook: wb, fileName: file.name } 
        });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: "Error parsing file." });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportConfirm = (data: any[][]) => {
    if (data.length > 0) {
      const headers = data[0];
      const townIdx = headers.findIndex((h: any) => h?.toString().toLowerCase().includes('town'));
      const defaultCol = townIdx >= 0 ? headers[townIdx] : headers[0];
      
      dispatch({ 
        type: 'CONFIRM_IMPORT', 
        payload: { data, selectedColumn: defaultCol } 
      });
    } else {
      dispatch({ type: 'SET_ERROR', payload: "The selected sheet/range appears to be empty." });
    }
  };

  const handleProcessFile = useCallback(async () => {
    if (!fileData || !selectedColumn || !lookupData) return;
    dispatch({ type: 'START_PROCESSING' });

    try {
      const processed = await processRows(fileData, selectedColumn, lookupData, {}, {});
      
      const statusPriority: Record<string, number> = {
        ambiguous: 0,
        fuzzy: 1,
        not_found: 2,
        manual: 3,
        resolved: 4,
        alias: 5,
        exact: 6
      };
      
      const sortedResults = [...processed].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
      dispatch({ type: 'FINISH_PROCESSING', payload: sortedResults });
    } catch (e) {
      console.error("Processing failed", e);
      dispatch({ type: 'SET_ERROR', payload: "Failed to process data." });
    }
  }, [fileData, selectedColumn, lookupData]);

  const handleTownSelection = useCallback((index: number, townName: string, type: 'manual' | 'resolved') => {
    if (!lookupData) return;
    dispatch({ type: 'APPLY_OVERRIDE', payload: { index, townName, type } });
  }, [lookupData]);

  const handleClearSelection = useCallback((index: number) => {
    dispatch({ type: 'CLEAR_OVERRIDE', payload: { index } });
  }, []);

  const downloadFile = () => {
    if (!results || !window.XLSX || !fileData || !lookupData) return;
    const originalHeaders = fileData[0];
    const getUniqueHeader = (base: string) => {
      let name = base; let counter = 1;
      while (originalHeaders.includes(name)) { name = `${base}_${counter}`; counter++; }
      return name;
    };

    const hStat = getUniqueHeader("MatchStatus");
    const hTown = getUniqueHeader("TownUpdated");
    const hID = getUniqueHeader("GEOID");
    
    const extraHeaders = extraFields.map(fieldId => {
      const fieldLabel = EXTRA_FIELDS.find(f => f.id === fieldId)?.label || fieldId;
      return getUniqueHeader(fieldLabel);
    });

    const headers = [hStat, hTown, hID, ...extraHeaders, ...originalHeaders];
    const originalOrderResults = [...results].sort((a, b) => a.index - b.index);
    
    const formatStr = (s: string) => casing === 'UPPER' ? s.toUpperCase() : toTitleCase(s);
    const formatVal = (v: any) => {
      if (typeof v === 'string') {
        return casing === 'UPPER' ? v.toUpperCase() : v;
      }
      return v;
    };

    const rows = originalOrderResults.map(r => {
      const townVal = formatStr(r.official || "");
      const extraVals = extraFields.map(fieldId => {
        const val = lookupData.towns[r.official]?.[fieldId];
        return (val !== undefined && val !== null) ? formatVal(val) : "";
      });
      return [r.status, townVal, r.geoid || "", ...extraVals, ...r.originalRow];
    });
    
    const ws = window.XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Cleaned");
    window.XLSX.writeFile(wb, `Cleaned_${fileName}`);
  };

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (!filterType) return results;
    return results.filter(r => {
      if (filterType === 'ambiguous') return r.status === 'ambiguous' || r.status === 'resolved';
      return r.status === filterType;
    });
  }, [results, filterType]);

  const targetColIdx = useMemo(() => {
    if (!fileData || !selectedColumn) return -1;
    return fileData[0].indexOf(selectedColumn);
  }, [fileData, selectedColumn]);

  const resetAll = () => dispatch({ type: 'RESET_SESSION' });

  if (loading && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="text-center flex flex-col items-center">
          <div className="mb-6 relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: VT_GREEN }}></div>
            <MapPin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2 tracking-wide">Initializing Cleaner</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Loading State Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-emerald-100 pb-24">
      <Header 
        currentView={currentView === 'import' ? 'app' : currentView} 
        setCurrentView={(v) => dispatch({ type: 'SET_VIEW', payload: v as any })}
        fileData={fileData}
        fileName={fileName}
        onReset={resetAll}
      />

      <main className="mx-auto mt-8 max-w-[1600px] px-6">
        {currentView === 'about' ? (
          <AboutPage onReturn={() => dispatch({ type: 'SET_VIEW', payload: 'app' })} />
        ) : currentView === 'import' && workbook ? (
          <ImportWizard 
            workbook={workbook} 
            fileName={fileName} 
            onConfirm={handleImportConfirm} 
            onCancel={resetAll}
          />
        ) : !fileData ? (
          <DropZone onFileLoaded={handleFile} />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProcessingToolbar 
              headers={fileData[0]}
              selectedColumn={selectedColumn}
              setSelectedColumn={(col) => dispatch({ type: 'SET_SELECTED_COLUMN', payload: col })}
              processFile={handleProcessFile}
              processing={processing}
              resultsAvailable={!!results}
              showSettings={showSettings}
              setShowSettings={(show) => dispatch({ type: 'SET_SHOW_SETTINGS', payload: show })}
              downloadFile={downloadFile}
              extraFields={extraFields}
              toggleExtraField={(id) => dispatch({ type: 'TOGGLE_EXTRA_FIELD', payload: id })}
              casing={casing}
              setCasing={(c) => dispatch({ type: 'SET_CASING', payload: c })}
            />

            {results && lookupData && (
              <div className="space-y-6">
                <StatsOverview 
                  results={results} 
                  filterType={filterType} 
                  setFilterType={(type) => dispatch({ type: 'SET_FILTER', payload: type })} 
                />
                
                <DataTable 
                  results={filteredResults}
                  lookupData={lookupData}
                  filterType={filterType}
                  clearFilter={() => dispatch({ type: 'SET_FILTER', payload: null })}
                  extraFields={extraFields}
                  fileHeaders={fileData[0]}
                  targetColIdx={targetColIdx}
                  onTownSelection={handleTownSelection}
                  onClearSelection={handleClearSelection}
                  casing={casing}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        body { font-family: Arial, Helvetica, sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;