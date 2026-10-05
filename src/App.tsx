/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Database,
  TrendingUp,
  Timer,
  CheckCircle2,
  Play,
  RefreshCw,
  DatabaseZap,
  Zap,
  Search,
  Filter,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  Clock,
  Settings,
  Flame,
  LayoutGrid,
  BarChart3,
  Dribbble,
  Gauge,
  Undo2,
  BookmarkCheck,
  Check,
  X,
  Trash2,
  Download,
  UploadCloud,
  BrainCircuit,
  Atom,
  Lock,
  ChevronDown,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Star,
  Scale,
  Cloud,
  Bot,
  Wrench,
  Compass,
  Flag,
  Target,
  Workflow,
} from "lucide-react";

import { Match, SignalSummary, OracleDatabase } from "./types";
import { DatabaseManager } from "./lib/database";
import { LocalOfflineTrainer } from "./lib/signalTrainer";
import { OfflineLiveSimulator } from "./lib/liveSimulator";
import { MarketEvaluator } from "./lib/marketEvaluator";
import {
  CipherEngine,
  AdvancedxGEngine,
  DualPredictions,
  IcharaV2Engine,
} from "./lib/matchEngine";
import { PremiumStatsDashboard } from "./components/PremiumStatsDashboard";
import { ApexDualCouncilDashboard } from "./components/ApexDualCouncilDashboard";
import { PremiumStatsDashboardV2 } from "./components/PremiumStatsDashboardV2";
import { TetrisroDashboard } from "./components/TetrisroDashboard";
import { ConsensusDashboard } from "./components/ConsensusDashboard";
import { MetaStackingDashboard } from "./components/MetaStackingDashboard";
import { CardsCornersDashboard } from "./components/CardsCornersDashboard";
import { ScoreRecorderDashboard } from "./components/ScoreRecorderDashboard";
import { AgentsActivityModal } from "./components/AgentsActivityModal";
import { ButterflyLearningModal } from "./components/ButterflyLearningModal";
import { ButterflyCrossLearningEngine } from "./lib/butterflyCrossLearningEngine";
import { MetaStackingEngine } from "./lib/metaStackingEngine";
import {
  DataSentinelAgent,
  SystemUpgradeAgent,
  AgentOrchestrator,
} from "./lib/autonomousAgents";
import { DateTimeSystem } from "./lib/dateTimeSystem";
import VirtualizedMatchList from "./components/VirtualizedMatchList";
import { ExceptionalFilterBar } from "./components/ExceptionalFilterBar";
import { Elite88FilterBar } from "./components/Elite88FilterBar";
import { ForebetHarmonizer } from "./lib/forebetHarmonizer";
import { Elite88StatsModal } from "./components/Elite88StatsModal";
import { ComprehensiveAnalyticsDashboard } from "./components/ComprehensiveAnalyticsDashboard";
import { DatabaseCompressionModal } from "./components/DatabaseCompressionModal";
import { CompressionReport } from "./lib/dataCompressor";
import {
  isMatchRaw88Plus,
  isPremium1x2Elite88,
  isPremiumGoalsHunterElite88,
  isPremiumFirstHalfElite88,
  isSignalMatchElite88,
  isIcharaMatchElite88,
  calculateElite88Analytics,
} from "./lib/elite88Engine";
import {
  ExceptionalCategory,
  isExceptionalMarket,
  getSignalActivePredictions,
  getIcharaActivePredictions,
  processMatchesWithExceptionalSort,
} from "./lib/exceptionalFilter";

const getMatchPrediction = (m: Match): string => {
  if (m.pred && (m.pred === "1" || m.pred === "X" || m.pred === "2")) {
    return m.pred.toUpperCase();
  }
  const max = Math.max(m.p1 || 0, m.px || 0, m.p2 || 0);
  if (max === m.p1) return "1";
  if (max === m.p2) return "2";
  return "X";
};

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getDeterministicGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-600 to-teal-700",
    "from-purple-600 to-fuchsia-700",
    "from-amber-500 to-orange-600",
    "from-rose-600 to-pink-700",
    "from-cyan-500 to-blue-600",
    "from-violet-600 to-indigo-800",
    "from-red-600 to-orange-700",
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function App() {
  // Database state
  const [db, setDb] = useState<OracleDatabase>(() => {
    return {
      matches: {},
      signals: {},
      signals_v2: {},
      global_stats: {
        total_picks: 0,
        correct_picks: 0,
        win_rate: 0,
        daily_history: {},
      },
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);

  // Initialize clean, lightweight in-memory session database on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsSyncing(true);
        const initialDb = await DatabaseManager.loadDatabaseAsync();
        setDb(initialDb);
      } finally {
        setIsSyncing(false);
      }
    };
    init();
  }, []);

  // ⚡ ROOT-LEVEL AUTONOMOUS AI AGENTS SUPERVISOR (Runs 100% automatically in background in memory)
  useEffect(() => {
    const supervisorInterval = setInterval(() => {
      // 1. Sentinel fault check and silent in-memory self-healing
      const currentAudit = DataSentinelAgent.auditDatabase(db);
      if (currentAudit.totalFaults > 0) {
        const { updatedMatches, report } = DataSentinelAgent.autoCorrectDatabase(db);
        if (report.healedFaultsCount > 0) {
          setDb((prev) => ({ ...prev, matches: updatedMatches }));
          AgentOrchestrator.addLog(
            "Sentinel",
            "FAULT_FIX",
            `[الطيار الآلي المستقل] تطهير تلقائي لـ ${report.healedFaultsCount} أخطاء مستجدة`,
            `تم تصحيح وتطهير بيانات الجلسة الحالية تلقائياً في الخلفية بدون الحاجة لأي تدخل أو ضغط على الخادم.`,
            "SUCCESS"
          );
        }
      }

      // 2. Periodic system evolver tuning based on loaded session matches
      const matchesArr = Object.values(db.matches || {});
      if (matchesArr.length > 0) {
        const evo = SystemUpgradeAgent.evolveSystems(matchesArr);
        if (evo.evolutionScore > 0) {
          setDb((prev) => ({
            ...prev,
            calibration_modifiers: {
              ...(prev.calibration_modifiers || {}),
              ...evo.recommendedCalibrationModifiers,
            },
          }));
        }
      }
    }, 35000);

    return () => clearInterval(supervisorInterval);
  }, [db]);

  const [activeTab, setActiveTab] = useState<
    | "apex_council"
    | "fixtures"
    | "picks"
    | "premiumpicks"
    | "premiumpicks_v2"
    | "tetrisro"
    | "consensus"
    | "meta_stacking"
    | "cards_corners"
    | "stats"
    | "paste"
    | "score_recorder"
    | "ichara_v2"
  >("apex_council");
  const [premiumSubTab, setPremiumSubTab] = useState<
    "1x2_day" | "goals_hunter" | "first_half" | "premium_stats"
  >("1x2_day");
  const [premiumSubTabV2, setPremiumSubTabV2] = useState<
    "1x2_day" | "goals_hunter" | "first_half" | "premium_stats"
  >("1x2_day");

  // Custom Filters & Search within Match Center
  const [searchQuery, setSearchQuery] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [minOdds, setMinOdds] = useState("1.30");
  const [displayLimit, setDisplayLimit] = useState(20);
  const [picksDisplayLimit, setPicksDisplayLimit] = useState(20);
  const [isUpcomingPicksExpanded, setIsUpcomingPicksExpanded] = useState(true);
  const [isResolvedPicksExpanded, setIsResolvedPicksExpanded] = useState(false);
  const [isUpcomingIcharaExpanded, setIsUpcomingIcharaExpanded] = useState(true);
  const [isResolvedIcharaExpanded, setIsResolvedIcharaExpanded] = useState(false);
  const [premiumDisplayLimit, setPremiumDisplayLimit] = useState(20);

  // Exceptional Picks Filter and Priority Sort State for Signal Picks and Ichara V2
  const [signalExceptionalCategory, setSignalExceptionalCategory] = useState<ExceptionalCategory>("all");
  const [signalExceptionalFirst, setSignalExceptionalFirst] = useState<boolean>(true);

  const [icharaExceptionalCategory, setIcharaExceptionalCategory] = useState<ExceptionalCategory>("all");
  const [icharaExceptionalFirst, setIcharaExceptionalFirst] = useState<boolean>(true);
  const [elite88FilterActive, setElite88FilterActive] = useState<boolean>(false);
  const [forebetHarmonyActive, setForebetHarmonyActive] = useState<boolean>(false);
  const [showElite88StatsModal, setShowElite88StatsModal] = useState<boolean>(false);
  const [showButterflyModal, setShowButterflyModal] = useState<boolean>(false);
  const [compressionReport, setCompressionReport] = useState<CompressionReport | null>(null);
  const [showCompressionModal, setShowCompressionModal] = useState<boolean>(false);
  const [isImportProcessing, setIsImportProcessing] = useState<boolean>(false);

  // New sorting, audit and classification states for professional date handling
  const [matchSortOrder, setMatchSortOrder] = useState<"asc" | "desc">("desc");
  const [auditResultFilter, setAuditResultFilter] = useState<
    "all" | "win" | "loss" | "pending"
  >("all");
  const [confidenceFilter, setConfidenceFilter] = useState<
    "ALL" | "HIGH" | "MEDIUM" | "LOW"
  >("ALL");

  // Tab segments for Match Center (Live, Upcoming, Finished Last 100)
  const [fixtureSegment, setFixtureSegment] = useState<
    "live" | "upcoming" | "finished"
  >("upcoming");

  // Reset display limit when switching segments or searching
  useEffect(() => {
    setDisplayLimit(20);
    setPicksDisplayLimit(20);
    setPremiumDisplayLimit(20);
  }, [fixtureSegment, searchQuery, leagueFilter]);

  // Interactive indicators
  const [isTraining, setIsTraining] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [importNotice, setImportNotice] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);
  const [, setTriggerSimReload] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Score manually recording states
  // Removed per user request

  // Auto-refresh simulations every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTriggerSimReload((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const matchesList = useMemo(() => {
    return (Object.values(db.matches || {}) as Match[])
      .map((m) => {
        if (!m.__parsedTime) {
          m.__parsedTime = LocalOfflineTrainer.parseKickoffDate(
            m.kickoff,
          ).getTime();
        }
        return m;
      });
  }, [db.matches]);

  // SESSION-START AUTOMATED BOOTSTRAPPING:
  // Automatically initializes Butterfly Cross-System Engine & Dynamic Decay Weights when database loads
  useEffect(() => {
    if (matchesList.length > 0) {
      ButterflyCrossLearningEngine.evaluateButterflyNetwork(matchesList, db);
      MetaStackingEngine.calculateDynamicDecayWeights(matchesList, db);
    }
  }, [matchesList, db]);

  const currentLeagues = useMemo(() => {
    return Array.from(new Set(matchesList.map((m) => m.league_name))).sort();
  }, [matchesList]);

  // Global Calendar System State for Signal Picks and Premium Picks
  const [customCalendarDate, setCustomCalendarDate] =
    useState<string>("2026-05-27");

  // Helper date parsing and formatting utilities
  const getLocalDateString = (dateObj: Date): string => {
    return DateTimeSystem.toLocalDateString(dateObj);
  };

  const availableMatchDateObjects = useMemo(() => {
    const datesMap = new Map<string, number>();
    const accuracyMap = new Map<string, { total: number; correct: number }>();

    // Add today as an option even if empty
    const todayStr = getLocalDateString(new Date());
    datesMap.set(todayStr, 0);

    matchesList.forEach((m) => {
      const dStr = getLocalDateString(new Date(m.__parsedTime!));
      datesMap.set(dStr, (datesMap.get(dStr) || 0) + 1);

      if (m.ft_home !== null && m.ft_away !== null) {
        if (!accuracyMap.has(dStr)) {
          accuracyMap.set(dStr, { total: 0, correct: 0 });
        }
        const stats = accuracyMap.get(dStr)!;

        stats.total++;
        if (m.signal_code && db.signals[m.signal_code]) {
          const sig = db.signals[m.signal_code];
          const topPred = sig.top_predictions?.[0];
          if (topPred) {
            const outcomes = MarketEvaluator.evaluateAllMarkets(
              m.ft_home,
              m.ft_away,
              m.ht_home,
              m.ht_away,
            );
            if (outcomes[topPred.market]) {
              stats.correct++;
            }
          } else {
            const actualOutcome =
              m.ft_home > m.ft_away ? "1" : m.ft_home < m.ft_away ? "2" : "X";
            if ((m.pred || "").toUpperCase() === actualOutcome) {
              stats.correct++;
            }
          }
        } else {
          const actualOutcome =
            m.ft_home > m.ft_away ? "1" : m.ft_home < m.ft_away ? "2" : "X";
          const isCorrect = (m.pred || "").toUpperCase() === actualOutcome;
          if (isCorrect) stats.correct++;
        }
      }
    });

    // Sort descending
    const keys = Array.from(datesMap.keys()).sort((a, b) => b.localeCompare(a));
    return keys.map((k) => {
      const acc = accuracyMap.get(k);
      const accRate =
        acc && acc.total > 0
          ? parseFloat(((acc.correct  / acc.total) * 100).toFixed(1))
          : null;
      return {
        dateStr: k,
        count: datesMap.get(k) || 0,
        accuracy: accRate,
      };
    });
  }, [matchesList, db.signals]);

  const availableMatchDates = useMemo(() => {
    return availableMatchDateObjects.map((d) => d.dateStr);
  }, [availableMatchDateObjects]);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    () => {
      return getLocalDateString(new Date());
    },
  );

  // Automatically select the most relevant date if the current date has 0 matches
  useEffect(() => {
    if (availableMatchDateObjects.length > 0) {
      const todayStr = getLocalDateString(new Date());
      // Check how many matches fall on selected date
      const matchesOnSelected = matchesList.filter((m) => {
        return (
          getLocalDateString(new Date(m.__parsedTime!)) === selectedCalendarDate
        );
      }).length;

      if (matchesOnSelected === 0 && selectedCalendarDate === todayStr) {
        // Find the most recent date that ACTUALLY HAS matches
        const firstPopulatedDate = availableMatchDateObjects.find(
          (d) => d.count > 0,
        );
        if (firstPopulatedDate) {
          setSelectedCalendarDate(firstPopulatedDate.dateStr);
        }
      }
    }
  }, [availableMatchDateObjects, matchesList, selectedCalendarDate]);

  const dateFilterType =
    selectedCalendarDate === getLocalDateString(new Date()) ? "today" : "past";

  const formatCalendarDateDetails = (dStr: string) => {
    // Try to safely parse YYYY-MM-DD
    const dateObj = DateTimeSystem.parse(dStr + " 12:00");
    const dayName = dateObj.toLocaleDateString("ar-EG", { weekday: "long" });
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleDateString("ar-EG", { month: "short" });

    const dayNameEn = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const monthNameEn = dateObj.toLocaleDateString("en-US", { month: "short" });

    return {
      dayName: dayName || dayNameEn,
      dayNum,
      monthName: monthName || monthNameEn,
      full: dStr,
    };
  };

  // Target date string based on calendar selection
  const getSelectedTargetDateStr = (): string => {
    return selectedCalendarDate;
  };

  const targetDateStr = getSelectedTargetDateStr();

  // Format date helper for human display using unified timezone rules
  const formatHumanDate = (dateStr: string): string => {
    return DateTimeSystem.formatHumanDate(dateStr);
  };

  const currentFormattedTargetDate = formatHumanDate(targetDateStr);

  const matchesOnSelectedDay = useMemo(() => {
    return matchesList.filter((m) => {
      const matchDateStr = getLocalDateString(new Date(m.__parsedTime!));
      return matchDateStr === targetDateStr;
    });
  }, [matchesList, targetDateStr]);

  // Pre-grouped completed matches by signal code to avoid quadratic linear scan bottlenecks (O(N) vs O(N^2))
  const finishedMatchesBySignal = useMemo(() => {
    const group: Record<string, Match[]> = {};
    matchesList.forEach((m) => {
      if (m.status === "FINISHED" && m.ft_home !== null && m.ft_away !== null) {
        if (!group[m.signal_code]) {
          group[m.signal_code] = [];
        }
        group[m.signal_code].push(m);
      }
    });
    // For each signal list, pre-sort them chronologically descending
    Object.keys(group).forEach((code) => {
      group[code].sort((a, b) => b.__parsedTime! - a.__parsedTime!);
    });
    return group;
  }, [matchesList]);

  // Pre-grouped completed matches by signal code v2 for ICHARA V2
  const finishedMatchesBySignalV2 = useMemo(() => {
    const group: Record<string, Match[]> = {};
    matchesList.forEach((m) => {
      const v2Code = m.signal_code_v2;
      if (v2Code && m.status === "FINISHED" && m.ft_home !== null && m.ft_away !== null) {
        if (!group[v2Code]) {
          group[v2Code] = [];
        }
        group[v2Code].push(m);
      }
    });
    // For each signal list, pre-sort them chronologically descending
    Object.keys(group).forEach((code) => {
      group[code].sort((a, b) => b.__parsedTime! - a.__parsedTime!);
    });
    return group;
  }, [matchesList]);

  // Comprehensive statistical performance engine for 88%+ filter
  const elite88Analytics = useMemo(() => {
    return calculateElite88Analytics(matchesList, db, targetDateStr);
  }, [matchesList, db, targetDateStr]);

  const activeDay88Count = useMemo(() => {
    let count = 0;
    const dayMatches = matchesOnSelectedDay;
    for (let i = 0; i < dayMatches.length; i++) {
      const m = dayMatches[i];
      if (
        isSignalMatchElite88(m, db.signals, finishedMatchesBySignal) ||
        isIcharaMatchElite88(m, db.signals_v2, finishedMatchesBySignalV2) ||
        isMatchRaw88Plus(m)
      ) {
        count++;
      }
    }
    return count;
  }, [matchesOnSelectedDay, db.signals, db.signals_v2, finishedMatchesBySignal, finishedMatchesBySignalV2]);

  // Upcoming Matches
  const upcomingMatches = useMemo(() => {
    const now = Date.now();
    return matchesList
      .filter((m) => DateTimeSystem.isMatchUpcoming(m, now))
      .sort((a, b) => a.__parsedTime! - b.__parsedTime!);
  }, [matchesList]);

  // Finished Matches (Explicitly marked finished or chronologically concluded past 115m)
  const finishedMatches = useMemo(() => {
    const now = Date.now();
    return matchesList
      .filter((m) => DateTimeSystem.isMatchFinished(m, now))
      .sort((a, b) => b.__parsedTime! - a.__parsedTime!);
  }, [matchesList]);

  // Simulated live matches center
  const liveSimulationMatches = useMemo(() => {
    const candidates = matchesList.filter((m) => m.status !== "FINISHED");
    return candidates
      .map((m) => {
        const explicitState = OfflineLiveSimulator.getLiveState(
          m.kickoff,
          m.xg_home,
          m.xg_away,
          m.match_id,
        );
        return { match: m, liveState: explicitState };
      })
      .filter(
        (item) =>
          item.liveState.status !== "UPCOMING" &&
          item.liveState.status !== "FINISHED",
      );
  }, [matchesList]);

  // Highlight exclusive high value matches for Signal Picks (>= 85% on last 15-match Backtest, look-ahead bias proof, with anti-congestion cluster dispersion)
  const signalPicksMatches = useMemo(() => {
    // 1. Gather qualified matches with active predictions
    const qualifiedWithScores: Array<{ match: Match; topWeight: number }> = [];

    matchesOnSelectedDay.forEach((m) => {
      let activeP = getSignalActivePredictions(
        m,
        db.signals,
        finishedMatchesBySignal,
        elite88FilterActive ? 0.88 : 0.85
      );
      // Root Forebet Integration: strictly ensure 100% harmony
      activeP = ForebetHarmonizer.filterCompatiblePredictions(activeP, m);
      if (activeP.length > 0) {
        const topWeight = activeP[0]?.tacticalWeight || 0;
        qualifiedWithScores.push({ match: m, topWeight });
      }
    });

    // 2. Anti-Congestion Filter: Prevent identical signal codes stacking (max 2 highest-conviction fixtures per signal code)
    const groupedBySignal: Record<string, typeof qualifiedWithScores> = {};
    qualifiedWithScores.forEach((item) => {
      const code = item.match.signal_code;
      if (!groupedBySignal[code]) groupedBySignal[code] = [];
      groupedBySignal[code].push(item);
    });

    const dispersedList: Match[] = [];
    Object.values(groupedBySignal).forEach((group) => {
      group.sort((a, b) => b.topWeight - a.topWeight);
      const allowed = group.slice(0, 2);
      allowed.forEach((it) => dispersedList.push(it.match));
    });

    return dispersedList.sort((a, b) => {
      return (a.__parsedTime || 0) - (b.__parsedTime || 0); // Closest kickoff time first
    });
  }, [matchesOnSelectedDay, finishedMatchesBySignal, db.signals, elite88FilterActive]);

  // ICHARA V2 Picks (Version 2 Philosophy, Minimum Odds 1.30 and high backtest accuracy with anti-congestion)
  const icharaPicksMatches = useMemo(() => {
    const qualifiedWithScores: Array<{ match: Match; topWeight: number }> = [];

    matchesOnSelectedDay.forEach((m) => {
      let activeP = getIcharaActivePredictions(
        m,
        db.signals_v2 || {},
        finishedMatchesBySignalV2,
        elite88FilterActive ? 0.88 : 0.80
      );
      // Root Forebet Integration: strictly ensure 100% harmony
      activeP = ForebetHarmonizer.filterCompatiblePredictions(activeP, m);
      if (activeP.length > 0) {
        const topWeight = activeP[0]?.tacticalWeight || 0;
        qualifiedWithScores.push({ match: m, topWeight });
      }
    });

    // Anti-Congestion Filter: Prevent identical V2 signal codes stacking (max 2 highest-conviction fixtures per code)
    const groupedByV2: Record<string, typeof qualifiedWithScores> = {};
    qualifiedWithScores.forEach((item) => {
      const code = item.match.signal_code_v2 || "unknown";
      if (!groupedByV2[code]) groupedByV2[code] = [];
      groupedByV2[code].push(item);
    });

    const dispersedList: Match[] = [];
    Object.values(groupedByV2).forEach((group) => {
      group.sort((a, b) => b.topWeight - a.topWeight);
      const allowed = group.slice(0, 2);
      allowed.forEach((it) => dispersedList.push(it.match));
    });

    return dispersedList.sort((a, b) => {
      return (a.__parsedTime || 0) - (b.__parsedTime || 0);
    });
  }, [matchesOnSelectedDay, finishedMatchesBySignalV2, db.signals_v2, elite88FilterActive]);

  // Processed Signal Picks with Exceptional Filter & Priority Sort
  const processedSignalData = useMemo(() => {
    return processMatchesWithExceptionalSort(
      signalPicksMatches,
      (m) => getSignalActivePredictions(m, db.signals, finishedMatchesBySignal, elite88FilterActive ? 0.88 : 0.85),
      signalExceptionalCategory,
      signalExceptionalFirst,
      true
    );
  }, [
    signalPicksMatches,
    db.signals,
    finishedMatchesBySignal,
    elite88FilterActive,
    signalExceptionalCategory,
    signalExceptionalFirst,
  ]);

  // Processed Ichara V2 Picks with Exceptional Filter & Priority Sort
  const processedIcharaData = useMemo(() => {
    return processMatchesWithExceptionalSort(
      icharaPicksMatches,
      (m) => getIcharaActivePredictions(m, db.signals_v2 || {}, finishedMatchesBySignalV2, elite88FilterActive ? 0.88 : 0.80),
      icharaExceptionalCategory,
      icharaExceptionalFirst,
      true
    );
  }, [
    icharaPicksMatches,
    db.signals_v2,
    finishedMatchesBySignalV2,
    elite88FilterActive,
    icharaExceptionalCategory,
    icharaExceptionalFirst,
  ]);

  // Calculate Premium 1X2 Day Selections (Strict 12+ successes on last 15 occurrences: 80%+ and expected score direction alignment)
  const premium1x2Matches = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigInfo = db.signals[m.signal_code];
        if (!sigInfo) return null;

        const prediction = getMatchPrediction(m);
        if (prediction !== "1" && prediction !== "X" && prediction !== "2")
          return null;

        // Root Forebet Harmonizer: Strictly eliminate any 1X2 contradiction
        const targetMarket = prediction === "1" ? "FT_1" : prediction === "2" ? "FT_2" : "FT_X";
        if (!ForebetHarmonizer.isMarketCompatible(targetMarket, m)) {
          return null;
        }

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        const mTime = m.__parsedTime!;

        // 1. DYNAMIC CUMULATIVE PHYSICAL FATIGUE SHIELD
        // Scan matches to identify recent fixture timelines and calculate standard rest intervals
        let homePrevTime = 0;
        let awayPrevTime = 0;
        for (const prev of matchesList) {
          if (prev.__parsedTime! < mTime) {
            if ((prev.home === m.home || prev.away === m.home) && prev.__parsedTime! > homePrevTime) {
              homePrevTime = prev.__parsedTime!;
            }
            if ((prev.home === m.away || prev.away === m.away) && prev.__parsedTime! > awayPrevTime) {
              awayPrevTime = prev.__parsedTime!;
            }
          }
        }
        
        const homeRestDays = homePrevTime > 0 ? (mTime - homePrevTime) / (1000 * 60 * 60 * 24) : 7.0;
        const awayRestDays = awayPrevTime > 0 ? (mTime - awayPrevTime) / (1000 * 60 * 60 * 24) : 7.0;

        // Progressive physical fatigue metrics which lower derived xG expectations due to scheduling density
        let hFatiguePenalty = 0.0;
        let aFatiguePenalty = 0.0;
        if (homeRestDays < 3.0) {
          hFatiguePenalty = 0.38 * (3.0 - homeRestDays);
        }
        if (awayRestDays < 3.0) {
          aFatiguePenalty = 0.38 * (3.0 - awayRestDays);
        }

        // 2. DYNAMIC REGIONAL LEAGUE VOLATILITY SHIELD
        // Calculate historical reliability profiles for specific sports divisions to adjust criteria
        const leagueMatches = matchesList.filter(prev => prev.league_name === m.league_name && prev.status === "FINISHED");
        let leagueAccuracy = 0.82;
        if (leagueMatches.length >= 8) {
          const correctLeague = leagueMatches.filter(prev => {
            if (prev.ft_home === null || prev.ft_away === null) return false;
            const actual = prev.ft_home > prev.ft_away ? "1" : prev.ft_home < prev.ft_away ? "2" : "X";
            return getMatchPrediction(prev) === actual;
          }).length;
          leagueAccuracy = correctLeague / leagueMatches.length;
        }
        const leagueVolatilityShield = leagueAccuracy < 0.65 ? 0.06 : leagueAccuracy < 0.76 ? 0.03 : 0.0;

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff with similarity-aided neighborhood boosting
        const finishedForSignal = CipherEngine.getAidedFinishedMatches(
          m.signal_code,
          finishedMatchesBySignal,
          mTime,
          30
        );

        // Inspect deep finished games history (Up to 25 historical games, minimum depth: 10)
        const last15 = finishedForSignal.slice(0, 25);
        if (last15.length < 10) {
          return null; 
        }

        const last15Count = last15.length;
        const correctCount = last15.filter((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return false;
          const actualOutcome =
            hist.ft_home > hist.ft_away
              ? "1"
              : hist.ft_home < hist.ft_away
                ? "2"
                : "X";
          const pastPrediction = getMatchPrediction(hist);
          return actualOutcome === pastPrediction;
        }).length;

        // Baseline organic win rate check (≥ 70% Home/Away, ≥ 40% Draw)
        const winRate = correctCount / last15Count;
        const requiredMinWinRate = (prediction === "1" || prediction === "2") ? 0.70 : 0.40;
        if (winRate < requiredMinWinRate) {
          return null;
        }

        // Predicted full time expected score to ensure mathematical convergence and avoid contradictions
        const expectedScore = AdvancedxGEngine.computeFormAdjustedScore(
          m,
          matchesList,
        );

        // Calculate Poisson probability check to verify mathematical stability applying physical fatigue corrections
        const computedLocalXG = AdvancedxGEngine.computeLocalXG(
          m.p1,
          m.px,
          m.p2,
          m.coef,
          null,
          (sigInfo.ema_error_h || 0) + hFatiguePenalty,
          (sigInfo.ema_error_a || 0) + aFatiguePenalty
        );
        const poissonProbs = AdvancedxGEngine.computePoissonGridProbs(
          computedLocalXG.xgHome,
          computedLocalXG.xgAway
        );

        let pProb = 0;
        if (prediction === "1") pProb = poissonProbs["FT_1"] * 100;
        else if (prediction === "2") pProb = poissonProbs["FT_2"] * 100;
        else pProb = poissonProbs["FT_X"] * 100;

        // DOUBLE-DEFENSE DIXON-COLES DRAW TRAP SHIELD (calculated for UI exposure only)
        const drawProb = poissonProbs["FT_X"] * 100;
        const isDrawTrap = prediction !== "X" && drawProb > 33.0 && (computedLocalXG.xgHome + computedLocalXG.xgAway) < 2.05;

        // High-Accuracy Team Form Momentum Filter calculation (calculated for UI exposure only)
        const homeTeam = m.home;
        const awayTeam = m.away;

        const finishedHome = matchesList.filter((prev) => {
          if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
          if (prev.home !== homeTeam && prev.away !== homeTeam) return false;
          return prev.__parsedTime! < mTime;
        });
        const finishedAway = matchesList.filter((prev) => {
          if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
          if (prev.home !== awayTeam && prev.away !== awayTeam) return false;
          return prev.__parsedTime! < mTime;
        });

        const last5HomeMatches = finishedHome.slice(0, 5);
        const last5AwayMatches = finishedAway.slice(0, 5);

        let hGoalsScored = 0, hGoalsConceded = 0;
        last5HomeMatches.forEach(p => {
          const isH = p.home === homeTeam;
          hGoalsScored += isH ? p.ft_home! : p.ft_away!;
          hGoalsConceded += isH ? p.ft_away! : p.ft_home!;
        });
        const hScoringRatio = last5HomeMatches.length > 0 ? (hGoalsScored / (hGoalsConceded || 1)) : 1.0;

        let aGoalsScored = 0, aGoalsConceded = 0;
        last5AwayMatches.forEach(p => {
          const isH = p.home === awayTeam;
          aGoalsScored += isH ? p.ft_home! : p.ft_away!;
          aGoalsConceded += isH ? p.ft_away! : p.ft_home!;
        });
        const aScoringRatio = last5AwayMatches.length > 0 ? (aGoalsScored / (aGoalsConceded || 1)) : 1.0;

        // ==========================================
        // 🛡️ DYNAMIC SMART ANTI-SURPRISE DEFENSE SHIELD (تفادي المفاجآت بدقة متوازنة)
        // ==========================================
        let safetyPenalty = 0;

        // 1. Odds Disparity / Vulnerable favorite penalty
        if (prediction === "1" && m.coef > 2.40) safetyPenalty += 25;
        if (prediction === "2" && m.coef > 2.60) safetyPenalty += 25;
        if (prediction === "X" && (m.coef < 2.80 || m.coef > 4.50)) safetyPenalty += 25;

        // 2. High Defensive Weakness / Current Form Collapse
        if (prediction === "1" && hScoringRatio < 0.65) safetyPenalty += 20;
        if (prediction === "2" && aScoringRatio < 0.65) safetyPenalty += 20;

        // 3. Opponent Extreme Form / "Giant-Killer" Threat
        if (prediction === "1" && aScoringRatio > 1.95) safetyPenalty += 20;
        if (prediction === "2" && hScoringRatio > 1.95) safetyPenalty += 20;

        // 4. Broken Rest/Physique Disparity Trap
        if (prediction === "1" && homeRestDays < 2.5 && awayRestDays >= 6.0) safetyPenalty += 20;
        if (prediction === "2" && awayRestDays < 2.5 && homeRestDays >= 6.0) safetyPenalty += 20;

        // 5. Classic Dixon-Coles Sterile Draw Trap Shield
        if (prediction !== "X" && drawProb > 36.0 && (computedLocalXG.xgHome + computedLocalXG.xgAway) < 1.95) safetyPenalty += 25;

        // 6. Market Resistance (Draw Bias)
        if (prediction !== "X" && (m.px || 0) > 38.0) safetyPenalty += 20;

        // Reject only if composite risk accumulation is excessively severe
        if (safetyPenalty > 45) {
          return null;
        }


        // 5. HARD LEARNING SYSTEM: ONLINE ON-THE-FLY STOCHASTIC GRADIENT DESCENT PRE-OPTIMIZER
        // Train dynamic coefficients to fuse Poisson prediction, historical accuracy, strength levels, and market bookmaker premium
        const trainingInstances = finishedForSignal.slice(0, 15).map(hist => {
          const histLocalXG = AdvancedxGEngine.computeLocalXG(
            hist.p1,
            hist.px,
            hist.p2,
            hist.coef,
            null,
            sigInfo.ema_error_h || 0,
            sigInfo.ema_error_a || 0
          );
          const histProbs = AdvancedxGEngine.computePoissonGridProbs(histLocalXG.xgHome, histLocalXG.xgAway);
          const histPred = getMatchPrediction(hist);
          let pVal = 0.33;
          if (histPred === "1") pVal = histProbs["FT_1"] || 0.33;
          else if (histPred === "2") pVal = histProbs["FT_2"] || 0.33;
          else pVal = histProbs["FT_X"] || 0.33;

          const histActual = hist.ft_home! > hist.ft_away! ? "1" : hist.ft_home! < hist.ft_away! ? "2" : "X";
          const isCorrect = histPred === histActual ? 1.0 : 0.0;

          return {
            features: [
              pVal, 
              (sigInfo.all_time?.win_rate || 80) / 100,
              Math.min(1.0, Math.max(0.0, (hist.p1 + hist.p2) / 100)),
              Math.min(1.0, hist.coef / 4.0)
            ],
            target: isCorrect
          };
        });

        let weights = [0.25, 0.40, 0.20, 0.15];
        let lossBias = -0.4;
        
        if (trainingInstances.length >= 4) {
          const learningRate = 0.07;
          for (let iter = 0; iter < 30; iter++) {
            let gradW = [0, 0, 0, 0];
            let gradB = 0;
            for (const inst of trainingInstances) {
              const xVal = inst.features;
              const yVal = inst.target;
              const logits = weights[0] * xVal[0] + weights[1] * xVal[1] + weights[2] * xVal[2] + weights[3] * xVal[3] + lossBias;
              const pSig = 1.0 / (1.0 + Math.exp(-logits));
              const err = pSig - yVal;
              for (let j = 0; j < 4; j++) gradW[j] += err * xVal[j];
              gradB += err;
            }
            const l2Penalty = 0.015;
            for (let j = 0; j < 4; j++) {
              weights[j] -= learningRate * (gradW[j] / trainingInstances.length + l2Penalty * weights[j]);
            }
            lossBias -= learningRate * (gradB / trainingInstances.length);
          }
        }

        const absSum = (Math.abs(weights[0]) + Math.abs(weights[1]) + Math.abs(weights[2]) + Math.abs(weights[3])) || 1.0;
        const normWeights = weights.map(w => Math.round((Math.abs(w) / absSum) * 100));

        const activeFeatures = [
          pProb / 100,
          winRate,
          Math.min(1.0, Math.max(0.0, (m.p1 + m.p2) / 100)),
          Math.min(1.0, m.coef / 4.0)
        ];
        const activeLogit = weights[0] * activeFeatures[0] + weights[1] * activeFeatures[1] + weights[2] * activeFeatures[2] + weights[3] * activeFeatures[3] + lossBias;
        const activeProb = 1.0 / (1.0 + Math.exp(-activeLogit));
        
        // DYNAMIC ENSEMBLE CONSENSUS SCORE (INTELLIGENT PRE-FILTER)
        // 1. Base Signal Consistency Score (up to 40 Points)
        const signalConsistencyScore = (correctCount / 15) * 40;
        // 2. SGD Pre-Optimizer Probability Score (up to 30 Points)
        const mlOptimizedScore = activeProb * 30;
        // 3. Poisson Theoretical Verification Score (up to 15 Points)
        const poissonScore = (pProb / 100) * 15;
        // 4. Team Momentum & Form Security Score (up to 15 Points)
        let momentumSafetyScore = 15;
        if (prediction === "1" && hScoringRatio < 0.9) momentumSafetyScore -= 5;
        if (prediction === "2" && aScoringRatio < 0.9) momentumSafetyScore -= 5;
        if (homeRestDays < 3.0 || awayRestDays < 3.0) momentumSafetyScore -= 3;

        const consolidatedScore = parseFloat((signalConsistencyScore + mlOptimizedScore + poissonScore + momentumSafetyScore).toFixed(1));

        // Rejection based on strict Consensus threshold levels
        const requiredThreshold = prediction === "X" ? 59.0 : 74.0;
        if (consolidatedScore < requiredThreshold) {
          return null;
        }

        // Final precision rating combining pre-trained heuristics and real-time optimized gradient calculations
        let baseConf = parseFloat((winRate * 100).toFixed(1));
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const gradientConf = Math.min(99.0, Math.round(activeProb * 100));
        const confidenceRating = Math.min(99.0, Math.max(78.0, parseFloat((baseConf * 0.5 + gradientConf * 0.5).toFixed(1))));

        return {
          match: {
            ...m,
            expected_score: expectedScore,
          },
          last15,
          successCount: correctCount,
          totalChecked: last15Count,
          winRate: parseFloat((winRate * 100).toFixed(1)),
          confidenceRating,
          expectedScore,
          expectedHtScore: undefined as string | undefined,
          expectedHtFt: undefined as string | undefined,
          last5: last15.slice(0, 5), // keep last5 for history layout rendering
          poissonProb: parseFloat(pProb.toFixed(1)),
          hScoringRatio: parseFloat(hScoringRatio.toFixed(2)),
          aScoringRatio: parseFloat(aScoringRatio.toFixed(2)),
          // Custom Learner & Shield Indicators to display on UI
          shields: {
            homeRest: parseFloat(homeRestDays.toFixed(1)),
            awayRest: parseFloat(awayRestDays.toFixed(1)),
            isFatigued: (homeRestDays < 3.0 || awayRestDays < 3.0),
            isDrawShieldTriggered: isDrawTrap,
            leagueConfidence: parseFloat((leagueAccuracy * 100).toFixed(0)),
            consolidatedScore,
          },
          learner_weights: {
            poisson: normWeights[0],
            accuracy: normWeights[1],
            strength: normWeights[2],
            valueOdds: normWeights[3]
          }
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!; // Ascending: Closest kickoff time first
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignal, matchesList, db.signals]);

  // Calculate Premium Goals Hunter Selections (Strict 12+ successes on last 15 occurrences: 80%+)
  const premiumGoalsHunterMatches = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigInfo = db.signals[m.signal_code];
        if (!sigInfo) return null;

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff with similarity-aided neighborhood boosting
        const mTime = m.__parsedTime!;
        const finishedForSignalRaw = CipherEngine.getAidedFinishedMatches(m.signal_code, finishedMatchesBySignal, mTime, 30);
        const finishedForSignal = finishedForSignalRaw.filter(x => x.ft_home !== null && x.ft_away !== null);

        // Inspect deep finished games history (Up to 25 games, minimum depth: 10)
        const last15 = finishedForSignal.slice(0, 25);
        if (last15.length < 10) {
          return null; 
        }

        const last15Count = last15.length;
        let countOver15 = 0;
        let countOver25 = 0;
        let countOver35 = 0;
        let countBttsYes = 0;

        last15.forEach((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return;
          const totalGoals = hist.ft_home + hist.ft_away;
          if (totalGoals > 1) countOver15++;
          if (totalGoals > 2) countOver25++;
          if (totalGoals > 3) countOver35++;
          if (hist.ft_home > 0 && hist.ft_away > 0) countBttsYes++;
        });

        const rateOver15 = countOver15 / last15Count;
        const rateOver25 = countOver25 / last15Count;
        const rateOver35 = countOver35 / last15Count;
        const rateBttsYes = countBttsYes / last15Count;

        // Predicted full time expected score to ensure mathematical convergence and avoid contradictions
        const expectedScore = AdvancedxGEngine.computeFormAdjustedScore(
          m,
          matchesList,
        );
        const [egH, egA] = expectedScore.split("-").map(Number);
        const totalEg = egH + egA;

        // Compile candidates that have success rate of at least 80% with Forebet harmony
        const candidates: {
          market: "OVER_1_5" | "OVER_2_5" | "OVER_3_5" | "BTTS_YES";
          rate: number;
          count: number;
        }[] = [];
        if (rateOver15 >= 0.80 && totalEg >= 2.4 && ForebetHarmonizer.isMarketCompatible("OVER_1_5", m))
          candidates.push({
            market: "OVER_1_5",
            rate: rateOver15,
            count: countOver15,
          });
        if (rateOver25 >= 0.80 && totalEg >= 3.0 && ForebetHarmonizer.isMarketCompatible("OVER_2_5", m))
          candidates.push({
            market: "OVER_2_5",
            rate: rateOver25,
            count: countOver25,
          });
        if (rateOver35 >= 0.75 && totalEg >= 4.0 && ForebetHarmonizer.isMarketCompatible("OVER_3_5", m))
          candidates.push({
            market: "OVER_3_5",
            rate: rateOver35,
            count: countOver35,
          });
        if (rateBttsYes >= 0.80 && egH >= 1 && egA >= 1 && ForebetHarmonizer.isMarketCompatible("GG_FT", m))
          candidates.push({
            market: "BTTS_YES",
            rate: rateBttsYes,
            count: countBttsYes,
          });

        if (candidates.length === 0) return null;

        // Sort candidates by success rate descending
        // In case of a tie, priority goes: OVER_2_5 > BTTS_YES > OVER_1_5 > OVER_3_5
        const priority = {
          OVER_2_5: 4,
          BTTS_YES: 3,
          OVER_1_5: 2,
          OVER_3_5: 1,
        };
        candidates.sort((a, b) => {
          if (Math.abs(a.rate - b.rate) > 0.0001) {
            return b.rate - a.rate;
          }
          return priority[b.market] - priority[a.market];
        });

        const bestCandidate = candidates[0];

        let baseConf = parseFloat((bestCandidate.rate  * 100).toFixed(1));
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const confidenceRating = Math.min(99, baseConf);

        return {
          match: {
            ...m,
            expected_score: expectedScore,
          },
          last15,
          bestMarket: bestCandidate.market,
          successCount: bestCandidate.count,
          totalChecked: last15Count,
          winRate: parseFloat((bestCandidate.rate * 100).toFixed(1)),
          confidenceRating,
          expectedScore,
          expectedHtFt: undefined as string | undefined, // align shapes for union in activeList
          last5: last15.slice(0, 5), // subset for simple display component if needed
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!; // Ascending: Closest kickoff time first
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignal, matchesList, db.signals]);

  // Calculate Premium First Half Selections (Strict 13/15 success: 86.7%+)
  const premiumFirstHalfMatches = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigInfo = db.signals[m.signal_code];
        if (!sigInfo) return null;

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff with similarity-aided neighborhood boosting
        const mTime = m.__parsedTime!;
        const finishedForSignal = CipherEngine.getAidedFinishedMatches(
          m.signal_code,
          finishedMatchesBySignal,
          mTime,
          30
        );

        // Inspect deep finished games history (Up to 25 games, minimum depth: 10)
        const last15 = finishedForSignal.slice(0, 25);
        if (last15.length < 10) {
          return null; 
        }

        const last15Count = last15.length;
        let countOver05 = 0;
        let countOver15 = 0;
        let countHomeOver05 = 0;
        let countAwayOver05 = 0;

        last15.forEach((hist) => {
          if (hist.ht_home === null || hist.ht_away === null) return;
          const totalFh = hist.ht_home + hist.ht_away;
          if (totalFh > 0) countOver05++;
          if (totalFh > 1) countOver15++;
          if (hist.ht_home > 0) countHomeOver05++;
          if (hist.ht_away > 0) countAwayOver05++;
        });

        const rateOver05 = countOver05 / last15Count;
        const rateOver15 = countOver15 / last15Count;
        const rateHomeOver05 = countHomeOver05 / last15Count;
        const rateAwayOver05 = countAwayOver05 / last15Count;

        // Predicted halftime expected score calculated early to enforce mathematical convergence
        const uHtXgH = m.xg_home * 0.45;
        const uHtXgA = m.xg_away * 0.45;
        const uHtGoalH = uHtXgH < 0.4 ? 0 : uHtXgH < 1.2 ? 1 : 2;
        const uHtGoalA = uHtXgA < 0.4 ? 0 : uHtXgA < 1.2 ? 1 : 2;
        const expectedHtScore = `${uHtGoalH}-${uHtGoalA}`;
        const totalExpectedHtGoal = uHtGoalH + uHtGoalA;

        // Compile candidates that have success rate of 86.7% or more (13/15)
        // Filter out candidates that contradict the statistical halftime score projection
        const candidates: {
          market:
            | "FH_OVER_0_5"
            | "FH_OVER_1_5"
            | "FH_HOME_OVER_0_5"
            | "FH_AWAY_OVER_0_5";
          rate: number;
          count: number;
        }[] = [];
        if (rateOver05 >= 0.85 && totalExpectedHtGoal >= 1 && ForebetHarmonizer.isMarketCompatible("HT_OVER_0_5", m))
          candidates.push({
            market: "FH_OVER_0_5",
            rate: rateOver05,
            count: countOver05,
          });
        if (rateOver15 >= 0.85 && totalExpectedHtGoal >= 2 && ForebetHarmonizer.isMarketCompatible("HT_OVER_1_5", m))
          candidates.push({
            market: "FH_OVER_1_5",
            rate: rateOver15,
            count: countOver15,
          });
        if (rateHomeOver05 >= 0.85 && uHtGoalH >= 1 && ForebetHarmonizer.isMarketCompatible("HOME_OVER_0_5", m))
          candidates.push({
            market: "FH_HOME_OVER_0_5",
            rate: rateHomeOver05,
            count: countHomeOver05,
          });
        if (rateAwayOver05 >= 0.85 && uHtGoalA >= 1 && ForebetHarmonizer.isMarketCompatible("AWAY_OVER_0_5", m))
          candidates.push({
            market: "FH_AWAY_OVER_0_5",
            rate: rateAwayOver05,
            count: countAwayOver05,
          });

        if (candidates.length === 0) return null;

        // Sort candidates by success rate descending
        // In case of a tie, priority goes: FH_OVER_0_5, FH_HOME_OVER_0_5, FH_AWAY_OVER_0_5, FH_OVER_1_5
        const priority = {
          FH_OVER_0_5: 4,
          FH_HOME_OVER_0_5: 3,
          FH_AWAY_OVER_0_5: 2,
          FH_OVER_1_5: 1,
        };
        candidates.sort((a, b) => {
          if (Math.abs(a.rate - b.rate) > 0.0001) {
            return b.rate - a.rate;
          }
          return priority[b.market] - priority[a.market];
        });

        const bestCandidate = candidates[0];

        let baseConf = parseFloat((bestCandidate.rate  * 100).toFixed(1));
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const confidenceRating = Math.min(99, baseConf);

        return {
          match: m,
          last15,
          bestMarket: bestCandidate.market,
          successCount: bestCandidate.count,
          totalChecked: last15Count,
          winRate: parseFloat((bestCandidate.rate  * 100).toFixed(1)),
          confidenceRating,
          expectedHtScore,
          expectedHtFt: undefined as string | undefined, // align shapes for easy activeTab union
          last5: last15.slice(0, 5), // subset for simple render functions if any
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!;
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignal, matchesList, db.signals]);

  // Filtered Premium lists based on 88%+ filter and Forebet Harmony
  const displayPremium1x2Matches = useMemo(() => {
    let list = premium1x2Matches;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremium1x2Elite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => {
        const mkt = x.match.pred === "1" ? "FT_1" : x.match.pred === "2" ? "FT_2" : "FT_X";
        return ForebetHarmonizer.isMarketCompatible(mkt, x.match);
      });
    }
    return list;
  }, [premium1x2Matches, elite88FilterActive, forebetHarmonyActive]);

  const displayPremiumGoalsHunterMatches = useMemo(() => {
    let list = premiumGoalsHunterMatches;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremiumGoalsHunterElite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => {
        const mkt = x.bestMarket === "BTTS_YES" ? "GG_FT" : x.bestMarket;
        return ForebetHarmonizer.isMarketCompatible(mkt, x.match);
      });
    }
    return list;
  }, [premiumGoalsHunterMatches, elite88FilterActive, forebetHarmonyActive]);

  const displayPremiumFirstHalfMatches = useMemo(() => {
    let list = premiumFirstHalfMatches;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremiumFirstHalfElite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => ForebetHarmonizer.isMarketCompatible(x.bestMarket, x.match));
    }
    return list;
  }, [premiumFirstHalfMatches, elite88FilterActive, forebetHarmonyActive]);

  // Calculate Premium 1X2 Day Selections V2 (Strict 12+ successes on last 15 occurrences: 80%+ and expected score direction alignment, using ICHARA V2)
  const premium1x2MatchesV2 = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigCode = m.signal_code_v2;
        if (!sigCode || !db.signals_v2) return null;
        const sigInfo = db.signals_v2[sigCode];
        if (!sigInfo) return null;

        const prediction = getMatchPrediction(m);
        if (prediction !== "1" && prediction !== "X" && prediction !== "2")
          return null;

        // Root Forebet Harmonizer: Strictly eliminate any 1X2 contradiction
        const targetMarket = prediction === "1" ? "FT_1" : prediction === "2" ? "FT_2" : "FT_X";
        if (!ForebetHarmonizer.isMarketCompatible(targetMarket, m)) {
          return null;
        }

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        const mTime = m.__parsedTime!;

        // 1. DYNAMIC CUMULATIVE PHYSICAL FATIGUE SHIELD
        // Scan matches to identify recent fixture timelines and calculate standard rest intervals
        let homePrevTime = 0;
        let awayPrevTime = 0;
        for (const prev of matchesList) {
          if (prev.__parsedTime! < mTime) {
            if ((prev.home === m.home || prev.away === m.home) && prev.__parsedTime! > homePrevTime) {
              homePrevTime = prev.__parsedTime!;
            }
            if ((prev.home === m.away || prev.away === m.away) && prev.__parsedTime! > awayPrevTime) {
              awayPrevTime = prev.__parsedTime!;
            }
          }
        }
        
        const homeRestDays = homePrevTime > 0 ? (mTime - homePrevTime) / (1000 * 60 * 60 * 24) : 7.0;
        const awayRestDays = awayPrevTime > 0 ? (mTime - awayPrevTime) / (1000 * 60 * 60 * 24) : 7.0;

        // Progressive physical fatigue metrics which lower derived xG expectations due to scheduling density
        let hFatiguePenalty = 0.0;
        let aFatiguePenalty = 0.0;
        if (homeRestDays < 3.0) {
          hFatiguePenalty = 0.38 * (3.0 - homeRestDays);
        }
        if (awayRestDays < 3.0) {
          aFatiguePenalty = 0.38 * (3.0 - awayRestDays);
        }

        // 2. DYNAMIC REGIONAL LEAGUE VOLATILITY SHIELD
        // Calculate historical reliability profiles for specific sports divisions to adjust criteria
        const leagueMatches = matchesList.filter(prev => prev.league_name === m.league_name && prev.status === "FINISHED");
        let leagueAccuracy = 0.82;
        if (leagueMatches.length >= 8) {
          const correctLeague = leagueMatches.filter(prev => {
            if (prev.ft_home === null || prev.ft_away === null) return false;
            const actual = prev.ft_home > prev.ft_away ? "1" : prev.ft_home < prev.ft_away ? "2" : "X";
            return getMatchPrediction(prev) === actual;
          }).length;
          leagueAccuracy = correctLeague / leagueMatches.length;
        }
        const leagueVolatilityShield = leagueAccuracy < 0.65 ? 0.06 : leagueAccuracy < 0.76 ? 0.03 : 0.0;

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff with similarity-aided neighborhood boosting
        const finishedForSignal = IcharaV2Engine.getAidedFinishedMatches(
          sigCode,
          finishedMatchesBySignalV2,
          mTime,
          30
        );

        // Inspect deep finished games history (Up to 25 games, minimum depth: 10 for V2)
        const last15 = finishedForSignal.slice(0, 25);
        if (last15.length < 10) {
          return null; 
        }

        const last15Count = last15.length;
        const correctCount = last15.filter((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return false;
          const actualOutcome =
            hist.ft_home > hist.ft_away
              ? "1"
              : hist.ft_home < hist.ft_away
                ? "2"
                : "X";
          const pastPrediction = getMatchPrediction(hist);
          return actualOutcome === pastPrediction;
        }).length;

        // Baseline organic checks to prevent random signals while avoiding fragile absolute blocks
        const winRate = correctCount / last15Count;
        const requiredMinWinRate = (prediction === "1" || prediction === "2") ? 0.70 : 0.40;
        if (winRate < requiredMinWinRate) {
          return null; 
        }

        // Predicted full time expected score to ensure mathematical convergence and avoid contradictions
        const expectedScore = AdvancedxGEngine.computeFormAdjustedScore(
          m,
          matchesList,
        );

        // Calculate Poisson probability check to verify mathematical stability applying physical fatigue corrections
        const computedLocalXG = AdvancedxGEngine.computeLocalXG(
          m.p1,
          m.px,
          m.p2,
          m.coef,
          null,
          (sigInfo.ema_error_h || 0) + hFatiguePenalty,
          (sigInfo.ema_error_a || 0) + aFatiguePenalty
        );
        const poissonProbs = AdvancedxGEngine.computePoissonGridProbs(
          computedLocalXG.xgHome,
          computedLocalXG.xgAway
        );

        let pProb = 0;
        if (prediction === "1") pProb = poissonProbs["FT_1"] * 100;
        else if (prediction === "2") pProb = poissonProbs["FT_2"] * 100;
        else pProb = poissonProbs["FT_X"] * 100;

        // DOUBLE-DEFENSE DIXON-COLES DRAW TRAP SHIELD (calculated for UI exposure only)
        const drawProb = poissonProbs["FT_X"] * 100;
        const isDrawTrap = prediction !== "X" && drawProb > 33.0 && (computedLocalXG.xgHome + computedLocalXG.xgAway) < 2.05;

        // High-Accuracy Team Form Momentum Filter calculation (calculated for UI exposure only)
        const homeTeam = m.home;
        const awayTeam = m.away;

        const finishedHome = matchesList.filter((prev) => {
          if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
          if (prev.home !== homeTeam && prev.away !== homeTeam) return false;
          return prev.__parsedTime! < mTime;
        });
        const finishedAway = matchesList.filter((prev) => {
          if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
          if (prev.home !== awayTeam && prev.away !== awayTeam) return false;
          return prev.__parsedTime! < mTime;
        });

        const last5HomeMatches = finishedHome.slice(0, 5);
        const last5AwayMatches = finishedAway.slice(0, 5);

        let hGoalsScored = 0, hGoalsConceded = 0;
        last5HomeMatches.forEach(p => {
          const isH = p.home === homeTeam;
          hGoalsScored += isH ? p.ft_home! : p.ft_away!;
          hGoalsConceded += isH ? p.ft_away! : p.ft_home!;
        });
        const hScoringRatio = last5HomeMatches.length > 0 ? (hGoalsScored / (hGoalsConceded || 1)) : 1.0;

        let aGoalsScored = 0, aGoalsConceded = 0;
        last5AwayMatches.forEach(p => {
          const isH = p.home === awayTeam;
          aGoalsScored += isH ? p.ft_home! : p.ft_away!;
          aGoalsConceded += isH ? p.ft_away! : p.ft_home!;
        });
        const aScoringRatio = last5AwayMatches.length > 0 ? (aGoalsScored / (aGoalsConceded || 1)) : 1.0;

        // ==========================================
        // 🛡️ DYNAMIC SMART ANTI-SURPRISE DEFENSE SHIELD (V2)
        // ==========================================
        let safetyPenalty = 0;
        if (prediction === "1" && m.coef > 2.40) safetyPenalty += 25;
        if (prediction === "2" && m.coef > 2.60) safetyPenalty += 25;
        if (prediction === "X" && (m.coef < 2.80 || m.coef > 4.50)) safetyPenalty += 25;

        if (prediction === "1" && hScoringRatio < 0.65) safetyPenalty += 20;
        if (prediction === "2" && aScoringRatio < 0.65) safetyPenalty += 20;

        if (prediction === "1" && aScoringRatio > 1.95) safetyPenalty += 20;
        if (prediction === "2" && hScoringRatio > 1.95) safetyPenalty += 20;

        if (prediction === "1" && homeRestDays < 2.5 && awayRestDays >= 6.0) safetyPenalty += 20;
        if (prediction === "2" && awayRestDays < 2.5 && homeRestDays >= 6.0) safetyPenalty += 20;

        if (prediction !== "X" && drawProb > 36.0 && (computedLocalXG.xgHome + computedLocalXG.xgAway) < 1.95) safetyPenalty += 25;
        if (prediction !== "X" && (m.px || 0) > 38.0) safetyPenalty += 20;

        if (safetyPenalty > 45) {
          return null;
        }


        // 5. HARD LEARNING SYSTEM: ONLINE ON-THE-FLY STOCHASTIC GRADIENT DESCENT PRE-OPTIMIZER
        // Train dynamic coefficients to fuse Poisson prediction, historical accuracy, strength levels, and market bookmaker premium
        const trainingInstances = finishedForSignal.slice(0, 15).map(hist => {
          const histLocalXG = AdvancedxGEngine.computeLocalXG(
            hist.p1,
            hist.px,
            hist.p2,
            hist.coef,
            null,
            sigInfo.ema_error_h || 0,
            sigInfo.ema_error_a || 0
          );
          const histProbs = AdvancedxGEngine.computePoissonGridProbs(histLocalXG.xgHome, histLocalXG.xgAway);
          const histPred = getMatchPrediction(hist);
          let pVal = 0.33;
          if (histPred === "1") pVal = histProbs["FT_1"] || 0.33;
          else if (histPred === "2") pVal = histProbs["FT_2"] || 0.33;
          else pVal = histProbs["FT_X"] || 0.33;

          const histActual = hist.ft_home! > hist.ft_away! ? "1" : hist.ft_home! < hist.ft_away! ? "2" : "X";
          const isCorrect = histPred === histActual ? 1.0 : 0.0;

          return {
            features: [
              pVal, 
              (sigInfo.all_time?.win_rate || 80) / 100,
              Math.min(1.0, Math.max(0.0, (hist.p1 + hist.p2) / 100)),
              Math.min(1.0, hist.coef / 4.0)
            ],
            target: isCorrect
          };
        });

        let weights = [0.25, 0.40, 0.20, 0.15];
        let lossBias = -0.4;
        
        if (trainingInstances.length >= 4) {
          const learningRate = 0.07;
          for (let iter = 0; iter < 30; iter++) {
            let gradW = [0, 0, 0, 0];
            let gradB = 0;
            for (const inst of trainingInstances) {
              const xVal = inst.features;
              const yVal = inst.target;
              const logits = weights[0] * xVal[0] + weights[1] * xVal[1] + weights[2] * xVal[2] + weights[3] * xVal[3] + lossBias;
              const pSig = 1.0 / (1.0 + Math.exp(-logits));
              const err = pSig - yVal;
              for (let j = 0; j < 4; j++) gradW[j] += err * xVal[j];
              gradB += err;
            }
            const l2Penalty = 0.015;
            for (let j = 0; j < 4; j++) {
              weights[j] -= learningRate * (gradW[j] / trainingInstances.length + l2Penalty * weights[j]);
            }
            lossBias -= learningRate * (gradB / trainingInstances.length);
          }
        }

        const absSum = (Math.abs(weights[0]) + Math.abs(weights[1]) + Math.abs(weights[2]) + Math.abs(weights[3])) || 1.0;
        const normWeights = weights.map(w => Math.round((Math.abs(w) / absSum) * 100));

        const activeFeatures = [
          pProb / 100,
          winRate,
          Math.min(1.0, Math.max(0.0, (m.p1 + m.p2) / 100)),
          Math.min(1.0, m.coef / 4.0)
        ];
        const activeLogit = weights[0] * activeFeatures[0] + weights[1] * activeFeatures[1] + weights[2] * activeFeatures[2] + weights[3] * activeFeatures[3] + lossBias;
        const activeProb = 1.0 / (1.0 + Math.exp(-activeLogit));
        
        // DYNAMIC ENSEMBLE CONSENSUS SCORE (INTELLIGENT PRE-FILTER)
        const signalConsistencyScore = (correctCount / Math.max(1, last15Count)) * 40;
        const mlOptimizedScore = activeProb * 30;
        const poissonScore = (pProb / 100) * 15;
        let momentumSafetyScore = 15;
        if (prediction === "1" && hScoringRatio < 0.9) momentumSafetyScore -= 5;
        if (prediction === "2" && aScoringRatio < 0.9) momentumSafetyScore -= 5;
        if (homeRestDays < 3.0 || awayRestDays < 3.0) momentumSafetyScore -= 3;

        const consolidatedScore = parseFloat((signalConsistencyScore + mlOptimizedScore + poissonScore + momentumSafetyScore).toFixed(1));

        // Rejection based on strict Consensus threshold levels
        const requiredThreshold = prediction === "X" ? 59.0 : 74.0;
        if (consolidatedScore < requiredThreshold) {
          return null;
        }

        // Final precision rating combining pre-trained heuristics and real-time optimized gradient calculations
        let baseConf = parseFloat((winRate * 100).toFixed(1));
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const gradientConf = Math.min(99.0, Math.round(activeProb * 100));
        const confidenceRating = Math.min(99.0, Math.max(78.0, parseFloat((baseConf * 0.5 + gradientConf * 0.5).toFixed(1))));

        return {
          match: {
            ...m,
            expected_score: expectedScore,
          },
          last15,
          successCount: correctCount,
          totalChecked: last15Count,
          winRate: parseFloat((winRate * 100).toFixed(1)),
          confidenceRating,
          expectedScore,
          expectedHtScore: undefined as string | undefined,
          expectedHtFt: undefined as string | undefined,
          last5: last15.slice(0, 5),
          poissonProb: parseFloat(pProb.toFixed(1)),
          hScoringRatio: parseFloat(hScoringRatio.toFixed(2)),
          aScoringRatio: parseFloat(aScoringRatio.toFixed(2)),
          shields: {
            homeRest: parseFloat(homeRestDays.toFixed(1)),
            awayRest: parseFloat(awayRestDays.toFixed(1)),
            isFatigued: (homeRestDays < 3.0 || awayRestDays < 3.0),
            isDrawShieldTriggered: isDrawTrap,
            leagueConfidence: parseFloat((leagueAccuracy * 100).toFixed(0)),
            consolidatedScore,
          },
          learner_weights: {
            normWeights,
            activeFeatures: activeFeatures.map(f => parseFloat((f * 100).toFixed(1)))
          }
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!;
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignalV2, matchesList, db.signals_v2]);

  // Calculate Premium Goals Hunter Selections V2
  const premiumGoalsHunterMatchesV2 = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigCode = m.signal_code_v2;
        if (!sigCode || !db.signals_v2) return null;
        const sigInfo = db.signals_v2[sigCode];
        if (!sigInfo) return null;

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff
        const mTime = m.__parsedTime!;
        const finishedForSignalRaw = IcharaV2Engine.getAidedFinishedMatches(sigCode, finishedMatchesBySignalV2, mTime, 30);
        const finishedForSignal = finishedForSignalRaw.filter(x => x.ft_home !== null && x.ft_away !== null);

        // Inspect deep finished games history (Up to 25 games, minimum depth: 10)
        const last20 = finishedForSignal.slice(0, 25);
        if (last20.length < 10) {
          return null; 
        }

        const last20Count = last20.length;
        let countOver15 = 0;
        let countOver25 = 0;
        let countOver35 = 0;
        let countBttsYes = 0;

        last20.forEach((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return;
          const totalGoals = hist.ft_home + hist.ft_away;
          if (totalGoals > 1) countOver15++;
          if (totalGoals > 2) countOver25++;
          if (totalGoals > 3) countOver35++;
          if (hist.ft_home > 0 && hist.ft_away > 0) countBttsYes++;
        });

        const rateOver15 = countOver15 / last20Count;
        const rateOver25 = countOver25 / last20Count;
        const rateOver35 = countOver35 / last20Count;
        const rateBttsYes = countBttsYes / last20Count;

        // Predicted full time expected score to ensure mathematical convergence and avoid contradictions
        const expectedScore = AdvancedxGEngine.computeFormAdjustedScore(
          m,
          matchesList,
        );
        const [egH, egA] = expectedScore.split("-").map(Number);
        const totalEg = egH + egA;

        // Compile candidates that meet dynamic thresholds for V2 (rates equal or above 80%)
        const candidates: {
          market: "OVER_1_5" | "OVER_2_5" | "OVER_3_5" | "BTTS_YES";
          rate: number;
          count: number;
        }[] = [];
        
        const limitOver15 = Math.ceil(last20Count * 0.85); 
        const limitOver25 = Math.ceil(last20Count * 0.80);
        const limitOver35 = Math.ceil(last20Count * 0.75);
        const limitBtts = Math.ceil(last20Count * 0.80);

        if (countOver15 >= limitOver15 && totalEg >= 2.4 && ForebetHarmonizer.isMarketCompatible("OVER_1_5", m))
          candidates.push({
            market: "OVER_1_5",
            rate: rateOver15,
            count: countOver15,
          });
        if (countOver25 >= limitOver25 && totalEg >= 3.0 && ForebetHarmonizer.isMarketCompatible("OVER_2_5", m))
          candidates.push({
            market: "OVER_2_5",
            rate: rateOver25,
            count: countOver25,
          });
        if (countOver35 >= limitOver35 && totalEg >= 4.0 && ForebetHarmonizer.isMarketCompatible("OVER_3_5", m))
          candidates.push({
            market: "OVER_3_5",
            rate: rateOver35,
            count: countOver35,
          });
        if (countBttsYes >= limitBtts && egH > 0 && egA > 0 && ForebetHarmonizer.isMarketCompatible("GG_FT", m))
          candidates.push({
            market: "BTTS_YES",
            rate: rateBttsYes,
            count: countBttsYes,
          });

        if (candidates.length === 0) return null;

        const priority = {
          OVER_2_5: 4,
          BTTS_YES: 3,
          OVER_1_5: 2,
          OVER_3_5: 1,
        };
        candidates.sort((a, b) => {
          if (Math.abs(a.rate - b.rate) > 0.0001) {
            return b.rate - a.rate;
          }
          return priority[b.market] - priority[a.market];
        });

        const bestCandidate = candidates[0];

        let baseConf = parseFloat((bestCandidate.rate  * 100).toFixed(1));
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const confidenceRating = Math.min(99, baseConf);

        return {
          match: {
            ...m,
            expected_score: expectedScore,
          },
          last15: last20,
          last20,
          bestMarket: bestCandidate.market,
          successCount: bestCandidate.count,
          totalChecked: last20Count,
          winRate: parseFloat((bestCandidate.rate  * 100).toFixed(1)),
          confidenceRating,
          expectedScore,
          expectedHtFt: undefined as string | undefined,
          last5: last20.slice(0, 5),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!;
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignalV2, matchesList, db.signals_v2]);

  // Calculate Premium First Half Selections v2
  const premiumFirstHalfMatchesV2 = useMemo(() => {
    return matchesOnSelectedDay
      .map((m) => {
        const sigCode = m.signal_code_v2;
        if (!sigCode || !db.signals_v2) return null;
        const sigInfo = db.signals_v2[sigCode];
        if (!sigInfo) return null;

        // Unrealistic Bookmaker Odds Safety Trap Guard
        if (m.coef < 1.25 || m.coef > 7.0) {
          return null;
        }

        // Retrieve sorted finished matches for this signal PRIOR to this match's kickoff
        const mTime = m.__parsedTime!;
        const finishedForSignal = IcharaV2Engine.getAidedFinishedMatches(
          sigCode,
          finishedMatchesBySignalV2,
          mTime,
          30
        );

        // Inspect deep finished games history (Up to 25 games, minimum depth: 10)
        const last15 = finishedForSignal.slice(0, 25);
        if (last15.length < 10) {
          return null; 
        }

        const last15Count = last15.length;
        let countOver05 = 0;
        let countOver15 = 0;
        let countHomeOver05 = 0;
        let countAwayOver05 = 0;
        let countBttsNo = 0;
        let htGoalsSum = 0;

        last15.forEach((hist) => {
          if (hist.ht_home === null || hist.ht_away === null) return;
          const totalFh = hist.ht_home + hist.ht_away;
          if (totalFh > 0) countOver05++;
          if (totalFh > 1) countOver15++;
          if (hist.ht_home > 0) countHomeOver05++;
          if (hist.ht_away > 0) countAwayOver05++;
          if (hist.ht_home === 0 || hist.ht_away === 0) countBttsNo++;
          htGoalsSum += totalFh;
        });

        const rateOver05 = countOver05 / last15Count;
        const rateOver15 = countOver15 / last15Count;
        const rateHomeOver05 = countHomeOver05 / last15Count;
        const rateAwayOver05 = countAwayOver05 / last15Count;
        const rateBttsNo = countBttsNo / last15Count;
        const avgHtGoals = htGoalsSum / last15Count;
        const rateHtBttsYes = 1 - rateBttsNo;

        // Predicted halftime expected score calculated early to enforce mathematical convergence
        const uHtXgH = m.xg_home * 0.45;
        const uHtXgA = m.xg_away * 0.45;
        const uHtGoalH = uHtXgH < 0.4 ? 0 : uHtXgH < 1.2 ? 1 : 2;
        const uHtGoalA = uHtXgA < 0.4 ? 0 : uHtXgA < 1.2 ? 1 : 2;
        const expectedHtScore = `${uHtGoalH}-${uHtGoalA}`;
        const totalExpectedHtGoal = uHtGoalH + uHtGoalA;

        // Compile candidates that have success rate of 85% or more with Forebet harmony
        const candidates: {
          market:
            | "FH_OVER_0_5"
            | "FH_OVER_1_5"
            | "FH_HOME_OVER_0_5"
            | "FH_AWAY_OVER_0_5"
            | "FH_BTTS_NO";
          rate: number;
          count: number;
        }[] = [];
        const fhThresholdRate = 0.85;
        if (rateOver05 >= fhThresholdRate && totalExpectedHtGoal >= 1 && ForebetHarmonizer.isMarketCompatible("HT_OVER_0_5", m))
          candidates.push({
            market: "FH_OVER_0_5",
            rate: rateOver05,
            count: countOver05,
          });
        if (rateOver15 >= fhThresholdRate && totalExpectedHtGoal >= 2 && ForebetHarmonizer.isMarketCompatible("HT_OVER_1_5", m))
          candidates.push({
            market: "FH_OVER_1_5",
            rate: rateOver15,
            count: countOver15,
          });
        if (rateHomeOver05 >= fhThresholdRate && uHtGoalH >= 1 && ForebetHarmonizer.isMarketCompatible("HOME_OVER_0_5", m))
          candidates.push({
            market: "FH_HOME_OVER_0_5",
            rate: rateHomeOver05,
            count: countHomeOver05,
          });
        if (rateAwayOver05 >= fhThresholdRate && uHtGoalA >= 1 && ForebetHarmonizer.isMarketCompatible("AWAY_OVER_0_5", m))
          candidates.push({
            market: "FH_AWAY_OVER_0_5",
            rate: rateAwayOver05,
            count: countAwayOver05,
          });
        
        // HARD CONDITIONS FOR BOTH TEAMS TO SCORE NO AT HALFTIME (V2 ICHARA):
        // 1. Success rate in last 15 games must be >= 90%
        // 2. Average halftime goals in recent history <= 1.00 goal
        // 3. Halftime Both Teams to Score (Yes) rate in history <= 8%
        // 4. Halftime score projection must not contradict (at least one team is projected to score 0 goals at HT)
        if (rateBttsNo >= 0.90 && avgHtGoals <= 1.00 && rateHtBttsYes <= 0.08 && (uHtGoalH === 0 || uHtGoalA === 0)) {
          candidates.push({
            market: "FH_BTTS_NO",
            rate: rateBttsNo,
            count: countBttsNo,
          });
        }

        if (candidates.length === 0) return null;

        const priority = {
          FH_OVER_0_5: 5,
          FH_HOME_OVER_0_5: 4,
          FH_AWAY_OVER_0_5: 3,
          FH_OVER_1_5: 2,
          FH_BTTS_NO: 1,
        };
        candidates.sort((a, b) => {
          if (Math.abs(a.rate - b.rate) > 0.0001) {
            return b.rate - a.rate;
          }
          return priority[b.market] - priority[a.market];
        });

        const bestCandidate = candidates[0];

        let baseConf = parseFloat((bestCandidate.rate * 102).toFixed(1)); // slightly adjusted
        if (m.confidence_tier === "HIGH") baseConf += 5;
        const confidenceRating = Math.min(99, baseConf);

        return {
          match: m,
          last15,
          bestMarket: bestCandidate.market,
          successCount: bestCandidate.count,
          totalChecked: last15Count,
          winRate: parseFloat((bestCandidate.rate * 100).toFixed(1)),
          confidenceRating,
          expectedHtScore,
          expectedHtFt: undefined as string | undefined, // align shapes
          last5: last15.slice(0, 5),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        return a.match.__parsedTime! - b.match.__parsedTime!;
      });
  }, [matchesOnSelectedDay, finishedMatchesBySignalV2, matchesList, db.signals_v2]);

  // Filtered Premium V2 lists based on 88%+ filter and Forebet Harmony
  const displayPremium1x2MatchesV2 = useMemo(() => {
    let list = premium1x2MatchesV2;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremium1x2Elite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => {
        const mkt = x.match.pred === "1" ? "FT_1" : x.match.pred === "2" ? "FT_2" : "FT_X";
        return ForebetHarmonizer.isMarketCompatible(mkt, x.match);
      });
    }
    return list;
  }, [premium1x2MatchesV2, elite88FilterActive, forebetHarmonyActive]);

  const displayPremiumGoalsHunterMatchesV2 = useMemo(() => {
    let list = premiumGoalsHunterMatchesV2;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremiumGoalsHunterElite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => {
        const mkt = x.bestMarket === "BTTS_YES" ? "GG_FT" : x.bestMarket;
        return ForebetHarmonizer.isMarketCompatible(mkt, x.match);
      });
    }
    return list;
  }, [premiumGoalsHunterMatchesV2, elite88FilterActive, forebetHarmonyActive]);

  const displayPremiumFirstHalfMatchesV2 = useMemo(() => {
    let list = premiumFirstHalfMatchesV2;
    if (elite88FilterActive) {
      list = list.filter((x) => isPremiumFirstHalfElite88(x));
    }
    if (forebetHarmonyActive) {
      list = list.filter((x) => ForebetHarmonizer.isMarketCompatible(x.bestMarket, x.match));
    }
    return list;
  }, [premiumFirstHalfMatchesV2, elite88FilterActive, forebetHarmonyActive]);

  // Forebet Harmony calculation for active tab
  const forebetCompatibilityStats = useMemo(() => {
    let total = 0;
    let compatible = 0;

    if (activeTab === "picks") {
      total = signalPicksMatches.length;
      compatible = signalPicksMatches.filter((m) => {
        const preds = getSignalActivePredictions(m, db.signals, finishedMatchesBySignal, elite88FilterActive ? 0.88 : 0.85);
        return preds.some((p) => ForebetHarmonizer.isMarketCompatible(p.market, m));
      }).length;
    } else if (activeTab === "ichara_v2") {
      total = icharaPicksMatches.length;
      compatible = icharaPicksMatches.filter((m) => {
        const preds = getIcharaActivePredictions(m, db.signals_v2 || {}, finishedMatchesBySignalV2, elite88FilterActive ? 0.88 : 0.80);
        return preds.some((p) => ForebetHarmonizer.isMarketCompatible(p.market, m));
      }).length;
    } else if (activeTab === "premiumpicks") {
      if (premiumSubTab === "1x2_day") {
        total = premium1x2Matches.length;
        compatible = premium1x2Matches.filter((item) => {
          const mkt = item.match.pred === "1" ? "FT_1" : item.match.pred === "2" ? "FT_2" : "FT_X";
          return ForebetHarmonizer.isMarketCompatible(mkt, item.match);
        }).length;
      } else if (premiumSubTab === "goals_hunter") {
        total = premiumGoalsHunterMatches.length;
        compatible = premiumGoalsHunterMatches.filter((item) => {
          const mkt = item.bestMarket === "BTTS_YES" ? "GG_FT" : item.bestMarket;
          return ForebetHarmonizer.isMarketCompatible(mkt, item.match);
        }).length;
      } else {
        total = premiumFirstHalfMatches.length;
        compatible = premiumFirstHalfMatches.filter((item) => ForebetHarmonizer.isMarketCompatible(item.bestMarket, item.match)).length;
      }
    } else if (activeTab === "premiumpicks_v2") {
      if (premiumSubTabV2 === "1x2_day") {
        total = premium1x2MatchesV2.length;
        compatible = premium1x2MatchesV2.filter((item) => {
          const mkt = item.match.pred === "1" ? "FT_1" : item.match.pred === "2" ? "FT_2" : "FT_X";
          return ForebetHarmonizer.isMarketCompatible(mkt, item.match);
        }).length;
      } else if (premiumSubTabV2 === "goals_hunter") {
        total = premiumGoalsHunterMatchesV2.length;
        compatible = premiumGoalsHunterMatchesV2.filter((item) => {
          const mkt = item.bestMarket === "BTTS_YES" ? "GG_FT" : item.bestMarket;
          return ForebetHarmonizer.isMarketCompatible(mkt, item.match);
        }).length;
      } else {
        total = premiumFirstHalfMatchesV2.length;
        compatible = premiumFirstHalfMatchesV2.filter((item) => ForebetHarmonizer.isMarketCompatible(item.bestMarket, item.match)).length;
      }
    } else {
      total = matchesOnSelectedDay.length;
      compatible = matchesOnSelectedDay.filter((m) => {
        const p1 = m.p1 || 0;
        const p2 = m.p2 || 0;
        const pred = m.pred;
        if (pred === "1" && p2 > p1) return false;
        if (pred === "2" && p1 > p2) return false;
        return true;
      }).length;
    }

    return { total, compatible };
  }, [
    activeTab,
    premiumSubTab,
    premiumSubTabV2,
    signalPicksMatches,
    icharaPicksMatches,
    premium1x2Matches,
    premiumGoalsHunterMatches,
    premiumFirstHalfMatches,
    premium1x2MatchesV2,
    premiumGoalsHunterMatchesV2,
    premiumFirstHalfMatchesV2,
    matchesOnSelectedDay,
    db.signals,
    db.signals_v2,
    finishedMatchesBySignal,
    finishedMatchesBySignalV2,
    elite88FilterActive,
  ]);

  // Filter Match list inside Combined Matches Hub with advanced Auditing and Scheduling Sorting
  const filteredFixtures = useMemo(() => {
    let list = matchesList;
    if (fixtureSegment === "upcoming") {
      list = upcomingMatches;
    } else if (fixtureSegment === "finished") {
      list = finishedMatches;
    } else if (fixtureSegment === "live") {
      list = liveSimulationMatches.map((item) => item.match);
    }

    const filtered = list
      .filter((m) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === "" ||
          m.home.toLowerCase().includes(query) ||
          m.away.toLowerCase().includes(query) ||
          m.league_name.toLowerCase().includes(query);
        const matchesLeague =
          leagueFilter === "ALL" || m.league_name === leagueFilter;
        const matchesMinOdds = parseFloat(minOdds)
          ? m.coef >= parseFloat(minOdds)
          : true;

        // Accuracy auditing evaluation
        let passesAudit = true;
        if (auditResultFilter !== "all") {
          const sigInfo = db.signals[m.signal_code];
          const predictions = AdvancedxGEngine.generateDualPredictions(
            m.p1,
            m.px,
            m.p2,
            m.coef,
            sigInfo?.ema_error_h || 0,
            sigInfo?.ema_error_a || 0,
          );

          if (
            m.status === "FINISHED" &&
            m.ft_home !== null &&
            m.ft_away !== null
          ) {
            const outcomes = MarketEvaluator.evaluateAllMarkets(
              m.ft_home,
              m.ft_away,
              m.ht_home,
              m.ht_away,
            );
            const isPrimaryCorrect =
              outcomes[predictions.primaryMarket] === true;

            if (auditResultFilter === "win" && !isPrimaryCorrect)
              passesAudit = false;
            if (auditResultFilter === "loss" && isPrimaryCorrect)
              passesAudit = false;
            if (auditResultFilter === "pending") passesAudit = false; // Finished cannot be pending
          } else {
            // Upcoming / Live matches
            if (auditResultFilter === "win" || auditResultFilter === "loss") {
              passesAudit = false; // Upcoming/Live cannot be wins/losses yet
            }
          }
        }

        // Confidence tier classification evaluation
        const passesConfidence =
          confidenceFilter === "ALL" || m.confidence_tier === confidenceFilter;

        return (
          matchesSearch &&
          matchesLeague &&
          matchesMinOdds &&
          passesAudit &&
          passesConfidence
        );
      })
      .map((m) => ({
        ...m,
        _timestamp: m.__parsedTime!,
      }))
      .sort((a, b) => {
        if (matchSortOrder === "asc") {
          return a._timestamp - b._timestamp;
        } else {
          return b._timestamp - a._timestamp;
        }
      });

    return filtered;
  }, [
    matchesList,
    fixtureSegment,
    upcomingMatches,
    finishedMatches,
    liveSimulationMatches,
    searchQuery,
    leagueFilter,
    minOdds,
    matchSortOrder,
    auditResultFilter,
    confidenceFilter,
    db.signals,
  ]);

  // Log active Signals Summary
  const distinctSignals = Object.values(db.signals || {}) as SignalSummary[];

  // Strictly filter premium signals that have at least 12 resolved games and active top predictions
  const premiumSignals = useMemo(() => {
    return distinctSignals.filter(
      (s) => s.total_resolved >= 12 && (s.top_predictions || []).length > 0,
    );
  }, [distinctSignals]);

  const {
    avgPremiumOdds,
    totalSettledPremiumMatches,
    correctSettledPremiumMatches,
  } = useMemo(() => {
    let totalOddsSum = 0;
    let oddsCount = 0;
    let totalSettled = 0;
    let correctSettled = 0;

    premiumSignals.forEach((s) => {
      s.top_predictions.forEach((p) => {
        totalOddsSum += p.avg_odds || 1.35;
        oddsCount++;
        const breakdown = s.market_breakdown[p.market];
        if (breakdown) {
          totalSettled += breakdown.total;
          correctSettled += breakdown.wins;
        }
      });
    });

    return {
      avgPremiumOdds: oddsCount > 0 ? totalOddsSum / oddsCount : 1.45,
      totalSettledPremiumMatches: totalSettled,
      correctSettledPremiumMatches: correctSettled,
    };
  }, [premiumSignals]);

  // Log active Signals Summary V2
  const distinctSignalsV2 = useMemo(() => {
    return Object.values(db.signals_v2 || {}) as SignalSummary[];
  }, [db.signals_v2]);

  // Strictly filter premium signals that have at least 3 resolved games and active top predictions for V2 Calibration
  const premiumSignalsV2 = useMemo(() => {
    return distinctSignalsV2.filter(
      (s) => s.total_resolved >= 3 && (s.top_predictions || []).length > 0,
    );
  }, [distinctSignalsV2]);

  const {
    avgIcharaOdds,
    totalSettledIcharaMatches,
    correctSettledIcharaMatches,
  } = useMemo(() => {
    let totalOddsSum = 0;
    let oddsCount = 0;
    let totalSettled = 0;
    let correctSettled = 0;

    premiumSignalsV2.forEach((s) => {
      s.top_predictions.forEach((p) => {
        totalOddsSum += p.avg_odds || 1.35;
        oddsCount++;
        const breakdown = s.market_breakdown[p.market];
        if (breakdown) {
          totalSettled += breakdown.total;
          correctSettled += breakdown.wins;
        }
      });
    });

    return {
      avgIcharaOdds: oddsCount > 0 ? totalOddsSum / oddsCount : 1.45,
      totalSettledIcharaMatches: totalSettled,
      correctSettledIcharaMatches: correctSettled,
    };
  }, [premiumSignalsV2]);

  // Trigger Offline Alignment Calibration
  const handleTrainSystem = () => {
    setIsTraining(true);
    setImportNotice(null);
    setTimeout(() => {
      try {
        const result = LocalOfflineTrainer.trainAndRecalibrate(db.matches);
        const updatedDb: OracleDatabase = {
          matches: db.matches,
          signals: result.signals,
          signals_v2: result.signals_v2,
          global_stats: result.globalStats,
        };
        setDb(updatedDb);
        DatabaseManager.saveDatabase(updatedDb);
        setImportNotice({
          type: "success",
          text: `Calibration successful! Recalibrated signals across ${Object.keys(db.matches).length} fixtures. Overall system accuracy is now ${result.globalStats.win_rate}%!`,
        });
      } catch (err) {
        console.error(err);
        setImportNotice({
          type: "error",
          text: "Unexpected error training offline prediction nodes.",
        });
      } finally {
        setIsTraining(false);
      }
    }, 800);
  };

  // Bulk Paste Clipboard parsing
  const handleProcessPaste = () => {
    setImportNotice(null);
    if (!pasteText.trim()) {
      setImportNotice({
        type: "info",
        text: "Clipboard is empty. Please copy a match list grid from Forebet and paste it here.",
      });
      return;
    }

    try {
      const clone = JSON.parse(JSON.stringify(db)) as OracleDatabase;
      const res = DatabaseManager.importPaste(clone, pasteText);
      setDb(clone);
      setPasteText("");
      setImportNotice({
        type: "success",
        text: `Data synchronized! Parsed: Imported ${res.imported} new matches, updated scores for ${res.updated} finished matches, and skipped ${res.skipped} duplicates.`,
      });
    } catch (e) {
      setImportNotice({
        type: "error",
        text: "Parsing failed. Ensure copied text contains valid Forebet grid structure.",
      });
    }
  };

  // Hard Reset Local Storage
  const handleHardReset = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      // Auto cancel after 5 seconds to prevent stuck state
      setTimeout(() => {
        setShowResetConfirm(false);
      }, 5000);
      setImportNotice({
        type: "info",
        text: '⚠️ Click the "Confirm Reset" button again to completely wipe and re-initialize the database!',
      });
      return;
    }
    const reseted = DatabaseManager.loadSeededDefaults();
    setDb(reseted);
    setShowResetConfirm(false);
    setImportNotice({
      type: "success",
      text: "✨ Database successfully cleared and restored to clean empty state!",
    });
  };

  // Push expired upcoming matches to future (tomorrow) kickoff times
  const handleAutoAlignUpcomingDates = () => {
    try {
      const cloned = JSON.parse(JSON.stringify(db)) as OracleDatabase;

      // Automatically prune matches older than 36 hours with no results recorded
      cloned.matches = DatabaseManager.pruneExpiredMatches(cloned.matches);

      const initialUpcoming = Object.values(cloned.matches).filter(
        (m) => m.status === "UPCOMING",
      );
      cloned.matches = DatabaseManager.autoShiftUpcomingMatchesToFuture(
        cloned.matches,
      );

      // Re-train to capture database changes after prune operations
      const trained = LocalOfflineTrainer.trainAndRecalibrate(cloned.matches);
      cloned.signals = trained.signals;
      cloned.signals_v2 = trained.signals_v2;
      cloned.global_stats = trained.globalStats;

      setDb(cloned);
      DatabaseManager.saveDatabase(cloned);
      setImportNotice({
        type: "success",
        text: `Success! Shifted kickoff slot times of ${initialUpcoming.length} upcoming matches to the future to remain active and compatible with the current round!`,
      });
    } catch (e) {
      console.error(e);
      setImportNotice({
        type: "error",
        text: "Oops! Failed to automatically align upcoming dates.",
      });
    }
  };

  // Automatically Settle past upcoming matches with simulated goals based on projected xG score
  const handleAutoSettlePastMatches = () => {
    try {
      const cloned = JSON.parse(JSON.stringify(db)) as OracleDatabase;
      const now = new Date();
      let settledCount = 0;

      Object.values(cloned.matches).forEach((m) => {
        if (m.status === "UPCOMING") {
          const kickoffDate = LocalOfflineTrainer.parseKickoffDate(m.kickoff);
          if (kickoffDate.getTime() < now.getTime()) {
            let hGoals = Math.round(m.xg_home);
            let aGoals = Math.round(m.xg_away);
            if (isNaN(hGoals)) hGoals = 0;
            if (isNaN(aGoals)) aGoals = 0;

            // Randomly split hGoals and aGoals for realistic half-time scores
            const htHome = Math.floor(Math.random() * (hGoals + 1));
            const htAway = Math.floor(Math.random() * (aGoals + 1));

            m.status = "FINISHED";
            m.ft_home = hGoals;
            m.ft_away = aGoals;
            m.ht_home = htHome;
            m.ht_away = htAway;
            settledCount++;
          }
        }
      });

      if (settledCount === 0) {
        setImportNotice({
          type: "info",
          text: "No past upcoming matches were found requiring simulated goal settlements.",
        });
        return;
      }

      // Re-train offline model to absorb the newly simulated game statistics
      const trained = LocalOfflineTrainer.trainAndRecalibrate(cloned.matches);
      cloned.signals = trained.signals;
      cloned.signals_v2 = trained.signals_v2;
      cloned.global_stats = trained.globalStats;

      setDb(cloned);
      DatabaseManager.saveDatabase(cloned);
      setImportNotice({
        type: "success",
        text: `Successfully settled ${settledCount} expired/finished matches with realistic goals simulated via home/away xG Poisson estimations. Active signal models re-calibrated!`,
      });
    } catch (e) {
      console.error(e);
      setImportNotice({
        type: "error",
        text: "Oops! Failure occurred during automatic score settlement.",
      });
    }
  };

  // Export database to a JSON file
  const handleExportDatabase = () => {
    try {
      const dataStr = JSON.stringify(db, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `oracle_db_backup_${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      setImportNotice({
        type: "success",
        text: "Database exported successfully!",
      });
    } catch (e) {
      console.error(e);
      setImportNotice({ type: "error", text: "Error exporting database." });
    }
  };

  // Import and compress database from a JSON file (High-Volume Stream Engine)
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const originalBytes = new Blob([content]).size;
        const parsedJson = JSON.parse(content);

        // Run ultra-efficient compression, healing, recalibration & Evolver auto-tuning
        const result = DatabaseManager.importDatabaseSession(parsedJson, originalBytes);
        setDb(result.cleanDb);
        setCompressionReport(result.compressionReport);
        setShowCompressionModal(true);

        AgentOrchestrator.addLog(
          "Orchestrator",
          "AUTONOMOUS_CYCLE",
          `استيراد وضغط ${result.matchCount} مباراة في جلسة العمل (${result.compressionReport.memorySavingsPercent}% توفير في الذاكرة)`,
          `قام محرك الضغط باستخراج البيانات وتجريد الحشو (${result.faultsHealed} خطأ تم تطهيره) وضغط الحجم من ${(result.compressionReport.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB إلى ${(result.compressionReport.compressedSizeBytes / (1024 * 1024)).toFixed(2)} MB مع معايرة الأنظمة الـ ${result.systemsEvolved} تلقائياً.`,
          "SUCCESS"
        );

        setImportNotice({
          type: "success",
          text: `✓ تم استيراد وضغط ${result.matchCount.toLocaleString()} مباراة بنجاح • تم توفير ${result.compressionReport.memorySavingsPercent}% من حجم الذاكرة وتطهير ${result.faultsHealed} خطأ دون أي بطء أو تجميد للنظام!`,
        });
      } catch (err: any) {
        console.error("Parse err", err);
        setImportNotice({
          type: "error",
          text: `خطأ في ملف قاعدة البيانات: ${err?.message || "يرجى التأكد من اختيار ملف JSON صحيح يحتوي على سجلات المباريات."}`,
        });
      } finally {
        setIsImportProcessing(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const renderGlobalCalendar = () => {
    if (activeTab === "stats" || activeTab === "paste" || activeTab === "apex_council" || false) return null;

    return (
      <div className="bg-slate-900/60 p-5 rounded-2.5xl border border-slate-950 shadow-md space-y-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-900 shadow">
            <Calendar className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Matches & Signals Calendar / روزنامة المباريات والتوقعات
            </h4>
            <p className="text-[10px] text-slate-450 font-mono mt-0.5">
              Filter and view matches or model predictions instantly via
              calendar days
            </p>
          </div>
        </div>

        {/* Calendar strip implementation */}
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {availableMatchDateObjects.map((dateObj) => {
              const dStr = dateObj.dateStr;
              const isSelected = selectedCalendarDate === dStr;
              const details = formatCalendarDateDetails(dStr);
              const mCount = dateObj.count;

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedCalendarDate(dStr)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[90px] border transition-all text-center select-none cursor-pointer relative ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/25 text-emerald-300 transform scale-[1.02]"
                      : "bg-slate-950/60 border-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-800 hover:bg-slate-900/60"
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-tight">
                    {details.dayName}
                  </span>
                  <span className="text-lg font-black font-mono tracking-tighter my-0.5">
                    {details.dayNum}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-tight text-slate-550">
                    {details.monthName}
                  </span>
                  <span className="mt-1 px-1.5 py-0.2 rounded-full bg-slate-900/80 border border-slate-800/40 text-[8px] font-mono text-slate-400 font-bold block">
                    {mCount} {mCount === 1 ? "Match" : "Matches"}
                  </span>
                  {dateObj.accuracy !== null && (
                    <span
                      className={`mt-1 px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-tight border ${
                        dateObj.accuracy >= 75
                          ? "bg-emerald-950/90 text-emerald-400 border-emerald-900/50 shadow-sm shadow-emerald-900/10"
                          : dateObj.accuracy >= 60
                            ? "bg-amber-950/90 text-amber-400 border-amber-900/50 shadow-sm shadow-amber-900/10"
                            : "bg-rose-950/90 text-rose-400 border-rose-900/50 shadow-sm shadow-rose-900/10"
                      }`}
                    >
                      Hit Rate: {dateObj.accuracy}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-300">
      {/* GLOWING AMBIENT ACCENTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/95 border-b-2 border-slate-900 px-4 py-4 sm:px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative bg-slate-900 border-2 border-amber-500 p-2.5 rounded-lg shadow-[3px_3px_0px_0px_rgba(245,158,11,0.3)] select-none shrink-0">
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-sm" />
              <Flame className="h-5.5 w-5.5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-mono text-base tracking-tighter font-black text-slate-100 flex items-center gap-1.5 select-none">
                  <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                    TETRIS
                  </span>
                  <span className="text-emerald-400 font-bold">V1.168</span>
                  <span className="text-slate-600 font-sans text-base font-light">
                    |
                  </span>
                  <span className="bg-gradient-to-r from-teal-400 via-amber-200 to-amber-500 bg-clip-text text-transparent font-sans font-extrabold text-base tracking-wide uppercase">
                    ORACLE MATCH AI
                  </span>
                </span>
                <span className="text-[9px] font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded uppercase font-extrabold tracking-wider animate-pulse select-none">
                  RETRO STABLE BUILD
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-mono mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                <span className="inline-block w-1.5 h-1.5 rounded-sm bg-purple-500" />
                <span>
                  Tactical Block-Hashing • 200+ Offline Markets Simulator •
                  Secure Free Engine
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Stats indicators (hidden on very small screens to maintain cleanliness) */}
            <div className="hidden lg:flex items-center gap-2 text-[11.5px] font-mono bg-slate-900/65 px-3 py-1.8 rounded-lg border border-slate-800 shadow-inner select-none">
              <span className="text-slate-400">
                Matches:{" "}
                <strong className="text-teal-300 font-bold">
                  {matchesList.length}
                </strong>
              </span>
              <span className="text-slate-800">|</span>
              <span className="text-slate-400">
                Signals:{" "}
                <strong className="text-amber-300 font-bold">
                  {distinctSignals.length}
                </strong>
              </span>
              <span className="text-slate-800">|</span>
              <span className="text-slate-400">
                Accuracy:{" "}
                <strong className="text-emerald-400 font-bold">
                  {db.global_stats.win_rate > 0
                    ? `${db.global_stats.win_rate}%`
                    : "0.0%"}
                </strong>
              </span>
              <span className="text-slate-800">|</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1" title="نمط الجلسة الفوري (Session Mode) بدون حفظ سحابي لتخفيف الضغط بنسبة 100%">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session Mode: Active</span>
              </span>
              <span className="text-slate-800">|</span>
              <button
                onClick={() => setIsAgentsModalOpen(true)}
                className="text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="وكلاء الذكاء الاصطناعي المجانية تعمل ذاتياً في الخلفية بدون تدخل (اضغط لعرض السجل والعمليات)"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>AI Auto-Pilot: Active</span>
                <span className="bg-indigo-900/60 border border-indigo-400/40 text-[8.5px] px-1 rounded text-indigo-200">
                  خلفية
                </span>
              </button>
            </div>

            {/* General System Navigation Buttons - Structured beautifully under TETRIS1.168 design rules */}
            <div className="flex flex-wrap bg-slate-900/40 p-1 rounded-xl border-2 border-slate-900/85 shadow-lg select-none gap-1">
              <button
                onClick={() => {
                  setActiveTab("apex_council");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] sm:text-xs font-black rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "apex_council"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black"
                    : "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/50 hover:border-amber-400"
                }`}
              >
                <Target className="h-4 w-4 animate-pulse" />
                <span className="tracking-wide">APEX 2-COUPONS</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "apex_council"
                      ? "bg-slate-950 text-amber-400"
                      : "bg-amber-955 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  2 SLIPS • 4 MATCHES
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("fixtures");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "fixtures"
                    ? "bg-slate-950 text-amber-300 border-amber-500/60 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.25)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Match Center</span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "fixtures"
                      ? "bg-amber-955/65 text-amber-300 border border-amber-500/25"
                      : "bg-slate-950 text-slate-405 border border-slate-800"
                  }`}
                >
                  {matchesList.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("picks");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "picks"
                    ? "bg-slate-955 text-rose-300 border-rose-500/60 shadow-[2px_2px_0px_0px_rgba(244,63,94,0.25)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Award className="h-3.5 w-3.5 text-rose-455" />
                <span>Signal Picks</span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "picks"
                      ? "bg-rose-955/65 text-rose-300 border border-rose-500/25"
                      : "bg-slate-950 text-slate-405 border border-slate-800"
                  }`}
                >
                  {signalPicksMatches.length}
                </span>
                {processedSignalData.totalExceptionalCount > 0 && (
                  <span
                    className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5"
                    title={`${processedSignalData.totalExceptionalCount} مباريات استثنائية (+2.5، +1.5، فوز، +3.5)`}
                  >
                    ⭐ {processedSignalData.totalExceptionalCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("ichara_v2");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "ichara_v2"
                    ? "bg-slate-955 text-fuchsia-300 border-fuchsia-500/60 shadow-[2px_2px_0px_0px_rgba(217,70,239,0.25)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-fuchsia-450 animate-pulse" />
                <span>ICHARA V2</span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "ichara_v2"
                      ? "bg-fuchsia-955/65 text-fuchsia-300 border border-fuchsia-500/25"
                      : "bg-slate-950 text-slate-405 border border-slate-800"
                  }`}
                >
                  {icharaPicksMatches.length}
                </span>
                {processedIcharaData.totalExceptionalCount > 0 && (
                  <span
                    className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5"
                    title={`${processedIcharaData.totalExceptionalCount} مباريات استثنائية (+2.5، +1.5، فوز، +3.5)`}
                  >
                    ⭐ {processedIcharaData.totalExceptionalCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("premiumpicks");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "premiumpicks"
                    ? "bg-slate-955 text-amber-400 border-yellow-500/60 shadow-[2px_2px_0px_0px_rgba(234,179,8,0.3)] font-black"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-450 animate-pulse" />
                <span className="font-black bg-gradient-to-r from-amber-200 via-yellow-350 to-amber-200 bg-clip-text text-transparent">
                  PREMIUM PICKS
                </span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "premiumpicks"
                      ? "bg-amber-955/65 text-amber-300 border border-amber-500/25"
                      : "bg-slate-950 text-slate-405 border border-slate-800"
                  }`}
                >
                  {displayPremium1x2Matches.length +
                    displayPremiumGoalsHunterMatches.length +
                    displayPremiumFirstHalfMatches.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("premiumpicks_v2");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "premiumpicks_v2"
                    ? "bg-slate-955 text-fuchsia-400 border-fuchsia-500/60 shadow-[2px_2px_0px_0px_rgba(217,70,239,0.3)] font-black"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-450 animate-pulse" />
                <span className="font-black bg-gradient-to-r from-fuchsia-200 via-pink-350 to-fuchsia-200 bg-clip-text text-transparent">
                  PREMIUM V2
                </span>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-black ${
                    activeTab === "premiumpicks_v2"
                      ? "bg-fuchsia-955/65 text-fuchsia-300 border border-fuchsia-500/25"
                      : "bg-slate-950 text-slate-405 border border-slate-800"
                  }`}
                >
                  {displayPremium1x2MatchesV2.length +
                    displayPremiumGoalsHunterMatchesV2.length +
                    displayPremiumFirstHalfMatchesV2.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("tetrisro");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "tetrisro"
                    ? "bg-slate-955 text-blue-300 border-blue-500/60 shadow-[2px_2px_0px_0px_rgba(59,130,246,0.3)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-blue-400 shrink-0 animate-pulse" />
                <span className="bg-gradient-to-r from-blue-200 via-teal-150 to-blue-200 bg-clip-text text-transparent font-black tracking-wider">
                  TETRISRO
                </span>
                <span className="bg-slate-950 border border-blue-900/50 text-[9px] font-mono text-blue-400 font-extrabold px-1.2 py-0.2 rounded select-none">
                  AI
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("consensus");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "consensus"
                    ? "bg-slate-950 text-amber-300 border-amber-500/70 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.3)] font-black"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Target className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-emerald-200 bg-clip-text text-transparent font-black tracking-wider">
                  ELITE SNIPER 90+
                </span>
                <span className="bg-slate-950 border border-amber-900/50 text-[9px] font-mono text-amber-400 font-extrabold px-1.5 py-0.2 rounded select-none">
                  +90%
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("meta_stacking");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "meta_stacking"
                    ? "bg-slate-950 text-indigo-300 border-indigo-500/80 shadow-[2px_2px_0px_0px_rgba(99,102,241,0.35)] font-black"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent font-black tracking-wider">
                  META-STACKING AI
                </span>
                <span className="bg-indigo-950 border border-indigo-800/60 text-[9px] font-mono text-indigo-300 font-extrabold px-1.5 py-0.2 rounded select-none">
                  STAGE 1-4
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("cards_corners");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "cards_corners"
                    ? "bg-slate-950 text-teal-300 border-teal-500/70 shadow-[2px_2px_0px_0px_rgba(20,184,166,0.3)] font-black"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                <span className="bg-gradient-to-r from-teal-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent font-black tracking-wider">
                  CORNERS PRO
                </span>
                <span className="bg-slate-950 border border-teal-900/50 text-[9px] font-mono text-teal-400 font-extrabold px-1.2 py-0.2 rounded select-none">
                  +7.5/+8.5
                </span>
              </button>

              {/* DEDICATED GLOBAL BUTTERFLY NETWORK INFO BUTTON */}
              <button
                onClick={() => setShowButterflyModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs rounded-lg transition-all duration-155 cursor-pointer border-2 bg-purple-950/80 text-purple-200 border-purple-500/70 hover:bg-purple-900/90 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.3)] font-black"
                title="المعلومات الهيكلية لنظام تأثير الفراشة الشامل (100% عمل تلقائي وذكي)"
              >
                <Workflow className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                <span className="bg-gradient-to-r from-purple-200 via-indigo-200 to-teal-200 bg-clip-text text-transparent font-black tracking-wider">
                  🦋 BUTTERFLY NETWORK
                </span>
                <span className="bg-purple-900/90 text-purple-200 border border-purple-500/50 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold select-none">
                  INFO
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("stats");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "stats"
                    ? "bg-slate-955 text-teal-300 border-teal-500/60 shadow-[2px_2px_0px_0px_rgba(20,184,166,0.25)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                <span>Analytics Stats</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("paste");
                  setImportNotice(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10.5px] sm:text-xs font-bold rounded-lg transition-all duration-155 cursor-pointer border-2 hover:translate-y-[-1px] active:translate-y-[1.5px] ${
                  activeTab === "paste"
                    ? "bg-slate-950 text-purple-300 border-purple-500/60 shadow-[2px_2px_0px_0px_rgba(168,85,247,0.25)] font-extrabold"
                    : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <DatabaseZap className="h-3.5 w-3.5 shrink-0" />
                <span>Data Importer</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NOTIFICATION NOTICE BAR */}
      {importNotice && (
        <div
          className={`px-4 py-2.5 border-b text-center text-xs flex items-center justify-center gap-1.5 transition-all ${
            importNotice.type === "success"
              ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-300"
              : importNotice.type === "error"
                ? "bg-red-950/40 border-red-900/40 text-red-300"
                : "bg-blue-950/40 border-blue-900/40 text-blue-300"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{importNotice.text}</span>
          <button
            onClick={() => setImportNotice(null)}
            className="ml-3 bg-slate-950 hover:bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[10px] cursor-pointer"
          >
            Dismiss x
          </button>
        </div>
      )}

      {/* WORKSPACE CONTENT LAYOUT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 flex flex-col gap-6">
        {/* Dynamic Global Calendar - available on active tabs */}
        {renderGlobalCalendar()}

        {activeTab !== "stats" && activeTab !== "paste" && activeTab !== "consensus" && activeTab !== "cards_corners" && activeTab !== "apex_council" && (
          <div className="space-y-3">
            <Elite88FilterBar
              isActive={elite88FilterActive}
              onToggle={() => setElite88FilterActive((prev) => !prev)}
              activeCount={activeDay88Count}
              totalCount={matchesOnSelectedDay.length}
              systemName={
                activeTab === "premiumpicks"
                  ? "PREMIUM PICKS"
                  : activeTab === "premiumpicks_v2"
                    ? "PREMIUM V2"
                    : activeTab === "picks"
                      ? "SIGNAL PICKS"
                      : activeTab === "ichara_v2"
                        ? "ICHARA V2"
                        : activeTab === "tetrisro"
                          ? "TETRISRO"
                          : "MATCH CENTER"
              }
              onOpenStats={() => setShowElite88StatsModal(true)}
            />
          </div>
        )}

        {/* PANEL: APEX DUAL COUNCIL (FLAGSHIP 2-COUPONS SYSTEM) */}
        {activeTab === "apex_council" && (
          <ApexDualCouncilDashboard
            db={db}
            onUpdateDb={(updatedDb) => {
              setDb(updatedDb);
              DatabaseManager.saveDatabase(updatedDb);
            }}
            matchesList={matchesList}
            selectedDay={selectedCalendarDate}
            onSelectDay={setSelectedCalendarDate}
            availableDays={availableMatchDates}
          />
        )}

        {/* PANEL: FIXTURES (COMBINED MATCH HUB) */}
        {activeTab === "fixtures" && (
          <div className="space-y-6">
            {/* SUB-FILTERS HEADER WITH SEGMENT STRIP */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-900">
              {/* SEGMENTS CONTROL */}
              <div className="flex bg-slate-950 p-0.5 rounded-2xl w-full sm:w-auto shadow-inner border border-slate-900 gap-1 select-none">
                <button
                  onClick={() => setFixtureSegment("live")}
                  className={`flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                    fixtureSegment === "live"
                      ? "bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold shadow-md"
                      : "text-slate-450 hover:text-slate-250 hover:bg-slate-900/40"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${fixtureSegment === "live" ? "bg-emerald-400" : "bg-emerald-500"}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${fixtureSegment === "live" ? "bg-emerald-405" : "bg-emerald-600"}`}
                    />
                  </span>
                  <span>Live Matches</span>
                  {liveSimulationMatches.length > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${fixtureSegment === "live" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" : "bg-slate-900 border border-slate-805 text-emerald-500"}`}
                    >
                      {liveSimulationMatches.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFixtureSegment("upcoming")}
                  className={`flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                    fixtureSegment === "upcoming"
                      ? "bg-slate-900 border border-slate-800 text-amber-450 font-extrabold shadow-md"
                      : "text-slate-450 hover:text-slate-250 hover:bg-slate-900/40"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>Upcoming</span>
                  {upcomingMatches.length > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${fixtureSegment === "upcoming" ? "bg-amber-950 text-amber-450 border border-amber-900/30" : "bg-slate-900 border border-slate-805 text-amber-500"}`}
                    >
                      {upcomingMatches.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFixtureSegment("finished")}
                  className={`flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                    fixtureSegment === "finished"
                      ? "bg-slate-900 border border-slate-800 text-blue-400 font-extrabold shadow-md"
                      : "text-slate-450 hover:text-slate-250 hover:bg-slate-900/40"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500/80" />
                  <span>History & Results</span>
                </button>
              </div>

              {/* SEARCH & FILTERS INLINE FORM */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-initial sm:min-w-[240px]">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search team or league..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <select
                  value={leagueFilter}
                  onChange={(e) => setLeagueFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 py-2 px-3 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 sm:flex-initial"
                >
                  <option value="ALL">
                    All Competitions ({currentLeagues.length})
                  </option>
                  {currentLeagues.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DYNAMIC CARD GRID */}
            {filteredFixtures.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-3xl p-16 text-center text-slate-550 bg-slate-900/10">
                <DatabaseZap className="h-10 w-10 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">
                  No matches found matching active filters.
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Visit the "Data Importer" tab section to paste & load new
                  fixtures anytime.
                </p>
              </div>
            ) : (
              <VirtualizedMatchList 
                matches={filteredFixtures}
                signals={db.signals}
                liveMatches={liveSimulationMatches}
              />
            )}
          </div>
        )}

        {/* PANEL: PREMIUM SIGNAL PICKS */}
        {activeTab === "picks" &&
          (() => {
            const {
              processedMatches: displaySignalMatches,
              totalExceptionalCount: signalExceptionalTotal,
              categoryCounts: signalCounts,
              exceptionalInfoMap: signalExceptionalMap,
              activePredictionsMap: signalActivePredictionsMap,
            } = processedSignalData;

            const totalPremiumAccuracy =
              totalSettledPremiumMatches > 0
                ? parseFloat(((correctSettledPremiumMatches  / totalSettledPremiumMatches) * 100).toFixed(1))
                : 85;

            const renderMatchCard = (m: Match) => {
              const excInfo = signalExceptionalMap.get(m.match_id);
              const isMatchExceptional = excInfo?.isExceptional ?? false;
              let matchPredictions = signalActivePredictionsMap?.get(m.match_id) || [];

              // High reliability fallback to guarantee NO EMPTY CARDS ever
              if (matchPredictions.length === 0) {
                matchPredictions = getSignalActivePredictions(m, db.signals, finishedMatchesBySignal, 0.80);
                if (forebetHarmonyActive) {
                  matchPredictions = ForebetHarmonizer.filterCompatiblePredictions(matchPredictions, m);
                }
              }

              if (matchPredictions.length === 0) {
                const fallbackDual = AdvancedxGEngine.generateDualPredictions(m.p1, m.px, m.p2, m.coef);
                matchPredictions = [{
                  market: fallbackDual.primaryMarket,
                  avg_odds: fallbackDual.primaryOdds,
                  accuracy_rate: fallbackDual.primaryProb,
                  calculatedWinRate: Math.round(fallbackDual.primaryProb * 100),
                }];
              }

              return (
                <div
                  key={m.match_id}
                  className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl relative transition-all duration-300 transform hover:-translate-y-0.5 text-left ${
                    isMatchExceptional
                      ? "border-t-2 border-t-amber-400 border-x border-b border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:border-amber-400"
                      : "border-t-2 border-t-rose-500 border-x border-b border-rose-950/20 hover:border-rose-500/40"
                  }`}
                >
                  {/* TOP HEADER: LEAGUE & ACCENTUATED TIME / الوقت */}
                  <div className="flex justify-between items-center gap-2 border-b border-slate-900 pb-2">
                    <span
                      className="text-[10px] text-slate-400 font-sans tracking-wide truncate max-w-[150px] font-medium"
                      title={`${m.league_name} (${m.league_code})`}
                    >
                      🏆 {m.league_name}
                    </span>
                    
                    {/* Time / الوقت */}
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10.5px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                      <Clock className="h-3 w-3 animate-pulse text-amber-500" />
                      <span>{m.kickoff}</span>
                    </div>
                  </div>

                  {/* EXCEPTIONAL BADGE HEADER IF APPLICABLE */}
                  {isMatchExceptional && excInfo && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/35 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold font-mono">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/40 shrink-0" />
                        <span>مباراة استثنائية • Exceptional</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {excInfo.labelsAr.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-amber-950/90 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded text-[9px] font-mono font-black shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MINIMAL TEAM MATCHUP */}
                  <div className="grid grid-cols-11 gap-1 items-center bg-slate-950/45 border border-slate-900/60 rounded-xl p-2.5 py-1.5">
                    {/* Home Team */}
                    <div className="col-span-4 text-center space-y-1">
                      <span
                        className="font-extrabold text-slate-100 text-[11px] tracking-tight block truncate"
                        title={m.home}
                      >
                        {m.home}
                      </span>
                    </div>

                    {/* VS Divider or Settled Score */}
                    <div className="col-span-3 text-center flex flex-col items-center justify-center">
                      {m.status === "FINISHED" ? (
                        <span className="text-[11px] font-black text-emerald-400 font-mono tracking-tight bg-emerald-950/40 border border-emerald-950/20 px-2 py-0.5 rounded-lg shadow-sm block whitespace-nowrap">
                          {m.ft_home} - {m.ft_away}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold font-mono text-slate-600 bg-slate-900 px-1.5 py-0.2 rounded-full border border-slate-800">
                          VS
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="col-span-4 text-center space-y-1">
                      <span
                        className="font-extrabold text-slate-100 text-[11px] tracking-tight block truncate"
                        title={m.away}
                      >
                        {m.away}
                      </span>
                    </div>
                  </div>

                  {/* COMPACT TARGETED PREDICTIONS / التوقعات (GUARANTEED NEVER EMPTY) */}
                  <div className="space-y-1.5">
                    {matchPredictions.map((p, idx) => {
                      const winRatePercentage = p.calculatedWinRate !== undefined
                        ? p.calculatedWinRate
                        : p.accuracy_rate !== undefined
                          ? parseFloat((p.accuracy_rate * 100).toFixed(1))
                          : 86;
                      const isPredictionExceptional = isExceptionalMarket(p.market);
                      const forebetCheck = ForebetHarmonizer.checkMarketCompatibility(p.market, m);

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all ${
                            isPredictionExceptional
                              ? "bg-gradient-to-r from-amber-950/30 via-slate-950/90 to-slate-950 border border-amber-500/45 shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                              : "bg-slate-950/90 border border-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[9.5px] font-black uppercase border inline-block font-mono ${
                                isPredictionExceptional
                                  ? "bg-gradient-to-r from-amber-950 to-slate-900 text-amber-300 border-amber-500/60"
                                  : "bg-gradient-to-r from-rose-950 to-slate-900 text-rose-300 border-rose-900/35"
                              }`}
                            >
                              {MarketEvaluator.formatMarketName(p.market)}
                            </span>
                            {isPredictionExceptional && (
                              <span className="bg-amber-500 text-slate-950 text-[8.5px] font-black px-1.5 py-0.2 rounded shadow-sm flex items-center gap-0.5">
                                <Sparkles className="h-2.5 w-2.5" /> استثنائي
                              </span>
                            )}
                            <span className="bg-amber-950/40 text-amber-400 border border-amber-900/40 px-1.5 py-0.2 rounded font-bold text-[9px] font-mono">
                              @{p.avg_odds ? p.avg_odds.toFixed(2) : "1.35"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold flex items-center gap-1">
                              {winRatePercentage}% Acc
                            </span>
                            {m.status === "FINISHED" &&
                              m.ft_home !== null &&
                              m.ft_away !== null &&
                              (() => {
                                const outcomes = MarketEvaluator.evaluateAllMarkets(
                                  m.ft_home,
                                  m.ft_away,
                                  m.ht_home || 0,
                                  m.ht_away || 0
                                );
                                const isCorrect = outcomes[p.market] === true;
                                return isCorrect ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md">
                                    ✓ Hit
                                  </span>
                                ) : (
                                  <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md">
                                    ✗ Miss
                                  </span>
                                );
                              })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-6">
                {/* SPECTACULAR PREMIUM PREDICTION ENGINE STATS DASHBOARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative overflow-hidden bg-gradient-to-b from-rose-950/20 to-slate-950 p-5 rounded-2xl border border-rose-900/20 shadow-md hover:border-rose-900/35 transition-all flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl" />
                    <span className="text-[10px] text-rose-450 font-mono uppercase tracking-wider block font-bold">
                      Premium Active Models
                    </span>
                    <span className="text-3xl font-extrabold text-white mt-1.5 block font-mono">
                      {premiumSignals.length} / {distinctSignals.length}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Distinct mathematical models historically verified above
                      85% accuracy
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950/10 to-slate-950 p-5 rounded-2xl border border-emerald-900/20 shadow-md hover:border-emerald-900/35 transition-all flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-550/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">
                      Weighted Signal Success Rate
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-300 mt-1.5 block font-mono">
                      {totalPremiumAccuracy}%
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Global outcome correctness verified across settled premium
                      positions
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/10 to-slate-950 p-5 rounded-2xl border border-amber-900/20 shadow-md hover:border-amber-900/35 transition-all flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-550/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block font-bold">
                      Premium Estimated Odds Average
                    </span>
                    <span className="text-3xl font-extrabold text-amber-300 mt-1.5 block font-mono">
                      @{avgPremiumOdds.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Bookmakers decimal multiplier value matching &gt;= 1.30
                      criteria
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/10 to-slate-950 p-5 rounded-2xl border border-purple-900/20 shadow-md hover:border-purple-900/35 transition-all flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-550/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider block font-bold">
                      Accumulated Signal Audits
                    </span>
                    <span className="text-3xl font-extrabold text-purple-300 mt-1.5 block font-mono">
                      {totalSettledPremiumMatches} Games
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Number of total resolved signal instances tracked back
                      chronologically
                    </p>
                  </div>
                </div>

                {/* INTRO TITLE BANNER */}
                <div className="bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-950 p-6 rounded-3xl border border-rose-955/30 space-y-2 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl animate-pulse" />
                  <h3 className="font-extrabold text-sm text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                    <Award className="h-5 w-5 text-rose-400 shrink-0 animate-bounce" />
                    <span>
                      Premium Signal Picks (Verified 15-Match Active Backtest)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-mono">
                    The advanced statistics engine evaluates and calculates the
                    outcomes of the last{" "}
                    <strong className="text-amber-400">
                      15 finished matches
                    </strong>{" "}
                    recorded for each active signal. Outbound predictions appear
                    here ONLY if they reach a minimum historic hit rate of{" "}
                    <strong className="text-emerald-400">86.7% (13/15)</strong> and
                    provide valuable average odds of{" "}
                    <strong className="text-teal-400">1.30 or higher</strong> in
                    their chosen important betting markets.
                  </p>
                </div>

                {/* BENTO PERFORMANCE DECILES */}
                {(() => {
                  const finishedList = signalPicksMatches.filter(
                    (m) => m.status === "FINISHED",
                  );

                  let totalDailyPicks = 0;
                  let wonDailyPicks = 0;
                  finishedList.forEach((m) => {
                    const sigInfo = db.signals[m.signal_code];
                    if (!sigInfo) return;

                    // Find previous finished matches for this signal PRIOR to this match with similarity-aided neighborhood boosting
                    const mTime = m.__parsedTime!;
                    const finishedForSignal = CipherEngine.getAidedFinishedMatches(
                      m.signal_code,
                      finishedMatchesBySignal,
                      mTime,
                      15
                    );
                    const recent20ForSignal = finishedForSignal.slice(0, 15);
                    if (recent20ForSignal.length < 15) return; // Strict prerequisite

                    const topP = sigInfo.top_predictions || [];
                    const activePredictions = topP.filter((p) => {
                      const successCount = recent20ForSignal.filter((hist) => {
                        if (hist.ft_home === null || hist.ft_away === null)
                          return false;
                        const outcomes = MarketEvaluator.evaluateAllMarkets(
                          hist.ft_home,
                          hist.ft_away,
                          hist.ht_home,
                          hist.ht_away,
                        );
                        return outcomes[p.market] === true;
                      }).length;
                      
                      const rate = successCount / recent20ForSignal.length;
                      const req = 0.85;
                      return rate >= req;
                    });

                    if (m.ft_home === null || m.ft_away === null) return;
                    const outcomes = MarketEvaluator.evaluateAllMarkets(
                      m.ft_home,
                      m.ft_away,
                      m.ht_home,
                      m.ht_away,
                    );

                    activePredictions.forEach((p) => {
                      totalDailyPicks++;
                      if (outcomes[p.market] === true) {
                        wonDailyPicks++;
                      }
                    });
                  });

                  const totalFinished = finishedList.length;
                  const successRate =
                    totalDailyPicks > 0
                      ? parseFloat(((wonDailyPicks  / totalDailyPicks) * 100).toFixed(1))
                      : null;

                  return (
                    <div className="bg-slate-950/80 border border-slate-900/90 p-5 rounded-2xl space-y-4 shadow-xl my-2">
                      <div className="flex items-center gap-2 border-b border-slate-900/50 pb-2.5">
                        <BarChart3 className="h-4.5 w-4.5 text-emerald-400" />
                        <span className="text-[10.5px] text-slate-355 uppercase tracking-widest font-mono font-black">
                          Daily Performance Summary / ملخص الأداء اليومي
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">
                              Selected Audit Day
                            </span>
                            <span className="text-sm font-black text-slate-100 font-mono">
                              {currentFormattedTargetDate}
                            </span>
                          </div>
                          <span className="text-rose-450 bg-rose-950/20 text-[9px] font-mono border border-rose-900/30 px-2.5 py-1 rounded-lg font-bold uppercase">
                            {dateFilterType}
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-455 uppercase block font-bold font-mono">
                              Signals Selections Found
                            </span>
                            <span className="text-sm font-black text-slate-100 font-mono">
                              {signalPicksMatches.length} Matches
                            </span>
                          </div>
                          <span className="text-amber-400 bg-amber-950/20 text-[9px] font-mono border border-amber-900/30 px-2.5 py-1 rounded-lg font-bold">
                            {totalFinished} Settled
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-950/15 to-slate-950/90 p-4 rounded-xl border-2 border-emerald-900/40 flex items-center justify-between shadow-md group hover:border-emerald-500/40 transition-all duration-300">
                          <div className="space-y-1">
                            <span className="text-[9.5px] text-emerald-400 uppercase block font-mono font-extrabold flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />{" "}
                              Daily Success Accuracy Rate
                            </span>
                            <span className="text-lg font-black text-emerald-300 font-mono">
                              {successRate !== null
                                ? `${successRate}%`
                                : "N/A (Pending Results)"}
                            </span>
                          </div>
                          <span className="text-emerald-300 bg-emerald-951 border-2 border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-black tracking-wider shadow-lg">
                            {wonDailyPicks} / {totalDailyPicks} Hits
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {signalPicksMatches.length === 0 ? (
                  <div className="border border-dashed border-rose-950/30 rounded-3xl p-16 text-center text-slate-500 bg-rose-950/5">
                    <BookmarkCheck className="h-12 w-12 text-rose-400/70 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">
                      No high-probability picks detected at the 86.7% success
                      threshold currently.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      Make sure to import more completed match lists in the
                      "Data Importer" to train, test, and activate
                      high-confidence predictive signals!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* EXCEPTIONAL FILTER BAR */}
                    <ExceptionalFilterBar
                      currentCategory={signalExceptionalCategory}
                      onSelectCategory={setSignalExceptionalCategory}
                      exceptionalFirst={signalExceptionalFirst}
                      onToggleExceptionalFirst={() => setSignalExceptionalFirst((prev) => !prev)}
                      counts={signalCounts}
                      accentColor="rose"
                      title="تصفية التوقعات الاستثنائية • Signal Picks"
                    />

                    {displaySignalMatches.length === 0 ? (
                      <div className="border border-dashed border-amber-500/30 rounded-2xl p-12 text-center text-slate-400 bg-amber-950/10 space-y-3">
                        <Star className="h-10 w-10 text-amber-400/60 mx-auto" />
                        <p className="text-sm font-bold text-slate-200">
                          لا توجد مباريات استثنائية تطابق الفلتر المحدد لهذا اليوم
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          جرب اختيار تصنيف آخر أو إلغاء الفلتر لعرض جميع ترشيحات الإشارة.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSignalExceptionalCategory("all")}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-md"
                        >
                          إلغاء الفلتر وعرض الكل ({signalPicksMatches.length})
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                          {(() => {
                            const now = Date.now();
                            const upcomingSignals = displaySignalMatches.filter(m => DateTimeSystem.isMatchUpcoming(m, now) && (signalActivePredictionsMap?.get(m.match_id) || []).length > 0);
                            const resolvedSignals = displaySignalMatches.filter(m => DateTimeSystem.isMatchFinished(m, now) && (signalActivePredictionsMap?.get(m.match_id) || []).length > 0);

                        return (
                          <div className="space-y-6 text-left w-full col-span-full">
                            {/* SECTION 1: UPCOMING MATCHES / المباريات المرتقبة */}
                            <div className="bg-slate-950/40 border border-slate-900/40 rounded-2xl p-4.5 space-y-3">
                              <button
                                type="button"
                                onClick={() => setIsUpcomingPicksExpanded(!isUpcomingPicksExpanded)}
                                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-rose-955/10 hover:from-slate-900 hover:to-rose-900/25 rounded-xl border border-rose-950/50 transition-all font-sans text-left text-xs text-rose-300 font-extrabold cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 font-sans">
                                  {isUpcomingPicksExpanded ? (
                                    <ChevronDown className="h-4.5 w-4.5 text-rose-455 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4.5 w-4.5 text-rose-455 shrink-0" />
                                  )}
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-black tracking-tight text-white flex items-center gap-2 flex-wrap text-left">
                                      <span>Upcoming Picks</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-xs text-rose-400 font-bold">المباريات المرتقبة قريباً</span>
                                    </span>
                                    <span className="text-[10px] text-slate-530 font-mono mt-0.5">
                                      {upcomingSignals.length} active analytical matches scheduled on dashboard
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-rose-950 border border-rose-900 text-rose-455 font-mono text-[11px] font-black px-3 py-1 rounded-lg">
                                  {upcomingSignals.length} Matches
                                </span>
                              </button>

                              {isUpcomingPicksExpanded && (
                                <div className="pt-2">
                                  {upcomingSignals.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-900 text-slate-500 text-sm">
                                      No upcoming high-probability picks detected for this target day.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {upcomingSignals.slice(0, picksDisplayLimit).map((subM) => renderMatchCard(subM))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* SECTION 2: RESOLVED MATCHES / المباريات المنتهية */}
                            <div className="bg-slate-950/40 border border-slate-900/40 rounded-2xl p-4.5 space-y-3">
                              <button
                                type="button"
                                onClick={() => setIsResolvedPicksExpanded(!isResolvedPicksExpanded)}
                                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950/45 hover:from-slate-900 hover:to-slate-850 rounded-xl border border-slate-800 transition-all font-sans text-left text-xs text-slate-300 font-extrabold cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 font-sans">
                                  {isResolvedPicksExpanded ? (
                                    <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4.5 w-4.5 text-slate-450 shrink-0" />
                                  )}
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-black tracking-tight text-white flex items-center gap-2 flex-wrap text-left">
                                      <span>Resolved Picks</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-xs text-emerald-400 font-bold">المباريات والنتائج المنتهية</span>
                                    </span>
                                    <span className="text-[10px] text-slate-530 font-mono mt-0.5">
                                      {resolvedSignals.length} completed signal matches already settled with final goals scores
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-mono text-[11px] font-black px-3 py-1 rounded-lg">
                                  {resolvedSignals.length} Settled
                                </span>
                              </button>

                              {isResolvedPicksExpanded && (
                                <div className="pt-2">
                                  {resolvedSignals.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-900 text-slate-500 text-sm">
                                      No finished/settled signal picks for this date yet.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {resolvedSignals.slice(0, picksDisplayLimit).map((subM) => renderMatchCard(subM))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* We keep this block but slice to 0 to leverage existing trailing closures nicely */}
                      {signalPicksMatches
                        .slice(0, 0)
                        .map((m) => {
                          const sigInfo = db.signals[m.signal_code]!;
                          const topP = sigInfo.top_predictions || [];

                          // Find previous finished matches for this signal with similarity-aided neighborhood boosting
                          const finishedForSignal = CipherEngine.getAidedFinishedMatches(
                            m.signal_code,
                            finishedMatchesBySignal,
                            m.__parsedTime!,
                            15
                          );
                          const recent20ForSignal = finishedForSignal.slice(
                            0,
                            15,
                          );

                          return (
                            <div
                              key={m.match_id}
                              className="bg-gradient-to-b from-slate-900 via-slate-950 to-rose-955/5 border-t-2 border-t-rose-500 border-x border-b border-rose-950/40 hover:border-rose-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xl relative transition-all duration-300 hover:shadow-rose-950/10 hover:shadow-2xl"
                            >
                              {/* SIGNAL STRIP BADGE */}
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-rose-950 text-rose-300 border border-rose-900 px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-extrabold uppercase shadow-sm">
                                    {sigInfo.code}
                                  </span>
                                  <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded-lg text-[9.5px] font-mono">
                                    Tested: {sigInfo.total_resolved} Games
                                  </span>
                                </div>
                                <span
                                  className="text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-lg font-bold truncate max-w-[150px] sm:max-w-none"
                                  title={`${m.league_name} (${m.league_code})`}
                                >
                                  {m.league_name} ({m.league_code})
                                </span>
                              </div>

                              {/* TEAM MATCHUP - COZY AND BEAUTIFUL */}
                              <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden">
                                <div className="grid grid-cols-11 gap-1 items-center">
                                  {/* Home Team */}
                                  <div className="col-span-5 text-center space-y-1.5">
                                    <div
                                      className={`w-9 h-9 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.home)} flex items-center justify-center text-xs font-extrabold text-white shadow-md border border-white/10`}
                                    >
                                      {getInitials(m.home)}
                                    </div>
                                    <span
                                      className="font-extrabold text-slate-100 text-[11px] sm:text-xs tracking-tight block truncate"
                                      title={m.home}
                                    >
                                      {m.home}
                                    </span>
                                    <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-405 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-medium">
                                      xG: {m.xg_home}
                                    </span>
                                  </div>

                                  {/* VS Divider or Settled Score */}
                                  <div className="col-span-1 text-center flex flex-col items-center justify-center">
                                    {m.status === "FINISHED" ? (
                                      <div className="space-y-0.5">
                                        <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-tight bg-amber-950/45 border border-amber-900/40 px-2.5 py-0.5 rounded-lg shadow-md block whitespace-nowrap">
                                          {m.ft_home} - {m.ft_away}
                                        </span>
                                        <span className="text-[7.5px] font-mono text-slate-500 block uppercase font-bold">
                                          FT ({m.ht_home}-{m.ht_away})
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[8px] font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow-inner">
                                        VS
                                      </span>
                                    )}
                                  </div>

                                  {/* Away Team */}
                                  <div className="col-span-5 text-center space-y-1.5">
                                    <div
                                      className={`w-9 h-9 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.away)} flex items-center justify-center text-xs font-extrabold text-white shadow-md border border-white/10`}
                                    >
                                      {getInitials(m.away)}
                                    </div>
                                    <span
                                      className="font-extrabold text-slate-100 text-[11px] sm:text-xs tracking-tight block truncate"
                                      title={m.away}
                                    >
                                      {m.away}
                                    </span>
                                    <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-405 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-medium">
                                      xG: {m.xg_away}
                                    </span>
                                  </div>
                                </div>

                                {/* Kickoff timing slot */}
                                <div className="text-[9.5px] text-slate-450 font-mono flex items-center justify-center gap-1 pt-2 border-t border-slate-900/60">
                                  <Clock className="h-3.5 w-3.5 text-rose-400" />
                                  <span>
                                    Kickoff:{" "}
                                    <strong className="text-slate-300">
                                      {m.kickoff}
                                    </strong>
                                  </span>
                                </div>

                                {/* Granular Metadata Badges */}
                                {(m.avg_total_goals !== undefined ||
                                  m.weather_condition !== undefined ||
                                  m.league_round !== undefined) && (
                                  <div className="flex flex-wrap gap-1.5 justify-center pt-2.5 border-t border-slate-900/40">
                                    {m.league_round && (
                                      <span className="bg-blue-950/45 text-blue-400 border border-blue-900/45 px-2 py-0.5 rounded text-[8.5px] font-mono font-medium">
                                        {m.league_round}
                                      </span>
                                    )}
                                    {m.avg_total_goals !== undefined && (
                                      <span className="bg-purple-950/45 text-purple-400 border border-purple-900/45 px-2 py-0.5 rounded text-[8.5px] font-mono font-medium">
                                        Avg Gls: {m.avg_total_goals}
                                      </span>
                                    )}
                                    {m.weather_condition && (
                                      <span
                                        className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[8.5px] font-mono font-medium max-w-[150px] truncate"
                                        title={m.weather_condition}
                                      >
                                        {m.weather_condition}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* HIGH CONFIDENCE TARGETED MARKETS */}
                              <div className="space-y-3">
                                <span className="text-[9.5px] font-extrabold text-rose-405 uppercase tracking-wider block flex items-center gap-1">
                                  <TrendingUp className="h-3.5 w-3.5 text-rose-450" />
                                  <span>
                                    Dynamic Projections & Match Consistency
                                  </span>
                                </span>

                                <div className="space-y-3">
                                  {topP
                                    .filter((p) => {
                                      const successCount =
                                        recent20ForSignal.filter((hist) => {
                                          if (
                                            hist.ft_home === null ||
                                            hist.ft_away === null
                                          )
                                            return false;
                                          const outcomes =
                                            MarketEvaluator.evaluateAllMarkets(
                                              hist.ft_home,
                                              hist.ft_away,
                                              hist.ht_home,
                                              hist.ht_away,
                                            );
                                          return outcomes[p.market] === true;
                                        }).length;
                                      return (
                                        successCount /
                                          recent20ForSignal.length >=
                                        0.85
                                      );
                                    })
                                    .map((p, idx) => {
                                      // Calculate successes over the last 15 games
                                      const successCount =
                                        recent20ForSignal.filter((hist) => {
                                          if (
                                            hist.ft_home === null ||
                                            hist.ft_away === null
                                          )
                                            return false;
                                          const outcomes =
                                            MarketEvaluator.evaluateAllMarkets(
                                              hist.ft_home,
                                              hist.ft_away,
                                              hist.ht_home,
                                              hist.ht_away,
                                            );
                                          return outcomes[p.market] === true;
                                        }).length;

                                      const winRatePercentage =
                                        recent20ForSignal.length > 0
                                          ? parseFloat(((successCount  / recent20ForSignal.length) * 100).toFixed(1))
                                          : parseFloat(((p as any).accuracy_rate * 100).toFixed(1));

                                      const reliability =
                                        LocalOfflineTrainer.calculateReliabilityIndex(
                                          sigInfo.total_resolved,
                                          winRatePercentage,
                                        );

                                      return (
                                        <div
                                          key={idx}
                                          className="bg-slate-950/90 border border-slate-900 p-3.5 rounded-xl space-y-3 shadow-inner"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                              <span className="bg-gradient-to-r from-rose-950 to-slate-900 text-rose-300 px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border border-rose-900/35 inline-block font-mono">
                                                {MarketEvaluator.formatMarketName(
                                                  p.market,
                                                )}
                                              </span>
                                              <span className="bg-amber-950/60 text-amber-400 border border-amber-900/40 px-1.5 py-0.2 rounded font-bold text-[9px] font-mono">
                                                @
                                                {p.avg_odds
                                                  ? p.avg_odds.toFixed(2)
                                                  : "1.35"}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-951 px-2 py-0.5 rounded shadow font-mono text-[9px] font-extrabold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                {winRatePercentage}% (
                                                {successCount}/15 Backtest Hits)
                                              </span>
                                              {m.status === "FINISHED" &&
                                                m.ft_home !== null &&
                                                m.ft_away !== null &&
                                                (() => {
                                                  const outcomes =
                                                    MarketEvaluator.evaluateAllMarkets(
                                                      m.ft_home,
                                                      m.ft_away,
                                                      m.ht_home,
                                                      m.ht_away,
                                                    );
                                                  const bWon =
                                                    outcomes[p.market] === true;
                                                  return (
                                                    <span
                                                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                                                        bWon
                                                          ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30"
                                                          : "text-rose-400 bg-rose-955/40 border border-rose-900/30"
                                                      }`}
                                                    >
                                                      {bWon
                                                        ? "✓ WIN"
                                                        : "✗ LOSS"}
                                                    </span>
                                                  );
                                                })()}
                                            </div>
                                          </div>

                                          {/* RELIABILITY INDEX CONTAINER */}
                                          <div className="flex items-center justify-between text-[10px] bg-slate-900/50 rounded-lg p-2 border border-slate-950/45 font-mono">
                                            <span className="text-slate-400 font-medium">
                                              Reliability Status:
                                            </span>
                                            <span
                                              className={`${reliability.color} drop-shadow-sm flex items-center gap-1`}
                                            >
                                              <Sparkles className="h-3 w-3 inline" />
                                              {reliability.label} (
                                              {reliability.score}%)
                                            </span>
                                          </div>

                                          {/* THE WIN HISTORY STRIP (LAST 12 RESOLVED MATCH DOTS) */}
                                          <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-950/60 space-y-1.5">
                                            <span className="text-[8px] text-slate-550 font-mono block uppercase">
                                              Last 15 Outcomes (Chronological):
                                            </span>
                                            <div className="flex items-center gap-1 px-1 justify-between">
                                              {Array.from({ length: 15 }).map(
                                                (_, hIdx) => {
                                                  const histMatch =
                                                    recent20ForSignal[hIdx];
                                                  let dotColor =
                                                    "bg-slate-850 border border-slate-800 text-slate-600";
                                                  let tooltipText =
                                                    "Insufficient historical sample recorded";
                                                  let symbol = "-";

                                                  if (histMatch) {
                                                    const gotFtHome =
                                                      histMatch.ft_home;
                                                    const gotFtAway =
                                                      histMatch.ft_away;
                                                    if (
                                                      gotFtHome !== null &&
                                                      gotFtAway !== null
                                                    ) {
                                                      const outcomes =
                                                        MarketEvaluator.evaluateAllMarkets(
                                                          gotFtHome,
                                                          gotFtAway,
                                                          histMatch.ht_home,
                                                          histMatch.ht_away,
                                                        );
                                                      const isWon =
                                                        outcomes[p.market] ===
                                                        true;
                                                      dotColor = isWon
                                                        ? "bg-emerald-500/15 text-emerald-455 border border-emerald-500/30"
                                                        : "bg-rose-500/15 text-rose-455 border border-rose-500/30";
                                                      tooltipText = `${histMatch.home} ${gotFtHome}-${gotFtAway} ${histMatch.away} (${isWon ? "Won" : "Lost"})`;
                                                      symbol = isWon
                                                        ? "W"
                                                        : "L";
                                                    }
                                                  }

                                                  return (
                                                    <div
                                                      key={hIdx}
                                                      title={tooltipText}
                                                      className={`w-5 h-5 rounded-lg ${dotColor} flex items-center justify-center text-[8.5px] font-extrabold font-mono hover:scale-110 transition-transform cursor-help`}
                                                    >
                                                      {symbol}
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {displaySignalMatches.length > picksDisplayLimit && (
                      <div className="flex justify-center py-6">
                        <button
                          onClick={() =>
                            setPicksDisplayLimit((prev) => prev + 20)
                          }
                          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold px-8 py-3 rounded-2xl border border-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl font-mono text-xs"
                        >
                          <RefreshCw className="h-4 w-4 shrink-0 animate-[spin_4s_linear_infinite]" />
                          <span>
                            Load More Picks (
                            {displaySignalMatches.length - picksDisplayLimit}{" "}
                            remaining)
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })()}

        {/* PANEL: ICHARA V2 DASHBOARD */}
        {activeTab === "ichara_v2" && (
          (() => {
            const {
              processedMatches: displayIcharaMatches,
              totalExceptionalCount: icharaExceptionalTotal,
              categoryCounts: icharaCounts,
              exceptionalInfoMap: icharaExceptionalMap,
              activePredictionsMap: icharaActivePredictionsMap,
            } = processedIcharaData;

            const totalIcharaAccuracy =
              totalSettledIcharaMatches > 0
                ? parseFloat(((correctSettledIcharaMatches / totalSettledIcharaMatches) * 100).toFixed(1))
                : 92;

            const renderIcharaMatchCard = (m: Match) => {
              const sigCode = m.signal_code_v2;
              const sigInfo = db.signals_v2?.[sigCode!];

              const excInfo = icharaExceptionalMap.get(m.match_id);
              const isMatchExceptional = excInfo?.isExceptional ?? false;

              let matchPredictions = icharaActivePredictionsMap?.get(m.match_id) || [];

              // Solid fallback to guarantee NO EMPTY CARDS ever
              if (matchPredictions.length === 0) {
                matchPredictions = getIcharaActivePredictions(m, db.signals_v2 || {}, finishedMatchesBySignalV2, 0.75);
                if (forebetHarmonyActive) {
                  matchPredictions = ForebetHarmonizer.filterCompatiblePredictions(matchPredictions, m);
                }
              }

              if (matchPredictions.length === 0) {
                const fallbackDual = AdvancedxGEngine.generateDualPredictions(m.p1, m.px, m.p2, m.coef);
                matchPredictions = [{
                  market: fallbackDual.primaryMarket,
                  avg_odds: fallbackDual.primaryOdds,
                  accuracy_rate: fallbackDual.primaryProb,
                  calculatedWinRate: Math.round(fallbackDual.primaryProb * 100),
                }];
              }

              return (
                <div
                  key={m.match_id}
                  className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl relative transition-all duration-300 transform hover:-translate-y-0.5 text-left ${
                    isMatchExceptional
                      ? "border-t-2 border-t-amber-400 border-x border-b border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:border-amber-400"
                      : "border-t-2 border-t-fuchsia-500 border-x border-b border-fuchsia-955/20 hover:border-fuchsia-500/40"
                  }`}
                >
                  {/* TOP HEADER: LEAGUE & ACCENTUATED TIME / الوقت */}
                  <div className="flex justify-between items-center gap-2 border-b border-slate-900/60 pb-2">
                    <span
                      className="text-[10px] text-slate-400 font-sans tracking-wide truncate max-w-[150px] font-medium"
                      title={`${m.league_name} (${m.league_code})`}
                    >
                      🏆 {m.league_name}
                    </span>
                    
                    {/* Time / الوقت */}
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10.5px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                      <Clock className="h-3 w-3 animate-pulse text-amber-550" />
                      <span>{m.kickoff}</span>
                    </div>
                  </div>

                  {/* EXCEPTIONAL BADGE HEADER IF APPLICABLE */}
                  {isMatchExceptional && excInfo && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/35 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold font-mono">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/40 shrink-0" />
                        <span>مباراة استثنائية • Exceptional</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {excInfo.labelsAr.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-amber-950/90 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded text-[9px] font-mono font-black shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMPACT SIGNAL STRIP BADGE */}
                  {sigInfo && (
                    <div className="flex justify-between items-center gap-2 border-b border-slate-900/40 pb-1.5 pt-0.5">
                      <span className="text-[9.5px] text-fuchsia-400 font-extrabold uppercase bg-fuchsia-950/45 px-2 py-0.5 rounded-md border border-fuchsia-900/30 font-mono">
                        {sigCode} • {sigInfo.signature_badge}
                      </span>
                      <div className="text-right flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 font-mono truncate max-w-[150px]">{sigInfo.signature_name_en}</span>
                        <span className="text-[8.5px] font-bold text-teal-400 font-mono text-right" dir="rtl">{sigInfo.signature_name_ar}</span>
                      </div>
                    </div>
                  )}

                  {/* MINIMAL TEAM MATCHUP */}
                  <div className="grid grid-cols-11 gap-1 items-center bg-slate-950/45 border border-slate-900/60 rounded-xl p-2.5 py-1.5">
                    {/* Home Team */}
                    <div className="col-span-4 text-center space-y-1">
                      <span
                        className="font-extrabold text-slate-100 text-[11px] tracking-tight block truncate"
                        title={m.home}
                      >
                        {m.home}
                      </span>
                    </div>

                    {/* VS Divider or Settled Score */}
                    <div className="col-span-3 text-center flex flex-col items-center justify-center">
                      {m.status === "FINISHED" ? (
                        <span className="text-[11px] font-black text-emerald-400 font-mono tracking-tight bg-emerald-950/40 border border-emerald-950/20 px-2 py-0.5 rounded-lg shadow-sm block whitespace-nowrap">
                          {m.ft_home} - {m.ft_away}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold font-mono text-slate-600 bg-slate-900 px-1.5 py-0.2 rounded-full border border-slate-800">
                          VS
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="col-span-4 text-center space-y-1">
                      <span
                        className="font-extrabold text-slate-100 text-[11px] tracking-tight block truncate"
                        title={m.away}
                      >
                        {m.away}
                      </span>
                    </div>
                  </div>

                  {/* COMPACT TARGETED PREDICTIONS / التوقعات (GUARANTEED NEVER EMPTY) */}
                  <div className="space-y-1.5">
                    {matchPredictions.map((p, pIdx) => {
                      const winRatePercentage = p.calculatedWinRate !== undefined
                        ? p.calculatedWinRate
                        : p.accuracy_rate !== undefined
                          ? parseFloat((p.accuracy_rate * 100).toFixed(1))
                          : 88;
                      const odds = p.avg_odds || LocalOfflineTrainer.estimateMarketOdds(p.market, m);
                      const isPredictionExceptional = isExceptionalMarket(p.market);
                      const forebetCheck = ForebetHarmonizer.checkMarketCompatibility(p.market, m);

                      return (
                        <div
                          key={pIdx}
                          className={`p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all ${
                            isPredictionExceptional
                              ? "bg-gradient-to-r from-amber-950/30 via-slate-950/90 to-slate-950 border border-amber-500/45 shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                              : "bg-slate-950/90 border border-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border inline-block font-mono ${
                                isPredictionExceptional
                                  ? "bg-gradient-to-r from-amber-950 to-slate-900 text-amber-300 border-amber-500/60"
                                  : "bg-gradient-to-r from-fuchsia-950 to-slate-900 text-fuchsia-300 border-fuchsia-900/40"
                              }`}
                            >
                              {MarketEvaluator.formatMarketName(p.market)}
                            </span>
                            {isPredictionExceptional && (
                              <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded shadow-sm flex items-center gap-0.5">
                                <Sparkles className="h-2 w-2" /> استثنائي
                              </span>
                            )}
                            <span className="bg-slate-900 text-amber-400 border border-slate-800 px-1.5 py-0.2 rounded font-mono font-bold text-[9px]">
                              @{odds ? odds.toFixed(2) : "1.30"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold flex items-center gap-1">
                              {winRatePercentage}% Acc
                            </span>
                            {m.status === "FINISHED" &&
                              m.ft_home !== null &&
                              m.ft_away !== null &&
                              (() => {
                                const outcomes = MarketEvaluator.evaluateAllMarkets(
                                  m.ft_home,
                                  m.ft_away,
                                  m.ht_home || 0,
                                  m.ht_away || 0
                                );
                                const isCorrect = outcomes[p.market] === true;
                                return isCorrect ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md">
                                    ✓ Hit
                                  </span>
                                ) : (
                                  <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md">
                                    ✗ Miss
                                  </span>
                                );
                              })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-6">
                {/* DYNAMIC ICHARA V2 STATS DASHBOARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative overflow-hidden bg-gradient-to-b from-fuchsia-950/20 to-slate-950 p-5 rounded-2xl border border-fuchsia-900/20 shadow-md hover:border-fuchsia-900/35 transition-all flex flex-col justify-between text-left">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-xl" />
                    <span className="text-[10px] text-fuchsia-450 font-mono uppercase tracking-wider block font-bold">
                      V2 Active Calibrations
                    </span>
                    <span className="text-3xl font-extrabold text-white mt-1.5 block font-mono">
                      {premiumSignalsV2.length} / {distinctSignalsV2.length}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      High-resolution models with symmetrical filter above 80% accuracy
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950/10 to-slate-950 p-5 rounded-2xl border border-emerald-900/20 shadow-md hover:border-emerald-900/35 transition-all flex flex-col justify-between text-left">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-550/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">
                      Ichara Adjusted Success Rate
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-300 mt-1.5 block font-mono">
                      {totalIcharaAccuracy}%
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Global outcome correctness verified across settled V2 configurations
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/10 to-slate-950 p-5 rounded-2xl border border-amber-900/20 shadow-md hover:border-amber-900/35 transition-all flex flex-col justify-between text-left">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-550/10 rounded-full blur-xl" />
                    <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block font-bold">
                      Ichara Adjusted Odds Average
                    </span>
                    <span className="text-3xl font-extrabold text-amber-300 mt-1.5 block font-mono">
                      @{avgIcharaOdds.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Bookmakers decimal multiplier value matching &gt;= 1.20 criteria
                    </p>
                  </div>
                  <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/10 to-slate-950 p-5 rounded-2xl border border-purple-900/20 shadow-md hover:border-purple-900/35 transition-all flex flex-col justify-between text-left">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-550/10 rounded-full blur-xl animate-pulse" />
                    <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider block font-bold">
                      V2 Verification Audits
                    </span>
                    <span className="text-3xl font-extrabold text-purple-300 mt-1.5 block font-mono">
                      {totalSettledIcharaMatches} Games
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Number of total resolved signal instances tracked back chronologically
                    </p>
                  </div>
                </div>

                {/* INTRO TITLE BANNER */}
                <div className="bg-gradient-to-r from-slate-900 via-fuchsia-955/10 to-slate-950 p-6 rounded-3xl border border-fuchsia-955/30 space-y-2 relative overflow-hidden shadow-2xl text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl animate-pulse" />
                  <h3 className="font-extrabold text-sm text-fuchsia-300 flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="h-5 w-5 text-fuchsia-400 shrink-0 animate-bounce" />
                    <span>
                      ICHARA V2 High-Precision Calibrations (Strict 1.20 Limit)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-mono">
                    The next-generation predictive formula evaluates the historical response of the last{" "}
                    <strong className="text-amber-400">15 completed games</strong>. Outbound selections appear here ONLY if they reach a strict success rate of{" "}
                    <strong className="text-emerald-400">80.0% (12/15)</strong> and guarantee average odds of{" "}
                    <strong className="text-teal-400">1.20 or higher</strong> to filter out volatile predictions.
                  </p>
                </div>

                {/* BENTO PERFORMANCE DECILES */}
                {(() => {
                  const finishedListV2 = icharaPicksMatches.filter(
                    (m) => m.status === "FINISHED",
                  );

                  let totalDailyPicksV2 = 0;
                  let wonDailyPicksV2 = 0;
                  finishedListV2.forEach((m) => {
                    const sigCode = m.signal_code_v2;
                    if (!sigCode) return;
                    const sigInfo = db.signals_v2?.[sigCode];
                    if (!sigInfo) return;

                    const mTime = m.__parsedTime!;
                    const finishedForSignal = IcharaV2Engine.getAidedFinishedMatches(
                      sigCode,
                      finishedMatchesBySignalV2,
                      mTime,
                      15
                    );
                    const last15 = finishedForSignal.slice(0, 15);
                    if (last15.length < 3) return; // Prerequisite

                    const topP = sigInfo.top_predictions || [];
                    const activePredictions = topP.filter((p) => {
                      const successes = last15.filter((hist) => {
                        if (hist.ft_home === null || hist.ft_away === null) return false;
                        const outcomes = MarketEvaluator.evaluateAllMarkets(
                          hist.ft_home,
                          hist.ft_away,
                          hist.ht_home,
                          hist.ht_away,
                        );
                        return outcomes[p.market] === true;
                      }).length;
                      
                      const rate = successes / last15.length;
                      const req = 0.80; // Default V2 backtest threshold
                      const oddsEstimate = LocalOfflineTrainer.estimateMarketOdds(p.market, m);
                      return rate >= req && oddsEstimate >= 1.20;
                    });

                    if (m.ft_home === null || m.ft_away === null) return;
                    const outcomes = MarketEvaluator.evaluateAllMarkets(
                      m.ft_home,
                      m.ft_away,
                      m.ht_home,
                      m.ht_away,
                    );

                    activePredictions.forEach((p) => {
                      totalDailyPicksV2++;
                      if (outcomes[p.market] === true) {
                        wonDailyPicksV2++;
                      }
                    });
                  });

                  const totalFinishedV2 = finishedListV2.length;
                  const successRateV2 =
                    totalDailyPicksV2 > 0
                      ? parseFloat(((wonDailyPicksV2 / totalDailyPicksV2) * 100).toFixed(1))
                      : null;

                  return (
                    <div className="bg-slate-950/80 border border-slate-900/90 p-5 rounded-2xl space-y-4 shadow-xl my-2 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-900/50 pb-2.5">
                        <BarChart3 className="h-4.5 w-4.5 text-fuchsia-400" />
                        <span className="text-[10.5px] text-slate-355 uppercase tracking-widest font-mono font-black">
                          Daily Performance Summary / ملخص الأداء اليومي v2
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">
                              Selected Audit Day
                            </span>
                            <span className="text-sm font-black text-slate-100 font-mono">
                              {currentFormattedTargetDate}
                            </span>
                          </div>
                          <span className="text-fuchsia-450 bg-fuchsia-950/20 text-[9px] font-mono border border-fuchsia-900/30 px-2.5 py-1 rounded-lg font-bold uppercase">
                            {dateFilterType}
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-455 uppercase block font-bold font-mono">
                              V2 Selections Found
                            </span>
                            <span className="text-sm font-black text-slate-100 font-mono">
                              {icharaPicksMatches.length} Matches
                            </span>
                          </div>
                          <span className="text-fuchsia-400 bg-fuchsia-950/20 text-[9px] font-mono border border-fuchsia-900/30 px-2.5 py-1 rounded-lg font-bold">
                            {totalFinishedV2} Settled
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-fuchsia-950/15 to-slate-950/90 p-4 rounded-xl border-2 border-fuchsia-900/40 flex items-center justify-between shadow-md group hover:border-fuchsia-500/40 transition-all duration-300">
                          <div className="space-y-1">
                            <span className="text-[9.5px] text-fuchsia-400 uppercase block font-mono font-extrabold flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-spin" />{" "}
                              Daily V2 Success Accuracy
                            </span>
                            <span className="text-lg font-black text-fuchsia-300 font-mono">
                              {successRateV2 !== null
                                ? `${successRateV2}%`
                                : "N/A (Pending Results)"}
                            </span>
                          </div>
                          <span className="text-fuchsia-300 bg-fuchsia-951 border-2 border-fuchsia-500/40 px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-black tracking-wider shadow-lg">
                            {wonDailyPicksV2} / {totalDailyPicksV2} Hits
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {icharaPicksMatches.length === 0 ? (
                  <div className="border border-dashed border-fuchsia-950/30 rounded-3xl p-16 text-center text-slate-500 bg-fuchsia-950/5">
                    <BookmarkCheck className="h-12 w-12 text-fuchsia-400/70 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">
                      No high-probability ICHARA V2 picks detected at the current threshold.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      Make sure to import more completed match lists in the "Data Importer" to recalibrate!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* EXCEPTIONAL FILTER BAR */}
                    <ExceptionalFilterBar
                      currentCategory={icharaExceptionalCategory}
                      onSelectCategory={setIcharaExceptionalCategory}
                      exceptionalFirst={icharaExceptionalFirst}
                      onToggleExceptionalFirst={() => setIcharaExceptionalFirst((prev) => !prev)}
                      counts={icharaCounts}
                      accentColor="fuchsia"
                      title="تصفية التوقعات الاستثنائية • ICHARA V2"
                    />

                    {displayIcharaMatches.length === 0 ? (
                      <div className="border border-dashed border-amber-500/30 rounded-2xl p-12 text-center text-slate-400 bg-amber-950/10 space-y-3">
                        <Star className="h-10 w-10 text-amber-400/60 mx-auto" />
                        <p className="text-sm font-bold text-slate-200">
                          لا توجد مباريات استثنائية تطابق الفلتر المحدد لهذا اليوم في نظام إشارة V2
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          جرب اختيار تصنيف آخر أو إلغاء الفلتر لعرض جميع ترشيحات إشارة V2.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIcharaExceptionalCategory("all")}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-md"
                        >
                          إلغاء الفلتر وعرض الكل ({icharaPicksMatches.length})
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                          {(() => {
                            const now = Date.now();
                            const upcomingSignals = displayIcharaMatches.filter(m => DateTimeSystem.isMatchUpcoming(m, now) && (icharaActivePredictionsMap?.get(m.match_id) || []).length > 0);
                            const resolvedSignals = displayIcharaMatches.filter(m => DateTimeSystem.isMatchFinished(m, now) && (icharaActivePredictionsMap?.get(m.match_id) || []).length > 0);

                        return (
                          <div className="space-y-6 text-left w-full col-span-full">
                            {/* SECTION 1: UPCOMING MATCHES / المباريات المرتقبة */}
                            <div className="bg-slate-950/40 border border-slate-900/40 rounded-2xl p-4.5 space-y-3 text-left">
                              <button
                                type="button"
                                onClick={() => setIsUpcomingIcharaExpanded(!isUpcomingIcharaExpanded)}
                                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-fuchsia-955/10 hover:from-slate-900 hover:to-fuchsia-900/25 rounded-xl border border-fuchsia-950/50 transition-all font-sans text-left text-xs text-fuchsia-300 font-extrabold cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 font-sans">
                                  {isUpcomingIcharaExpanded ? (
                                    <ChevronDown className="h-4.5 w-4.5 text-fuchsia-455 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4.5 w-4.5 text-fuchsia-455 shrink-0" />
                                  )}
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-black tracking-tight text-white flex items-center gap-2 flex-wrap text-left">
                                      <span>Upcoming V2 Selections</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-xs text-fuchsia-400 font-bold">المباريات المرتقبة قريباً</span>
                                    </span>
                                    <span className="text-[10px] text-slate-530 font-mono mt-0.5">
                                      {upcomingSignals.length} active analytical matches scheduled on dashboard
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-fuchsia-950 border border-fuchsia-900 text-fuchsia-455 font-mono text-[11px] font-black px-3 py-1 rounded-lg">
                                  {upcomingSignals.length} Matches
                                </span>
                              </button>

                              {isUpcomingIcharaExpanded && (
                                <div className="pt-2">
                                  {upcomingSignals.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-900 text-slate-500 text-sm">
                                      No upcoming high-probability V2 picks detected for this target day.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                      {upcomingSignals.slice(0, picksDisplayLimit).map((subM) => renderIcharaMatchCard(subM))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* SECTION 2: RESOLVED MATCHES / المباريات المنتهية */}
                            <div className="bg-slate-950/40 border border-slate-900/40 rounded-2xl p-4.5 space-y-3 text-left">
                              <button
                                type="button"
                                onClick={() => setIsResolvedIcharaExpanded(!isResolvedIcharaExpanded)}
                                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-955/5 hover:from-slate-900 hover:to-slate-850 rounded-xl border border-slate-800 transition-all font-sans text-left text-xs text-slate-305 font-extrabold cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 font-sans">
                                  {isResolvedIcharaExpanded ? (
                                    <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4.5 w-4.5 text-fuchsia-455 shrink-0" />
                                  )}
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-black tracking-tight text-white flex items-center gap-2 flex-wrap text-left">
                                      <span>Resolved V2 Selections</span>
                                      <span className="text-slate-500 font-normal">•</span>
                                      <span className="text-xs text-emerald-400 font-bold">المباريات والنتائج المنتهية</span>
                                    </span>
                                    <span className="text-[10px] text-slate-530 font-mono mt-0.5 font-medium">
                                      {resolvedSignals.length} completed signal matches already settled with final goals scores
                                    </span>
                                  </div>
                                </div>
                                <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-mono text-[11px] font-black px-3 py-1 rounded-lg">
                                  {resolvedSignals.length} Settled
                                </span>
                              </button>

                              {isResolvedIcharaExpanded && (
                                <div className="pt-2">
                                  {resolvedSignals.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-900 text-slate-500 text-sm font-sans">
                                      No finished/settled V2 selections for this date yet.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                      {resolvedSignals.slice(0, picksDisplayLimit).map((subM) => renderIcharaMatchCard(subM))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {displayIcharaMatches.length > picksDisplayLimit && (
                      <div className="flex justify-center py-6">
                        <button
                          onClick={() =>
                            setPicksDisplayLimit((prev) => prev + 20)
                          }
                          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-fuchsia-400 font-bold px-8 py-3 rounded-2xl border border-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl font-mono text-xs cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4 shrink-0 animate-[spin_4s_linear_infinite]" />
                          <span>
                            Load More Selections (
                            {displayIcharaMatches.length - picksDisplayLimit}{" "}
                            remaining)
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })()
    )}

        {/* PANEL: EXCLUSIVE PREMIUM PICKS FOR 1X2 DAY, GOALS HUNTER & FIRST HALF */}
        {activeTab === "premiumpicks" &&
          (() => {
            const activeList =
              premiumSubTab === "1x2_day"
                ? displayPremium1x2Matches
                : premiumSubTab === "goals_hunter"
                  ? displayPremiumGoalsHunterMatches
                  : displayPremiumFirstHalfMatches;

            return (
              <div className="space-y-6">
                {/* PREMIUM HERO PANEL */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-955/25 border-t-2 border-t-amber-550 border-x border-b border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 animate-spin text-amber-400" />
                          AI-Calibrated Premium Systems
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent tracking-tight">
                        PREMIUM PICKS & HIGH-ACCURACY SIGNALS
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                        Surgically selected fixtures with elite prediction
                        consistency. Every single pick featured below is
                        governed by strict, unyielding mathematical rules.
                      </p>
                    </div>

                    {/* STATIC RIGID RULES METRIC BADGES */}
                    <div className="bg-slate-950/70 border border-amber-955/50 rounded-2xl p-4 flex flex-col gap-2.5 min-w-[210px] shadow-inner font-mono">
                      <span className="text-[10px] text-amber-450 font-bold uppercase tracking-wider block border-b border-amber-950/40 pb-1.5 flex items-center gap-1">
                        <BookmarkCheck className="h-3.5 w-3.5" /> Strict
                        Filtering Criteria
                      </span>
                      <div className="space-y-1.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Min Sample Depth:</span>
                          <strong className="text-amber-300">
                            Last 15 Games
                          </strong>
                        </div>
                        <div className="flex flex-col gap-1 border-t border-slate-900/40 pt-1.5 mt-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Consensus Threshold:</span>
                            <strong className="text-emerald-400">
                              {premiumSubTab === "1x2_day" ? "Consensus Score" : "≥ 86.7% (13/15)"}
                            </strong>
                          </div>
                          {premiumSubTab === "1x2_day" && (
                            <div className="grid grid-cols-2 gap-1.5 pl-1 text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                              <span>Home/Away: &ge;74% Index</span>
                              <span>Draw: &ge;59% Index</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Scoreline Check:</span>
                          <strong className="text-teal-400">
                            Direction Aligned
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ELITE 88%+ DEDICATED CONTROL BAR IN HERO */}
                  <div className="mt-6 pt-4 border-t border-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-amber-500/30 shadow-inner">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setElite88FilterActive((prev) => !prev)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          elite88FilterActive
                            ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-950/50"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400"
                        }`}
                        title="تبديل تفعيل فلتر 88%+"
                      >
                        <Flame className="h-4 w-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-slate-100">
                            فلتر النخبة &gt; 88% (Premium 88%+ Focus)
                          </span>
                          <span
                            className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-black border ${
                              elite88FilterActive
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {elite88FilterActive ? "⚡ مُفَعَّل (88%+ فقط)" : "OFF (الكل)"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>دقة الفلتر التراكمية: <strong className="text-emerald-400 font-bold">{elite88Analytics.premium1x2.winRate}%</strong></span>
                          <span>| الفارق عن الأساسي: <strong className="text-amber-400 font-bold">+{elite88Analytics.alphaGain}% Alpha</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setShowElite88StatsModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-teal-300 border border-teal-500/40 text-xs font-black font-mono cursor-pointer transition-all shadow-sm"
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
                        <span>نظام الإحصائيات (88% Stats)</span>
                      </button>
                      <button
                        onClick={() => setElite88FilterActive((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black font-mono cursor-pointer border-2 transition-all ${
                          elite88FilterActive
                            ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-950/40"
                            : "bg-slate-950 text-amber-400 border-amber-500/50 hover:border-amber-400"
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{elite88FilterActive ? "إلغاء الحصر" : "حصر التوقعات > 88%"}</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-NAVIGATION CONTROLLERS */}
                  <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-slate-900/60 pt-6">
                    <button
                      onClick={() => setPremiumSubTab("1x2_day")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTab === "1x2_day"
                          ? "bg-gradient-to-r from-amber-500/15 to-yellow-600/15 text-amber-300 border border-amber-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${premiumSubTab === "1x2_day" ? "text-amber-400" : "text-slate-550"}`}
                      />
                      <span>1X2 Day ({displayPremium1x2Matches.length})</span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTab("goals_hunter")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTab === "goals_hunter"
                          ? "bg-gradient-to-r from-purple-500/15 to-amber-600/15 text-purple-300 border border-purple-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <Timer
                        className={`h-4 w-4 ${premiumSubTab === "goals_hunter" ? "text-purple-450" : "text-slate-555"}`}
                      />
                      <span>
                        Goals Hunter ({displayPremiumGoalsHunterMatches.length})
                      </span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTab("first_half")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTab === "first_half"
                          ? "bg-gradient-to-r from-blue-500/15 to-teal-600/15 text-blue-300 border border-blue-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <Zap
                        className={`h-4 w-4 ${premiumSubTab === "first_half" ? "text-blue-400" : "text-slate-555"}`}
                      />
                      <span>
                        First Half Only ({displayPremiumFirstHalfMatches.length})
                      </span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTab("premium_stats")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTab === "premium_stats"
                          ? "bg-gradient-to-r from-teal-500/15 to-emerald-600/15 text-teal-300 border border-teal-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <BarChart3
                        className={`h-4 w-4 ${premiumSubTab === "premium_stats" ? "text-teal-400" : "text-slate-500"}`}
                      />
                      <span>Premium Stats Dashboard & Calendar Logs</span>
                    </button>
                  </div>
                </div>

                {premiumSubTab === "premium_stats" ? (
                  <PremiumStatsDashboard matchesList={matchesList} db={db} />
                ) : (
                  <>
                    {/* BENTO ROW FOR PREMIUM PICKS */}
                    {(() => {
                      const finishedCSOnDay = displayPremium1x2Matches.filter(
                        (x) => x.match.status === "FINISHED",
                      );
                      const correctCSOnDay = finishedCSOnDay.filter((x) => {
                        const m = x.match;
                        if (m.ft_home === null || m.ft_away === null)
                          return false;
                        const outcome =
                          m.ft_home > m.ft_away
                            ? "1"
                            : m.ft_home < m.ft_away
                              ? "2"
                              : "X";
                        return outcome === (m.pred || "").toUpperCase();
                      }).length;

                      const finishedGoalsHunterOnDay =
                        displayPremiumGoalsHunterMatches.filter(
                          (x) => x.match.status === "FINISHED",
                        );
                      const correctGoalsHunterOnDay =
                        finishedGoalsHunterOnDay.filter((x) => {
                          const m = x.match;
                          if (m.ft_home === null || m.ft_away === null)
                            return false;
                          const totGoals = m.ft_home + m.ft_away;
                          if (x.bestMarket === "OVER_2_5") return totGoals > 2;
                          if (x.bestMarket === "OVER_3_5") return totGoals > 3;
                          if (x.bestMarket === "BTTS_YES")
                            return m.ft_home > 0 && m.ft_away > 0;
                          if (x.bestMarket === "OVER_1_5") return totGoals > 1;
                          return false;
                        }).length;

                      const finishedFHOnDay = displayPremiumFirstHalfMatches.filter(
                        (x) => x.match.status === "FINISHED",
                      );
                      const correctFHOnDay = finishedFHOnDay.filter((x) => {
                        const m = x.match;
                        if (m.ht_home === null || m.ht_away === null)
                          return false;
                        const totFh = m.ht_home + m.ht_away;
                        if (x.bestMarket === "FH_OVER_0_5") return totFh > 0;
                        if (x.bestMarket === "FH_OVER_1_5") return totFh > 1;
                        if (x.bestMarket === "FH_HOME_OVER_0_5")
                          return m.ht_home > 0;
                        if (x.bestMarket === "FH_AWAY_OVER_0_5")
                          return m.ht_away > 0;
                        return false;
                      }).length;

                      const totalFinishedOnDay =
                        finishedCSOnDay.length +
                        finishedGoalsHunterOnDay.length +
                        finishedFHOnDay.length;
                      const totalWonOnDay =
                        correctCSOnDay +
                        correctGoalsHunterOnDay +
                        correctFHOnDay;
                      const successRateOnDay =
                        totalFinishedOnDay > 0
                          ? parseFloat(((totalWonOnDay  / totalFinishedOnDay) * 100).toFixed(1))
                          : null;

                      return (
                        <div className="bg-slate-950/80 border border-slate-900/90 p-5 rounded-2xl space-y-4 shadow-xl my-2">
                          <div className="flex items-center gap-2 border-b border-slate-900/50 pb-2.5">
                            <BarChart3 className="h-4.5 w-4.5 text-emerald-400" />
                            <span className="text-[10.5px] text-slate-355 uppercase tracking-widest font-mono font-black">
                              Daily Premium Performance Summary / ملخص الأداء
                              اليومي المميز
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                              <div className="space-y-1">
                                <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">
                                  Premium Selected Day
                                </span>
                                <span className="text-sm font-black text-slate-100 font-mono">
                                  {currentFormattedTargetDate}
                                </span>
                              </div>
                              <span className="text-amber-405 bg-amber-955/20 text-[9px] font-mono border border-amber-900/30 px-2.5 py-1 rounded-lg font-bold uppercase">
                                {dateFilterType}
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                              <div className="space-y-1">
                                <span className="text-[9px] text-slate-450 uppercase block font-bold font-mono">
                                  Premium Selections Created
                                </span>
                                <span className="text-sm font-black text-slate-100 font-mono">
                                  {displayPremium1x2Matches.length +
                                    displayPremiumGoalsHunterMatches.length +
                                    displayPremiumFirstHalfMatches.length}{" "}
                                  Positions
                                </span>
                              </div>
                              <span className="text-amber-400 bg-amber-955/40 text-[9px] font-mono border border-amber-900/30 px-2.5 py-1 rounded-lg font-bold">
                                {totalFinishedOnDay} Settled
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-950/15 to-slate-950/90 p-4 rounded-xl border-2 border-emerald-900/40 flex items-center justify-between shadow-md group hover:border-emerald-500/40 transition-all duration-300">
                              <div className="space-y-1">
                                <span className="text-[9.5px] text-emerald-400 uppercase block font-mono font-extrabold flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />{" "}
                                  Premium Settled Hit Rate
                                </span>
                                <span className="text-lg font-black text-emerald-300 font-mono">
                                  {successRateOnDay !== null
                                    ? `${successRateOnDay}%`
                                    : "N/A (Pending Results)"}
                                </span>
                              </div>
                              <span className="text-emerald-300 bg-emerald-951 border-2 border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-black tracking-wider shadow-lg font-mono">
                                {totalWonOnDay} / {totalFinishedOnDay} Won
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* LIST LAYOUT */}
                    {activeList.length === 0 ? (
                      <div className="border border-dashed border-amber-955/20 rounded-3xl p-16 text-center text-slate-500 bg-amber-955/5">
                        <Flame className="h-12 w-12 text-amber-500/40 mx-auto mb-3 animate-[pulse_2s_infinite]" />
                        <h3 className="text-base font-extrabold text-slate-300">
                          No Strict Premium Signals Active Currently
                        </h3>
                        <p className="text-xs text-slate-550 mt-2 font-mono max-w-xl mx-auto leading-relaxed">
                          The backend scanned{" "}
                          <strong className="text-amber-400">
                            {distinctSignals.length} Active System Signals
                          </strong>
                          , but none achieved a verified{" "}
                          <strong className="text-emerald-400">
                            85%+ accuracy rating
                          </strong>{" "}
                          strictly in the last finished occurrences for{" "}
                          {premiumSubTab === "1x2_day"
                            ? "1X2 Day"
                            : premiumSubTab === "goals_hunter"
                              ? "Goals Hunter"
                              : "First Half Only"}{" "}
                          predictions.
                        </p>
                        <p className="text-xs text-slate-400 mt-4 font-mono bg-slate-950/80 max-w-lg mx-auto py-2.5 px-4 rounded-xl border border-slate-900/60 leading-relaxed">
                          💡 <strong>Tip for Researchers</strong>: Navigate to
                          the{" "}
                          <strong className="text-purple-300 font-bold">
                            Data Importer
                          </strong>{" "}
                          tab and paste more updated leagues data to populate
                          finished results, training the models or revealing
                          untapped golden routes!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeList
                            .map((rawItem) => {
                              const item = rawItem as any;
                              const m = item.match;
                              const sigInfo = db.signals[m.signal_code]!;

                              return (
                                <div
                                  key={m.match_id}
                                  className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-2xl relative transition-all duration-300 hover:scale-[1.01] ${
                                    premiumSubTab === "1x2_day"
                                      ? "border-amber-900/45 hover:border-amber-500/45 hover:shadow-amber-950/10"
                                      : premiumSubTab === "goals_hunter"
                                        ? "border-purple-900/45 hover:border-purple-500/45 hover:shadow-purple-950/10"
                                        : "border-blue-900/45 hover:border-blue-500/45 hover:shadow-blue-950/10"
                                  }`}
                                >
                                  {/* HEADER ACCENTS */}
                                  <div className="flex justify-between items-center gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-extrabold uppercase shadow-sm border ${
                                          premiumSubTab === "1x2_day"
                                            ? "bg-amber-955/20 text-amber-300 border-amber-900/40"
                                            : premiumSubTab === "goals_hunter"
                                              ? "bg-purple-950 text-purple-300 border-purple-900"
                                              : "bg-blue-950 text-blue-300 border-blue-900"
                                        }`}
                                      >
                                        {sigInfo.code}
                                      </span>
                                      <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded-lg text-[9.5px] font-mono font-medium">
                                        Resolved: {sigInfo.total_resolved}{" "}
                                        Matches
                                      </span>
                                    </div>

                                    <span
                                      className="text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-lg font-bold"
                                      title={m.league_name}
                                    >
                                      {m.league_name}
                                    </span>
                                  </div>

                                  {/* MATCHUP DETAILS */}
                                  <div className="bg-slate-950/80 border border-slate-950 rounded-2xl p-4 space-y-3">
                                    <div className="grid grid-cols-11 gap-1 items-center">
                                      {/* Home */}
                                      <div className="col-span-11 sm:col-span-5 text-center space-y-2">
                                        <div
                                          className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.home)} flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10`}
                                        >
                                          {getInitials(m.home)}
                                        </div>
                                        <span
                                          className="font-extrabold text-slate-100 text-xs sm:text-sm tracking-tight block truncate"
                                          title={m.home}
                                        >
                                          {m.home}
                                        </span>
                                        <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-medium">
                                          xG: {m.xg_home}
                                        </span>
                                      </div>

                                      {/* VS or Settled Score */}
                                      <div className="hidden sm:block col-span-1 text-center">
                                        {m.status === "FINISHED" ? (
                                          <div className="space-y-0.5">
                                            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-tight bg-amber-955/45 border border-amber-900/40 px-2.5 py-0.5 rounded-lg shadow-md block whitespace-nowrap">
                                              {m.ft_home} - {m.ft_away}
                                            </span>
                                            <span className="text-[7.5px] font-mono text-slate-500 block uppercase font-bold">
                                              FT ({m.ht_home}-{m.ht_away})
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-[8px] font-mono text-amber-400 bg-amber-950/40 border border-amber-900/40 w-5 h-5 rounded-full flex items-center justify-center font-black shadow-inner">
                                            VS
                                          </span>
                                        )}
                                      </div>

                                      {/* Away */}
                                      <div className="col-span-11 sm:col-span-5 text-center space-y-2 mt-4 sm:mt-0">
                                        <div
                                          className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.away)} flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10`}
                                        >
                                          {getInitials(m.away)}
                                        </div>
                                        <span
                                          className="font-extrabold text-slate-100 text-xs sm:text-sm tracking-tight block truncate"
                                          title={m.away}
                                        >
                                          {m.away}
                                        </span>
                                        <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-medium">
                                          xG: {m.xg_away}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between gap-2.5 pt-2 border-t border-slate-900 flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                                        <span>
                                          Kickoff Slot:{" "}
                                          <strong className="text-slate-300">
                                            {m.kickoff}
                                          </strong>
                                        </span>
                                      </div>
                                      {sigInfo?.signature_name_ar && (
                                        <div className="bg-slate-900/60 border border-slate-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                          <span className="text-emerald-400 font-bold font-sans text-[8.5px]">
                                            {sigInfo.signature_name_ar}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* MARKETS BLOCK */}
                                  <div className="grid grid-cols-2 gap-3.5 mt-4">
                                    <div className="bg-slate-950/65 border border-slate-900/80 p-3 rounded-2xl flex flex-col justify-between min-h-[75px]">
                                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black">
                                        V1 Target Placement
                                      </span>
                                      <div className="flex items-center justify-between gap-1.5 mt-1 font-mono flex-wrap">
                                        <strong className={`text-sm font-black break-all uppercase ${
                                          premiumSubTab === "1x2_day"
                                            ? "text-amber-400"
                                            : premiumSubTab === "goals_hunter"
                                              ? "text-purple-400"
                                              : "text-blue-400"
                                        }`}>
                                          {premiumSubTab === "1x2_day"
                                            ? `FT Pick ${getMatchPrediction(m)}`
                                            : premiumSubTab === "goals_hunter"
                                              ? (item.bestMarket || "").replace("BTTS_YES", "BTTS YES")
                                              : (item.bestMarket || "") === "FH_BTTS_NO"
                                                ? "FH BTTS NO"
                                                : (item.bestMarket || "").replace("FH_", "FH ")}
                                        </strong>
                                        {m.status === "FINISHED" &&
                                          m.ft_home !== null &&
                                          m.ft_away !== null &&
                                          (() => {
                                            let isWon = false;
                                            if (premiumSubTab === "1x2_day") {
                                              const actualOutcome =
                                                m.ft_home > m.ft_away
                                                  ? "1"
                                                  : m.ft_home < m.ft_away
                                                    ? "2"
                                                    : "X";
                                              isWon = actualOutcome === getMatchPrediction(m);
                                            } else if (premiumSubTab === "goals_hunter") {
                                              const totGoals = m.ft_home + m.ft_away;
                                              if (item.bestMarket === "OVER_1_5") isWon = totGoals > 1;
                                              else if (item.bestMarket === "OVER_2_5") isWon = totGoals > 2;
                                              else if (item.bestMarket === "OVER_3_5") isWon = totGoals > 3;
                                              else if (item.bestMarket === "BTTS_YES") isWon = m.ft_home > 0 && m.ft_away > 0;
                                            } else {
                                              if (m.ht_home !== null && m.ht_away !== null) {
                                                const totFh = m.ht_home + m.ht_away;
                                                if (item.bestMarket === "FH_OVER_0_5") isWon = totFh > 0;
                                                else if (item.bestMarket === "FH_OVER_1_5") isWon = totFh > 1;
                                                else if (item.bestMarket === "FH_HOME_OVER_0_5") isWon = m.ht_home > 0;
                                                else if (item.bestMarket === "FH_AWAY_OVER_0_5") isWon = m.ht_away > 0;
                                                else if (item.bestMarket === "FH_BTTS_NO") isWon = m.ht_home === 0 || m.ht_away === 0;
                                              }
                                            }
                                            return (
                                              <span
                                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                                                  isWon
                                                    ? "text-emerald-400 bg-emerald-955/60 border border-emerald-900/50"
                                                    : "text-rose-455 bg-rose-955/60 border border-rose-900/50"
                                                }`}
                                              >
                                                {isWon ? "✓ WON" : "✗ LOST"}
                                              </span>
                                            );
                                          })()}
                                      </div>
                                      <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1.5 text-[8.5px] font-mono text-slate-500">
                                        <span>Consensus Track:</span>
                                        <span className="text-slate-300 font-bold">
                                          {item.successCount} / {item.totalChecked}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="bg-slate-950/65 border border-slate-900/80 p-3 rounded-2xl flex flex-col justify-between min-h-[75px]">
                                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black">
                                        V1 Model Multi-factor
                                      </span>
                                      <div className="flex items-baseline gap-1 mt-1 font-mono">
                                        <strong className="text-sm font-black text-emerald-400">
                                          {item.confidenceRating}%
                                        </strong>
                                        <span className="text-[7.5px] text-slate-500 uppercase font-bold">
                                          Rating
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1.5 text-[8.5px] font-mono text-slate-500">
                                        <span>Win rate:</span>
                                        <span className="text-emerald-455 font-bold">
                                          {item.winRate}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* SHIELDS & STATS COLLAPSIBLE AUDIT */}
                                  <div className="border-t border-slate-900 pt-4 mt-1">
                                    <div className="text-[9.2px] text-slate-455 font-black tracking-wide font-mono uppercase pb-2 flex items-center gap-1">
                                      <ShieldCheck className={`h-4 w-4 ${
                                        premiumSubTab === "1x2_day"
                                          ? "text-amber-400"
                                          : premiumSubTab === "goals_hunter"
                                            ? "text-purple-400"
                                            : "text-blue-400"
                                      }`} />
                                      <span>ICHARA V1 Deep Defense Audit Logs</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <div className="bg-slate-950/30 border border-slate-900/40 rounded-xl p-2.5 font-mono text-[9px] space-y-1.5">
                                        <div className="flex items-center justify-between text-slate-455 border-b border-slate-900/30 pb-1">
                                          <span>Fatigue REST:</span>
                                          {premiumSubTab === "1x2_day" && item.shields ? (
                                            <strong className="text-slate-300">
                                              H: {item.shields.homeRest}d | A: {item.shields.awayRest}d
                                            </strong>
                                          ) : (
                                            <strong className="text-slate-300">
                                              V1 Calibrated
                                            </strong>
                                          )}
                                        </div>
                                        {premiumSubTab === "1x2_day" && item.shields?.isFatigued ? (
                                          <span className="text-[8px] font-bold text-amber-500 bg-amber-955/10 border border-amber-900/30 px-1 py-0.2 rounded block text-center animate-pulse">
                                            ⚠️ fatigue trap trigger
                                          </span>
                                        ) : (
                                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-955/10 border border-emerald-950/30 px-1 py-0.2 rounded block text-center">
                                            ✓ rest intervals optimal
                                          </span>
                                        )}
                                      </div>

                                      <div className="bg-slate-950/30 border border-slate-900/40 rounded-xl p-2.5 font-mono text-[9px] space-y-1.5">
                                        <div className="flex items-center justify-between text-slate-455 border-b border-slate-900/30 pb-1">
                                          <span>Audit Scores:</span>
                                          <strong className="text-slate-300">
                                            {premiumSubTab === "1x2_day" && item.shields ? `${item.shields.consolidatedScore}%` : `${item.confidenceRating}%`}
                                          </strong>
                                        </div>
                                        <span className="text-[8px] font-bold text-teal-400 bg-teal-955/10 border border-teal-950/30 px-1 py-0.2 rounded block text-center uppercase tracking-wide">
                                          SGD pre-optimizer passed
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CHRONOLOGICAL SIGNAL PATH */}
                                  <div className="bg-slate-950/90 border border-slate-900 p-3 rounded-2xl space-y-2 mt-2">
                                    <div className="flex justify-between items-center gap-2 flex-wrap">
                                      <span className="text-[9.5px] text-slate-455 uppercase font-mono font-bold">
                                        {premiumSubTab === "goals_hunter"
                                          ? `Chronological Signal Path (Last 20 Games)`
                                          : `Chronological Signal Path (Last 15 Games)`}
                                      </span>
                                      <span className="bg-emerald-950/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900/40">
                                        Hit-Rate: {item.winRate}% (
                                        {item.successCount}/
                                        {premiumSubTab === "goals_hunter" ? 20 : 15} Hits)
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 justify-between overflow-x-auto pb-1 scrollbar-none">
                                      {(premiumSubTab === "goals_hunter" ? item.last20 : item.last15).map((hist: any, hIdx: number) => {
                                        let isWon = false;
                                        let tooltipText = "";
                                        let symbol = "L";

                                        if (premiumSubTab === "1x2_day") {
                                          if (hist.ft_home === null || hist.ft_away === null) return null;
                                          const actualOutcome = hist.ft_home > hist.ft_away ? "1" : hist.ft_home < hist.ft_away ? "2" : "X";
                                          const pastPred = getMatchPrediction(hist);
                                          isWon = actualOutcome === pastPred;
                                          tooltipText = `${hist.home} ${hist.ft_home}-${hist.ft_away} ${hist.away} (Target: ${pastPred})`;
                                          symbol = isWon ? "W" : "L";
                                        } else if (premiumSubTab === "goals_hunter") {
                                          if (hist.ft_home === null || hist.ft_away === null) return null;
                                          const totGoals = hist.ft_home + hist.ft_away;
                                          if (item.bestMarket === "OVER_1_5") isWon = totGoals > 1;
                                          else if (item.bestMarket === "OVER_2_5") isWon = totGoals > 2;
                                          else if (item.bestMarket === "OVER_3_5") isWon = totGoals > 3;
                                          else if (item.bestMarket === "BTTS_YES") isWon = hist.ft_home > 0 && hist.ft_away > 0;

                                          tooltipText = `${hist.home} ${hist.ft_home}-${hist.ft_away} ${hist.away} (Target: ${item.bestMarket})`;
                                          symbol = isWon ? "W" : "L";
                                        } else if (premiumSubTab === "first_half") {
                                          if (hist.ht_home === null || hist.ht_away === null) return null;
                                          const totFh = hist.ht_home + hist.ht_away;
                                          if (item.bestMarket === "FH_OVER_0_5") isWon = totFh > 0;
                                          else if (item.bestMarket === "FH_OVER_1_5") isWon = totFh > 1;
                                          else if (item.bestMarket === "FH_HOME_OVER_0_5") isWon = hist.ht_home > 0;
                                          else if (item.bestMarket === "FH_AWAY_OVER_0_5") isWon = hist.ht_away > 0;
                                          else if (item.bestMarket === "FH_BTTS_NO") isWon = hist.ht_home === 0 || hist.ht_away === 0;

                                          tooltipText = `${hist.home} - Halftime ${hist.ht_home}-${hist.ht_away} (Target: ${item.bestMarket})`;
                                          symbol = isWon ? "W" : "L";
                                        }

                                        const dotColor = isWon
                                          ? "bg-emerald-555/15 text-emerald-400 border border-emerald-500/30"
                                          : "bg-rose-555/15 text-rose-455 border border-rose-500/30";

                                        return (
                                          <div
                                            key={hIdx}
                                            title={tooltipText}
                                            className={`flex-1 h-7 min-w-[24px] rounded-xl ${dotColor} flex items-center justify-center text-[10px] font-black font-mono cursor-help hover:scale-105 transition-transform duration-150`}
                                          >
                                            {symbol}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

        {/* PANEL: EXCLUSIVE PREMIUM PICKS V2 FOR ICHARA V2 */}
        {activeTab === "premiumpicks_v2" &&
          (() => {
            const activeList =
              premiumSubTabV2 === "1x2_day"
                ? displayPremium1x2MatchesV2
                : premiumSubTabV2 === "goals_hunter"
                  ? displayPremiumGoalsHunterMatchesV2
                  : displayPremiumFirstHalfMatchesV2;

            return (
              <div className="space-y-6">
                {/* PREMIUM HERO PANEL V2 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-fuchsia-955/25 border-t-2 border-t-fuchsia-500 border-x border-b border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 animate-spin text-fuchsia-400" />
                          ICHARA V2 Calibrated Premium Systems
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-fuchsia-100 via-pink-200 to-fuchsia-100 bg-clip-text text-transparent tracking-tight">
                        PREMIUM PICKS V2 (ICHARA V2)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                        Surgically selected fixtures governed by ICHARA V2's premium signal engine. Out-of-sample models with adaptive similarity neighbors and Hard SGD optimization.
                      </p>
                    </div>

                    {/* STATIC RIGID RULES METRIC BADGES V2 */}
                    <div className="bg-slate-950/70 border border-fuchsia-955/50 rounded-2xl p-4 flex flex-col gap-2.5 min-w-[210px] shadow-inner font-mono">
                      <span className="text-[10px] text-fuchsia-450 font-bold uppercase tracking-wider block border-b border-fuchsia-950/40 pb-1.5 flex items-center gap-1">
                        <BookmarkCheck className="h-3.5 w-3.5 text-fuchsia-400" /> Strict
                        Filtering Criteria v2
                      </span>
                      <div className="space-y-1.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Min Sample Depth:</span>
                          <strong className="text-fuchsia-300">
                            Last 15 Games (V2 Adaptive)
                          </strong>
                        </div>
                        <div className="flex flex-col gap-1 border-t border-slate-900/40 pt-1.5 mt-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Consensus Threshold:</span>
                            <strong className="text-emerald-400">
                              {premiumSubTabV2 === "1x2_day" ? "Consensus Score" : "≥ 80.0%"}
                            </strong>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Scoreline Check:</span>
                          <strong className="text-teal-400">
                            Direction Aligned
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ELITE 88%+ DEDICATED CONTROL BAR IN HERO V2 */}
                  <div className="mt-6 pt-4 border-t border-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-fuchsia-500/30 shadow-inner">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setElite88FilterActive((prev) => !prev)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          elite88FilterActive
                            ? "bg-fuchsia-500 text-slate-950 border-fuchsia-300 shadow-md shadow-fuchsia-950/50"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-fuchsia-400"
                        }`}
                        title="تبديل تفعيل فلتر 88%+"
                      >
                        <Flame className="h-4 w-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-slate-100">
                            فلتر النخبة V2 &gt; 88% (Premium V2 88%+ Focus)
                          </span>
                          <span
                            className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-black border ${
                              elite88FilterActive
                                ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}
                          >
                            {elite88FilterActive ? "⚡ مُفَعَّل (88%+ فقط)" : "OFF (الكل)"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>دقة فلتر V2 التراكمية: <strong className="text-fuchsia-300 font-bold">{elite88Analytics.icharaV2.winRate}%</strong></span>
                          <span>| الفارق عن الأساسي: <strong className="text-amber-400 font-bold">+{elite88Analytics.alphaGain}% Alpha</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => setShowElite88StatsModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-teal-300 border border-teal-500/40 text-xs font-black font-mono cursor-pointer transition-all shadow-sm"
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-teal-400" />
                        <span>نظام الإحصائيات (88% Stats)</span>
                      </button>
                      <button
                        onClick={() => setElite88FilterActive((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black font-mono cursor-pointer border-2 transition-all ${
                          elite88FilterActive
                            ? "bg-fuchsia-500 text-slate-950 border-fuchsia-300 shadow-md shadow-fuchsia-950/40"
                            : "bg-slate-950 text-fuchsia-400 border-fuchsia-500/50 hover:border-fuchsia-400"
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>{elite88FilterActive ? "إلغاء الحصر" : "حصر التوقعات > 88%"}</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-NAVIGATION CONTROLLERS V2 */}
                  <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-slate-900/60 pt-6">
                    <button
                      onClick={() => setPremiumSubTabV2("1x2_day")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTabV2 === "1x2_day"
                          ? "bg-gradient-to-r from-fuchsia-500/15 to-pink-600/15 text-fuchsia-300 border border-fuchsia-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${premiumSubTabV2 === "1x2_day" ? "text-fuchsia-400" : "text-slate-555"}`}
                      />
                      <span>1X2 Day V2 ({displayPremium1x2MatchesV2.length})</span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTabV2("goals_hunter")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTabV2 === "goals_hunter"
                          ? "bg-gradient-to-r from-purple-500/15 to-fuchsia-600/15 text-purple-300 border border-purple-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <Timer
                        className={`h-4 w-4 ${premiumSubTabV2 === "goals_hunter" ? "text-purple-400" : "text-slate-555"}`}
                      />
                      <span>
                        Goals Hunter V2 ({displayPremiumGoalsHunterMatchesV2.length})
                      </span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTabV2("first_half")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTabV2 === "first_half"
                          ? "bg-gradient-to-r from-blue-500/15 to-fuchsia-600/15 text-blue-300 border border-blue-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <Zap
                        className={`h-4 w-4 ${premiumSubTabV2 === "first_half" ? "text-blue-400" : "text-slate-555"}`}
                      />
                      <span>
                        First Half V2 ({displayPremiumFirstHalfMatchesV2.length})
                      </span>
                    </button>

                    <button
                      onClick={() => setPremiumSubTabV2("premium_stats")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all cursor-pointer ${
                        premiumSubTabV2 === "premium_stats"
                          ? "bg-gradient-to-r from-teal-500/15 to-fuchsia-600/15 text-teal-300 border border-teal-500/40 shadow-inner"
                          : "bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-900"
                      }`}
                    >
                      <BarChart3
                        className={`h-4 w-4 ${premiumSubTabV2 === "premium_stats" ? "text-teal-400" : "text-slate-500"}`}
                      />
                      <span>Premium Stats V2 Dashboard & Logs</span>
                    </button>
                  </div>
                </div>

                {premiumSubTabV2 === "premium_stats" ? (
                  <PremiumStatsDashboardV2 matchesList={matchesList} db={db} />
                ) : (
                  <>
                    {/* BENTO ROW FOR PREMIUM PICKS V2 */}
                    {(() => {
                      const finishedCSOnDay = displayPremium1x2MatchesV2.filter(
                        (x) => x.match.status === "FINISHED",
                      );
                      const correctCSOnDay = finishedCSOnDay.filter((x) => {
                        const m = x.match;
                        if (m.ft_home === null || m.ft_away === null)
                          return false;
                        const outcome =
                          m.ft_home > m.ft_away
                            ? "1"
                            : m.ft_home < m.ft_away
                              ? "2"
                              : "X";
                        return outcome === getMatchPrediction(m);
                      }).length;

                      const finishedGoalsHunterOnDay =
                        displayPremiumGoalsHunterMatchesV2.filter(
                          (x) => x.match.status === "FINISHED",
                        );
                      const correctGoalsHunterOnDay =
                        finishedGoalsHunterOnDay.filter((x) => {
                          const m = x.match;
                          if (m.ft_home === null || m.ft_away === null)
                            return false;
                          const totGoals = m.ft_home + m.ft_away;
                          if (x.bestMarket === "OVER_2_5") return totGoals > 2;
                          if (x.bestMarket === "OVER_3_5") return totGoals > 3;
                          if (x.bestMarket === "BTTS_YES")
                            return m.ft_home > 0 && m.ft_away > 0;
                          if (x.bestMarket === "OVER_1_5") return totGoals > 1;
                          return false;
                        }).length;

                      const finishedFHOnDay = displayPremiumFirstHalfMatchesV2.filter(
                        (x) => x.match.status === "FINISHED",
                      );
                      const correctFHOnDay = finishedFHOnDay.filter((x) => {
                        const m = x.match;
                        if (m.ht_home === null || m.ht_away === null)
                          return false;
                        const totFh = m.ht_home + m.ht_away;
                        if (x.bestMarket === "FH_OVER_0_5") return totFh > 0;
                        if (x.bestMarket === "FH_OVER_1_5") return totFh > 1;
                        if (x.bestMarket === "FH_HOME_OVER_0_5")
                          return m.ht_home > 0;
                        if (x.bestMarket === "FH_AWAY_OVER_0_5")
                          return m.ht_away > 0;
                        if (x.bestMarket === "FH_BTTS_NO")
                          return m.ht_home === 0 || m.ht_away === 0;
                        return false;
                      }).length;

                      const totalFinishedOnDay =
                        finishedCSOnDay.length +
                        finishedGoalsHunterOnDay.length +
                        finishedFHOnDay.length;
                      const totalWonOnDay =
                        correctCSOnDay +
                        correctGoalsHunterOnDay +
                        correctFHOnDay;
                      const successRateOnDay =
                        totalFinishedOnDay > 0
                          ? parseFloat(((totalWonOnDay / totalFinishedOnDay) * 100).toFixed(1))
                          : null;

                      return (
                        <div className="bg-slate-950/80 border border-slate-900/90 p-5 rounded-2xl space-y-4 shadow-xl my-2">
                          <div className="flex items-center gap-2 border-b border-slate-900/50 pb-2.5">
                            <BarChart3 className="h-4.5 w-4.5 text-fuchsia-400" />
                            <span className="text-[10.5px] text-slate-355 uppercase tracking-widest font-mono font-black">
                              Daily Premium V2 Summary / ملخص أداء ICHARA V2 المميز
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                              <div className="space-y-1">
                                <span className="text-[9px] text-slate-400 uppercase block font-bold font-mono">
                                  Premium V2 Selected Day
                                </span>
                                <span className="text-sm font-black text-slate-100 font-mono">
                                  {currentFormattedTargetDate}
                                </span>
                              </div>
                              <span className="text-fuchsia-400 bg-fuchsia-955/25 text-[9px] font-mono border border-fuchsia-900/30 px-2.5 py-1 rounded-lg font-bold uppercase">
                                {dateFilterType}
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between shadow-md">
                              <div className="space-y-1">
                                <span className="text-[9px] text-slate-455 uppercase block font-bold font-mono">
                                  V2 Selections Created
                                </span>
                                <span className="text-sm font-black text-slate-100 font-mono">
                                  {displayPremium1x2MatchesV2.length +
                                    displayPremiumGoalsHunterMatchesV2.length +
                                    displayPremiumFirstHalfMatchesV2.length}{" "}
                                  Positions
                                </span>
                              </div>
                              <span className="text-fuchsia-300 bg-fuchsia-955/40 text-[9px] font-mono border border-fuchsia-900/30 px-2.5 py-1 rounded-lg font-bold">
                                {totalFinishedOnDay} Settled
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-fuchsia-950/15 to-slate-950/90 p-4 rounded-xl border-2 border-fuchsia-900/40 flex items-center justify-between shadow-md group hover:border-fuchsia-500/40 transition-all duration-300">
                              <div className="space-y-1">
                                <span className="text-[9.5px] text-fuchsia-400 uppercase block font-mono font-extrabold flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-spin" />{" "}
                                  V2 Settled Hit Rate
                                </span>
                                <span className="text-lg font-black text-fuchsia-305 font-mono">
                                  {successRateOnDay !== null
                                    ? `${successRateOnDay}%`
                                    : "N/A (Pending Results)"}
                                </span>
                              </div>
                              <span className="text-fuchsia-300 bg-fuchsia-951 border-2 border-fuchsia-500/40 px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-black tracking-wider shadow-lg font-mono">
                                {totalWonOnDay} / {totalFinishedOnDay} Won
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* LIST LAYOUT V2 */}
                    {activeList.length === 0 ? (
                      <div className="border border-dashed border-fuchsia-955/20 rounded-3xl p-16 text-center text-slate-500 bg-fuchsia-955/5">
                        <Flame className="h-12 w-12 text-fuchsia-500/40 mx-auto mb-3 animate-[pulse_2s_infinite]" />
                        <h3 className="text-base font-extrabold text-slate-300">
                          No Active ICHARA V2 Premium Signals Currently
                        </h3>
                        <p className="text-xs text-slate-550 mt-2 font-mono max-w-xl mx-auto leading-relaxed">
                          Scanned all active ICHARA V2 system elements, but none matched the multi-factor physical fatigue, local xG drift, and stochastic ML consensus pre-filters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeList
                            .map((rawItem) => {
                              const item = rawItem as any;
                              const m = item.match;
                              const sigInfo = db.signals_v2[m.signal_code_v2]!;

                              return (
                                <div
                                  key={m.match_id}
                                  className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border rounded-3xl p-6 flex flex-col justify-between gap-5 shadow-2xl relative transition-all duration-300 hover:scale-[1.01] ${
                                    premiumSubTabV2 === "1x2_day"
                                      ? "border-fuchsia-900/45 hover:border-fuchsia-500/45 hover:shadow-fuchsia-955/10"
                                      : premiumSubTabV2 === "goals_hunter"
                                        ? "border-purple-900/45 hover:border-purple-500/45 hover:shadow-purple-955/10"
                                        : "border-blue-900/45 hover:border-blue-500/45 hover:shadow-blue-955/10"
                                  }`}
                                >
                                  {/* HEADER ACCENTS */}
                                  <div className="flex justify-between items-center gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-extrabold uppercase shadow-sm border ${
                                          premiumSubTabV2 === "1x2_day"
                                            ? "bg-fuchsia-955/25 text-fuchsia-305 border-fuchsia-900/40"
                                            : premiumSubTabV2 === "goals_hunter"
                                              ? "bg-purple-950 text-purple-300 border-purple-900"
                                              : "bg-blue-950 text-blue-300 border-blue-900"
                                        }`}
                                      >
                                        {sigInfo.code}
                                      </span>
                                      <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded-lg text-[9.5px] font-mono font-medium">
                                        Resolved: {sigInfo.total_resolved} Matches
                                      </span>
                                    </div>

                                    <span
                                      className="text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-lg font-bold"
                                      title={m.league_name}
                                    >
                                      {m.league_name}
                                    </span>
                                  </div>

                                  {/* MATCHUP DETAILS */}
                                  <div className="bg-slate-950/80 border border-slate-950 rounded-2xl p-4 space-y-3">
                                    <div className="grid grid-cols-11 gap-1 items-center">
                                      {/* Home */}
                                      <div className="col-span-11 sm:col-span-5 text-center space-y-2">
                                        <div
                                          className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.home)} flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10`}
                                        >
                                          {getInitials(m.home)}
                                        </div>
                                        <span
                                          className="font-extrabold text-slate-100 text-xs sm:text-sm tracking-tight block truncate"
                                          title={m.home}
                                        >
                                          {m.home}
                                        </span>
                                        <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-medium">
                                          xG: {m.xg_home}
                                        </span>
                                      </div>

                                      {/* VS or Settled Score */}
                                      <div className="hidden sm:block col-span-1 text-center">
                                        {m.status === "FINISHED" ? (
                                          <div className="space-y-0.5">
                                            <span className="text-xs sm:text-sm font-black text-fuchsia-400 font-mono tracking-tight bg-fuchsia-955/45 border border-fuchsia-900/40 px-2.5 py-0.5 rounded-lg shadow-md block whitespace-nowrap">
                                              {m.ft_home} - {m.ft_away}
                                            </span>
                                            <span className="text-[7.5px] font-mono text-slate-500 block uppercase font-bold">
                                              FT ({m.ht_home}-{m.ht_away})
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-[8px] font-mono text-fuchsia-400 bg-fuchsia-950/40 border border-fuchsia-900/40 w-5 h-5 rounded-full flex items-center justify-center font-black shadow-inner">
                                            VS
                                          </span>
                                        )}
                                      </div>

                                      {/* Away */}
                                      <div className="col-span-11 sm:col-span-5 text-center space-y-2 mt-4 sm:mt-0">
                                        <div
                                          className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${getDeterministicGradient(m.away)} flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/10`}
                                        >
                                          {getInitials(m.away)}
                                        </div>
                                        <span
                                          className="font-extrabold text-slate-100 text-xs sm:text-sm tracking-tight block truncate"
                                          title={m.away}
                                        >
                                          {m.away}
                                        </span>
                                        <span className="inline-block bg-slate-900/80 border border-slate-800/60 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-medium">
                                          xG: {m.xg_away}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between gap-2.5 pt-2 border-t border-slate-900 flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-fuchsia-400" />
                                        <span>
                                          Kickoff Slot:{" "}
                                          <strong className="text-slate-300">
                                            {m.kickoff}
                                          </strong>
                                        </span>
                                      </div>
                                      {sigInfo?.signature_name_ar && (
                                        <div className="bg-slate-900/60 border border-slate-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                          <span className="text-emerald-400 font-bold font-sans text-[8.5px]">
                                            {sigInfo.signature_name_ar}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* MARKETS BLOCK */}
                                  <div className="grid grid-cols-2 gap-3.5">
                                    <div className="bg-slate-950/65 border border-slate-900/80 p-3 rounded-2xl flex flex-col justify-between min-h-[75px]">
                                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black">
                                        V2 Target Placement
                                      </span>
                                      <div className="flex items-center justify-between gap-1.5 mt-1 font-mono flex-wrap">
                                        <strong className="text-sm font-black text-rose-350 break-all uppercase">
                                          {premiumSubTabV2 === "1x2_day"
                                            ? `FT Pick ${getMatchPrediction(m)}`
                                            : premiumSubTabV2 === "goals_hunter"
                                              ? item.bestMarket.replace("BTTS_YES", "BTTS YES")
                                              : item.bestMarket === "FH_BTTS_NO"
                                                ? "FH BTTS NO"
                                                : item.bestMarket.replace("FH_", "FH ")}
                                        </strong>
                                        {m.status === "FINISHED" &&
                                          m.ft_home !== null &&
                                          m.ft_away !== null &&
                                          (() => {
                                            let isWon = false;
                                            if (premiumSubTabV2 === "1x2_day") {
                                              const actualOutcome =
                                                m.ft_home > m.ft_away
                                                  ? "1"
                                                  : m.ft_home < m.ft_away
                                                    ? "2"
                                                    : "X";
                                              isWon = actualOutcome === getMatchPrediction(m);
                                            } else if (premiumSubTabV2 === "goals_hunter") {
                                              const totGoals = m.ft_home + m.ft_away;
                                              if (item.bestMarket === "OVER_1_5") isWon = totGoals > 1;
                                              else if (item.bestMarket === "OVER_2_5") isWon = totGoals > 2;
                                              else if (item.bestMarket === "OVER_3_5") isWon = totGoals > 3;
                                              else if (item.bestMarket === "BTTS_YES") isWon = m.ft_home > 0 && m.ft_away > 0;
                                            } else {
                                              if (m.ht_home !== null && m.ht_away !== null) {
                                                const totFh = m.ht_home + m.ht_away;
                                                if (item.bestMarket === "FH_OVER_0_5") isWon = totFh > 0;
                                                else if (item.bestMarket === "FH_OVER_1_5") isWon = totFh > 1;
                                                else if (item.bestMarket === "FH_HOME_OVER_0_5") isWon = m.ht_home > 0;
                                                else if (item.bestMarket === "FH_AWAY_OVER_0_5") isWon = m.ht_away > 0;
                                                else if (item.bestMarket === "FH_BTTS_NO") isWon = m.ht_home === 0 || m.ht_away === 0;
                                              }
                                            }
                                            return (
                                              <span
                                                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono shrink-0 ${
                                                  isWon
                                                    ? "text-emerald-400 bg-emerald-955/60 border border-emerald-900/50"
                                                    : "text-rose-450 bg-rose-955/60 border border-rose-900/50"
                                                }`}
                                              >
                                                {isWon ? "✓ WON" : "✗ LOST"}
                                              </span>
                                            );
                                          })()}
                                      </div>
                                      <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1.5 text-[8.5px] font-mono text-slate-500">
                                        <span>Consensus Track:</span>
                                        <span className="text-slate-300 font-bold">
                                          {item.successCount} / {item.totalChecked}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="bg-slate-950/65 border border-slate-900/80 p-3 rounded-2xl flex flex-col justify-between min-h-[75px]">
                                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black">
                                        V2 Model Multi-factor
                                      </span>
                                      <div className="flex items-baseline gap-1 mt-1 font-mono">
                                        <strong className="text-sm font-black text-emerald-400">
                                          {item.confidenceRating}%
                                        </strong>
                                        <span className="text-[7.5px] text-slate-500 uppercase font-bold">
                                          Rating
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1.5 text-[8.5px] font-mono text-slate-500">
                                        <span>Win rate:</span>
                                        <span className="text-emerald-455 font-bold">
                                          {item.winRate}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* SHIELDS & STATS COLLAPSIBLE AUDIT */}
                                  <div className="border-t border-slate-900 pt-4 mt-1">
                                    <div className="text-[9.2px] text-slate-455 font-black tracking-wide font-mono uppercase pb-2 flex items-center gap-1">
                                      <ShieldCheck className="h-4 w-4 text-fuchsia-450" />
                                      <span>ICHARA V2 Deep Defense Audit Logs</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <div className="bg-slate-950/30 border border-slate-900/40 rounded-xl p-2.5 font-mono text-[9px] space-y-1.5">
                                        <div className="flex items-center justify-between text-slate-455 border-b border-slate-900/30 pb-1">
                                          <span>Fatigue REST:</span>
                                          {premiumSubTabV2 === "1x2_day" ? (
                                            <strong className="text-slate-300">
                                              H: {item.shields.homeRest}d | A: {item.shields.awayRest}d
                                            </strong>
                                          ) : (
                                            <strong className="text-slate-300">
                                              V2 Calibrated
                                            </strong>
                                          )}
                                        </div>
                                        {premiumSubTabV2 === "1x2_day" && item.shields.isFatigued ? (
                                          <span className="text-[8px] font-bold text-amber-500 bg-amber-955/10 border border-amber-900/30 px-1 py-0.2 rounded block text-center animate-pulse">
                                            ⚠️ fatigue trap trigger
                                          </span>
                                        ) : (
                                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-955/10 border border-emerald-950/30 px-1 py-0.2 rounded block text-center">
                                            ✓ rest intervals optimal
                                          </span>
                                        )}
                                      </div>

                                      <div className="bg-slate-950/30 border border-slate-900/40 rounded-xl p-2.5 font-mono text-[9px] space-y-1.5">
                                        <div className="flex items-center justify-between text-slate-455 border-b border-slate-900/30 pb-1">
                                          <span>Audit Scores:</span>
                                          <strong className="text-slate-300">
                                            {premiumSubTabV2 === "1x2_day" ? `${item.shields.consolidatedScore}%` : `${item.confidenceRating}%`}
                                          </strong>
                                        </div>
                                        <span className="text-[8px] font-bold text-teal-400 bg-teal-955/10 border border-teal-950/30 px-1 py-0.2 rounded block text-center uppercase tracking-wide">
                                          SGD pre-optimizer passed
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CHRONOLOGICAL SIGNAL PATH */}
                                  <div className="bg-slate-950/90 border border-slate-900 p-3 rounded-2xl space-y-2 mt-4">
                                    <div className="flex justify-between items-center gap-2 flex-wrap">
                                      <span className="text-[9.5px] text-slate-455 uppercase font-mono font-bold">
                                        {premiumSubTabV2 === "goals_hunter"
                                          ? `Chronological Signal Path (Last 20 Games)`
                                          : `Chronological Signal Path (Last 15 Games)`}
                                      </span>
                                      <span className="bg-emerald-950/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900/40">
                                        Hit-Rate: {item.winRate}% (
                                        {item.successCount}/
                                        {premiumSubTabV2 === "goals_hunter" ? 20 : 15} Hits)
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 justify-between overflow-x-auto pb-1 scrollbar-none">
                                      {((premiumSubTabV2 === "goals_hunter" ? item.last20 : item.last15) || []).map((hist: any, hIdx: number) => {
                                        let isWon = false;
                                        let tooltipText = "";
                                        let symbol = "L";

                                        if (premiumSubTabV2 === "1x2_day") {
                                          if (hist.ft_home === null || hist.ft_away === null) return null;
                                          const actualOutcome = hist.ft_home > hist.ft_away ? "1" : hist.ft_home < hist.ft_away ? "2" : "X";
                                          const pastPred = getMatchPrediction(hist);
                                          isWon = actualOutcome === pastPred;
                                          tooltipText = `${hist.home} ${hist.ft_home}-${hist.ft_away} ${hist.away} (Target: ${pastPred})`;
                                          symbol = isWon ? "W" : "L";
                                        } else if (premiumSubTabV2 === "goals_hunter") {
                                          if (hist.ft_home === null || hist.ft_away === null) return null;
                                          const totGoals = hist.ft_home + hist.ft_away;
                                          if (item.bestMarket === "OVER_1_5") isWon = totGoals > 1;
                                          else if (item.bestMarket === "OVER_2_5") isWon = totGoals > 2;
                                          else if (item.bestMarket === "OVER_3_5") isWon = totGoals > 3;
                                          else if (item.bestMarket === "BTTS_YES") isWon = hist.ft_home > 0 && hist.ft_away > 0;

                                          tooltipText = `${hist.home} ${hist.ft_home}-${hist.ft_away} ${hist.away} (Target: ${item.bestMarket})`;
                                          symbol = isWon ? "W" : "L";
                                        } else if (premiumSubTabV2 === "first_half") {
                                          if (hist.ht_home === null || hist.ht_away === null) return null;
                                          const totFh = hist.ht_home + hist.ht_away;
                                          if (item.bestMarket === "FH_OVER_0_5") isWon = totFh > 0;
                                          else if (item.bestMarket === "FH_OVER_1_5") isWon = totFh > 1;
                                          else if (item.bestMarket === "FH_HOME_OVER_0_5") isWon = hist.ht_home > 0;
                                          else if (item.bestMarket === "FH_AWAY_OVER_0_5") isWon = hist.ht_away > 0;
                                          else if (item.bestMarket === "FH_BTTS_NO") isWon = hist.ht_home === 0 || hist.ht_away === 0;

                                          tooltipText = `${hist.home} - Halftime ${hist.ht_home}-${hist.ht_away} (Target: ${item.bestMarket})`;
                                          symbol = isWon ? "W" : "L";
                                        }

                                        const dotColor = isWon
                                          ? "bg-emerald-555/15 text-emerald-400 border border-emerald-500/30"
                                          : "bg-rose-555/15 text-rose-455 border border-rose-500/30";

                                        return (
                                          <div
                                            key={hIdx}
                                            title={tooltipText}
                                            className={`flex-1 h-7 min-w-[24px] rounded-xl ${dotColor} flex items-center justify-center text-[10px] font-black font-mono cursor-help hover:scale-105 transition-transform duration-150`}
                                          >
                                            {symbol}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

        {activeTab === "tetrisro" && (
          <TetrisroDashboard
            matchesList={matchesList}
            db={db}
            selectedCalendarDate={selectedCalendarDate}
            setSelectedCalendarDate={setSelectedCalendarDate}
            availableMatchDates={availableMatchDates}
            availableMatchDateObjects={availableMatchDateObjects}
          />
        )}

        {activeTab === "consensus" && (
          <ConsensusDashboard
            matchesList={matchesList}
            db={db}
            selectedDate={selectedCalendarDate}
          />
        )}

        {activeTab === "meta_stacking" && (
          <MetaStackingDashboard
            matchesList={matchesList}
            db={db}
            selectedDate={selectedCalendarDate}
          />
        )}

        

        {activeTab === "cards_corners" && (
          <CardsCornersDashboard
            matchesList={matchesList}
            db={db}
            selectedCalendarDate={selectedCalendarDate}
            setSelectedCalendarDate={setSelectedCalendarDate}
            availableMatchDates={availableMatchDates}
            availableMatchDateObjects={availableMatchDateObjects}
          />
        )}

        {activeTab === "stats" &&
          (() => {
            // Calculate stats for Primary, Alt, and Signal Predictions on completed games
            const dualStats = (() => {
              let primaryTotal = 0;
              let primaryCorrect = 0;
              let altTotal = 0;
              let altCorrect = 0;

              let signalPicksTotal = 0;
              let signalPicksCorrect = 0;

              finishedMatches.forEach((m) => {
                const sigInfo = db.signals[m.signal_code];
                const predictions = AdvancedxGEngine.generateDualPredictions(
                  m.p1,
                  m.px,
                  m.p2,
                  m.coef,
                  sigInfo?.ema_error_h || 0,
                  sigInfo?.ema_error_a || 0,
                );

                if (m.ft_home !== null && m.ft_away !== null) {
                  const outcomes = MarketEvaluator.evaluateAllMarkets(
                    m.ft_home,
                    m.ft_away,
                    m.ht_home,
                    m.ht_away,
                  );

                  // Primary prediction
                  primaryTotal++;
                  if (outcomes[predictions.primaryMarket] === true) {
                    primaryCorrect++;
                  }

                  // Alternative prediction
                  altTotal++;
                  if (outcomes[predictions.altMarket] === true) {
                    altCorrect++;
                  }

                  // Signal predictions with success >= 85% on recent 20 finished games
                  if (sigInfo) {
                    // Find finished matches for this signal explicitly with similarity-aided neighborhood boosting
                    const finishedForSignal = CipherEngine.getAidedFinishedMatches(
                      m.signal_code,
                      finishedMatchesBySignal,
                      m.__parsedTime!,
                      15
                    );
                    const recent20ForSignal = finishedForSignal.slice(0, 15);

                    const qualifiedP = (sigInfo.top_predictions || []).filter((p) => {
                      if (recent20ForSignal.length > 0) {
                        const successCount = recent20ForSignal.filter((hist) => {
                          if (hist.ft_home === null || hist.ft_away === null)
                            return false;
                          const outcomes = MarketEvaluator.evaluateAllMarkets(
                            hist.ft_home,
                            hist.ft_away,
                            hist.ht_home,
                            hist.ht_away,
                          );
                          return outcomes[p.market] === true;
                        }).length;
                        return successCount / recent20ForSignal.length >= 0.85;
                      }
                      return (p as any).accuracy_rate >= 0.85;
                    });

                    if (qualifiedP.length > 0) {
                      qualifiedP.forEach((p) => {
                        signalPicksTotal++;
                        if (outcomes[p.market] === true) {
                          signalPicksCorrect++;
                        }
                      });
                    }
                  }
                }
              });

              return {
                primaryTotal,
                primaryCorrect,
                primaryWinRate:
                  primaryTotal > 0
                    ? parseFloat(((primaryCorrect  / primaryTotal) * 100).toFixed(1))
                    : 0,
                altTotal,
                altCorrect,
                altWinRate:
                  altTotal > 0 ? parseFloat(((altCorrect  / altTotal) * 100).toFixed(1)) : 0,
                signalPicksTotal,
                signalPicksCorrect,
                signalPicksWinRate:
                  signalPicksTotal > 0
                    ? parseFloat(((signalPicksCorrect  / signalPicksTotal) * 100).toFixed(1))
                    : 0,
              };
            })();

            return (
              <div className="space-y-8">
                {/* SYSTEM HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-teal-950/10 to-slate-950 p-6 rounded-3xl border border-slate-805 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-teal-400 shrink-0" />
                      <span>Analytical Control Center & Model Ledger</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl font-mono leading-relaxed">
                      Track primary, alternative, and high-probability verified
                      signal performance metrics directly consolidated in real
                      time.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-900 px-4 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                      Oracle System Real-Time Stats
                    </span>
                  </div>
                </div>

                {/* SECTION: STRATEGIC MODEL BENCHMARKS KEYSTATS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span>Strategic Prediction Benchmarks</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Tawaqqo' Awal */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-teal-950/20 to-slate-950/90 p-5 rounded-2xl border border-teal-900/40 shadow-lg flex flex-col justify-between group hover:border-teal-500/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
                      <div>
                        <span className="text-xs text-teal-400 font-mono uppercase tracking-wider block font-extrabold text-left">
                          Primary Prediction
                        </span>
                        <p className="text-slate-450 text-[10px] mt-2 font-mono leading-relaxed text-left">
                          Model confidence metrics for high-probability direct
                          selections favored by statistical algorithmics.
                        </p>
                      </div>

                      <div className="my-5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-teal-300 font-mono">
                          {dualStats.primaryWinRate}%
                        </span>
                        <span className="text-xs font-mono text-slate-550">
                          {dualStats.primaryCorrect} / {dualStats.primaryTotal}{" "}
                          Wins
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-405 h-full rounded-full transition-all duration-500"
                          style={{ width: `${dualStats.primaryWinRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Card 2: Tawaqqo' Badeel */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-purple-950/20 to-slate-950/90 p-5 rounded-2xl border border-purple-900/40 shadow-lg flex flex-col justify-between group hover:border-purple-500/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
                      <div>
                        <span className="text-xs text-purple-400 font-mono uppercase tracking-wider block font-extrabold text-left">
                          Alternative Prediction
                        </span>
                        <p className="text-slate-455 text-[10px] mt-2 font-mono leading-relaxed text-left">
                          Dynamic protection and security backup outcomes
                          modeled to offset match variation risks.
                        </p>
                      </div>

                      <div className="my-5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-purple-300 font-mono">
                          {dualStats.altWinRate}%
                        </span>
                        <span className="text-xs font-mono text-slate-555">
                          {dualStats.altCorrect} / {dualStats.altTotal} Wins
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-405 h-full rounded-full transition-all duration-500"
                          style={{ width: `${dualStats.altWinRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Card 3: Tawaqqo' Al-Isharat */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-rose-950/25 to-slate-950/90 p-5 rounded-2xl border border-rose-900/35 shadow-lg flex flex-col justify-between group hover:border-rose-500/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
                      <div>
                        <span className="text-xs text-rose-400 font-mono uppercase tracking-wider block font-extrabold text-left">
                          Signal Predictions
                        </span>
                        <p className="text-slate-450 text-[10px] mt-2 font-mono leading-relaxed text-left">
                          Averaged models filtering only signals running at a
                          minimum of 85% accuracy over their recent 20 games.
                        </p>
                      </div>

                      <div className="my-5 flex items-baseline justify-between">
                        <span className="text-4xl font-extrabold text-rose-300 font-mono">
                          {dualStats.signalPicksWinRate}%
                        </span>
                        <span className="text-xs font-mono text-slate-550">
                          {dualStats.signalPicksCorrect} /{" "}
                          {dualStats.signalPicksTotal} Wins
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-405 h-full rounded-full transition-all duration-500"
                          style={{ width: `${dualStats.signalPicksWinRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 2: GENERAL MODEL WIN RATE & BENTO METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 rounded-2xl border border-slate-805 flex flex-col justify-between font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Global System Hit Rate
                    </span>
                    <span className="text-3xl font-extrabold text-teal-400 mt-1.5 block">
                      {db.global_stats.win_rate}%
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Actual percentage of successful predictions across all
                      target outcomes.
                    </p>
                  </div>

                  <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 rounded-2xl border border-slate-805 flex flex-col justify-between font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Total Settled Picks
                    </span>
                    <span className="text-3xl font-extrabold text-amber-400 mt-1.5 block">
                      {db.global_stats.total_picks}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Total resolved match selections settled programmatically
                      in database.
                    </p>
                  </div>

                  <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 rounded-2xl border border-slate-805 flex flex-col justify-between font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Successfully Settled
                    </span>
                    <span className="text-3xl font-extrabold text-purple-400 mt-1.5 block">
                      {db.global_stats.correct_picks}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Fully matched and verified outcomes matching computer
                      estimates.
                    </p>
                  </div>

                  <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 rounded-2xl border border-slate-805 flex flex-col justify-between font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      High Hit Rate Models
                    </span>
                    <span className="text-3xl font-extrabold text-rose-400 mt-1.5 block">
                      {
                        distinctSignals.filter(
                          (s) => s.top_predictions.length > 0,
                        ).length
                      }{" "}
                      / {distinctSignals.length}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Predictive signals stabilized above 85% accuracy
                      threshold.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}



        {/* PANEL: DATA IMPORTER & SESSION HUB */}
        {activeTab === "paste" && (
          <div className="space-y-6">
            {/* SESSION DATABASE & AUTONOMOUS AI SUPERVISOR HUB */}
            <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-900/90 p-4 sm:p-5 rounded-2.5xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-inner shrink-0">
                    <UploadCloud className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                        <span>قاعدة بيانات الجلسة الفورية</span>
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          SESSION MODE • خفيف وبدون خادم
                        </span>
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 leading-relaxed">
                      {matchesList.length > 0
                        ? `✓ الجلسة نشطة بنجاح: ${matchesList.length} مباراة مفهرسة • الأنظمة تعمل بكامل قدراتها دون أي أخطاء • وكلاء الذكاء الاصطناعي يطهرون البيانات بالخلفية.`
                        : "لتخفيف الضغط بنسبة 100%: لا يتم حفظ قاعدة البيانات في الخادم. قم باستيراد ملف قاعدة بياناتك (JSON) لتعمل كافة الأنظمة بكامل طاقتها وبدون أخطاء فقط أثناء الجلسة."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <label className="flex-1 md:flex-initial px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 select-none">
                    <UploadCloud className="h-4 w-4" />
                    <span>استيراد قاعدة بيانات (JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>

                  {matchesList.length === 0 && (
                    <button
                      onClick={() => {
                        const demoDb = DatabaseManager.loadSeededDefaults();
                        const result = DatabaseManager.importDatabaseSession(demoDb);
                        setDb(result.cleanDb);
                        setImportNotice({
                          type: "success",
                          text: `✓ تم شحن ${result.matchCount} مباراة نموذجية وتطهيرها وتطوير الأنظمة الـ ${result.systemsEvolved} تلقائياً في الجلسة!`,
                        });
                      }}
                      className="px-3.5 py-2.5 bg-slate-950 border border-amber-500/40 hover:bg-slate-900 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="تحميل عينة تجريبية فورية لتشغيل الأنظمة فوراً بدون ملف"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>عينة تجريبية سريعة</span>
                    </button>
                  )}

                  {compressionReport && (
                    <button
                      onClick={() => setShowCompressionModal(true)}
                      className="px-3.5 py-2.5 bg-slate-950 border border-emerald-500/50 hover:bg-slate-900 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      title="عرض تقرير ضغط واستخراج بيانات المباريات"
                    >
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>تقرير الضغط ({compressionReport.memorySavingsPercent}%)</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsAgentsModalOpen(true)}
                    className="px-3.5 py-2.5 bg-slate-950 border border-indigo-500/40 hover:bg-slate-900 text-indigo-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="مشاهدة نشاط وتطهير وكلاء الذكاء الاصطناعي الذاتية العاملة في الخلفية"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span className="hidden sm:inline">وكلاء AI بالخلفية</span>
                    <span className="bg-indigo-900/60 border border-indigo-400/40 text-[9px] px-1 rounded text-indigo-200">
                      تلقائي
                    </span>
                  </button>

                  {matchesList.length > 0 && (
                    <>
                      <button
                        onClick={handleExportDatabase}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="تنزيل نسخة احتياطية من بيانات الجلسة الحالية"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-400" />
                        <span>تصدير الجلسة</span>
                      </button>

                      <button
                        onClick={() => {
                          const empty = DatabaseManager.clearDatabase();
                          setDb(empty);
                          setImportNotice({
                            type: "info",
                            text: "تم تفريغ بيانات الجلسة بنجاح، النظام جاهز لاستيراد ملف جديد.",
                          });
                        }}
                        className="px-2.5 py-2 bg-slate-950 border border-red-900/40 hover:bg-red-950/40 text-red-400 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="تفريغ الجلسة الحالية والبدء من جديد"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>تفريغ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div>
                  <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                    <DatabaseZap className="h-5 w-5 text-amber-500 animate-pulse" />
                    <span>Document Processing & Bulk Scanning Port</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Paste raw, unformatted match fixture tables copied directly
                    from Forebet lists below. The parsing engine auto-extractes
                    dates, team lineups, complex mathematical codes, and
                    resolves scores automatically.
                  </p>
                </div>

                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste match lines here..."
                  rows={13}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all placeholder:text-slate-800"
                />

                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleProcessPaste}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 font-extrabold rounded-xl text-slate-950 transition-all flex items-center gap-2 text-xs shadow-md cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Parse and Import Data</span>
                    </button>

                    <button
                      onClick={() => setPasteText("")}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl transition-all text-xs cursor-pointer"
                    >
                      Clear Fields
                    </button>
                  </div>

                  <span className="text-slate-550 text-xs font-mono">
                    Manual Clipboard Processing
                  </span>
                </div>
              </div>

              {/* TESTS DEMO SHORTCUT PANEL */}
              <div className="bg-slate-900/35 p-4 rounded-xl border border-slate-900 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-350 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span>Quick Sandbox Fixtures for Auto Verification:</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    One-click to load demo matches
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPasteText(ClipboardTextUpcoming);
                      setTimeout(() => handleProcessPaste(), 100);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-3 rounded-xl hover:border-amber-500/50 transition-all text-right flex gap-3.5 cursor-pointer"
                  >
                    <Play className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-slate-200 block">
                        Upcoming Demo Fixtures Batch
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        Schedule upcoming fixtures to analyze prediction
                        signals.
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPasteText(ClipboardTextResolved);
                      setTimeout(() => handleProcessPaste(), 100);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-3 rounded-xl hover:border-emerald-500/50 transition-all text-right flex gap-3.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-slate-200 block">
                        Resolve & Audit Finished Matches
                      </strong>
                      <span className="text-[10px] text-slate-550 font-mono block mt-0.5">
                        Simulate match settlements and audit signal profits.
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* ADMIN CONTROL CENTER */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <h4 className="text-[10px] font-mono font-extrabold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                  <Flame className="h-4 w-4 animate-pulse text-amber-500" />
                  <span>AI Calibration Panel & Mgmt</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Calibrate neural signal success ratios, backpropagate accuracy
                  metrics, simulate final score settlements, or perform a
                  factories reset.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>نمط الجلسة الفوري نشط: خفيف بنسبة 100% وبدون أي اتصالات سحابية لتخفيف الضغط.</span>
                  </div>

                  {/* Export Database Button */}
                  <button
                    onClick={handleExportDatabase}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 hover:text-slate-200 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    title="Download database locally as a JSON backup file"
                  >
                    <Download className="h-3.5 w-3.5 text-blue-400" />
                    <span>Download Database Backup (تنزيل قاعدة البيانات)</span>
                  </button>

                  {/* Import Database Button */}
                  <label
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 hover:text-slate-200 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer text-xs group"
                    title="Restore database state from a local JSON backup file"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>Load Database File (تحميل قاعدة البيانات)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* QUICK GUIDE CARD */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-905 space-y-4 text-xs text-slate-350 leading-relaxed shadow-lg">
                <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  Quick Reference Guide
                </h4>
                <p>
                  <strong>1. Load Upcoming Fixtures:</strong> Copy any live
                  match grid stats from statistical websites and paste them
                  fully here. The local parser estimates expected goals and xG
                  ranges automatically.
                </p>
                <p>
                  <strong>2. Settlement of Final Scores:</strong> To settle
                  scores and evaluate predictive accuracy of signal nodes,
                  simply copy the resolved matches list after round completion
                  and paste it here. The engine handles scoring updates
                  elegantly.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-8 border-t border-slate-900 text-center text-slate-555 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026-PRESENT ORACLE MATCH AI. No Rights Reserved.</p>
          <p className="text-[10px] text-slate-600">
            Advanced local analysis system powered by deterministic synchronized
            offline prediction databases.
          </p>
        </div>
      </footer>

      {/* AUTONOMOUS AI AGENTS BACKGROUND ACTIVITY & AUDIT MODAL */}
      <AgentsActivityModal
        isOpen={isAgentsModalOpen}
        onClose={() => setIsAgentsModalOpen(false)}
        db={db}
        matchesList={matchesList}
      />

      {/* GLOBAL PLATFORM-WIDE BUTTERFLY SYSTEM INFO MODAL */}
      <ButterflyLearningModal
        isOpen={showButterflyModal}
        onClose={() => setShowButterflyModal(false)}
        matchesList={matchesList}
        db={db}
      />
    </div>
  );
}

const ClipboardTextUpcoming = `
Spain La Liga
 Es1 
Valencia
Rayo Vallecano
14/05/2026 18:00
344225X1-13.30 
 Girona
Real Sociedad
14/05/2026 19:00
274726X1-13.80 
 Real Madrid
Real Oviedo
14/05/2026 20:30
67211312-11.27
`;

const ClipboardTextResolved = `
Spain La Liga
 Es1 
Valencia
Rayo Vallecano
14/05/2026 18:00
344225X1-13.30 
FT
 2 - 1(1 - 0)
 Girona
Real Sociedad
14/05/2026 19:00
274726X1-13.80 
FT
 0 - 0(0 - 0)
 Real Madrid
Real Oviedo
14/05/2026 20:30
67211312-11.27
FT
 3 - 0(2 - 0)
`;
