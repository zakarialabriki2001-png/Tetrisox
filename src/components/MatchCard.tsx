import React, { memo, useState, useMemo } from 'react';
import { Calendar, Vote, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';
import { Match, SignalSummary } from '../types';
import { AdvancedxGEngine } from '../lib/matchEngine';
import { MarketEvaluator } from '../lib/marketEvaluator';
import { ButterflyGovernorEngine, MatchCouncilVerdict, EvolvedCouncilPrediction } from '../lib/butterflyGovernorEngine';
import { CouncilVotingModal } from './CouncilVotingModal';

interface MatchCardProps {
  match: Match;
  sigInfo?: SignalSummary;
  liveInfo?: any;
  onSelect?: (id: string) => void;
  allMatches?: Match[];
}

const MatchCard: React.FC<MatchCardProps> = memo(({ match: m, sigInfo, liveInfo, allMatches = [] }) => {
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  const fallbackPredictions = AdvancedxGEngine.generateDualPredictions(
    m.p1, m.px, m.p2, m.coef,
    sigInfo?.ema_error_h || 0,
    sigInfo?.ema_error_a || 0
  );

  const rawList: EvolvedCouncilPrediction[] = [
    { market: fallbackPredictions.primaryMarket, avg_odds: fallbackPredictions.primaryOdds, calculatedWinRate: Math.round(fallbackPredictions.primaryProb * 100), isCouncilTransformed: false },
    { market: fallbackPredictions.altMarket, avg_odds: fallbackPredictions.altOdds, calculatedWinRate: Math.round(fallbackPredictions.altProb * 100), isCouncilTransformed: false }
  ];

  const sovereign = useMemo(() => {
    return ButterflyGovernorEngine.getSovereignCouncilPredictions(m, rawList, allMatches);
  }, [m, allMatches]);

  const councilVerdict = sovereign.verdict;
  const councilSuitability = sovereign.suitability;
  const activePicks = sovereign.evolvedPredictions;
  const primaryPick = activePicks[0] || rawList[0];
  const altPick = activePicks[1] || rawList[1];
  
  const isLiveActive = !!liveInfo;

  let settlement: { primaryCorrect: boolean; altCorrect: boolean; isPrimaryPendingData?: boolean } | null = null;
  if (m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null) {
    const evalPrimary = MarketEvaluator.evaluateMatchMarket(primaryPick.market, m);
    const evalAlt = MarketEvaluator.evaluateMatchMarket(altPick.market, m);
    settlement = {
      primaryCorrect: evalPrimary.status === 'WON',
      altCorrect: evalAlt.status === 'WON',
      isPrimaryPendingData: evalPrimary.status === 'PENDING_CORNERS_DATA'
    };
  }

  return (
    <div 
      className={`relative h-[168px] bg-slate-900/45 hover:bg-slate-900/85 rounded-2xl p-4 border flex flex-col justify-between transition-all duration-200 group hover:shadow-xl selection:bg-teal-500/20 ${
        isLiveActive
          ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/10'
          : m.status === 'FINISHED' 
          ? 'border-slate-800/80 hover:border-slate-700/65' 
          : 'border-slate-800/80 hover:border-slate-700/65'
      }`}
    >
      {/* 1. DATE / TIMING HEADER */}
      <div className="flex items-center justify-between gap-1 border-b border-slate-850/60 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[11px] font-mono font-semibold text-slate-400">
            {m.kickoff}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Council Pre-Match Vote Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCouncilModal(true);
            }}
            title="انقر لعرض تصويت مجلس عملاء الذكاء الاصطناعي الـ 15 المتخصصين وتصفية المباريات الصعبة"
            className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black flex items-center gap-1 cursor-pointer transition-all border shadow-sm ${
              councilVerdict.decision === 'CERTIFIED_ELITE'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                : councilVerdict.decision === 'VETOED'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 hover:bg-rose-900'
                : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/60 hover:bg-indigo-900'
            }`}
          >
            <Vote className="w-2.5 h-2.5" />
            <span>مجلس الفراشة ({councilVerdict.approvalCount}/{councilVerdict.votes?.length || 15}): {
              councilVerdict.decision === 'CERTIFIED_ELITE'
                ? 'صالحة للرهان 5★'
                : councilVerdict.decision === 'VETOED'
                ? 'غير صالحة ⛔'
                : 'صالحة بدرع 4★'
            }</span>
          </button>

          {isLiveActive ? (
            <span className="bg-emerald-950/85 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-full font-black text-[9px] font-mono flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE • {liveInfo.liveState.timeLabel}</span>
            </span>
          ) : m.status === 'FINISHED' ? (
            <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-black text-[9px] font-mono uppercase tracking-wider">
              Settled
            </span>
          ) : (
            <span className="bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-full font-black text-[9px] font-mono uppercase tracking-wider">
              Upcoming
            </span>
          )}
        </div>
      </div>
      
      {/* 2. CORE TEAM ROW */}
      <div className="flex items-center justify-between gap-2.5 py-1.5 bg-slate-950/35 px-3 rounded-xl border border-slate-900/60">
        {/* Home Team */}
        <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
          <span className="w-5 h-5 rounded-md bg-slate-900 text-emerald-400 font-mono font-black text-[10.5px] flex items-center justify-center border border-emerald-500/10 shrink-0">
            {m.home.charAt(0)}
          </span>
          <span className="text-[13px] font-extrabold text-slate-100 truncate group-hover:text-white transition-colors leading-tight">
            {m.home}
          </span>
        </div>

        {/* Score display */}
        <div className="px-1.5 shrink-0 flex justify-center">
          {isLiveActive ? (
            <div className="bg-emerald-950/45 border border-emerald-990/30 px-2.5 py-0.5 rounded-md min-w-[45px] text-center">
              <span className="font-mono text-[12.5px] font-black text-emerald-405 tracking-wider">
                {liveInfo.liveState.goalsH}-{liveInfo.liveState.goalsA}
              </span>
            </div>
          ) : m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null ? (
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md min-w-[45px] text-center">
              <span className="font-mono text-[12.5px] font-black text-amber-500 tracking-wider">
                {m.ft_home}-{m.ft_away}
              </span>
            </div>
          ) : (
            <div className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-900 min-w-[45px] text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VS</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-[13px] font-extrabold text-slate-100 truncate text-right group-hover:text-white transition-colors leading-tight">
            {m.away}
          </span>
          <span className="w-5 h-5 rounded-md bg-slate-900 text-amber-400 font-mono font-black text-[10.5px] flex items-center justify-center border border-amber-500/10 shrink-0">
            {m.away.charAt(0)}
          </span>
        </div>
      </div>

      {/* 3. PREDICTIONS MINI-GRID (Enlarged & highly readable labels and stats) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Primary Prediction Accent */}
        <div className={`p-2 px-2.5 rounded-xl flex items-center justify-between transition-colors ${
          primaryPick.isCouncilTransformed
            ? 'bg-emerald-955/25 border-2 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            : 'bg-slate-950/70 border border-teal-500/20 hover:border-teal-500/35'
        }`}>
          <div className="min-w-0 flex-1">
            <span className={`text-[8px] font-black px-1 py-0.2 rounded block uppercase tracking-wider w-fit mb-1 ${
              primaryPick.isCouncilTransformed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-teal-500/10 text-teal-400'
            }`}>
              {primaryPick.isCouncilTransformed ? '⚡ تحويل المجلس' : 'Primary Tip'}
            </span>
            <span className="text-[11.5px] font-black text-slate-100 block leading-tight truncate" title={MarketEvaluator.formatMarketNameAr(primaryPick.market)}>
              {MarketEvaluator.formatMarketNameAr(primaryPick.market)}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11.5px] shrink-0 font-extrabold pl-2 border-l border-slate-900/80 ml-2">
            <span className="text-teal-400 font-black text-xs">@{primaryPick.avg_odds ? primaryPick.avg_odds.toFixed(2) : "1.35"}</span>
            {settlement && (
              <span className="shrink-0">
                {settlement.primaryCorrect ? (
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1 py-0.1 rounded border border-emerald-900 font-black">✓</span>
                ) : (
                  <span className="bg-rose-950 text-rose-450 text-[10px] px-1 py-0.1 rounded border border-rose-900 font-black">✗</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Alternative Prediction Accent */}
        <div className="bg-slate-950/70 border border-amber-500/20 hover:border-amber-500/35 p-2 px-2.5 rounded-xl flex items-center justify-between transition-colors">
          <div className="min-w-0 flex-1">
            <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded block uppercase tracking-wider w-fit mb-1">
              Alternative
            </span>
            <span className="text-[11.5px] font-black text-slate-100 block leading-tight truncate" title={MarketEvaluator.formatMarketNameAr(altPick.market)}>
              {MarketEvaluator.formatMarketNameAr(altPick.market)}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11.5px] shrink-0 font-extrabold pl-2 border-l border-slate-900/80 ml-2">
            <span className="text-amber-400 font-black text-xs">@{altPick.avg_odds ? altPick.avg_odds.toFixed(2) : "1.30"}</span>
            {settlement && (
              <span className="shrink-0">
                {settlement.altCorrect ? (
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] px-1 py-0.1 rounded border border-emerald-900 font-black">✓</span>
                ) : (
                  <span className="bg-rose-950 text-rose-455 text-[10px] px-1 py-0.1 rounded border border-rose-900 font-black">✗</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Match AI Agent Council Voting Breakdown Modal */}
      <CouncilVotingModal
        verdict={councilVerdict}
        isOpen={showCouncilModal}
        onClose={() => setShowCouncilModal(false)}
      />
    </div>
  );
});

export default MatchCard;
