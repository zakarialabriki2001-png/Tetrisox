import React from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  Home,
  Plane,
  ArrowUpDown,
  Filter,
  Check,
  Star,
} from 'lucide-react';
import { ExceptionalCategory } from '../lib/exceptionalFilter';

interface ExceptionalFilterBarProps {
  currentCategory: ExceptionalCategory;
  onSelectCategory: (cat: ExceptionalCategory) => void;
  exceptionalFirst: boolean;
  onToggleExceptionalFirst: () => void;
  counts: {
    all: number;
    exceptional_only: number;
    over_25_35: number;
    over_15: number;
    home_win: number;
    away_win: number;
  };
  accentColor?: 'rose' | 'fuchsia';
  title?: string;
}

export const ExceptionalFilterBar: React.FC<ExceptionalFilterBarProps> = ({
  currentCategory,
  onSelectCategory,
  exceptionalFirst,
  onToggleExceptionalFirst,
  counts,
  accentColor = 'rose',
  title = 'تصفية المباريات والتوقعات الاستثنائية',
}) => {
  const isRose = accentColor === 'rose';

  const filterOptions: Array<{
    id: ExceptionalCategory;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
    count: number;
    badgeColor?: string;
  }> = [
    {
      id: 'all',
      labelAr: 'جميع المباريات',
      labelEn: 'All Matches',
      icon: <Filter className="h-3.5 w-3.5" />,
      count: counts.all,
    },
    {
      id: 'exceptional_only',
      labelAr: '⭐ الاستثنائية فقط',
      labelEn: 'Exceptional Only',
      icon: <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/30" />,
      count: counts.exceptional_only,
      badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
    },
    {
      id: 'over_25_35',
      labelAr: '+2.5 / +3.5 أهداف',
      labelEn: 'Over 2.5 / 3.5',
      icon: <Flame className="h-3.5 w-3.5 text-orange-400" />,
      count: counts.over_25_35,
      badgeColor: 'text-orange-300 bg-orange-950/60 border-orange-500/40',
    },
    {
      id: 'over_15',
      labelAr: '+1.5 أهداف',
      labelEn: 'Over 1.5',
      icon: <Zap className="h-3.5 w-3.5 text-emerald-400" />,
      count: counts.over_15,
      badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
    },
    {
      id: 'home_win',
      labelAr: 'فوز المضيف (1)',
      labelEn: 'Home Win',
      icon: <Home className="h-3.5 w-3.5 text-cyan-400" />,
      count: counts.home_win,
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40',
    },
    {
      id: 'away_win',
      labelAr: 'فوز المستضيف (2)',
      labelEn: 'Away Win',
      icon: <Plane className="h-3.5 w-3.5 text-purple-400" />,
      count: counts.away_win,
      badgeColor: 'text-purple-300 bg-purple-950/60 border-purple-500/40',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-left">
      {/* HEADER WITH PRIMARY TOGGLE BUTTON */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 border-b border-slate-800/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-white uppercase font-sans">
                {title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {counts.exceptional_only} مباراة استثنائية
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5" dir="rtl">
              إظهار التوقعات النادرة (+2.5، +1.5، فوز المضيف، فوز المستضيف، +3.5) بسهولة
            </p>
          </div>
        </div>

        {/* PRIMARY TOGGLE: EXCEPTIONAL MATCHES FIRST */}
        <button
          type="button"
          onClick={onToggleExceptionalFirst}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
            exceptionalFirst
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-amber-500/20 font-black'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
          title="عند التفعيل: يتم وضع المباريات الاستثنائية في مقدمة القائمة بغض النظر عن وقت انطلاق المباراة"
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className={`h-3.5 w-3.5 ${exceptionalFirst ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>المباريات الاستثنائية أولاً</span>
          </div>

          <span
            className={`text-[9.5px] px-2 py-0.5 rounded-md font-mono font-black ${
              exceptionalFirst
                ? 'bg-slate-950 text-amber-300 shadow-sm'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {exceptionalFirst ? '✓ مُـفـعّـل (بغض النظر عن الوقت)' : 'حسب التوقيت'}
          </span>
        </button>
      </div>

      {/* FILTER PILLS / CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filterOptions.map((opt) => {
          const isSelected = currentCategory === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectCategory(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? isRose
                    ? 'bg-rose-950/80 text-rose-200 border-rose-500/70 shadow-lg shadow-rose-950/30'
                    : 'bg-fuchsia-955/80 text-fuchsia-200 border-fuchsia-500/70 shadow-lg shadow-fuchsia-950/30'
                  : 'bg-slate-950/80 text-slate-400 border-slate-850 hover:border-slate-750 hover:text-slate-200'
              }`}
            >
              <span className="shrink-0">{opt.icon}</span>
              <span>{opt.labelAr}</span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${
                  isSelected
                    ? isRose
                      ? 'bg-rose-900/60 text-rose-100 border-rose-700/50'
                      : 'bg-fuchsia-900/60 text-fuchsia-100 border-fuchsia-700/50'
                    : opt.badgeColor || 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
