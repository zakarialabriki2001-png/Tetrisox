import React, { useState, useMemo } from "react";
import {
  FileCode,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Search,
  BookOpen,
  Settings,
  HelpCircle,
  Hash,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { Match, OracleDatabase } from "../types";
import { DatabaseManager } from "../lib/database";
import { LocalOfflineTrainer } from "../lib/signalTrainer";

interface ScoreRecorderDashboardProps {
  db: OracleDatabase;
  setDb: (updater: OracleDatabase | ((prev: OracleDatabase) => OracleDatabase)) => void;
  matchesList: Match[];
}

export const ScoreRecorderDashboard: React.FC<ScoreRecorderDashboardProps> = ({
  db,
  setDb,
  matchesList
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // Local score inputs indexed by match_id
  const [scores, setScores] = useState<Record<string, { ht_home: string; ht_away: string; ft_home: string; ft_away: string }>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const now = Date.now();

  // Find all matches that:
  // 1. Kickoff has passed (are in the past)
  // 2. Do not have recorded scores (ht_home, ht_away, ft_home or ft_away are null, OR status is not FINISHED)
  // 3. Are NOT older than 48 hours (to satisfy the 48-hour auto-prune limit)
  const pendingMatches = useMemo(() => {
    return matchesList.filter((m) => {
      const isSettled = m.status === "FINISHED" && m.ft_home !== null && m.ft_away !== null;
      const kickoffTime = m.__parsedTime || 0;
      const age = now - kickoffTime;

      // Has the kickoff time passed?
      const inPast = kickoffTime < now;
      // Is it older than 48 hours?
      const isExpired = age > 48 * 60 * 60 * 1000;

      return inPast && !isSettled && !isExpired;
    });
  }, [matchesList, now]);

  // Render a list of matches that already have scores recorded within the last 48 hours to allow corrections
  const recentSettledMatches = useMemo(() => {
    return matchesList
      .filter((m) => {
        const isSettled = m.status === "FINISHED" && m.ft_home !== null && m.ft_away !== null;
        const age = now - (m.__parsedTime || 0);
        return isSettled && age <= 48 * 60 * 60 * 1000;
      })
      .sort((a, b) => (b.__parsedTime || 0) - (a.__parsedTime || 0));
  }, [matchesList, now]);

  // Filter pending matches list by search keyword
  const filteredPending = useMemo(() => {
    return pendingMatches.filter((m) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        m.home.toLowerCase().includes(query) ||
        m.away.toLowerCase().includes(query) ||
        m.league_name.toLowerCase().includes(query)
      );
    });
  }, [pendingMatches, searchQuery]);

  const handleInputChange = (matchId: string, field: "ht_home" | "ht_away" | "ft_home" | "ft_away", value: string) => {
    // Retain only positive integers
    const cleaned = value.replace(/\D/g, "");
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { ht_home: "", ht_away: "", ft_home: "", ft_away: "" }),
        [field]: cleaned
      }
    }));
  };

  const handleSaveScore = (m: Match) => {
    const input = scores[m.match_id];
    if (!input || input.ft_home === "" || input.ft_away === "") {
      alert("الرجاء إدخال نتيجة نهاية المباراة الكاملة (FT_Home و FT_Away) على الأقل!");
      return;
    }

    const ftHome = parseInt(input.ft_home, 10);
    const ftAway = parseInt(input.ft_away, 10);

    // Default first half to standard proportional estimate if left blank
    const htHome = input.ht_home !== "" ? parseInt(input.ht_home, 10) : Math.floor(ftHome / 2);
    const htAway = input.ht_away !== "" ? parseInt(input.ht_away, 10) : Math.floor(ftAway / 2);

    const cloned = JSON.parse(JSON.stringify(db)) as OracleDatabase;
    if (cloned.matches[m.match_id]) {
      cloned.matches[m.match_id] = {
        ...cloned.matches[m.match_id],
        status: "FINISHED",
        ft_home: ftHome,
        ft_away: ftAway,
        ht_home: htHome,
        ht_away: htAway
      };
    }

    // Automatically recalculate offline ML metrics & signal states since historical results updated
    try {
      const trained = LocalOfflineTrainer.trainAndRecalibrate(cloned.matches);
      cloned.signals = trained.signals;
      cloned.signals_v2 = trained.signals_v2;
      cloned.global_stats = trained.globalStats;
    } catch (e) {
      console.error("Failed to train after score recording:", e);
    }

    setDb(cloned);
    DatabaseManager.saveDatabase(cloned);

    setSuccessMessage(`تم حفظ النتيجة بنجاح لمباراة: ${m.home} vs ${m.away} (${htHome}-${htAway}) / [${ftHome}-${ftAway}]`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleRemoveMatch = (matchId: string) => {
    if (confirm("هل تريد تجاهل وإزالة هذه المباراة نهائياً من قاعدة البيانات؟")) {
      const cloned = JSON.parse(JSON.stringify(db)) as OracleDatabase;
      delete cloned.matches[matchId];

      try {
        const trained = LocalOfflineTrainer.trainAndRecalibrate(cloned.matches);
        cloned.signals = trained.signals;
        cloned.signals_v2 = trained.signals_v2;
        cloned.global_stats = trained.globalStats;
      } catch (e) {
        console.error("Failed to train after score removal:", e);
      }

      setDb(cloned);
      DatabaseManager.saveDatabase(cloned);
    }
  };

  return (
    <div id="score-recorder-dashboard" className="space-y-6">
      {/* Arabic/English Combined Premium Header */}
      <div className="relative overflow-hidden bg-slate-950 border border-purple-500/25 rounded-2xl p-6 sm:p-8 shadow-[0_0_20px_rgba(168,85,247,0.06)] animate-fade-in">
        <div className="absolute right-0 top-0 h-48 w-48 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 rounded-full blur-3xl opacity-80 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/15 border border-purple-500/30 rounded-full">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[10px] uppercase tracking-wider text-purple-300 font-extrabold font-mono text-right">
                MANUAL SCORE & RESULT RECORDER • إدارة وضبط النتائج المعلقة
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              PENDING RESULTS DESK{" "}
              <span className="text-purple-400 font-mono text-xl sm:text-2xl font-light">
                / تسجيل النتائج المعلقة
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed text-right md:text-left">
              تتيح لك هذه المنصة معالجة وتسجيل نتائج المباريات التي انتهت تكتيكياً ولكن لم تُستخرج نتائج أهدافها بعد، أو مباريات يوم أمس.
              تنبيه: المباريات التي تتجاوز الـ <span className="text-purple-400 font-bold">48 ساعة</span> بدون تدوين نتيجتها، سيتم تجاهلها تلقائياً من قِبل النظام.
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0 text-right bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-inner min-w-[200px]">
            <p className="text-[10px] text-slate-400 font-bold">PENDING ACTIONS</p>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
              {pendingMatches.length} Matches
            </p>
            <span className="text-[9px] text-purple-400 font-medium font-mono">
              Ignore after 48h limit
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-bold leading-normal">
          <CheckCircle2 className="h-5 w-5 shrink-0 animate-bounce" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Pending Action Form List vs Recently Settled Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Main Pending Recorder Desk */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-4">
            
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400 animate-spin" />
                <h3 className="text-sm font-extrabold text-white">
                  المباريات المعلقة حالياً ({filteredPending.length})
                </h3>
              </div>

              {/* Keyword Filter Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="ابحث عن الفريق أو البطولة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-955 text-xs text-white border border-slate-800 focus:border-purple-500/50 rounded-lg pl-9 pr-3 py-2 outline-none transition"
                />
              </div>
            </div>

            {/* List of pending matches */}
            {filteredPending.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3.5">
                <div className="inline-flex p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-400 font-bold">
                  لا توجد مباريات معلقة بدون نتائج حالياً!
                </p>
                <p className="text-[10px] text-slate-500 max-w-md mx-auto">
                  كل المباريات التي انطلقت تم تسجيل نتائجها بنجاح أو لم يمر عليها موعد الانطلاق، أو تجاوزت مدة الـ 48 ساعة فتم إهمالها نهائياً.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPending.map((m) => {
                  const localState = scores[m.match_id] || { ht_home: "", ht_away: "", ft_home: "", ft_away: "" };
                  const kickoffFormatted = m.kickoff;

                  return (
                    <div
                      key={m.match_id}
                      className="bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-4 space-y-4 transition"
                    >
                      {/* Top Row info */}
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-900 pb-2">
                        <span className="text-slate-400 font-bold">
                          🏆 {m.league_name}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{kickoffFormatted}</span>
                        </div>
                      </div>

                      {/* Score Input block */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* Team names representation */}
                        <div className="md:col-span-5 flex items-center justify-between gap-3 text-xs">
                          <span className="text-white font-extrabold flex-1 text-left truncate">
                            {m.home}
                          </span>
                          <span className="text-slate-500 font-mono shrink-0 px-2">
                            VS
                          </span>
                          <span className="text-white font-extrabold flex-1 text-right truncate">
                            {m.away}
                          </span>
                        </div>

                        {/* Numeric Inputs for Scores */}
                        <div className="md:col-span-4 grid grid-cols-4 gap-2 text-center">
                          {/* HT Inputs */}
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 block font-bold">HT H</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={localState.ht_home}
                              placeholder="-"
                              onChange={(e) => handleInputChange(m.match_id, "ht_home", e.target.value)}
                              className="w-full bg-slate-900 text-center font-bold text-xs p-1.5 border border-slate-800 focus:border-purple-500/60 rounded text-amber-400 font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 block font-bold">HT A</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={localState.ht_away}
                              placeholder="-"
                              onChange={(e) => handleInputChange(m.match_id, "ht_away", e.target.value)}
                              className="w-full bg-slate-900 text-center font-bold text-xs p-1.5 border border-slate-800 focus:border-purple-500/60 rounded text-amber-400 font-mono"
                            />
                          </div>

                          {/* FT Inputs */}
                          <div className="space-y-1">
                            <label className="text-[9px] text-purple-400 block font-bold">FT H</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={localState.ft_home}
                              placeholder="-"
                              onChange={(e) => handleInputChange(m.match_id, "ft_home", e.target.value)}
                              className="w-full bg-slate-900 text-center font-extrabold text-xs p-1.5 border border-purple-900/40 focus:border-purple-500/75 rounded text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-purple-400 block font-bold">FT A</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={localState.ft_away}
                              placeholder="-"
                              onChange={(e) => handleInputChange(m.match_id, "ft_away", e.target.value)}
                              className="w-full bg-slate-900 text-center font-extrabold text-xs p-1.5 border border-purple-900/40 focus:border-purple-500/75 rounded text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Save Trigger Button */}
                        <div className="md:col-span-3 flex justify-end gap-2.5">
                          <button
                            onClick={() => handleSaveScore(m)}
                            className="bg-purple-650 hover:bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition w-full justify-center md:w-auto"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>حفظ النتيجة</span>
                          </button>
                          
                          <button
                            onClick={() => handleRemoveMatch(m.match_id)}
                            className="bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 text-xs p-2 rounded-lg cursor-pointer transition"
                            title="تجاهل المباراة نهائياً"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Col 3: Side Panel (Recently Resolved Scoring Ledger for corrections) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <History className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">
                نتائج تم تسجيلها أخر 48 ساعة
              </h3>
            </div>

            {recentSettledMatches.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-6">
                لا توجد نتائج مسجلة مؤخراً في السجلات المحفوظة.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {recentSettledMatches.map((m) => (
                  <div
                    key={m.match_id}
                    className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg text-[11px]"
                  >
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-mono">
                      <span className="truncate max-w-[120px]">{m.league_name}</span>
                      <span>{m.kickoff.split(" ")[0]}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 truncate text-slate-300 font-medium">
                        {m.home} - {m.away}
                      </div>
                      
                      {/* Recorded scores */}
                      <div className="bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-amber-400 shrink-0">
                        ({m.ht_home || 0}-{m.ht_away || 0}) [{m.ft_home || 0}-{m.ft_away || 0}]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
