import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  Database,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Download,
  Copy,
  Check,
  Layers,
  Search,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { CompressionReport } from '../lib/dataCompressor';

interface DatabaseCompressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CompressionReport | null;
  onDownloadCompressedJson?: () => void;
}

export const DatabaseCompressionModal: React.FC<DatabaseCompressionModalProps> = ({
  isOpen,
  onClose,
  report,
  onDownloadCompressedJson,
}) => {
  const [copied, setCopied] = useState(false);
  const [leagueSearch, setLeagueSearch] = useState('');

  if (!isOpen || !report) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(report.markdownSummaryTable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredLeagues = report.leaguesSummary.filter((l) =>
    l.leagueName.toLowerCase().includes(leagueSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-left space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GLOW DECORATIONS */}
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-850 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/40 shadow-inner">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  HIGH-VOLUME INGESTION &amp; COMPRESSION ENGINE
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-955/60 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                  {report.processingDurationMs}ms Latency
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 font-mono flex items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  تقرير المعالجة والضغط الفوري لقاعدة البيانات
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                تم استيراد الملف وضغطه بنجاح مع تجريد البيانات المكررة والاحتفاظ بنسبة 100% من سلامة المباريات.
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

        {/* COMPRESSION & RECORD CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Memory Savings */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                نسبة الضغط وتوفير الذاكرة
              </span>
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-300 font-mono">
                {report.memorySavingsPercent}%
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">توفير</span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>الحجم:</span>
              <strong className="text-slate-200 font-bold">
                {(report.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB ➔ {(report.compressedSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </strong>
            </div>
          </div>

          {/* Card 2: Total Records */}
          <div className="bg-gradient-to-b from-amber-950/30 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                إجمالي السجلات المعالجة
              </span>
              <Database className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-300 font-mono">
                {report.totalRecords.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">مباراة</span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>الدوريات المكتشفة:</span>
              <strong className="text-amber-300 font-bold">{report.leaguesSummary.length} دوري</strong>
            </div>
          </div>

          {/* Card 3: Finished Matches */}
          <div className="bg-gradient-to-b from-blue-950/30 to-slate-950 border-2 border-blue-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                المباريات المنتهية (FT / HT)
              </span>
              <FileCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-300 font-mono">
                {report.finishedCount.toLocaleString()}
              </span>
              <span className="text-xs text-blue-400 font-mono">محسومة</span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>بيانات النتائج:</span>
              <strong className="text-slate-200 font-bold">100% مدققة</strong>
            </div>
          </div>

          {/* Card 4: Upcoming Matches */}
          <div className="bg-gradient-to-b from-purple-950/30 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                المباريات القادمة (P1/PX/P2)
              </span>
              <Flame className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-300 font-mono">
                {report.upcomingCount.toLocaleString()}
              </span>
              <span className="text-xs text-purple-400 font-mono">نشطة</span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono flex justify-between border-t border-slate-900 pt-1.5">
              <span>احتمالات وإشارات:</span>
              <strong className="text-purple-300 font-bold">جاهزة للتحليل</strong>
            </div>
          </div>
        </div>

        {/* PURGED BLACKLISTED BANNER */}
        {report.purgedBlacklistedCount > 0 && (
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-900/60 rounded-xl border border-rose-500/50 text-rose-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-200 uppercase font-mono">
                  تم تفريغ واستبعاد المسابقات المحظورة تلقائياً
                </h4>
                <p className="text-[11px] text-rose-300/80">
                  تم حذف وتفريغ {report.purgedBlacklistedCount.toLocaleString()} مباراة تابعة للدوريات المحظورة (النمسا ودرجات ألمانيا 4-6 وهواة) نهائياً من قاعدة البيانات.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-rose-950 border border-rose-700 text-rose-300 shrink-0">
              {report.purgedBlacklistedCount} مباراة مفرغة
            </span>
          </div>
        )}

        {/* LEAGUES GROUPING TABLE */}
        <div className="bg-slate-900/70 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-black font-mono text-slate-200 uppercase tracking-wider">
                توزيع المباريات حسب الدوريات والبطولات (Grouped by League)
              </h3>
            </div>

            {/* SEARCH */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={leagueSearch}
                onChange={(e) => setLeagueSearch(e.target.value)}
                placeholder="بحث في الدوريات..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-3">اسم الدوري (League Name)</th>
                  <th className="py-2.5 px-3 text-center">إجمالي المباريات</th>
                  <th className="py-2.5 px-3 text-center">المباريات المنتهية (FT/HT)</th>
                  <th className="py-2.5 px-3 text-center">المباريات القادمة</th>
                  <th className="py-2.5 px-3 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredLeagues.slice(0, 50).map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-200 font-bold flex items-center gap-2">
                      <span className="text-emerald-400">🏆</span>
                      <span className="truncate max-w-[280px]">{l.leagueName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-100 font-bold">{l.total}</td>
                    <td className="py-2.5 px-3 text-center text-blue-400">{l.finished}</td>
                    <td className="py-2.5 px-3 text-center text-purple-400">{l.upcoming}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="bg-slate-950 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded text-[10px] font-bold">
                        جاهز ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIONS & FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-black font-mono cursor-pointer transition-all shadow-md"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? 'تم نسخ التقرير (Markdown)!' : 'نسخ التقرير بتنسيق Markdown'}</span>
            </button>

            {onDownloadCompressedJson && (
              <button
                onClick={onDownloadCompressedJson}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 text-xs font-black font-mono cursor-pointer transition-all shadow-md"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>تحميل نسخة مضغوطة خفيفة (Compressed JSON)</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            بدء تصفح المباريات والأنظمة
          </button>
        </div>
      </div>
    </div>
  );
};
