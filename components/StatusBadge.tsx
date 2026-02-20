import React from 'react';
import { MatchStatus } from '../types';

interface BadgeProps {
  status: MatchStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const configs: Record<MatchStatus, { text: string; class: string }> = {
    exact: { text: "DIRECT MATCH", class: "bg-[#006039] text-white" },
    alias: { text: "ALIAS MATCH", class: "bg-teal-100 text-teal-800 border border-teal-200" },
    fuzzy: { text: "FUZZY MATCH", class: "bg-[#003865] text-white shadow-sm" },
    manual: { text: "MANUAL SET", class: "bg-gray-800 text-white" },
    resolved: { text: "CONFLICT FIXED", class: "bg-[#006039] text-white" },
    ambiguous: { text: "MULTIPLE FOUND", class: "bg-[#FFB81C] text-gray-900 font-black shadow-sm" },
    not_found: { text: "NOT FOUND", class: "bg-gray-100 text-gray-500 border border-gray-200" }
  };

  const config = configs[status] || configs.not_found;

  return (
    <div className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[9px] font-bold tracking-widest whitespace-nowrap ${config.class}`}>
      {config.text}
    </div>
  );
};