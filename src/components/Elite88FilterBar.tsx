import React from 'react';
import { Sparkles, Zap, BarChart3, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

interface Elite88FilterBarProps {
  isActive: boolean;
  onToggle: () => void;
  activeCount: number;
  totalCount: number;
  systemName?: string;
  onOpenStats?: () => void;
}

export const Elite88FilterBar: React.FC<Elite88FilterBarProps> = ({
  isActive,
  onToggle,
  activeCount,
  totalCount,
  systemName = 'جميع الأنظمة',
  onOpenStats,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 border-2 transition-all duration-300 shadow-xl select-none ${
        isActive
          ? 'bg-gradient-to-r from-amber-950/40 via-emerald-955/40 to-slate-950 border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.18)]'
          : 'bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border-slate-800/80 hover:border-amber-500/40'
      }`}
    >
      {/* GLOW ACCENTS */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        {/* LEFT / TITLE & DESCRIPTION */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={`p-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-amber-400 hover:border-amber-500/50'
            }`}
            title="تفعيل / إيقاف فلتر التوقعات الفائقة > 88%"
          >
            {isActive ? (
              <Flame className="h-5 w-5 fill-slate-950 animate-bounce" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </button>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-black font-mono tracking-wide text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                  فلتر النخبة الفائق &gt; 88%
                </span>
                <span className="text-[10px] text-slate-500 font-normal">| ELITE 88%+</span>
              </span>

              <span
                className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-md border ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {isActive ? '⚡ مـفـعّـل (ACTIVE)' : '⚪ غير مفعل'}
              </span>

              {systemName && (
                <span className="text-[9px] font-mono bg-slate-900/80 text-amber-400/90 border border-slate-800 px-2 py-0.5 rounded-md">
                  {systemName}
                </span>
              )}
            </div>

            <p className="text-[10.5px] text-slate-400 font-sans mt-0.5 line-clamp-1">
              {isActive
                ? `يتم الآن عرض المباريات ذات الدقة والتوقعات الصارمة (>= 88%) فقط: عُثر على ${activeCount} من أصل ${totalCount}`
                : 'تصفية فورية لعزل المباريات ذات الاحتمالات والإشارات القياسية التي تتجاوز 88% بدقة عالية'}
            </p>
          </div>
        </div>

        {/* RIGHT / ACTIONS & STATS BUTTON */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {onOpenStats && (
            <button
              type="button"
              onClick={onOpenStats}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black font-mono bg-slate-900 hover:bg-slate-850 text-teal-300 border border-teal-500/40 hover:border-teal-400 transition-all cursor-pointer shadow-md hover:shadow-teal-950/30"
            >
              <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
              <span>إحصائيات الفلتر (Stats)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black font-mono tracking-wide transition-all cursor-pointer border-2 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/40 scale-102'
                : 'bg-slate-950 hover:bg-slate-900 text-amber-400 border-amber-500/50 hover:border-amber-400'
            }`}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>إظهار الكل (Show All)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>تفعيل 88%+ فقط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
