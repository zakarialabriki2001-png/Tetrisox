import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Target,
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  Star,
  Scale,
  Radio,
  History,
  Timer,
  Cpu,
  BarChart3,
  Award,
  Activity,
  Sliders,
  ShieldCheck,
  Network,
  Share2,
  GitMerge,
  Workflow,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Crosshair
} from 'lucide-react';
import { Match, OracleDatabase } from '../types';
import { DateTimeSystem } from '../lib/dateTimeSystem';
import { LEAGUE_MAP } from '../lib/matchEngine';
import {
  MetaStackingEngine,
  MetaStackingPick,
  StrictMetaAnalytics,
  SubsystemFormProfile
} from '../lib/metaStackingEngine';
import {
  ButterflyCrossLearningEngine,
  ButterflyNetworkState
} from '../lib/butterflyCrossLearningEngine';

interface MetaStackingDashboardProps {
  matchesList: Match[];
  db: OracleDatabase;
  selectedDate: string;
}

export const MetaStackingDashboard: React.FC<MetaStackingDashboardProps> = ({
  matchesList,
  db,
  selectedDate
}) => {
  const [activeDate, setActiveDate] = useState<string>(selectedDate);
  const [viewMode, setViewMode] = useState<'PICKS' | 'BUTTERFLY_NETWORK' | 'ANALYTICS_LEARNER' | 'WEIGHTS_MATRIX'>('PICKS');
  const [starFilter, setStarFilter] = useState<'ALL' | 'FIVE_STAR' | 'FOUR_STAR'>('ALL');
  const [timingFilter, setTimingFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPickId, setExpandedPickId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(30);

  // Self-Healing Simulation state
  const [simLog, setSimLog] = useState<string[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync if parent selectedDate changes
  useEffect(() => {
    if (selectedDate && selectedDate !== activeDate) {
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    setVisibleCount(30);
  }, [activeDate, viewMode, starFilter, timingFilter]);

  // Extract available dates from matchesList
  const availableDates = useMemo(() => {
    const datesMap = new Map<string, number>();
    matchesList.forEach((m) => {
      const time = m.__parsedTime || DateTimeSystem.parse(m.kickoff).getTime();
      const dStr = DateTimeSystem.toLocalDateString(new Date(time));
      datesMap.set(dStr, (datesMap.get(dStr) || 0) + 1);
    });

    return Array.from(datesMap.entries())
      .map(([dateStr, count]) => ({ dateStr, count }))
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [matchesList]);

  // Dynamic Subsystem Form & Weights (Stage 1 Moving Window)
  const subsystemWeights = useMemo(() => {
    return MetaStackingEngine.calculateDynamicDecayWeights(matchesList, db);
  }, [matchesList, db]);

  // Butterfly Effect Network State
  const butterflyNetwork: ButterflyNetworkState = useMemo(() => {
    return ButterflyCrossLearningEngine.evaluateButterflyNetwork(matchesList, db);
  }, [matchesList, db]);

  // Strict Performance & Auto-Learner Analytics
  const autoAnalytics: StrictMetaAnalytics = useMemo(() => {
    return MetaStackingEngine.calculateAutomatedAnalytics(matchesList, db);
  }, [matchesList, db]);

  // Filter matches for the active date
  const matchesOnActiveDate = useMemo(() => {
    return matchesList.filter((m) => {
      const time = m.__parsedTime || DateTimeSystem.parse(m.kickoff).getTime();
      const matchDateStr = DateTimeSystem.toLocalDateString(new Date(time));
      return matchDateStr === activeDate;
    });
  }, [matchesList, activeDate]);

  // Process matches into strict 4-Star and 5-Star picks
  const strictPicksOnDate = useMemo(() => {
    return MetaStackingEngine.getMetaPicks(matchesOnActiveDate, db, matchesList);
  }, [matchesOnActiveDate, db, matchesList]);

  // Filter by Star Rating and Temporal Status
  const filteredPicks = useMemo(() => {
    return strictPicksOnDate.filter(p => {
      // Star filter
      if (starFilter === 'FIVE_STAR' && p.starRating !== 5) return false;
      if (starFilter === 'FOUR_STAR' && p.starRating !== 4) return false;

      // Timing filter
      if (timingFilter === 'UPCOMING') return p.temporalStatus === 'UPCOMING';
      if (timingFilter === 'LIVE') return p.temporalStatus === 'LIVE';
      if (timingFilter === 'FINISHED') return p.temporalStatus === 'FINISHED';

      return true;
    });
  }, [strictPicksOnDate, starFilter, timingFilter]);

  // Counts
  const starCounts = useMemo(() => {
    const fiveStar = strictPicksOnDate.filter(p => p.starRating === 5).length;
    const fourStar = strictPicksOnDate.filter(p => p.starRating === 4).length;
    return {
      all: strictPicksOnDate.length,
      fiveStar,
      fourStar
    };
  }, [strictPicksOnDate]);

  const visiblePicks = useMemo(() => {
    return filteredPicks.slice(0, visibleCount);
  }, [filteredPicks, visibleCount]);

  const handleCopyPick = (pick: MetaStackingPick) => {
    const stars = '★'.repeat(pick.starRating);
    const text = `🧠 META-STACKING AI: ${pick.match.home} vs ${pick.match.away}\n🎯 Prediction: ${pick.marketTitleEn}\n⚡ Odds: @${pick.odds.toFixed(2)} | Meta-Probability: ${pick.metaProbability}%\n⭐ Rating: ${stars} (${pick.starRating}/5 Stars)\n📊 Consensus Index: ${pick.consensusIndex}%\n🛡️ Converging Systems: ${pick.supportingSubsystems.map(s => `${s.nameEn} (W=${s.subsystemWeight.toFixed(2)})`).join(' + ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(pick.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 text-slate-100 font-sans" dir="ltr">
      {/* --------------------------------------------------------------------- */}
      {/* HERO SECTION: Strict 4/5 Star Meta-Stacking AI Banner                 */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/90 border border-indigo-400/60 text-indigo-300 text-xs font-black tracking-wider uppercase shadow-md">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                META-STACKING AI • BUTTERFLY CASCADE NETWORK
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/70 text-amber-300 font-black">
                STRICT 4★ & 5★ FILTER ONLY
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-950/80 border border-purple-600/70 text-purple-300 font-bold flex items-center gap-1">
                <Workflow className="w-3 h-3 text-purple-400" />
                BUTTERFLY RIPPLE ACTIVE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Confidence-Weighted Stacking Meta-Learner</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
              Consolidates predictions across all platform engines (Signal V1, Ichara V2, Premium V1/V2, Tetrisro, Forebet). Features a Butterfly Effect Cross-System Cascade Network where analytical calibrations in one system positively ripple across adjacent engines to prevent errors.
            </p>
          </div>

          {/* Quick HUD Analytics Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-slate-950/90 border border-indigo-900/50 p-3.5 rounded-2xl shrink-0 shadow-inner">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Today's Picks</div>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                {starCounts.all}
              </div>
              <div className="text-[9.5px] text-amber-400/80 font-mono">4★ & 5★ Only</div>
            </div>

            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Butterfly Ripples</div>
              <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">
                {butterflyNetwork.activeRipples.length} Active
              </div>
              <div className="text-[9.5px] text-purple-300/80 font-mono">Cross-System Cascade</div>
            </div>

            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Errors Shielded</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                {butterflyNetwork.preventedErrorsCount}
              </div>
              <div className="text-[9.5px] text-emerald-400 font-mono font-bold">
                +{butterflyNetwork.overallAccuracyBoostPercent}% Alpha Boost
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Matchday:
          </span>
          {availableDates.slice(0, 14).map((dObj) => {
            const isSelected = dObj.dateStr === activeDate;
            return (
              <button
                key={dObj.dateStr}
                onClick={() => setActiveDate(dObj.dateStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-950/90 text-indigo-200 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{dObj.dateStr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  isSelected ? 'bg-indigo-900/60 text-indigo-300' : 'bg-slate-900 text-slate-500'
                }`}>
                  {dObj.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TABS CONTROLLER: Picks Queue vs Butterfly Network vs Auto-Learner    */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('PICKS')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
              viewMode === 'PICKS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top Picks Queue (4★ & 5★ Only)</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/70 text-amber-300 font-mono text-[11px] font-black">
              {starCounts.all}
            </span>
          </button>

          <button
            onClick={() => setViewMode('BUTTERFLY_NETWORK')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
              viewMode === 'BUTTERFLY_NETWORK'
                ? 'bg-purple-950/90 text-purple-200 border-purple-500 shadow-lg shadow-purple-950/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Workflow className="w-4 h-4 text-purple-400" />
            <span>Butterfly Effect Cascade Network</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/70 text-purple-300 font-mono text-[11px] font-black">
              {butterflyNetwork.activeRipples.length} Ripples
            </span>
          </button>

          <button
            onClick={() => setViewMode('ANALYTICS_LEARNER')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
              viewMode === 'ANALYTICS_LEARNER'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Strict Auto-Learner Analytics</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950/70 text-emerald-300 font-mono text-[11px] font-black">
              {autoAnalytics.hitRatePercent}%
            </span>
          </button>

          <button
            onClick={() => setViewMode('WEIGHTS_MATRIX')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
              viewMode === 'WEIGHTS_MATRIX'
                ? 'bg-slate-950 text-indigo-300 border-indigo-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Subsystem Weights Matrix (W_i)</span>
          </button>
        </div>

        {/* Sub-Filters for Picks View */}
        {viewMode === 'PICKS' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Star Filter Pill */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setStarFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  starFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({starCounts.all})
              </button>
              <button
                onClick={() => setStarFilter('FIVE_STAR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  starFilter === 'FIVE_STAR'
                    ? 'bg-indigo-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>5★ Diamond</span>
                <span className="text-[10px] opacity-90">({starCounts.fiveStar})</span>
              </button>
              <button
                onClick={() => setStarFilter('FOUR_STAR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  starFilter === 'FOUR_STAR'
                    ? 'bg-purple-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>4★ High Conviction</span>
                <span className="text-[10px] opacity-90">({starCounts.fourStar})</span>
              </button>
            </div>

            {/* Timing Filter Pill */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {(['ALL', 'UPCOMING', 'LIVE', 'FINISHED'] as const).map((tFilter) => (
                <button
                  key={tFilter}
                  onClick={() => setTimingFilter(tFilter)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    timingFilter === tFilter
                      ? 'bg-slate-800 text-white font-black border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tFilter === 'ALL' ? 'All' : tFilter === 'UPCOMING' ? 'Upcoming' : tFilter === 'LIVE' ? 'Live' : 'Finished'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 1: STRICT 4-STAR & 5-STAR TOP PICKS QUEUE                       */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'PICKS' && (
        <>
          {visiblePicks.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                No 4-Star or 5-Star Predictions Qualified for this Target Day
              </h3>
              <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                Strict meta-learner gatekeeper: Predictions below 76% meta-probability or with conflicting subsystem signals are automatically purged to guarantee high-accuracy output.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {visiblePicks.map((pick, idx) => {
                  const { match } = pick;
                  const isCopied = copiedId === pick.id;
                  const isExpanded = expandedPickId === pick.id;

                  return (
                    <div
                      key={pick.id}
                      className={`bg-slate-900/95 border-2 rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between relative overflow-hidden group ${
                        pick.starRating === 5
                          ? 'border-indigo-500/70 hover:border-indigo-400 shadow-indigo-950/20'
                          : 'border-purple-600/50 hover:border-purple-500 shadow-purple-950/20'
                      }`}
                    >
                      {/* Top Accent Strip */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          pick.starRating === 5
                            ? 'from-indigo-400 via-purple-300 to-pink-500 animate-pulse'
                            : 'from-purple-500 via-teal-400 to-emerald-400'
                        }`}
                      />

                      <div className="space-y-3.5">
                        {/* Header: Rank, League, Star Rating & Temporal Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs font-black flex items-center justify-center shadow-inner">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                              {match.league_code || 'LEAGUE'}
                            </span>
                            <span className="text-xs font-medium text-slate-400 truncate max-w-[120px] sm:max-w-[160px]">
                              {LEAGUE_MAP[match.league_code || ''] || match.league_code}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Star Rating Badge */}
                            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-black font-mono shadow-sm ${
                              pick.starRating === 5
                                ? 'bg-indigo-950 text-indigo-200 border-indigo-500'
                                : 'bg-purple-950 text-purple-200 border-purple-500'
                            }`}>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: pick.starRating }).map((_, sIdx) => (
                                  <Star key={sIdx} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {pick.starRating === 5 ? '5★ DIAMOND' : '4★ HIGH CONVICTION'}
                              </span>
                            </div>

                            {/* Temporal Status Badge */}
                            {pick.temporalStatus === 'FINISHED' ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                                <History className="w-3 h-3" /> Concluded
                              </span>
                            ) : pick.temporalStatus === 'LIVE' ? (
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1 animate-pulse">
                                <Radio className="w-3 h-3 text-emerald-400" /> Live
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-400" /> Upcoming
                              </span>
                            )}

                            <button
                              onClick={() => handleCopyPick(pick)}
                              title="Copy Pick"
                              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{match.kickoff ? match.kickoff.split(' ')[1] || match.kickoff : 'TBD'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Teams Matchup Box */}
                        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                          <div className="space-y-0.5 text-left flex-1">
                            <div className="font-black text-sm sm:text-base text-white tracking-wide truncate">{match.home}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              <span className="text-teal-400 font-bold">{match.p1}% Win</span>
                              <span className="text-slate-600 mx-1.5">•</span>
                              <span>xG: {match.xg_home ?? '1.4'}</span>
                            </div>
                          </div>

                          <div className="px-3 text-center">
                            {pick.actualScore ? (
                              <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                                pick.status === 'WON'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                  : 'bg-rose-950 text-rose-300 border-rose-600'
                              }`}>
                                {pick.status === 'WON' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                                {pick.actualScore}
                              </span>
                            ) : pick.temporalStatus === 'FINISHED' ? (
                              <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                FT (Concluded)
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                VS
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5 text-right flex-1">
                            <div className="font-black text-sm sm:text-base text-white tracking-wide truncate">{match.away}</div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-end">
                              <span>xG: {match.xg_away ?? '1.1'}</span>
                              <span className="text-slate-600 mx-1.5">•</span>
                              <span className="text-cyan-400 font-bold">{match.p2}% Win</span>
                            </div>
                          </div>
                        </div>

                        {/* Stacking Prediction Box */}
                        <div className="rounded-xl p-3.5 border bg-slate-950/90 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10.5px] font-mono font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1 bg-indigo-950/90 text-indigo-300 border border-indigo-700/60">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              META-STACKED TARGET PREDICTION
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-900 text-amber-300 border border-amber-900/40 px-2.5 py-0.5 rounded font-mono font-bold text-xs">
                                @{pick.odds.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-mono text-xs font-black">
                                <Zap className="w-3 h-3 text-emerald-400" />
                                {pick.metaProbability}% Meta-Prob
                              </div>
                            </div>
                          </div>

                          <div className="text-base font-black text-white tracking-wide">
                            {pick.marketTitleEn}
                          </div>

                          {/* Consensus and Dispersion Bar */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1 rounded-lg">
                              <span className="text-slate-400">Consensus Index:</span>
                              <strong className="text-emerald-400 font-bold">
                                {pick.consensusIndex}%
                              </strong>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1 rounded-lg">
                              <span className="text-slate-400">Expected Value:</span>
                              <strong className="text-teal-300 font-bold">
                                +{pick.expectedValue}% EV
                              </strong>
                            </div>
                          </div>

                          {/* Outlier Warning if any */}
                          {pick.outlierCount > 0 && (
                            <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-2 text-[10.5px] font-mono text-amber-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>
                                Outlier Filter: {pick.outliersDetected.join(', ')} downweighted (0.35x) to safeguard accuracy.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expandable Inspection Breakdown */}
                        <div>
                          <button
                            onClick={() => setExpandedPickId(isExpanded ? null : pick.id)}
                            className="w-full text-left py-1 text-[11px] font-mono font-bold text-indigo-300 hover:text-indigo-200 flex items-center justify-between cursor-pointer"
                          >
                            <span>
                              {isExpanded ? 'Hide Subsystem Inputs ▲' : 'Inspect Supporting Subsystems & Dynamic Weights (W_i) ▼'}
                            </span>
                            <span className="text-slate-500">{pick.allSubsystemInputs.length} Systems Analyzed</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-800/80">
                              {pick.allSubsystemInputs.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className={`p-2 rounded-lg text-[10.5px] font-mono flex items-center justify-between border ${
                                    sub.isOutlier
                                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                                      : sub.market === pick.market
                                      ? 'bg-slate-950 border-emerald-900/40 text-emerald-300'
                                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{sub.nameEn}:</span>
                                    <span>{sub.marketTitleEn}</span>
                                    {sub.isOutlier && (
                                      <span className="px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200 text-[9px] font-bold">
                                        Outlier Downweighted (0.35x)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>Prob: {(sub.probability * 100).toFixed(0)}%</span>
                                    <span className="text-indigo-400 font-bold">W={sub.subsystemWeight.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Status */}
                      <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                        <span>Market Category: {pick.marketCategory}</span>
                        {pick.status === 'WON' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Won
                          </span>
                        )}
                        {pick.status === 'LOST' && (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Missed
                          </span>
                        )}
                        {pick.status === 'PENDING' && pick.temporalStatus === 'FINISHED' && (
                          <span className="text-slate-400">Finished (Concluded)</span>
                        )}
                        {pick.status === 'PENDING' && pick.temporalStatus === 'LIVE' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Radio className="w-3 h-3 animate-pulse" /> Live Now
                          </span>
                        )}
                        {pick.status === 'PENDING' && pick.temporalStatus === 'UPCOMING' && (
                          <span className="text-sky-400/90">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredPicks.length && (
                <div className="pt-3 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 30)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Load More Predictions ({filteredPicks.length - visibleCount} remaining)</span>
                    <ChevronDown className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 2: BUTTERFLY EFFECT CROSS-SYSTEM CASCADE NETWORK (4-PHASES)     */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'BUTTERFLY_NETWORK' && (
        <div className="space-y-6">
          <div className="bg-slate-900/95 border border-purple-500/50 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-400" />
                <span>Inter-System Butterfly Effect Cascade Network (4-Phase Operational Architecture)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSimulating(true);
                    const sim = ButterflyCrossLearningEngine.simulate4PhaseHealingCascade('SIGNAL_V1');
                    setSimLog(sim.simulationLogEn);
                    setTimeout(() => setIsSimulating(false), 800);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-xs font-bold hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>Simulate 4-Phase Self-Healing Cascade</span>
                </button>
                <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-700/80 font-bold">
                  Last Cascade Audit: {butterflyNetwork.lastCascadeTimestamp}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Complete 4-Phase Butterfly Architecture: Phase 1 Error Dissector Engine $\rightarrow$ Phase 2 Cross-Propagation Grid $\rightarrow$ Phase 3 Butterfly Dynamic Adjuster $\rightarrow$ Phase 4 Meta-Feedback Loop & Nash Equilibrium.
            </p>

            {/* Self-Healing Terminal Output */}
            {simLog && (
              <div className="mt-3 bg-slate-950 border border-purple-800/80 rounded-xl p-3.5 font-mono text-xs space-y-1 text-purple-200 animate-fadeIn">
                <div className="text-[10px] font-bold uppercase text-purple-400 tracking-wider mb-2 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  REAL-TIME 4-PHASE SELF-HEALING CASCADE LOG
                </div>
                {simLog.map((line, lIdx) => (
                  <div key={lIdx} className="text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span> {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PHASE 1: Error Dissector Engine Panel */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <span>Phase 1: Error Dissector Engine (محرك تشريح الأخطاء واستخراج النواة)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {butterflyNetwork.dissectedErrors.slice(0, 4).map((err, eIdx) => (
                <div key={eIdx} className="bg-slate-950/90 border border-rose-900/50 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      TAXONOMY: {err.errorTaxonomy}
                    </span>
                    <span className="text-slate-400 text-[10px]">Delta: Δ = {err.errorDelta}</span>
                  </div>
                  <div className="font-bold text-white text-xs">{err.taxonomyReasonAr}</div>
                  <p className="text-[11px] text-slate-400 leading-snug">{err.taxonomyReasonEn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PHASE 2: Cross-Propagation Grid Panel */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Phase 2: Cross-Propagation Grid (شبكة التمرير التشاركي للأخطاء)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {butterflyNetwork.activeRipples.map((ripple, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-slate-900/90 border border-purple-800/60 rounded-2xl p-4.5 space-y-3 relative overflow-hidden shadow-md hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                      {ripple.rippleType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ripple.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                    <span className="font-bold text-amber-300">{ripple.sourceSystemNameEn}</span>
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-bold text-emerald-400">{ripple.targetSystems.join(' & ')}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono">
                    {ripple.positiveImpactDescriptionEn}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Trigger: {ripple.triggerReasonEn}</span>
                    <span className="text-purple-300 font-bold">Delta: {ripple.calibrationDelta > 0 ? `+${ripple.calibrationDelta}` : ripple.calibrationDelta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHASE 3: Butterfly Dynamic Adjuster & Elasticity Index Panel */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Phase 3: Butterfly Dynamic Adjuster (موازن أثر الفراشة الديناميكي)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(butterflyNetwork.systemProfiles).map((sys) => (
                <div
                  key={sys.systemId}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-indigo-500/60 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                      {sys.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      {sys.errorPreventionRatePercent}% Error Shield
                    </span>
                  </div>

                  <div>
                    <h5 className="text-base font-black text-white">{sys.nameEn}</h5>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-snug">
                      {sys.natureDescriptionEn}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Elasticity Index (E_i):</span>
                      <span className="text-amber-300 font-bold">E = {sys.elasticityIndex.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Micro-Weight Tuning:</span>
                      <span className="text-emerald-400 font-bold">+{sys.microWeightTuningFactor}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHASE 4: Meta-Feedback Loop & Nash Equilibrium Panel */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Phase 4: Meta-Feedback Loop & Nash Equilibrium (حلقة التغذية الراجعة والتقييم الذاتي)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {butterflyNetwork.structuralMemoryLog.map((mem) => (
                <div key={mem.id} className="bg-slate-950/90 border border-emerald-900/60 p-3.5 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span className="text-emerald-400">{mem.id}</span>
                    <span className="text-[10px] text-slate-500">{mem.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-200 font-bold">{mem.triggerEvent}</div>
                  <p className="text-[10.5px] text-slate-400 leading-tight">{mem.actionExecuted}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-500">Acc: {mem.systemAccuracyBefore}% → <strong className="text-emerald-300">{mem.systemAccuracyAfter}%</strong></span>
                    <span className="text-teal-300 font-bold">Nash Equilibrium ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 3: STRICT AUTOMATED META-LEARNER PERFORMANCE ANALYTICS          */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'ANALYTICS_LEARNER' && (
        <div className="space-y-6">
          <div className="bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Strict Automated Meta-Learner System Analytics</span>
              </h3>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-700/80 font-bold">
                Last Auto-Recalibration: {autoAnalytics.lastAutoLearnerRecalibrationTime}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Automated strict backtesting engine verifying all 4-Star & 5-Star predictions across settled historical database records. Flat 1-unit stake calculation with dynamic loss penalty weighting.
            </p>
          </div>

          {/* Performance KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Settled Predictions</span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{autoAnalytics.totalSettledPicks}</span>
              <span className="text-[10px] text-emerald-400 font-mono block">{autoAnalytics.wonCount} Wins / {autoAnalytics.lostCount} Losses</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Overall Hit Rate</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{autoAnalytics.hitRatePercent}%</span>
              <span className="text-[10px] text-slate-400 font-mono block">Average Odds: @{autoAnalytics.avgOdds.toFixed(2)}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Net Units Gain</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">+{autoAnalytics.netUnitsGain} u</span>
              <span className="text-[10px] text-teal-300 font-mono block">ROI: +{autoAnalytics.roiPercent}%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Max Win Streak</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{autoAnalytics.maxWinStreak} Games</span>
              <span className="text-[10px] text-amber-400/80 font-mono block">Current Streak: {autoAnalytics.currentWinStreak}</span>
            </div>
          </div>

          {/* Star Breakdown & Drawdown Shield Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Accuracy Breakdown by Star Tier</span>
              </h4>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-indigo-900/60 font-mono text-xs">
                  <span className="font-bold text-indigo-300">5★ Diamond Secure (≥ 80% Meta-Prob)</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm block">{autoAnalytics.fiveStarHitRate}% Hit Rate</span>
                    <span className="text-[10px] text-slate-400">({autoAnalytics.fiveStarWins} Wins / {autoAnalytics.fiveStarTotal} Settled)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-purple-900/60 font-mono text-xs">
                  <span className="font-bold text-purple-300">4★ High Conviction (≥ 74% Meta-Prob)</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm block">{autoAnalytics.fourStarHitRate}% Hit Rate</span>
                    <span className="text-[10px] text-slate-400">({autoAnalytics.fourStarWins} Wins / {autoAnalytics.fourStarTotal} Settled)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict Auto-Learner Rules & Drawdown Shield</span>
              </h4>
              <ul className="space-y-2 text-xs font-mono text-slate-300 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Strict Punitive Decay: Subsystems with 2 consecutive losses receive automatic 0.85x weight penalty.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Drawdown Protection Index: {autoAnalytics.drawdownProtectionPercent}% stability.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Only top-tier 4★ & 5★ predictions are allowed to pass to the user.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW 4: DYNAMIC WEIGHTS & MOVING WINDOW MATRIX (Stage 1 Inspection)  */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'WEIGHTS_MATRIX' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>Stage 1: Moving Window & Dynamic Decay Weighting Matrix (W_i)</span>
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Every subsystem is continuously audited against its last 30 completed games. Predictions in games 1-10 carry 1.6x weight, games 11-20 carry 1.0x weight, and games 21-30 carry 0.5x weight. The dynamic weight W_i directly scales the system's influence in the Stacking Model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(subsystemWeights).map((profile) => (
              <div
                key={profile.id}
                className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-lg hover:border-indigo-600/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                    {profile.badge}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                    profile.momentumTrend === 'UP'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : profile.momentumTrend === 'DOWN'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-slate-950 text-slate-400 border border-slate-700'
                  }`}>
                    {profile.momentumTrend === 'UP' ? '▲ Upward Momentum' : profile.momentumTrend === 'DOWN' ? '▼ Downward' : '• Stable Form'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">{profile.nameEn}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Moving Window:</span>
                    <strong className="text-slate-200">Last {profile.sampleSize} Games</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Dynamic Weight (W_i):</span>
                    <strong className="text-indigo-400 text-sm">W = {profile.dynamicWeight.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Recent 10 Acc:</span>
                    <strong className="text-emerald-400">{profile.recent10Accuracy}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Decay Weighted Acc:</span>
                    <strong className="text-teal-300">{profile.decayWeightedAccuracy}%</strong>
                  </div>
                </div>

                {profile.strictPenaltyApplied && (
                  <div className="text-[10.5px] font-mono text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60 font-bold">
                    ⚠️ Strict Auto-Learner Penalty Applied (-15% weight due to recent loss streak)
                  </div>
                )}

                <p className="text-[11px] font-mono text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                  {profile.statusNoteEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
