import React, { useState } from 'react';
import { Info, Activity, FileText, ExternalLink, Database, ArrowRight, Download, CheckCircle2, Copy, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { RAW_DATA_RESOURCES, VT_GREEN } from '../constants';

const ResourceItem: React.FC<{ title: string, url: string, size: string }> = ({ title, url, size }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-emerald-300 hover:shadow-sm bg-gray-50/50 hover:bg-white transition-all group gap-4">
      <div className="overflow-hidden w-full md:w-auto">
        <h4 className="font-bold text-gray-800 text-sm mb-1">{title}</h4>
        <div className="text-xs text-gray-400 font-mono truncate w-full group-hover:text-emerald-700 transition-colors" title={url}>{url}</div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 mr-2">{size}</span>
        
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all shadow-sm flex items-center gap-2" title="Copy URL">
            {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span className="text-xs font-bold hidden md:inline">{copied ? 'COPIED!' : 'COPY URL'}</span>
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#003865] hover:brightness-110 text-white transition-all shadow-sm flex items-center gap-2 font-bold text-xs uppercase tracking-wider" title="Download File">
            <Download size={16} /> <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC<{ onReturn: () => void }> = ({ onReturn }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
          <Info size={28} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">About the Cleaner</h2>
      </div>
      
      <div className="prose prose-emerald max-w-none text-gray-600 text-lg mb-12 space-y-4">
        <p>
          The Vermont Town Name Cleaner is a utility designed to help data practitioners standardize messy, inconsistent, or aliased town names against official state geographic identifiers. 
        </p>
        <p>
          <strong>How it works:</strong> The tool cross-references your uploaded data against a comprehensive <em>alias table</em> maintained by the state. This means it automatically resolves common misspellings, local colloquialisms, historical designations, and <strong>unincorporated villages to their official host municipalities</strong> (for example, mapping "Quechee" to its official town of "Hartford" or "Waterbury Center" to "Waterbury").
        </p>
        <p>
          This ensures your datasets can be accurately mapped, joined, and analyzed using official Vermont data standards without tedious manual data entry.
        </p>
      </div>

      <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2">
        <Activity size={20} className="text-gray-400" />
        Understanding Match Statuses
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <StatusBadge status="exact" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">The input exactly matches the official legal name of the municipality.</p>
        </div>
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <StatusBadge status="alias" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">The input matched a known alternate name, village, or historical designation in the state alias table.</p>
        </div>
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <StatusBadge status="fuzzy" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">The input contained typos or slight variations, but a close match was confidently found via algorithmic string matching.</p>
        </div>
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <StatusBadge status="ambiguous" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">The input name could refer to multiple official towns (e.g., "Barre" could be Barre City or Barre Town). Requires user resolution.</p>
        </div>
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <StatusBadge status="not_found" />
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">No matching record could be determined. You can click on the cell to manually assign a town.</p>
        </div>
        <div className="flex flex-col items-start gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <div className="flex flex-wrap gap-2"><StatusBadge status="manual" /><StatusBadge status="resolved" /></div>
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">The user manually selected a town to override a prediction or to resolve a conflict.</p>
        </div>
      </div>

      <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2">
        <FileText size={20} className="text-gray-400" />
        Resources & Data Standards
      </h3>
      
      <div className="grid gap-4">
        <a href="https://files.vcgi.vermont.gov/other/standards-guidelines/geonames-codes/geonames-codes-standard.html" target="_blank" rel="noopener noreferrer" 
            className="flex flex-col md:flex-row items-start md:items-center gap-5 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#006039] hover:bg-emerald-50/30 transition-all group">
            <div className="bg-emerald-100 text-[#006039] p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#006039] flex items-center gap-2">
                Vermont Geographic Area Names and Codes Data Standard
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-gray-500 font-medium">Official standard from the Vermont Center for Geographic Information (VCGI) detailing the naming conventions and identifier codes for geographic areas.</p>
            </div>
        </a>

        <a href="https://geodata.vermont.gov/datasets/3f464b0e1980450e9026430a635bff0a_0/" target="_blank" rel="noopener noreferrer" 
            className="flex flex-col md:flex-row items-start md:items-center gap-5 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#003865] hover:bg-[#003865]/5 transition-all group">
            <div className="bg-[#003865]/10 text-[#003865] p-3 rounded-xl group-hover:scale-110 transition-transform">
              <MapPin size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#003865] flex items-center gap-2">
                Town Boundary Hosted Feature Layer
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-gray-500 font-medium">Access the official hosted feature layer and GIS data for Vermont town boundaries on the Open Geodata Portal.</p>
            </div>
        </a>
      </div>

      <h3 className="text-xl font-black text-gray-800 mt-12 mb-6 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2">
        <Database size={20} className="text-gray-400" />
        Direct Data Downloads
      </h3>

      <div className="flex flex-col gap-3">
        {RAW_DATA_RESOURCES.map((res, idx) => (
            <ResourceItem key={idx} title={res.title} url={res.url} size={res.size} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onReturn}
          style={{ backgroundColor: VT_GREEN }}
          className="rounded-xl px-10 py-4 text-sm font-bold tracking-widest text-white hover:brightness-110 transition-all shadow-md inline-flex items-center gap-2"
        >
          RETURN TO CLEANER <ArrowRight size={18}/>
        </button>
      </div>
    </div>
  );
};