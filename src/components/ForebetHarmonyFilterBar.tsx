import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, ShieldAlert, Info } from 'lucide-react';

interface ForebetHarmonyFilterBarProps {
  isActive: boolean;
  onToggle: () => void;
  compatibleCount: number;
  totalCount: number;
  systemName?: string;
}

export const ForebetHarmonyFilterBar: React.FC<ForebetHarmonyFilterBarProps> = ({
  isActive,
  onToggle,
  compatibleCount,
  totalCount,
  systemName = 'الأنظمة',
}) => {
  const percent = totalCount > 0 ? Math.round((compatibleCount / totalCount) * 100) : 0;

  return (
    <div
      className={`rounded-2xl transition-all duration-300 p-3 sm:p-4 border backdrop-blur-md ${
        isActive
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
          : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800/80'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Info and Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isActive
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
            }`}
          >
            {isActive ? (
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            ) : (
              <ShieldAlert className="h-5 w-5 opacity-70" />
            )}
          </div>

          <div className="space-y-0.5 text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-100 font-sans tracking-tight">
                فلتر عدم تعارض Forebet الذكي
              </span>
              <span
                className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isActive ? 'درع التوافق نَشِط 100%' : 'غير مفعل'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight font-sans">
              يضمن تطابق توقعات {systemName} مع نتيجة ومسار Forebet ويحجب أي تعارض إحصائي
            </p>
          </div>
        </div>

        {/* Right: Metrics & Switch Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>المباريات المتوافقة:</span>
              <strong className="text-xs sm:text-sm font-bold text-emerald-400">
                {compatibleCount}
              </strong>
              <span className="text-slate-500">/ {totalCount}</span>
              <span className="text-[10px] text-teal-400 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-500/20 font-bold">
                {percent}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
              isActive
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>مُفعّل (منع التعارض)</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>تفعيل فلتر التوافق</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
