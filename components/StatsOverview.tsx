import React from 'react';
import { CheckCircle2, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { ProcessedRow, MatchStatus } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
  bgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, isActive, onClick, colorClass, bgClass }) => (
  <button 
    onClick={onClick} 
    className={`relative flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full
      ${isActive 
        ? `${colorClass} ${bgClass} shadow-md scale-[1.02] z-10` 
        : 'border-transparent bg-white shadow-sm hover:border-gray-200 hover:shadow-md text-gray-600'
      }
    `}
  >
    {isActive && <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-md ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></div>}
    
    <div className={`mb-3 p-2 rounded-lg ${isActive ? 'bg-white/60' : 'bg-gray-50 text-gray-400'}`}>
      {icon}
    </div>
    <div className={`text-3xl font-black mb-1 ${isActive ? colorClass.split(' ')[0] : 'text-gray-800'}`}>
      {value.toLocaleString()}
    </div>
    <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? colorClass.split(' ')[0] : 'text-gray-400'}`}>
      {label}
    </div>
  </button>
);

interface StatsOverviewProps {
  results: ProcessedRow[];
  filterType: MatchStatus | null;
  setFilterType: (status: MatchStatus | null) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ results, filterType, setFilterType }) => {
  const toggleFilter = (type: MatchStatus) => {
    setFilterType(filterType === type ? null : type);
  };

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
      <StatCard 
        icon={<CheckCircle2 size={18} />}
        label="Direct Match" 
        value={results.filter(r => r.status === 'exact').length} 
        onClick={() => toggleFilter('exact')} 
        isActive={filterType === 'exact'} 
        colorClass="text-emerald-700 border-emerald-500"
        bgClass="bg-emerald-50"
      />
      <StatCard 
        icon={<CheckCircle size={18} />}
        label="Alias Resolved" 
        value={results.filter(r => r.status === 'alias').length} 
        onClick={() => toggleFilter('alias')} 
        isActive={filterType === 'alias'} 
        colorClass="text-teal-700 border-teal-500"
        bgClass="bg-teal-50"
      />
      <StatCard 
        icon={<Info size={18} />}
        label="Fuzzy Match" 
        value={results.filter(r => r.status === 'fuzzy').length} 
        onClick={() => toggleFilter('fuzzy')} 
        isActive={filterType === 'fuzzy'} 
        colorClass="text-blue-700 border-blue-500"
        bgClass="bg-blue-50"
      />
      <StatCard 
        icon={<AlertTriangle size={18} />}
        label="Conflicts" 
        value={results.filter(r => r.status === 'ambiguous' || r.status === 'resolved').length} 
        onClick={() => toggleFilter('ambiguous')} 
        isActive={filterType === 'ambiguous'} 
        colorClass="text-amber-700 border-[#FFB81C]"
        bgClass="bg-amber-50"
      />
      <StatCard 
        icon={<AlertCircle size={18} />}
        label="Not Found" 
        value={results.filter(r => r.status === 'not_found').length} 
        onClick={() => toggleFilter('not_found')} 
        isActive={filterType === 'not_found'} 
        colorClass="text-gray-600 border-gray-400"
        bgClass="bg-gray-100"
      />
    </div>
  );
};