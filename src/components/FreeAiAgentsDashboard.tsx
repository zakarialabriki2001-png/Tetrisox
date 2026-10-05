import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Zap,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Terminal,
  Activity,
  Layers,
  Search,
  Filter,
  Check,
  Database,
  ArrowRight,
  TrendingUp,
  Award,
  Flame,
  Info,
  ChevronRight,
  ChevronDown,
  Wrench,
  Bot,
  BrainCircuit,
  Lock,
} from "lucide-react";
import { Match, OracleDatabase } from "../types";
import {
  DataSentinelAgent,
  SystemUpgradeAgent,
  OfflineTraitAgent,
  AgentOrchestrator,
  FaultAuditResult,
  FaultHealingReport,
  SystemEvolutionReport,
  MatchTraitProfile,
  AgentActionLog,
  OFFLINE_TRAIT_REGISTRY,
  DatabaseFault,
  OfflineTraitType,
} from "../lib/autonomousAgents";
import { DEFAULT_SYSTEM_WEIGHTS, SystemIdentifier } from "../lib/metaAuditEngine";

interface FreeAiAgentsDashboardProps {
  db: OracleDatabase;
  onUpdateDb: (updatedDb: OracleDatabase) => void;
  matchesList: Match[];
  onSelectMatchToInspect?: (match: Match) => void;
}

export const FreeAiAgentsDashboard: React.FC<FreeAiAgentsDashboardProps> = ({
  db,
  onUpdateDb,
  matchesList,
}) => {
  // Sub-tab navigation
  const [subTab, setSubTab] = useState<"sentinel" | "evolver" | "trait_matcher" | "logs">("sentinel");

  // Auto-pilot background execution toggle
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(true);
  const [isExecutingCycle, setIsExecutingCycle] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  // Agent State
  const [auditResult, setAuditResult] = useState<FaultAuditResult>(() =>
    DataSentinelAgent.auditDatabase(db)
  );
  const [lastHealingReport, setLastHealingReport] = useState<FaultHealingReport | null>(null);

  const [evolutionReport, setEvolutionReport] = useState<SystemEvolutionReport>(() =>
    SystemUpgradeAgent.evolveSystems(matchesList, DEFAULT_SYSTEM_WEIGHTS)
  );

  // Trait Matcher match selection
  const [selectedMatchId, setSelectedMatchId] = useState<string>(() => {
    if (matchesList.length > 0) {
      // Pick first upcoming match or first finished match
      const up = matchesList.find((m) => m.status === "UPCOMING");
      return up ? up.match_id : matchesList[0].match_id;
    }
    return "";
  });

  const [traitSearchQuery, setTraitSearchQuery] = useState<string>("");
  const [logsFilter, setLogsFilter] = useState<string>("ALL");

  // Keep audit in sync when db changes
  useEffect(() => {
    const audit = DataSentinelAgent.auditDatabase(db);
    setAuditResult(audit);
  }, [db]);

  // Keep evolution in sync when matchesList changes
  useEffect(() => {
    const evo = SystemUpgradeAgent.evolveSystems(matchesList, evolutionReport.optimizedWeights);
    setEvolutionReport(evo);
  }, [matchesList.length]);

  // Auto-Pilot periodic pulse (every 45s when tab is active or in background)
  useEffect(() => {
    if (!autoPilotActive) return;

    const interval = setInterval(() => {
      // Run automatic background scan and heal if faults are detected
      const currentAudit = DataSentinelAgent.auditDatabase(db);
      if (currentAudit.totalFaults > 0) {
        const { updatedMatches, report } = DataSentinelAgent.autoCorrectDatabase(db);
        if (report.healedFaultsCount > 0) {
          const updatedDb = { ...db, matches: updatedMatches };
          onUpdateDb(updatedDb);
          setLastHealingReport(report);
          AgentOrchestrator.addLog(
            "Sentinel",
            "FAULT_FIX",
            `[الطيار الآلي] تطهير تلقائي لـ ${report.healedFaultsCount} أخطاء مستجدة`,
            `تم تصحيح وتحديث السجلات في الخلفية للحفاظ على كفاءة قاعدة البيانات بنسبة 100%.`,
            "SUCCESS"
          );
        }
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [autoPilotActive, db, onUpdateDb]);

  // Handle Full Manual Cycle execution
  const handleRunFullCycle = () => {
    setIsExecutingCycle(true);
    setExecutionMessage("جاري تشغيل الوكلاء المستقلة لمسح وتطهير وترقية النظام...");

    setTimeout(() => {
      const result = AgentOrchestrator.runFullAutonomousCycle(db, (updated) => {
        onUpdateDb(updated);
      });

      setAuditResult(result.faultReport);
      setLastHealingReport(result.healingReport);
      setEvolutionReport(result.evolutionReport);
      setIsExecutingCycle(false);
      setExecutionMessage("اكتملت دورة الترقية الذاتية وتطهير البيانات بنجاح!");

      setTimeout(() => setExecutionMessage(null), 4000);
    }, 600);
  };

  // Handle Healing Faults Only
  const handleHealFaults = () => {
    setIsExecutingCycle(true);
    setTimeout(() => {
      const { updatedMatches, report } = DataSentinelAgent.autoCorrectDatabase(db);
      const updatedDb: OracleDatabase = {
        ...db,
        matches: updatedMatches,
        system_telemetry: {
          last_sync: new Date().toISOString(),
          payload_size_bytes: JSON.stringify(updatedMatches).length,
          total_matches: Object.keys(updatedMatches).length,
          total_signals: Object.keys(db.signals || {}).length,
          total_slips: db.archived_slips?.length || 0,
          sync_type: "LOCAL_STORE",
          healed_records_detected: true,
          active_strategy: db.active_strategy || "BALANCED",
          operations_count: (db.system_telemetry?.operations_count || 0) + 1,
        },
      };

      onUpdateDb(updatedDb);
      setLastHealingReport(report);
      setAuditResult(DataSentinelAgent.auditDatabase(updatedDb));
      setIsExecutingCycle(false);

      AgentOrchestrator.addLog(
        "Sentinel",
        "FAULT_FIX",
        `تم تطهير ${report.healedFaultsCount} خطأ يدوياً بنجاح`,
        `تم حفظ وإعادة فهرسة قاعدة البيانات المنقحة في التخزين الدائم.`,
        "SUCCESS"
      );
    }, 400);
  };

  // Trait profile for selected match
  const selectedMatch = useMemo(() => {
    return matchesList.find((m) => m.match_id === selectedMatchId) || matchesList[0] || null;
  }, [matchesList, selectedMatchId]);

  const selectedMatchTraitProfile: MatchTraitProfile | null = useMemo(() => {
    if (!selectedMatch) return null;
    return OfflineTraitAgent.extractMatchTraits(selectedMatch, matchesList);
  }, [selectedMatch, matchesList]);

  // Filtered matches for trait selector
  const filteredMatchesForTrait = useMemo(() => {
    if (!traitSearchQuery.trim()) return matchesList.slice(0, 40);
    const q = traitSearchQuery.toLowerCase();
    return matchesList
      .filter(
        (m) =>
          m.home.toLowerCase().includes(q) ||
          m.away.toLowerCase().includes(q) ||
          m.league_name.toLowerCase().includes(q) ||
          m.signal_code.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [matchesList, traitSearchQuery]);

  // Action logs
  const logs = useMemo(() => {
    const all = AgentOrchestrator.getLogs();
    if (logsFilter === "ALL") return all;
    return all.filter((l) => l.agentName === logsFilter);
  }, [logsFilter, isExecutingCycle]);

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. AGENTS CONTROL COMMAND HEADER                              */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border-2 border-indigo-500/40 p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Glowing Ambient Accents */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative p-3.5 bg-indigo-950/80 border-2 border-indigo-400 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
              <Bot className="h-7 w-7 text-indigo-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-200 bg-clip-text text-transparent">
                    وكلاء الذكاء الاصطناعي المجانية
                  </span>
                  <span className="text-xs font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    FREE OFFLINE AI
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                أنظمة ذكاء ذاتية ومستقلة تعمل <strong className="text-amber-300 font-bold">100% دون إنترنت</strong> وبدون أي اشتراكات أو تكاليف. تتولى تطهير ومعالجة أخطاء قاعدة البيانات تلقائياً، وترقية أوزان وتناغم المنظومة، واستخراج سمات المطابقة التكتيكية من صميم أرشيفك المرفوع.
              </p>
            </div>
          </div>

          {/* Quick Actions & Auto-Pilot Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Pilot Toggle */}
            <button
              onClick={() => {
                const next = !autoPilotActive;
                setAutoPilotActive(next);
                AgentOrchestrator.addLog(
                  "Orchestrator",
                  "AUTONOMOUS_CYCLE",
                  next ? "تفعيل وضع الطيار الآلي المستقل" : "إيقاف وضع الطيار الآلي المستقل",
                  next
                    ? "يقوم النظام الآن بمراقبة قاعدة البيانات وتطهير الأخطاء وترقية الأوزان دورياً في الخلفية."
                    : "تم تحويل التحكم إلى النمط اليدوي.",
                  next ? "SUCCESS" : "INFO"
                );
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-md ${
                autoPilotActive
                  ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  autoPilotActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                }`}
              />
              <span>الطيار الآلي الذاتي: {autoPilotActive ? "مفعّل نشط" : "معطل"}</span>
            </button>

            {/* Run Full Cycle Button */}
            <button
              onClick={handleRunFullCycle}
              disabled={isExecutingCycle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm border-2 border-indigo-400/80 shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`h-4 w-4 ${isExecutingCycle ? "animate-spin" : ""}`} />
              <span>{isExecutingCycle ? "جاري التشغيل..." : "تشغيل كافة الوكلاء وترقية المنظومة"}</span>
            </button>
          </div>
        </div>

        {/* Global Pulse Status Banner */}
        {executionMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{executionMessage}</span>
          </div>
        )}

        {/* System Vital Counters Strip */}
        <div className="mt-6 pt-5 border-t border-indigo-900/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400">صحة قاعدة البيانات</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-lg sm:text-xl font-black font-mono ${
                  auditResult.healthPercentage >= 95
                    ? "text-emerald-400"
                    : auditResult.healthPercentage >= 80
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {auditResult.healthPercentage}%
              </span>
              <span className="text-[10px] text-slate-400">
                ({auditResult.healthyMatchesCount} / {auditResult.totalMatchesAudited} سليم)
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400">الأخطاء المكتشفة</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-lg sm:text-xl font-black font-mono ${
                  auditResult.totalFaults === 0 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {auditResult.totalFaults}
              </span>
              <span className="text-[10px] text-slate-400">
                {auditResult.totalFaults === 0 ? "نظيفة تماماً" : "جاهزة للتطهير الفوري"}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400">مؤشر تطور الأنظمة (Evolution)</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-lg sm:text-xl font-black font-mono text-indigo-300">
                {evolutionReport.evolutionScore}%
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">معاير 8 أنظمة</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] font-mono text-slate-400">السمات المستخرجة أوفلاين</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
                {Object.keys(OFFLINE_TRAIT_REGISTRY).length} أنماط
              </span>
              <span className="text-[10px] text-slate-400">تطابق منسوخ 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-TAB NAVIGATION STATIONS                                 */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/60 rounded-xl border border-slate-800 select-none">
        <button
          onClick={() => setSubTab("sentinel")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            subTab === "sentinel"
              ? "bg-slate-950 text-emerald-400 border border-emerald-500/50 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Wrench className="h-4 w-4 text-emerald-400" />
          <span>وكيل إصلاح الأخطاء والتطهير (Sentinel)</span>
          {auditResult.totalFaults > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {auditResult.totalFaults}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab("evolver")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            subTab === "evolver"
              ? "bg-slate-950 text-indigo-300 border border-indigo-500/50 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Cpu className="h-4 w-4 text-indigo-400" />
          <span>وكيل ترقية وتطوير الأنظمة (Evolver)</span>
          <span className="bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
            {evolutionReport.evolutionScore}%
          </span>
        </button>

        <button
          onClick={() => setSubTab("trait_matcher")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            subTab === "trait_matcher"
              ? "bg-slate-950 text-amber-300 border border-amber-500/50 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Layers className="h-4 w-4 text-amber-400" />
          <span>سمات الأرشيف ومطابقة التوائم (Trait Matcher)</span>
          <span className="bg-amber-900/40 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
            OFFLINE
          </span>
        </button>

        <button
          onClick={() => setSubTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            subTab === "logs"
              ? "bg-slate-950 text-purple-300 border border-purple-500/50 shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Terminal className="h-4 w-4 text-purple-400" />
          <span>سجل نشاط الوكلاء المستقلة (Logs)</span>
          <span className="bg-slate-800 text-slate-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
            {logs.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. SUB-TAB 1: SENTINEL & AUTO-FAULT CORRECTOR                  */}
      {/* ============================================================== */}
      {subTab === "sentinel" && (
        <div className="space-y-5">
          {/* Status Alert Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              auditResult.totalFaults === 0
                ? "bg-emerald-950/40 border-emerald-500/40"
                : "bg-amber-950/40 border-amber-500/50"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  auditResult.totalFaults === 0
                    ? "bg-emerald-900/50 border-emerald-500 text-emerald-400"
                    : "bg-amber-900/50 border-amber-500 text-amber-400"
                }`}
              >
                {auditResult.totalFaults === 0 ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <span>
                    {auditResult.totalFaults === 0
                      ? "قاعدة البيانات سليمة ومحصنة بنسبة 100%"
                      : `تم رصد ${auditResult.totalFaults} خلل أو تعارض في ${auditResult.faultyMatchesCount} سجل`}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {auditResult.totalFaults === 0
                    ? "قام وكيل الحراسة (Sentinel) بفحص كافة المباريات المسجلة والتأكد من انعدام التناقض بين الشوطين، وسلامة الشفرات والإشارات، وصحة الأهداف والاحتمالات."
                    : "الوكيل مستعد لتطهير وتصحيح كافة التناقضات رياضياً وتثبيت النتائج المعيوبة تلقائياً بضغطة زر واحدة."}
                </p>
              </div>
            </div>

            {auditResult.totalFaults > 0 && (
              <button
                onClick={handleHealFaults}
                disabled={isExecutingCycle}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm border-2 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                إصلاح وتطهير كافة الأخطاء فوراً
              </button>
            )}
          </div>

          {/* Fault Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-400">تناقض الشوط الأول (HT &gt; FT)</div>
              <div className="text-lg font-mono font-black text-rose-400 mt-1">
                {auditResult.faultsByCategory.IMPOSSIBLE_HALFTIME_SCORE}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">تصحيح تلقائي لمعادلة النتيجة</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-400">شفرات إشارة مفقودة (Ciphers)</div>
              <div className="text-lg font-mono font-black text-amber-400 mt-1">
                {auditResult.faultsByCategory.MISSING_CIPHER_OR_SIGNAL}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">إعادة توليد عبر محرك التشفير</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-400">عدم تطابق الحالة (Status)</div>
              <div className="text-lg font-mono font-black text-sky-400 mt-1">
                {auditResult.faultsByCategory.STATUS_MISMATCH}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">مزامنة UPCOMING و FINISHED</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-400">خلل التوقيت والأرقام (Timestamps)</div>
              <div className="text-lg font-mono font-black text-purple-400 mt-1">
                {auditResult.faultsByCategory.BROKEN_TIMESTAMP +
                  auditResult.faultsByCategory.INVALID_OR_MISSING_ODDS +
                  auditResult.faultsByCategory.CORRUPT_XG}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">معايرة الفهرسة والانطلاق</div>
            </div>
          </div>

          {/* Detailed Faults Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>قائمة السجلات والخلل المرصود ({auditResult.faultsList.length})</span>
              </h4>
              <span className="text-xs text-slate-400">
                يتم فحص وتطهير كافة السجلات بدون تدخل بشري في وضع الطيار الآلي
              </span>
            </div>

            {auditResult.faultsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <div className="text-base font-bold text-slate-200">لا توجد أي أخطاء أو تعارضات!</div>
                <div className="text-xs text-slate-400 mt-1">
                  كافة مباريات قاعدة البيانات المرفوعة مطابقة تماماً للمحددات الرياضية والتكتيكية.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
                {auditResult.faultsList.map((fault) => (
                  <div key={fault.id} className="p-4 hover:bg-slate-850/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                            fault.severity === "CRITICAL"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : fault.severity === "WARNING"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-blue-950 text-blue-300 border border-blue-800"
                          }`}
                        >
                          {fault.severity}
                        </span>
                        <strong className="text-xs sm:text-sm text-slate-100">{fault.matchTitle}</strong>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {fault.detectedValue}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-300">{fault.descriptionAr}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <Wrench className="h-3 w-3" />
                      <span>الحل المطبق بواسطة الوكيل: {fault.suggestedFix}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Healing Report if available */}
          {lastHealingReport && (
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>
                  تقرير التطهير الأخير: تم تصحيح {lastHealingReport.healedFaultsCount} خطأ في{" "}
                  {lastHealingReport.repairedMatchesCount} مباراة بنجاح.
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 max-h-32 overflow-y-auto space-y-1">
                {lastHealingReport.logs.slice(0, 10).map((l, i) => (
                  <div key={i}>• {l}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUB-TAB 2: EVOLVER & SYSTEM UPGRADE                         */}
      {/* ============================================================== */}
      {subTab === "evolver" && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border-2 border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
                <span>الترقية التلقائية والمعايرة الديناميكية لأنظمة التوقع</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                يقوم وكيل الترقية (Evolver) بحساب الدقة التاريخية ومؤشر Brier لكافة الأنظمة، وضبط أوزان الخوارزميات ديناميكياً لرفع نسبة إصابة الأهداف والفرص المزدوجة.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg font-bold">
                مؤشر التطور: {evolutionReport.evolutionScore}%
              </span>
            </div>
          </div>

          {/* Subsystems Upgrade Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(evolutionReport.systemsMetrics).map((m) => (
              <div
                key={m.systemId}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-100">{m.systemNameAr}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      m.status === "UPGRADED"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">نسبة الإصابة التاريخية:</span>
                    <strong className="text-emerald-400 font-mono">{m.winRate}%</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">الوزن الحالي:</span>
                    <span className="text-slate-300 font-mono">{m.currentWeight}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">الوزن المعاير (ترقية):</span>
                    <strong className="text-indigo-400 font-mono">{m.recommendedWeight}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">حجم العينة الأرشيفية:</span>
                    <span className="text-slate-400 font-mono">{m.sampleSize} مباراة</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-tight">
                  {m.upgradeActionAr}
                </div>
              </div>
            ))}
          </div>

          {/* Calibration Modifiers Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-400" />
              <span>محددات المعايرة التلقائية للأسواق (Calibration Modifiers)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(evolutionReport.recommendedCalibrationModifiers).map(
                ([key, val]) => (
                  <div key={key} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">{key}</div>
                    <div
                      className={`text-lg font-mono font-black mt-1 ${
                        val > 0
                          ? "text-emerald-400"
                          : val < 0
                          ? "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {val > 0 ? `+${val}%` : `${val}%`}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">إزاحة تصحيحية</div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Key Directives */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>التوجيهات التلقائية المستنتجة من الأرشيف:</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              {evolutionReport.keyDirectives.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUB-TAB 3: OFFLINE TRAITS & DATABASE TWIN MATCHER          */}
      {/* ============================================================== */}
      {subTab === "trait_matcher" && (
        <div className="space-y-5">
          {/* Header Explanation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <span>سمات المطابقة للأرشيف التكتيكي (100% مباريات قاعدة البيانات)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                يستخرج هذا الوكيل السمات التكتيكية فقط وحصرياً من <strong className="text-amber-300">مباريات قاعدة البيانات المرفوعة</strong>، ثم يطابق أي مباراة مع توائمها التاريخية المطابقة كربونياً لمعرفة النتائج والأسواق الفعلية التي تحققت تاريخياً.
              </p>
            </div>
            <div className="text-xs font-mono bg-amber-900/60 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-bold shrink-0">
              {matchesList.length} مباراة مفهرسة
            </div>
          </div>

          {/* Match Picker Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-amber-400" />
                <span>اختر مباراة لفحص سماتها التكتيكية والتوائم التاريخية في الأرشيف:</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن فريق، دوري، أو شفرة..."
                  value={traitSearchQuery}
                  onChange={(e) => setTraitSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Quick Match Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredMatchesForTrait.map((m) => (
                <button
                  key={m.match_id}
                  onClick={() => setSelectedMatchId(m.match_id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    selectedMatchId === m.match_id
                      ? "bg-amber-950 text-amber-300 border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate max-w-[150px] inline-block">
                    {m.home} vs {m.away}
                  </span>
                  <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                    ({m.signal_code})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trait Profile Card for Selected Match */}
          {selectedMatch && selectedMatchTraitProfile && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
              {/* Target Match Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <span>{selectedMatch.league_name}</span>
                    <span>•</span>
                    <span>{selectedMatch.kickoff}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{selectedMatch.signal_code}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-100 mt-1">
                    {selectedMatch.home} <span className="text-slate-400 font-light">vs</span>{" "}
                    {selectedMatch.away}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">الإجماع التجريبي للتوائم</div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {selectedMatchTraitProfile.empiricalConsensusMarket}
                    </div>
                  </div>
                  <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-sm font-black px-3 py-1.5 rounded-xl">
                    {selectedMatchTraitProfile.empiricalConfidence}% ثقة
                  </div>
                </div>
              </div>

              {/* Extracted Traits Pills */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>
                    السمات التكتيكية المستخلصة من الأرشيف ({selectedMatchTraitProfile.activeTraits.length})
                  </span>
                </h4>

                {selectedMatchTraitProfile.activeTraits.length === 0 ? (
                  <div className="p-4 bg-slate-950/50 rounded-xl text-xs text-slate-400 text-center">
                    لا تزال عينة هذه المباراة أولية، لم تتطابق مع سمة حصرية بعد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedMatchTraitProfile.activeTraits.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border ${t.trait.badgeColor} space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black flex items-center gap-1.5">
                            <span>{t.trait.icon}</span>
                            <span>{t.trait.nameAr}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/60">
                            {t.confidenceScore}% دقة
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 leading-tight">
                          {t.evidenceAr}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historical Twins Table from Uploaded Database */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
                    <Database className="h-4 w-4 text-teal-400" />
                    <span>أقرب التوائم التاريخية منسوخة من قاعدة بياناتك (Nearest Match Twins):</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    مقارنة عبر مسافات بوازون وxG وشفرة الإشارة
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
                  {selectedMatchTraitProfile.historicalTwins.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      لا توجد مباريات منتهية كافية بعد في الأرشيف للمقارنة.
                    </div>
                  ) : (
                    selectedMatchTraitProfile.historicalTwins.map((twin, i) => (
                      <div
                        key={i}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-100">
                              {twin.match.home} vs {twin.match.away}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({twin.match.league_name} • {twin.match.kickoff})
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                            {twin.winningMarkets.map((mkt, mi) => (
                              <span
                                key={mi}
                                className="text-[9.5px] bg-slate-900 text-teal-300 border border-teal-800/40 px-1.5 py-0.2 rounded"
                              >
                                ✓ {mkt}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center">
                            <div className="text-[9px] font-mono text-slate-400">نتيجة المباراة</div>
                            <div className="text-sm font-mono font-black text-amber-300">
                              {twin.scoreResult}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              شوط: {twin.htScoreResult}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-[9px] font-mono text-slate-400">نسبة التطابق</div>
                            <div className="text-sm font-mono font-black text-indigo-400">
                              {twin.similarityScore}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUB-TAB 4: AGENT ACTION LOGS & TERMINAL                     */}
      {/* ============================================================== */}
      {subTab === "logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-100">سجل نشاط وأوامر الوكلاء الذاتية</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">تصفية حسب الوكيل:</span>
              <select
                value={logsFilter}
                onChange={(e) => setLogsFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">كافة الوكلاء</option>
                <option value="Sentinel">Sentinel (التطهير)</option>
                <option value="Evolver">Evolver (الترقية)</option>
                <option value="TraitMiner">TraitMiner (السمات)</option>
                <option value="Orchestrator">Orchestrator (المنسق)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="text-center text-slate-400 py-12">لا توجد سجلات بعد. قم بتشغيل دورة الوكلاء للبدء.</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">[{log.timestamp}]</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.agentName === "Sentinel"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : log.agentName === "Evolver"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                            : log.agentName === "TraitMiner"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-purple-950 text-purple-300 border border-purple-800"
                        }`}
                      >
                        {log.agentNameAr}
                      </span>
                      <strong className="text-slate-100">{log.titleAr}</strong>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        log.level === "SUCCESS"
                          ? "text-emerald-400 bg-emerald-950"
                          : log.level === "WARNING"
                          ? "text-amber-400 bg-amber-950"
                          : "text-blue-400 bg-blue-950"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="mt-1 text-slate-300 text-[11.5px] leading-relaxed">
                    {log.detailsAr}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
