import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check,
  Zap,
  ChevronDown,
  Calendar,
  Radio,
  History,
  Timer
} from 'lucide-react';
import { Match, OracleDatabase } from '../types';
import { DateTimeSystem } from '../lib/dateTimeSystem';
import { LEAGUE_MAP } from '../lib/matchEngine';
import { 
  SniperConsensusEngine, 
  SniperConsensusPick 
} from '../lib/sniperConsensusEngine';

interface ConsensusDashboardProps {
  matchesList: Match[];
  db: OracleDatabase;
  selectedDate: string;
}

export const ConsensusDashboard: React.FC<ConsensusDashboardProps> = ({ 
  matchesList, 
  db,
  selectedDate
}) => {
  const [activeDate, setActiveDate] = useState<string>(selectedDate);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(30);
  
  // Timing Filter State: ALL vs UPCOMING vs LIVE vs FINISHED (Automatic Temporal Classification)
  const [timingFilter, setTimingFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');

  // Sync if parent selectedDate changes
  useEffect(() => {
    if (selectedDate && selectedDate !== activeDate) {
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    setVisibleCount(30);
  }, [activeDate, timingFilter]);

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

  // Filter matches belonging to the active date
  const matchesOnActiveDate = useMemo(() => {
    return matchesList.filter((m) => {
      const time = m.__parsedTime || DateTimeSystem.parse(m.kickoff).getTime();
      const matchDateStr = DateTimeSystem.toLocalDateString(new Date(time));
      return matchDateStr === activeDate;
    });
  }, [matchesList, activeDate]);

  // Evaluate Sniper Consensus Picks for Active Date automatically
  const snipedPicksOnDate = useMemo(() => {
    return SniperConsensusEngine.getSniperPicks(matchesOnActiveDate, db, matchesList);
  }, [matchesOnActiveDate, db, matchesList]);

  // Filter sniped picks based on temporal status (Upcoming vs Live vs Finished)
  const filteredPicks = useMemo(() => {
    const now = Date.now();
    return snipedPicksOnDate.filter((pick) => {
      const isFinished = DateTimeSystem.isMatchFinished(pick.match, now);
      const isLive = DateTimeSystem.isMatchLive(pick.match, now);
      const isUpcoming = DateTimeSystem.isMatchUpcoming(pick.match, now);

      if (timingFilter === 'UPCOMING') return isUpcoming;
      if (timingFilter === 'LIVE') return isLive;
      if (timingFilter === 'FINISHED') return isFinished;
      return true;
    });
  }, [snipedPicksOnDate, timingFilter]);

  // Counts by temporal category
  const temporalCounts = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let live = 0;
    let finished = 0;

    snipedPicksOnDate.forEach((pick) => {
      if (DateTimeSystem.isMatchFinished(pick.match, now)) finished++;
      else if (DateTimeSystem.isMatchLive(pick.match, now)) live++;
      else upcoming++;
    });

    return {
      all: snipedPicksOnDate.length,
      upcoming,
      live,
      finished
    };
  }, [snipedPicksOnDate]);

  // Dynamic statistics computed strictly from genuine database matches
  const dynamicStats = useMemo(() => {
    const finishedMatches = matchesList.filter(
      (m) => DateTimeSystem.isMatchFinished(m)
    ).slice(0, 300);

    const snipedFinished = SniperConsensusEngine.getSniperPicks(finishedMatches, db, matchesList);
    const resolved = snipedFinished.filter((p) => p.status === 'WON' || p.status === 'LOST');
    const wonCount = resolved.filter((p) => p.status === 'WON').length;
    const winRate = resolved.length > 0 ? (wonCount / resolved.length) * 100 : 0;

    const validPicks = (snipedPicksOnDate || []).filter(p => p && typeof p.odds === 'number');
    const avgOdds = validPicks.length > 0
      ? validPicks.reduce((acc, p) => acc + (p?.odds || 0), 0) / validPicks.length
      : 0;

    return {
      resolvedCount: resolved.length,
      wonCount,
      winRate: Math.round(winRate * 10) / 10,
      totalToday: snipedPicksOnDate.length,
      avgOdds: Math.round(avgOdds * 100) / 100
    };
  }, [matchesList, db, snipedPicksOnDate]);

  const visiblePicks = useMemo(() => {
    return filteredPicks.slice(0, visibleCount);
  }, [filteredPicks, visibleCount]);

  const handleCopyPick = (pick: SniperConsensusPick) => {
    const text = `🎯 ELITE SNIPER: ${pick.match.home} vs ${pick.match.away}\n📊 Prediction: ${pick.marketTitleEn}\n⚡ Odds: @${pick.odds.toFixed(2)} | Confidence: ${pick.consensusScore}%\n🛡️ Systems: ${pick.supportingEngines.map(e => e.nameEn).join(' + ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(pick.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-5 text-slate-100 font-sans" dir="ltr">
      {/* Streamlined Top Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-600/70 text-amber-300 text-xs font-black tracking-wider uppercase">
                <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ELITE SNIPER
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-bold">
                AUTO-CONVERGENCE (QUORUM ≥ 2)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-600/70 text-cyan-300 font-bold">
                TEMPORAL AUTO-AUDIT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Elite Sniper Consensus Engine
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl font-mono leading-relaxed">
              Strict multi-system mathematical consensus. Matches auto-conclude into Finished archive after 115 minutes from kickoff to prevent clutter.
            </p>
          </div>

          {/* Clean Dynamic Metrics HUD */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Picks Today</div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {dynamicStats.totalToday}
              </div>
            </div>

            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Avg Odds</div>
              <div className="text-base sm:text-lg font-black text-teal-400 font-mono">
                {dynamicStats.avgOdds > 0 ? `@${dynamicStats.avgOdds.toFixed(2)}` : '--'}
              </div>
            </div>

            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Settled Win Rate</div>
              <div className="text-base sm:text-lg font-black font-mono">
                {dynamicStats.resolvedCount > 0 ? (
                  <span className="text-emerald-400">{dynamicStats.winRate}%</span>
                ) : (
                  <span className="text-slate-500 font-normal text-xs">Tracking</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
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
                    ? 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{dObj.dateStr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  isSelected ? 'bg-amber-900/60 text-amber-300' : 'bg-slate-900 text-slate-500'
                }`}>
                  {dObj.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Temporal Tabs Row (Upcoming vs Live vs Finished Auto-Audit) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimingFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timingFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All Picks</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${timingFilter === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {temporalCounts.all}
              </span>
            </button>

            <button
              onClick={() => setTimingFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timingFilter === 'UPCOMING'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Upcoming</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${timingFilter === 'UPCOMING' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {temporalCounts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setTimingFilter('LIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timingFilter === 'LIVE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>In-Play (Live)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${timingFilter === 'LIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {temporalCounts.live}
              </span>
            </button>

            <button
              onClick={() => setTimingFilter('FINISHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timingFilter === 'FINISHED'
                  ? 'bg-purple-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3 h-3" />
              <span>Finished (Concluded)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${timingFilter === 'FINISHED' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {temporalCounts.finished}
              </span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>Time-Concluded Rule: Auto-migrates to Finished at Kickoff + 115m</span>
          </div>
        </div>
      </div>

      {/* Main List of Predictions */}
      {filteredPicks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            {timingFilter === 'UPCOMING'
              ? 'No Upcoming Sniper Picks for this date'
              : timingFilter === 'FINISHED'
              ? 'No Concluded Sniper Picks yet'
              : timingFilter === 'LIVE'
              ? 'No Active In-Play Matches right now'
              : 'No Sniper Picks Found For This Matchday'}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Requires at least 2 parent systems to agree unanimously with odds ≥ 1.30.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visiblePicks.map((pick, idx) => {
              const { match } = pick;
              const isCopied = copiedId === pick.id;

              const isFinished = DateTimeSystem.isMatchFinished(match);
              const isLive = DateTimeSystem.isMatchLive(match);
              const isUpcoming = DateTimeSystem.isMatchUpcoming(match);

              return (
                <div
                  key={pick.id}
                  className={`bg-slate-900/95 border rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between relative overflow-hidden group ${
                    isFinished
                      ? 'border-slate-800/70 opacity-90'
                      : isLive
                      ? 'border-emerald-700/80 shadow-emerald-950/20'
                      : 'border-slate-800 hover:border-amber-700/60'
                  }`}
                >
                  {/* Glowing Top Accent Border by Tier & Temporal State */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      isLive
                        ? 'from-emerald-400 via-teal-300 to-green-500 animate-pulse'
                        : isFinished
                        ? 'from-slate-600 via-slate-500 to-slate-700'
                        : pick.tier === 'DIAMOND'
                        ? 'from-cyan-400 via-sky-300 to-indigo-500'
                        : pick.tier === 'GOLD'
                        ? 'from-amber-400 via-yellow-300 to-orange-500'
                        : 'from-emerald-400 via-teal-300 to-cyan-500'
                    }`}
                  />

                  <div className="space-y-3.5">
                    {/* Header: Rank, League, Kickoff, Status & Copy */}
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
                        {/* Temporal Status Badge */}
                        {isFinished ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                            <History className="w-3 h-3 text-slate-400" /> Finished
                          </span>
                        ) : isLive ? (
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

                        <span
                          className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 border ${
                            pick.tier === 'DIAMOND'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                              : pick.tier === 'GOLD'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          }`}
                        >
                          {pick.tier === 'DIAMOND' ? '💎 DIAMOND' : pick.tier === 'GOLD' ? '🥇 GOLD' : '🎯 TACTICAL'}
                        </span>

                        <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{match.kickoff ? match.kickoff.split(' ')[1] || match.kickoff : 'TBD'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Teams Row */}
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
                        ) : isFinished ? (
                          <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                            FT (Time-Concluded)
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

                    {/* Main Prediction Box */}
                    <div className="rounded-xl p-3.5 border bg-slate-950/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-mono font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1 bg-amber-950/80 text-amber-300 border border-amber-700/60">
                          <Target className="w-3 h-3 text-amber-400" />
                          SNIPED TARGET PREDICTION
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-900 text-amber-300 border border-amber-900/40 px-2.5 py-0.5 rounded font-mono font-bold text-xs">
                            @{pick.odds.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-mono text-xs font-black">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            {pick.consensusScore}% Score
                          </div>
                        </div>
                      </div>

                      <div className="text-base font-black text-white tracking-wide">
                        {pick.marketTitleEn}
                      </div>

                      {/* Supporting Engines Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400">Engines:</span>
                        {pick.supportingEngines.map((e, eIdx) => (
                          <span
                            key={eIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10.5px] font-mono border border-slate-800 font-bold"
                          >
                            {e.nameEn} ({e.confidence}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Status */}
                  <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                    <span>Market: {pick.market}</span>
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
                    {pick.status === 'PENDING' && isFinished && (
                      <span className="text-slate-400">Finished (Concluded)</span>
                    )}
                    {pick.status === 'PENDING' && isLive && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse" /> Live Now
                      </span>
                    )}
                    {pick.status === 'PENDING' && isUpcoming && (
                      <span className="text-sky-400/90">Upcoming</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button if needed */}
          {visibleCount < filteredPicks.length && (
            <div className="pt-3 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 30)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Load More Picks ({filteredPicks.length - visibleCount} remaining)</span>
                <ChevronDown className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
