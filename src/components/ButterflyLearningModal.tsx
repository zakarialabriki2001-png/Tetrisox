import React, { useState } from 'react';
import {
  X,
  Workflow,
  Activity,
  Crosshair,
  ArrowRight,
  SlidersHorizontal,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Cpu,
  Share2,
  GitMerge,
  Layers,
  CheckCircle2,
  Zap,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { Match, OracleDatabase } from '../types';
import {
  ButterflyCrossLearningEngine,
  ButterflyNetworkState,
  AllPlatformSystemId,
  ButterflyIntensity
} from '../lib/butterflyCrossLearningEngine';

interface ButterflyLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchesList: Match[];
  db?: OracleDatabase;
  onRecalibrated?: () => void;
}

export const ButterflyLearningModal: React.FC<ButterflyLearningModalProps> = ({
  isOpen,
  onClose,
  matchesList,
  db,
  onRecalibrated
}) => {
  const [settings, setSettings] = useState(() => ButterflyCrossLearningEngine.getSettings());
  const [simLog, setSimLog] = useState<string[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<AllPlatformSystemId>('SIGNAL_V1');
  const [recalibrationNotice, setRecalibrationNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const networkState: ButterflyNetworkState = ButterflyCrossLearningEngine.evaluateButterflyNetwork(matchesList, db);

  const handleRunCascade = (sys: AllPlatformSystemId) => {
    setIsSimulating(true);
    const result = ButterflyCrossLearningEngine.executeLiveCascade(sys);
    setSimLog(result.simulationLogEn);
    setSettings(ButterflyCrossLearningEngine.getSettings());
    setRecalibrationNotice(`Successfully executed 4-Phase Butterfly Cascade! ${result.shieldedCount} vulnerable matches converted to ironclad lines.`);
    if (onRecalibrated) onRecalibrated();
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleToggle = () => {
    const updated = ButterflyCrossLearningEngine.toggleButterfly();
    setSettings(updated);
    if (onRecalibrated) onRecalibrated();
  };

  const handleIntensityChange = (intensity: ButterflyIntensity) => {
    const updated = ButterflyCrossLearningEngine.setIntensity(intensity);
    setSettings(updated);
    if (onRecalibrated) onRecalibrated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 via-teal-400 to-emerald-400 rounded-t-3xl animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950 border border-purple-500 text-purple-300 text-xs font-black uppercase font-mono shadow-md">
                <Workflow className="w-4 h-4 text-purple-400 animate-pulse" />
                PLATFORM-WIDE BUTTERFLY CROSS-LEARNING ENGINE
              </span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                settings.isEnabled 
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300' 
                  : 'bg-rose-950 border border-rose-600 text-rose-300'
              }`}>
                {settings.isEnabled ? 'CASCADE ACTIVE (LIVE SHIELDING)' : 'BYPASSED'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>شبكة التعلم التعاقبي التكيفي (تأثير الفراشة ذو الأثر الفعلي)</span>
            </h2>
            <p className="text-xs text-slate-400">
              يقوم النظام بتشريح أخطاء المباريات السابقة وتمرير موجات تصحيحية (Ripples) فورية لتحويل الرهانات الهشة إلى قسائم حصينة لا تخسر.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Controls Strip */}
        <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-400">Status:</div>
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                settings.isEnabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {settings.isEnabled ? '✓ BUTTERFLY SHIELD: ON' : '✕ BUTTERFLY SHIELD: OFF'}
            </button>

            <div className="hidden sm:block text-slate-700">|</div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400">Intensity:</span>
              {(['BALANCED', 'MAXIMUM_SHIELD', 'AGGRESSIVE_CASCADE'] as ButterflyIntensity[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleIntensityChange(mode)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    settings.intensity === mode
                      ? 'bg-purple-600 text-white font-bold border border-purple-400'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleRunCascade(selectedSystem)}
            disabled={isSimulating}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Executing Ripple Cascade...' : 'Execute 4-Phase Butterfly Recalibration'}</span>
          </button>
        </div>

        {recalibrationNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{recalibrationNotice}</span>
          </div>
        )}

        {/* HUD Analytics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/90 border border-purple-900/60 p-4 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Inter-System Cascades</span>
            <span className="text-2xl font-black text-purple-300 font-mono">{networkState.globalCascadesCount}</span>
            <span className="text-[10px] text-purple-400 font-mono block">Automated Cross-Sync</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Shielded Errors</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{networkState.preventedErrorsCount}</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Traps Neutralized</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Alpha Gain Boost</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">+{settings.alphaGain}%</span>
            <span className="text-[10px] text-cyan-400 font-mono block">Nash Equilibrium</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Ripple Vectors</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{networkState.activeRipples.length}</span>
            <span className="text-[10px] text-amber-400 font-mono block">Cross-System Channels</span>
          </div>
        </div>

        {/* LIVE TRANSFORMED MATCH SAMPLES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Real-Time Butterfly Market Transformations</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Visible on Dual Daily Slips</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {networkState.shieldedMatchesSummary.map((item, idx) => (
              <div key={item.matchId + idx} className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.fixture}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10.5px] font-bold">
                    SHIELDED
                  </span>
                </div>

                <div className="text-xs font-mono space-y-1 bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-rose-400 line-through">Original: {item.originalMarket} (Volatile)</div>
                  <div className="text-emerald-400 font-bold">➔ Transformed: {item.shieldedMarket} (Protected)</div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  "{item.reason}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Output Log */}
        {simLog && (
          <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/40 space-y-2">
            <div className="text-xs font-mono text-purple-400 uppercase font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Cascade Telemetry Output</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              {simLog.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Butterfly state persists across sessions and dynamically shields Slip 1 & Slip 2.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close Modal & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
