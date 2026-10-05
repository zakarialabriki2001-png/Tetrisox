import React from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Percent,
  Flame,
  Zap,
  Target,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Elite88AnalyticsReport } from '../lib/elite88Engine';

interface Elite88StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: Elite88AnalyticsReport;
}

export const Elite88StatsModal: React.FC<Elite88StatsModalProps> = ({
  isOpen,
  onClose,
  analytics,
}) => {
  if (!isOpen) return null;

  const {
    overall,
    premium1x2,
    premiumGoalsHunter,
    premiumFirstHalf,
    signalPicks,
    icharaV2,
    rawProb88,
    todayStats,
    alphaGain,
    baselineWinRate,
  } = analytics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-left space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GLOW DECORATIONS */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-850 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 rounded-2xl border border-amber-500/40 shadow-inner">
              <BarChart3 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  STATISTICAL VERIFICATION ENGINE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                  ALPHA EDGE +{alphaGain}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 font-mono flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                  نظام التتبع الإحصائي لفلتر النخبة (&gt; 88%)
                </span>
              </h2>
              <p className="text-xs text-slate-450 mt-0.5 font-sans">
                تحليل دقيق لأداء ونجاح المباريات التي تجاوزت توقعاتها 88% عبر جميع الأنظمة (Premium, Signals, V2, Consensus).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 88%+ Win Rate */}
          <div className="bg-gradient-to-b from-emerald-950/30 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 space-y-2 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                معدل دقة فلتر 88%+
              </span>
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-300 font-mono">
                {overall.winRate}%
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5" /> +{alphaGain}% vs base
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>المحسومة الفائزة:</span>
              <strong className="text-slate-200 font-bold">
                {overall.won.toLocaleString()} / {overall.settled.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Card 2: Total 88%+ Positions */}
          <div className="bg-gradient-to-b from-amber-950/30 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                إجمالي مباريات 88%+
              </span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-300 font-mono">
                {overall.total.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">مباراة</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>متوسط الأودز (Avg Odds):</span>
              <strong className="text-amber-300 font-bold">{overall.avgOdds}</strong>
            </div>
          </div>

          {/* Card 3: Today Selection */}
          <div className="bg-gradient-to-b from-purple-950/30 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                أداء اليوم المختار ({todayStats.selectedDate || 'اليوم'})
              </span>
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-300 font-mono">
                {todayStats.winRate !== null ? `${todayStats.winRate}%` : `${todayStats.totalActive} نشط`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>النتائج المنتهية:</span>
              <strong className="text-slate-200 font-bold">
                {todayStats.totalWon} / {todayStats.totalSettled} فوز
              </strong>
            </div>
          </div>

          {/* Card 4: Baseline vs Filter Edge */}
          <div className="bg-gradient-to-b from-blue-950/30 to-slate-950 border-2 border-blue-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                فارق التفوق (Alpha Gain)
              </span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-300 font-mono">
                +{alphaGain}%
              </span>
              <span className="text-xs text-slate-400 font-mono">ميزة نقية</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>الدقة الأساسية العادية:</span>
              <strong className="text-slate-400 font-bold">{baselineWinRate}%</strong>
            </div>
          </div>
        </div>

        {/* SYSTEM BY SYSTEM BREAKDOWN TABLE */}
        <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              <span>تفصيل أداء الفلتر حسب الأنظمة والأسواق الفرعية</span>
            </h3>
            <span className="text-[10.5px] font-mono text-slate-400">
              عتبة التصفية: <strong className="text-amber-400">&gt;= 88.0%</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10.5px]">
                  <th className="py-2.5 px-3">النظام / الفئة (System Module)</th>
                  <th className="py-2.5 px-3">إجمالي الفرص (&gt;=88%)</th>
                  <th className="py-2.5 px-3">المحسومة (Settled)</th>
                  <th className="py-2.5 px-3">الفائزة (Won)</th>
                  <th className="py-2.5 px-3">متوسط الأودز</th>
                  <th className="py-2.5 px-3 text-right">نسبة النجاح (Hit Rate)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                <tr className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 text-amber-300 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>PREMIUM 1X2 (Day Picks)</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{premium1x2.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{premium1x2.settled.toLocaleString()}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{premium1x2.won.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{premium1x2.avgOdds}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-black">
                      {premium1x2.winRate}%
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-purple-500/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 text-purple-300 font-bold">
                    <Flame className="h-3.5 w-3.5 text-purple-400" />
                    <span>PREMIUM GOALS HUNTER (Over/BTTS)</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{premiumGoalsHunter.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{premiumGoalsHunter.settled.toLocaleString()}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{premiumGoalsHunter.won.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{premiumGoalsHunter.avgOdds}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-black">
                      {premiumGoalsHunter.winRate}%
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-blue-500/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 text-blue-300 font-bold">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span>PREMIUM FIRST HALF (FH +0.5 / +1.5)</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{premiumFirstHalf.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{premiumFirstHalf.settled.toLocaleString()}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{premiumFirstHalf.won.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{premiumFirstHalf.avgOdds}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-black">
                      {premiumFirstHalf.winRate}%
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-rose-500/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 text-rose-300 font-bold">
                    <Award className="h-3.5 w-3.5 text-rose-400" />
                    <span>SIGNAL PICKS (&gt;=88% Historical Consistency)</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{signalPicks.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{signalPicks.settled.toLocaleString()}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{signalPicks.won.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{signalPicks.avgOdds}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-black">
                      {signalPicks.winRate}%
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-fuchsia-500/5 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 text-fuchsia-300 font-bold">
                    <Zap className="h-3.5 w-3.5 text-fuchsia-400" />
                    <span>ICHARA V2 &amp; PREMIUM V2</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{icharaV2.total.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{icharaV2.settled.toLocaleString()}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{icharaV2.won.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{icharaV2.avgOdds}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-black">
                      {icharaV2.winRate}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPLANATORY FOOTER */}
        <div className="bg-amber-955/20 border border-amber-900/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              <strong>تحصين البيانات:</strong> الفلتر يعمل وفق مصفوفة خالية من انحياز التطلع المستقبلي (Look-Ahead Bias Free) مع احتساب فقط المباريات التي حققت الشروط الرياضية الدقيقة.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs cursor-pointer shadow-md shrink-0"
          >
            إغلاق (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
