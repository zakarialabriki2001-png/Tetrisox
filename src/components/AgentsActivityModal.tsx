import React, { useState } from "react";
import {
  X,
  Bot,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  Wrench,
  Sparkles,
  Sliders,
} from "lucide-react";
import {
  AgentOrchestrator,
  DataSentinelAgent,
  SystemUpgradeAgent,
} from "../lib/autonomousAgents";
import { OracleDatabase, Match } from "../types";

interface AgentsActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: OracleDatabase;
  matchesList: Match[];
}

export const AgentsActivityModal: React.FC<AgentsActivityModalProps> = ({
  isOpen,
  onClose,
  db,
  matchesList,
}) => {
  const [filter, setFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  const logs = AgentOrchestrator.getLogs();
  const filteredLogs = filter === "ALL" ? logs : logs.filter((l) => l.agentName === filter);

  const audit = DataSentinelAgent.auditDatabase(db);
  const evo = SystemUpgradeAgent.evolveSystems(matchesList);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border-2 border-indigo-500/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-400 rounded-xl text-indigo-300">
              <Bot className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">
                  لوحة تحكم ونشاط وكلاء الذكاء الاصطناعي الذاتية
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  تعمل 100% تلقائياً في الخلفية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                صيانة مستمرة لقاعدة البيانات • ترقية ومعايرة حية للأنظمة • استخراج سمات الأرشيف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Vital Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-slate-800/80 bg-slate-950/30">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono text-slate-400">صحة بيانات الجلسة</div>
            <div className="text-lg font-black font-mono text-emerald-400 mt-1">
              {audit.healthPercentage}%
            </div>
            <div className="text-[9.5px] text-slate-400">
              {audit.healthyMatchesCount} / {audit.totalMatchesAudited} سليم
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono text-slate-400">الأخطاء المعالجة تلقائياً</div>
            <div className="text-lg font-black font-mono text-amber-400 mt-1">
              {audit.totalFaults === 0 ? "0 (نظيفة)" : audit.totalFaults}
            </div>
            <div className="text-[9.5px] text-slate-400">تطهير فوري مستمر</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono text-slate-400">مؤشر تطور الأنظمة (Evolution)</div>
            <div className="text-lg font-black font-mono text-indigo-300 mt-1">
              {evo.evolutionScore}%
            </div>
            <div className="text-[9.5px] text-emerald-400 font-bold">8 أنظمة معايرة</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono text-slate-400">وضع قاعدة البيانات</div>
            <div className="text-xs font-black font-mono text-cyan-300 mt-1">
              In-Memory Session
            </div>
            <div className="text-[9.5px] text-slate-400">بدون ضغط سيرفر أو كوتا</div>
          </div>
        </div>

        {/* Logs Controls */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            <span>سجل الأوامر والعمليات المنفذة ذاتياً في الخلفية:</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">تصفية:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">كافة الوكلاء</option>
              <option value="Sentinel">Sentinel (التطهير)</option>
              <option value="Evolver">Evolver (الترقية)</option>
              <option value="Orchestrator">Orchestrator (المنسق)</option>
            </select>
          </div>
        </div>

        {/* Live Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs divide-y divide-slate-800/40">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              الوكلاء تعمل بصمت في الخلفية. ستظهر السجلات تلقائياً عند استيراد المباريات أو معالجة البيانات.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-2 first:pt-0">
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
                <div className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                  {log.detailsAr}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>نظام الجلسة الخفيف: يتم حفظ ومعالجة البيانات في الذاكرة الحية للجلسة الحالية لتفادي أي ضغط.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
