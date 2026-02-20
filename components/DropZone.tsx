import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { VT_BLUE } from '../constants';

interface DropZoneProps {
  onFileLoaded: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, dragging: boolean) => {
    e.preventDefault();
    setIsDragging(dragging);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) onFileLoaded(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Clean & Standardize Town Names</h2>
        <p className="text-gray-500 text-lg">Upload your dataset to match against official Vermont geographic identifiers.</p>
      </div>
      
      <div 
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-24 text-center transition-all duration-300 bg-white ${isDragging ? "border-emerald-500 shadow-xl scale-[1.02]" : "border-gray-300 hover:border-emerald-400 shadow-sm"}`}
      >
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-colors ${isDragging ? 'bg-emerald-100' : 'bg-gray-50'}`}>
          <Upload size={36} className={isDragging ? 'text-emerald-600' : 'text-gray-400'} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Drag & drop your file here</h3>
        <p className="text-gray-500 font-medium text-sm mb-8">Supports .CSV, .XLSX, and .XLS formats</p>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: VT_BLUE }}
          className="rounded-lg px-8 py-3.5 text-sm font-bold tracking-widest text-white transition-all hover:brightness-110 active:scale-95 shadow-md flex items-center gap-2 mx-auto"
        >
          BROWSE FILES
        </button>
        <input ref={fileInputRef} type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => e.target.files && onFileLoaded(e.target.files[0])} />
      </div>
    </div>
  );
};