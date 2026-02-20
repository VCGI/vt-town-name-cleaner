import React from 'react';
import { MapPin, FileSpreadsheet, Trash2 } from 'lucide-react';
import { APP_TITLE, VT_GREEN } from '../constants';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  fileData: any[] | null;
  fileName: string;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  setCurrentView, 
  fileData, 
  fileName, 
  onReset 
}) => {
  return (
    <>
      <header className="text-white px-6 py-2.5 w-full z-40 relative bg-[#003300]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between text-[11px] sm:text-xs tracking-wide">
          <div className="opacity-90">
            An Official <span className="font-bold">Vermont</span> Government Website
          </div>
          <a href="https://www.vermont.gov/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex items-center">
            <img src="https://files.vcgi.vermont.gov/logo/vermont-logo-white.png" alt="State of Vermont" style={{ height: '18px', width: 'auto' }} />
          </a>
        </div>
      </header>

      <nav className="border-b border-gray-200 px-6 py-4 sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-inner" style={{ backgroundColor: VT_GREEN }}>
              <MapPin className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide text-gray-900 leading-none">{APP_TITLE}</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PROTOTYPE v0.1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setCurrentView('app')} className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'app' ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-900'}`}>Cleaner Tool</button>
              <button onClick={() => setCurrentView('about')} className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'about' ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-900'}`}>About & Standards</button>
            </div>

            {fileData && currentView === 'app' && (
              <div className="flex items-center gap-6 bg-gray-50 py-2 px-4 rounded-xl border border-gray-100">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1 flex items-center gap-1">
                    <FileSpreadsheet size={10} /> {fileName}
                  </span>
                  <span className="text-[12px] font-bold text-gray-800 leading-none">{fileData.length - 1} Records</span>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                <button onClick={onReset} className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-bold group">
                  <span className="hidden md:inline group-hover:underline">Clear</span>
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};