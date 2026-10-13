import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const rounded = Math.round(score);

  const getColorClasses = () => {
    if (rounded >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    if (rounded >= 80) return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
    if (rounded >= 70) return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
  };

  const getSizeClasses = () => {
    if (size === 'sm') return 'text-xs px-2 py-0.5';
    if (size === 'lg') return 'text-base px-3.5 py-1.5';
    return 'text-sm px-2.5 py-1';
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${getColorClasses()} ${getSizeClasses()}`}
      title={`Trust Score: ${rounded}/100 (Calculated from peer ratings, session completion, and verified skills)`}
    >
      <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {showLabel && <span className="font-medium text-slate-500 text-xs uppercase tracking-wider">Trust</span>}
      <span className="font-bold">{rounded}%</span>
    </div>
  );
};
