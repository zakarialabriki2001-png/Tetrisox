import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  TrendingUp,
  Calculator,
  RefreshCw,
  CheckCircle2,
  Flag,
  Target,
  ArrowRight,
  Sliders,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';
import { Match } from '../types';
import { CornersEngine, CardsCornersAnalysis } from '../lib/cardsCornersEngine';
import { LEAGUE_MAP } from '../lib/matchEngine';
import { DateTimeSystem } from '../lib/dateTimeSystem';

interface CardsCornersDashboardProps {
  matchesList: Match[];
  selectedCalendarDate: string;
  setSelectedCalendarDate: (d: string) => void;
  availableMatchDateObjects: { dateStr: string; count: number }[];
}

export const CardsCornersDashboard = ({
  matchesList,
  selectedCalendarDate,
  setSelectedCalendarDate,
  availableMatchDateObjects,
}: CardsCornersDashboardProps) => {
  const [subTab, setSubTab] = useState<'elite' | 'lab' | 'rules'>('elite');
  const [searchQuery, setSearchQuery] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'OVER_7_5' | 'OVER_8_5'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'FINISHED'>('ALL');
  const [tier1Only, setTier1Only] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Custom Simulator Parameters for Lab
  const [simHomeXg, setSimHomeXg] = useState<number>(1.85);
  const [simAwayXg, setSimAwayXg] = useState<number>(1.20);
  const [simHomeProb, setSimHomeProb] = useState<number>(55);
  const [simHomeAvgCorners, setSimHomeAvgCorners] = useState<number>(5.5);
  const [simAwayAvgCorners, setSimAwayAvgCorners] = useState<number>(4.2);

  // Filter matches based on selected date
  const matchesOnSelectedDate = useMemo(() => {
    return matchesList.filter((m: Match) => {
      const matchTime = DateTimeSystem.parse(m.kickoff).getTime();
      const matchDateStr = DateTimeSystem.toLocalDateString(new Date(matchTime));
      return matchDateStr === selectedCalendarDate;
    });
  }, [matchesList, selectedCalendarDate]);

  // Daily Elite Corner Picks
  const dailyElitePicks = useMemo(() => {
    return CornersEngine.getDailyElitePicks(matchesOnSelectedDate, 30, { tier1AndCupsOnly: tier1Only });
  }, [matchesOnSelectedDate, tier1Only]);

  // Filtered selections
  const filteredElitePicks = useMemo(() => {
    return dailyElitePicks.filter((p: any) => {
      const m = p.match;
      
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = m.home.toLowerCase().includes(searchLower) || m.away.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;

      // League
      if (leagueFilter !== 'ALL' && m.league_code !== leagueFilter) return false;

      // Market
      if (marketFilter === 'OVER_7_5' && p.primarySelection.badge !== '+7.5 ركنيات') return false;
      if (marketFilter === 'OVER_8_5' && p.primarySelection.badge !== '+8.5 ركنيات') return false;

      // Status
      const isFinished = DateTimeSystem.isMatchFinished(m);
      const isLive = DateTimeSystem.isMatchLive(m);
      if (statusFilter === 'UPCOMING' && (isFinished || isLive)) return false;
      if (statusFilter === 'LIVE' && !isLive) return false;
      if (statusFilter === 'FINISHED' && !isFinished) return false;

      return true;
    });
  }, [dailyElitePicks, searchQuery, leagueFilter, marketFilter, statusFilter]);

  const distinctLeagues = useMemo(() => {
    const codes = new Set<string>();
    matchesOnSelectedDate.forEach((m: Match) => {
      if (m.league_code) codes.add(m.league_code);
    });
    return Array.from(codes);
  }, [matchesOnSelectedDate]);

  // Simulator calculation
  const simAnalysis = useMemo(() => {
    const dummyMatch: Match = {
      id: 'sim_match',
      home: 'الفريق المستضيف (المحاكاة)',
      away: 'الفريق الضيف (المحاكاة)',
      kickoff: new Date().toISOString(),
      league_code: 'UCL',
      league_name: 'Champions League',
      xg_home: simHomeXg,
      xg_away: simAwayXg,
      p1: simHomeProb,
      px: 25,
      p2: 100 - simHomeProb - 25,
      avg_corners_home: simHomeAvgCorners,
      avg_corners_away: simAwayAvgCorners
    };
    return CornersEngine.analyzeMatch(dummyMatch);
  }, [simHomeXg, simAwayXg, simHomeProb, simHomeAvgCorners, simAwayAvgCorners]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl border border-blue-500/20 p-6 md:p-8 custom-glow-blue">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/20 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">نظام تحليل الركنيات المتكامل V4.8</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              نظام الركنيات <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">الذكي الصارم</span>
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm leading-relaxed">
              تحليل تكتيكي عميق للركنيات يتخطى عامل العشوائية، بالاعتماد على خوارزمية بواسون (Poisson Distribution)، معدلات التحويل، وضغط هجمات الأجنحة الفعال.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <button
              onClick={() => setSubTab('elite')}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border text-sm ${
                subTab === 'elite'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              قائمة النخبة اليومية
            </button>
            <button
              onClick={() => setSubTab('lab')}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border text-sm ${
                subTab === 'lab'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              مختبر المحاكاة التفاعلي
            </button>
            <button
              onClick={() => setSubTab('rules')}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border text-sm ${
                subTab === 'rules'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              شروط وقواعد النظام
            </button>
          </div>
        </div>
      </div>

      {subTab === 'elite' && (
        <div className="space-y-6">
          {/* Calendar Picker Strip */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">حدد تاريخ التوقعات</h3>
                <p className="text-xs text-slate-400">استعرض التوقعات طبقاً للأيام المتوفرة في قاعدة البيانات</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {availableMatchDateObjects.map((d: any) => (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedCalendarDate(d.dateStr)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedCalendarDate === d.dateStr
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{d.dateStr === '2026-10-04' ? 'اليوم' : d.dateStr === '2026-10-03' ? 'الأمس' : 'غداً'}</span>
                  <span className="text-[10px] opacity-75">{d.dateStr}</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded-full text-[10px]">{d.count} مباريات</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن فريق معين..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pr-10 pl-4 text-xs font-medium text-slate-100 outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-200 outline-none border-none cursor-pointer"
              >
                <option value="ALL">جميع الدوريات</option>
                {distinctLeagues.map(code => (
                  <option key={code} value={code}>{LEAGUE_MAP[code] || code}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <Compass className="w-4 h-4 text-slate-400" />
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value as any)}
                className="w-full bg-transparent text-xs font-bold text-slate-200 outline-none border-none cursor-pointer"
              >
                <option value="ALL">جميع خطوط الركنيات</option>
                <option value="OVER_7_5">خط +7.5 ركنيات</option>
                <option value="OVER_8_5">خط +8.5 ركنيات</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">الدرجة الأولى والكؤوس</span>
              </div>
              <input
                type="checkbox"
                checked={tier1Only}
                onChange={(e) => setTier1Only(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Matches List */}
          {filteredElitePicks.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 p-12 rounded-3xl text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-blue-400 mx-auto opacity-70 animate-bounce" />
              <h3 className="font-bold text-slate-100 text-lg">لم نعثر على أي توقعات مطابقة</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                حاول تعديل فلاتر البحث أو حدد تاريخاً آخراً يضم مباريات في الدوريات الكبرى المؤهلة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredElitePicks.map((analysis) => {
                const isExpanded = expandedId === analysis.match.id;
                const m = analysis.match;
                const sel = analysis.primarySelection;

                return (
                  <div
                    key={m.id}
                    className="bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    {/* Header bar */}
                    <div className="bg-slate-950/80 px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-extrabold text-blue-300">{analysis.leagueFullName}</span>
                      </div>
                      
                      {/* Live status */}
                      {DateTimeSystem.isMatchLive(m) ? (
                        <span className="bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5">
                          <span>• مباشر</span>
                          <span>{m.minute || 0}'</span>
                        </span>
                      ) : DateTimeSystem.isMatchFinished(m) ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 rounded-full">
                          انتهت
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-medium">
                          {DateTimeSystem.formatTime(DateTimeSystem.parse(m.kickoff))}
                        </span>
                      )}
                    </div>

                    {/* Match block */}
                    <div className="p-4 md:p-5 space-y-4">
                      {/* Teams and score */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-right">
                          <h4 className="font-extrabold text-sm md:text-base text-white">{m.home}</h4>
                          <p className="text-[10px] text-slate-400">مستضيف • xG {m.xg_home.toFixed(2)}</p>
                        </div>
                        
                        <div className="px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-w-[70px]">
                          {DateTimeSystem.isMatchFinished(m) || DateTimeSystem.isMatchLive(m) ? (
                            <span className="font-black text-white text-base">
                              {m.live_home_goals !== undefined ? m.live_home_goals : m.ft_home} - {m.live_away_goals !== undefined ? m.live_away_goals : m.ft_away}
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-slate-400">VS</span>
                          )}
                          <span className="text-[9px] font-bold text-blue-400 mt-1">
                            {DateTimeSystem.isMatchLive(m) || DateTimeSystem.isMatchFinished(m) 
                              ? `ركنيات: ${m.live_corners_home || 0}-${m.live_corners_away || 0}`
                              : 'بانتظار الركنيات'
                            }
                          </span>
                        </div>

                        <div className="flex-1 text-left">
                          <h4 className="font-extrabold text-sm md:text-base text-white">{m.away}</h4>
                          <p className="text-[10px] text-slate-400">ضيف • xG {m.xg_away.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Prediction Widget */}
                      <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block">التوقع الموصى به</span>
                          <span className="text-sm font-black text-slate-100">{sel.marketNameAr}</span>
                        </div>
                        <div className="text-left">
                          <span className="inline-block bg-blue-500 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg">
                            ثقة {sel.confidenceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Brief reasoning and fair odds */}
                      <div className="flex items-center justify-between text-xs border-t border-slate-800/50 pt-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Zap className="w-4 h-4 text-blue-400" />
                          <span>{sel.keyMetricValue}</span>
                        </div>
                        <div className="text-slate-300 font-bold">
                          الأودد العادل: <span className="text-blue-400">{sel.projectedOdds.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Expandable detailed statistics */}
                      {isExpanded && (
                        <div className="space-y-4 pt-3 border-t border-slate-800/80 animate-fadeIn">
                          {/* Tactical dynamics */}
                          <div className="p-3 bg-slate-950/70 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">نمط سير اللقاء المتوقع:</span>
                              <span className="font-bold text-blue-300">{analysis.cornersProfile.cornerDynamicsLabelAr}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">إيقاع صناعة العرضيات:</span>
                              <span className="font-bold text-blue-300">{analysis.cornersProfile.flankActivityLabelAr}</span>
                            </div>
                          </div>

                          {/* Poisson chart */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">التوزيع الاحتمالي للركنيات (بواسون):</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {analysis.poissonCorners.map((p, i) => (
                                <div key={i} className="bg-slate-950 p-2 rounded-lg text-center border border-slate-800/60">
                                  <span className="text-[10px] text-slate-400 block mb-1">{p.rangeAr}</span>
                                  <span className="text-xs font-extrabold text-blue-400">{p.prob}%</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Individual team expectancy */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-center">
                              <span className="text-[11px] text-slate-400 block mb-1">ركنيات {m.home}</span>
                              <span className="text-sm font-black text-white">{analysis.cornersProfile.lambdaCornersHome.toFixed(1)}</span>
                              <p className="text-[9px] text-slate-500 mt-1">{analysis.cornersProfile.total1.bracket}</p>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-center">
                              <span className="text-[11px] text-slate-400 block mb-1">ركنيات {m.away}</span>
                              <span className="text-sm font-black text-white">{analysis.cornersProfile.lambdaCornersAway.toFixed(1)}</span>
                              <p className="text-[9px] text-slate-500 mt-1">{analysis.cornersProfile.total2.bracket}</p>
                            </div>
                          </div>

                          {/* Algorithmic reasoning */}
                          <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl">
                            <span className="text-[10px] font-bold text-blue-400 block mb-1">شرح الخوارزمية المضادة للعشوائية:</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{sel.reasoningAr}</p>
                          </div>
                        </div>
                      )}

                      {/* Expand / collapse button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white py-1 transition-all"
                      >
                        <span>{isExpanded ? 'عرض تفاصيل أقل' : 'عرض تفاصيل التحليل العميق'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-slate-100 text-sm">مؤشرات ومعاملات اللقاء</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">معدل الأهداف المتوقع للمستضيف (Home xG): {simHomeXg}</label>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={simHomeXg}
                  onChange={(e) => setSimHomeXg(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">معدل الأهداف المتوقع للضيف (Away xG): {simAwayXg}</label>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={simAwayXg}
                  onChange={(e) => setSimAwayXg(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">نسبة سيطرة واستحواذ المستضيف: {simHomeProb}%</label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={simHomeProb}
                  onChange={(e) => setSimHomeProb(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">متوسط ركنيات المستضيف التاريخي: {simHomeAvgCorners}</label>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.1"
                  value={simHomeAvgCorners}
                  onChange={(e) => setSimHomeAvgCorners(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold">متوسط ركنيات الضيف التاريخي: {simAwayAvgCorners}</label>
                <input
                  type="range"
                  min="2.0"
                  max="10.0"
                  step="0.1"
                  value={simAwayAvgCorners}
                  onChange={(e) => setSimAwayAvgCorners(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            
            <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl space-y-1">
              <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                تنويه المحاكاة
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                تقوم هذه المحاكاة بحساب خطوط الركنيات المتوقعة مباشرة باستخدام دالة Poisson لتوزيع الاحتمالات طبقاً للمعطيات التي تدرجها.
              </p>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">نتائج التحليل والمحاكاة الفورية</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">الركنيات المتوقعة كلياً</span>
                    <span className="text-2xl font-black text-white">{simAnalysis.cornersProfile.lambdaCorners.toFixed(1)}</span>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Flag className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">التصنيف الهجومي المتوقع</span>
                    <span className="text-sm font-black text-blue-300">{simAnalysis.cornersProfile.cornerDynamicsLabelAr}</span>
                  </div>
                </div>
              </div>

              {/* Prediction widget */}
              <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 p-5 rounded-2xl border border-blue-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 block font-bold mb-1">التوقع الخوارزمي الموصى به:</span>
                    <h4 className="text-lg font-black text-white">{simAnalysis.primarySelection.marketNameAr}</h4>
                  </div>
                  <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl">
                    ثقة {simAnalysis.primarySelection.confidenceScore}%
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simAnalysis.primarySelection.reasoningAr}
                </p>
              </div>

              {/* Poisson bars */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block">منحنى توزيع بواسون للتوقع:</span>
                <div className="space-y-2">
                  {simAnalysis.poissonCorners.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{p.rangeAr}</span>
                        <span className="text-blue-400">{p.prob}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${p.prob}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-8 max-w-4xl mx-auto">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-black text-white">الأساس العلمي والرياضي لنظام الركنيات</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              بنيت خوارزمياتنا على معايير ثابتة ومضادة للعشوائية لتأمين أعلى دقة وأمان للتوقعات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Calculator className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">تطبيق نموذج بواسون للتوزيع</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                تقيس الخوارزمية متوسط الركنيات لكل فريق بموجب عوامل الضغط Territory control وتحولها إلى دالة Poisson لحساب احتمالية إحراز الأهداف لتجاوز خطوط الرهان (+7.5 و +8.5).
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">فلتر المسابقات النسائية والودية</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                يتم حظر واستبعاد جميع المباريات النسائية، والودية والمغمورة كلياً من قاعدة البيانات لعدم ثبات خطوط تكتيكها وعشوائية هجماتها.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Flag className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">تأكيد الميول الهجومي النشط</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                يتطلب خط +8.5 ألا يكون هناك تفاوت هجومي يعيق سير الركنيات، وفي حال تم رصد تراجع لأحد الفريقين يتم إلغاء التوتال والميل للتوقعات الفردية.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">معيار الدرجات الأولى وحجم الأسواق</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                نركز حصرياً على الدوريات والبطولات الكبرى التي يتوفر بها أسواق المراهنات المتنوعة لتسهيل العثور على الخطوط بنسب حقيقية ومربحة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
