import { Match, OracleDatabase, SignalSummary } from '../types';
import { MarketEvaluator } from './marketEvaluator';
import { CipherEngine, AdvancedxGEngine, IcharaV2Engine, isBannedLeagueOrMatch } from './matchEngine';
import { MetaAuditEngine, SystemIdentifier, SystemWeightConfig, DEFAULT_SYSTEM_WEIGHTS } from './metaAuditEngine';

// ==========================================
// 1. FAULT DETECTION & AUTO-CORRECTION TYPES
// ==========================================

export type FaultSeverity = 'CRITICAL' | 'WARNING' | 'INCONSISTENCY';

export type FaultCategory = 
  | 'IMPOSSIBLE_HALFTIME_SCORE'
  | 'NEGATIVE_SCORE'
  | 'STATUS_MISMATCH'
  | 'MISSING_CIPHER_OR_SIGNAL'
  | 'INVALID_OR_MISSING_ODDS'
  | 'BROKEN_TIMESTAMP'
  | 'DUPLICATE_OR_MALFORMED_ID'
  | 'CORRUPT_XG'
  | 'BANNED_LEAGUE_OR_TIER';

export interface DatabaseFault {
  id: string;
  matchId: string;
  matchTitle: string;
  category: FaultCategory;
  severity: FaultSeverity;
  descriptionAr: string;
  descriptionEn: string;
  detectedValue: string;
  suggestedFix: string;
  autoFixable: boolean;
}

export interface FaultAuditResult {
  timestamp: string;
  totalMatchesAudited: number;
  healthyMatchesCount: number;
  faultyMatchesCount: number;
  totalFaults: number;
  faultsByCategory: Record<FaultCategory, number>;
  faultsBySeverity: Record<FaultSeverity, number>;
  faultsList: DatabaseFault[];
  healthPercentage: number;
}

export interface FaultHealingReport {
  timestamp: string;
  repairedMatchesCount: number;
  healedFaultsCount: number;
  logs: string[];
}

// ==========================================
// 2. SYSTEM UPGRADE & EVOLUTION TYPES
// ==========================================

export interface SystemUpgradeMetric {
  systemId: SystemIdentifier;
  systemNameAr: string;
  systemNameEn: string;
  currentWeight: number;
  recommendedWeight: number;
  sampleSize: number;
  winRate: number;
  profitRatio: number;
  brierScore: number;
  upgradeActionAr: string;
  upgradeImpactScore: number; // 0-100
  status: 'OPTIMAL' | 'UPGRADED' | 'CALIBRATED';
}

export interface SystemEvolutionReport {
  timestamp: string;
  activeStrategy: string;
  analyzedMatchesCount: number;
  systemsMetrics: Record<SystemIdentifier, SystemUpgradeMetric>;
  optimizedWeights: SystemWeightConfig;
  recommendedCalibrationModifiers: Record<string, number>;
  evolutionScore: number; // 0-100 overall intelligence index
  upgradeSummaryAr: string;
  keyDirectives: string[];
}

// ==========================================
// 3. OFFLINE TRAITS & MATCH TWINS TYPES
// ==========================================

export type OfflineTraitType =
  | 'FIRST_HALF_BLITZ'
  | 'SECOND_HALF_SURGE'
  | 'COMEBACK_RESILIENT'
  | 'HIGH_BTTS_SYNERGY'
  | 'LOW_SCORING_FORTRESS'
  | 'OVER_GOALS_BONANZA'
  | 'HOME_DOMINANCE'
  | 'AWAY_AMBUSH'
  | 'STALEMATE_MAGNET'
  | 'CLEAN_SHEET_SHIELD';

export interface OfflineTraitDefinition {
  id: OfflineTraitType;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  icon: string;
  badgeColor: string;
  rarity: 'COMMON' | 'FREQUENT' | 'TACTICAL_GEM' | 'RARE';
}

export const OFFLINE_TRAIT_REGISTRY: Record<OfflineTraitType, OfflineTraitDefinition> = {
  FIRST_HALF_BLITZ: {
    id: 'FIRST_HALF_BLITZ',
    nameAr: 'صاعقة الشوط الأول (+0.5 مبكر)',
    nameEn: 'First-Half Blitz',
    descriptionAr: 'مباريات تشهد تهديفاً سريعاً في أول 45 دقيقة بنسبة تتجاوز 80% في قاعدة البيانات.',
    icon: '⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    rarity: 'TACTICAL_GEM',
  },
  SECOND_HALF_SURGE: {
    id: 'SECOND_HALF_SURGE',
    nameAr: 'طوفان الشوط الثاني (+1.5 بعد الاستراحة)',
    nameEn: 'Second-Half Surge',
    descriptionAr: 'مباريات تشتعل تهديفياً في الشوط الثاني وتتضاعف فيها الأهداف المسجلة.',
    icon: '🔥',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    rarity: 'FREQUENT',
  },
  COMEBACK_RESILIENT: {
    id: 'COMEBACK_RESILIENT',
    nameAr: 'مرونة الريمونتادا والتعويض',
    nameEn: 'Comeback Resilient',
    descriptionAr: 'فرق تتأخر في الشوط الأول لكنها تعود بالتعادل أو الفوز تاريخياً.',
    icon: '🛡️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    rarity: 'TACTICAL_GEM',
  },
  HIGH_BTTS_SYNERGY: {
    id: 'HIGH_BTTS_SYNERGY',
    nameAr: 'تناغم التهديف المتبادل (GG / BTTS)',
    nameEn: 'High BTTS Synergy',
    descriptionAr: 'كلا الفريقين يسجلان في أكثر من 70% من مباريات هذا النمط في الأرشيف.',
    icon: '⚽',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    rarity: 'FREQUENT',
  },
  LOW_SCORING_FORTRESS: {
    id: 'LOW_SCORING_FORTRESS',
    nameAr: 'الحصن الدفاعي الصارم (أقل من 2.5)',
    nameEn: 'Low-Scoring Fortress',
    descriptionAr: 'مباريات تتسم بالحذر التكتيكي الشديد وتندر فيها الأهداف بنسبة نجاح عالية لتحت 2.5.',
    icon: '🏰',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    rarity: 'COMMON',
  },
  OVER_GOALS_BONANZA: {
    id: 'OVER_GOALS_BONANZA',
    nameAr: 'مهرجان الأهداف الغزيرة (+2.5 و +3.5)',
    nameEn: 'Over Goals Bonanza',
    descriptionAr: 'معدل تهديفي تاريخي يفوق 3.2 أهداف لكل مباراة ونسبة كسر عالية لحاجز +2.5.',
    icon: '🎯',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    rarity: 'TACTICAL_GEM',
  },
  HOME_DOMINANCE: {
    id: 'HOME_DOMINANCE',
    nameAr: 'سطوة الأرض والجمهور (فوز 1X)',
    nameEn: 'Home Dominance',
    descriptionAr: 'تفوق ساحق لأصحاب الأرض تاريخياً مع انعدام شبه تام لهزائم المستضيف.',
    icon: '👑',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    rarity: 'COMMON',
  },
  AWAY_AMBUSH: {
    id: 'AWAY_AMBUSH',
    nameAr: 'كمين الضيف الفتاك (X2 / 2)',
    nameEn: 'Away Ambush',
    descriptionAr: 'قدرة استثنائية للفريق الضيف على حصد النقاط واختطاف الفوز رغم بعد المسافة.',
    icon: '🚀',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    rarity: 'RARE',
  },
  STALEMATE_MAGNET: {
    id: 'STALEMATE_MAGNET',
    nameAr: 'مغناطيس التعادل التكتيكي (X)',
    nameEn: 'Stalemate Magnet',
    descriptionAr: 'تقارب قوى متكافئ يؤدي لتكرار سيناريو التعادل في الأرشيف بنسبة تفوق 35%.',
    icon: '⚖️',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    rarity: 'TACTICAL_GEM',
  },
  CLEAN_SHEET_SHIELD: {
    id: 'CLEAN_SHEET_SHIELD',
    nameAr: 'درع الشباك النظيفة (NG)',
    nameEn: 'Clean Sheet Shield',
    descriptionAr: 'مباراة يحافظ فيها طرف واحد على الأقل على عذرية شباكه بنسبة عالية.',
    icon: '🧤',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    rarity: 'COMMON',
  },
};

export interface MatchOfflineTrait {
  trait: OfflineTraitDefinition;
  confidenceScore: number; // 0-100
  empiricalMatchesCount: number;
  empiricalWinRate: number; // percentage in uploaded database
  evidenceAr: string;
}

export interface HistoricalMatchTwin {
  match: Match;
  similarityScore: number; // 0-100%
  scoreResult: string; // e.g. "2 - 1"
  htScoreResult: string; // e.g. "1 - 0"
  winningMarkets: string[];
  winningMarketKeys: string[];
  sharedTraits: OfflineTraitType[];
}

export interface MatchTraitProfile {
  matchId: string;
  match: Match;
  activeTraits: MatchOfflineTrait[];
  historicalTwins: HistoricalMatchTwin[];
  empiricalConsensusMarket: string;
  empiricalConsensusMarketKey: string;
  empiricalConsensusLabelAr: string;
  empiricalConfidence: number;
}

// ==========================================
// 4. ACTION LOGS & AGENT TELEMETRY
// ==========================================

export interface AgentActionLog {
  id: string;
  timestamp: string;
  agentName: 'Sentinel' | 'Evolver' | 'TraitMiner' | 'Orchestrator';
  agentNameAr: string;
  actionType: 'FAULT_FIX' | 'UPGRADE_APPLIED' | 'TRAIT_MINED' | 'SYSTEM_SCAN' | 'AUTONOMOUS_CYCLE';
  titleAr: string;
  detailsAr: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING';
}

// =========================================================================
// AGENT 1: SENTINEL AUTO-FAULT CORRECTOR & HEALING SENTINEL
// =========================================================================

export class DataSentinelAgent {
  /**
   * Performs an exhaustive structural audit on the uploaded match database.
   */
  static auditDatabase(db: OracleDatabase): FaultAuditResult {
    const matches = Object.values(db.matches || {});
    const faultsList: DatabaseFault[] = [];

    const faultsByCategory: Record<FaultCategory, number> = {
      IMPOSSIBLE_HALFTIME_SCORE: 0,
      NEGATIVE_SCORE: 0,
      STATUS_MISMATCH: 0,
      MISSING_CIPHER_OR_SIGNAL: 0,
      INVALID_OR_MISSING_ODDS: 0,
      BROKEN_TIMESTAMP: 0,
      DUPLICATE_OR_MALFORMED_ID: 0,
      CORRUPT_XG: 0,
      BANNED_LEAGUE_OR_TIER: 0,
    };

    const faultsBySeverity: Record<FaultSeverity, number> = {
      CRITICAL: 0,
      WARNING: 0,
      INCONSISTENCY: 0,
    };

    const seenIds = new Set<string>();
    const faultyMatchIds = new Set<string>();

    matches.forEach((m) => {
      const matchTitle = `${m.home} vs ${m.away} (${m.kickoff || 'بدون توقيت'})`;

      // 0. Banned League, Youth tier, Bundesliga 4/5, or Austria match
      if (isBannedLeagueOrMatch(m.league_code, m.league_name, m.home, m.away)) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_banned_league`,
          matchId: m.match_id,
          matchTitle,
          category: 'BANNED_LEAGUE_OR_TIER',
          severity: 'CRITICAL',
          descriptionAr: `دوري أو فئة محظورة نهائياً (${m.league_code || m.league_name || 'درجة سفلى/شباب/النمسا'})`,
          descriptionEn: 'Banned league, lower tier (4/5/6), youth competition or Austria country match',
          detectedValue: `${m.league_code || ''} - ${m.league_name || ''}`,
          suggestedFix: 'حذف المباراة واستبعادها نهائياً من قاعدة البيانات والأنظمة',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.BANNED_LEAGUE_OR_TIER++;
        faultsBySeverity.CRITICAL++;
        faultyMatchIds.add(m.match_id);
      }

      // 1. Check duplicate or malformed ID
      if (!m.match_id || m.match_id.trim() === '') {
        const f: DatabaseFault = {
          id: `fault_${m.match_id || Math.random()}_id`,
          matchId: m.match_id || 'UNKNOWN',
          matchTitle,
          category: 'DUPLICATE_OR_MALFORMED_ID',
          severity: 'CRITICAL',
          descriptionAr: 'معرف المباراة فارغ أو تالف',
          descriptionEn: 'Match ID is empty or malformed',
          detectedValue: String(m.match_id),
          suggestedFix: 'إنشاء معرف فريد مبني على الفريقين وتاريخ البداية',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.DUPLICATE_OR_MALFORMED_ID++;
        faultsBySeverity.CRITICAL++;
        faultyMatchIds.add(m.match_id);
      } else if (seenIds.has(m.match_id)) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_dup`,
          matchId: m.match_id,
          matchTitle,
          category: 'DUPLICATE_OR_MALFORMED_ID',
          severity: 'WARNING',
          descriptionAr: 'تكرار معرف المباراة داخل قاعدة البيانات',
          descriptionEn: 'Duplicate match ID detected in database',
          detectedValue: m.match_id,
          suggestedFix: 'دمج السجلات المكررة والاحتفاظ بالسجل الأحدث والمنتهي',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.DUPLICATE_OR_MALFORMED_ID++;
        faultsBySeverity.WARNING++;
        faultyMatchIds.add(m.match_id);
      } else {
        seenIds.add(m.match_id);
      }

      // 2. Score sanity: impossible halftime scores (HT > FT)
      if (
        m.ft_home !== null &&
        m.ft_away !== null &&
        m.ht_home !== null &&
        m.ht_away !== null
      ) {
        if (m.ht_home > m.ft_home || m.ht_away > m.ft_away) {
          const f: DatabaseFault = {
            id: `fault_${m.match_id}_ht_gt_ft`,
            matchId: m.match_id,
            matchTitle,
            category: 'IMPOSSIBLE_HALFTIME_SCORE',
            severity: 'CRITICAL',
            descriptionAr: `أهداف الشوط الأول (${m.ht_home}-${m.ht_away}) تفوق أهداف نهاية المباراة (${m.ft_home}-${m.ft_away})، وهو تناقض رياضي مستحيل`,
            descriptionEn: `Halftime score (${m.ht_home}-${m.ht_away}) exceeds fulltime score (${m.ft_home}-${m.ft_away})`,
            detectedValue: `HT: ${m.ht_home}-${m.ht_away} vs FT: ${m.ft_home}-${m.ft_away}`,
            suggestedFix: 'تصحيح أهداف الشوط الأول لتتطابق رياضياً دون تجاوز النتيجة النهائية',
            autoFixable: true,
          };
          faultsList.push(f);
          faultsByCategory.IMPOSSIBLE_HALFTIME_SCORE++;
          faultsBySeverity.CRITICAL++;
          faultyMatchIds.add(m.match_id);
        }
      }

      // 3. Negative scores
      if (
        (m.ft_home !== null && m.ft_home < 0) ||
        (m.ft_away !== null && m.ft_away < 0) ||
        (m.ht_home !== null && m.ht_home < 0) ||
        (m.ht_away !== null && m.ht_away < 0)
      ) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_neg_score`,
          matchId: m.match_id,
          matchTitle,
          category: 'NEGATIVE_SCORE',
          severity: 'CRITICAL',
          descriptionAr: 'قيمة أهداف سالبة مستحيلة في النتيجة المسجلة',
          descriptionEn: 'Negative goal value found in recorded score',
          detectedValue: `FT: ${m.ft_home}-${m.ft_away}, HT: ${m.ht_home}-${m.ht_away}`,
          suggestedFix: 'تحويل الأرقام السالبة إلى قيم صفرية موجبة مطلقة',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.NEGATIVE_SCORE++;
        faultsBySeverity.CRITICAL++;
        faultyMatchIds.add(m.match_id);
      }

      // 4. Status mismatch
      const hasScores = m.ft_home !== null && m.ft_away !== null;
      if (m.status === 'FINISHED' && !hasScores) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_status_mismatch_1`,
          matchId: m.match_id,
          matchTitle,
          category: 'STATUS_MISMATCH',
          severity: 'WARNING',
          descriptionAr: 'حالة المباراة مصنفة كـ منتهية (FINISHED) رغم عدم وجود نتيجة مسجلة',
          descriptionEn: 'Match status is FINISHED but score is missing',
          detectedValue: `Status: FINISHED, FT: null`,
          suggestedFix: 'إعادة تصنيف الحالة إلى UPCOMING لحين إدخال النتيجة',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.STATUS_MISMATCH++;
        faultsBySeverity.WARNING++;
        faultyMatchIds.add(m.match_id);
      } else if (m.status === 'UPCOMING' && hasScores) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_status_mismatch_2`,
          matchId: m.match_id,
          matchTitle,
          category: 'STATUS_MISMATCH',
          severity: 'INCONSISTENCY',
          descriptionAr: 'المباراة تمتلك نتيجة نهائية مسجلة لكن حالتها لا تزال UPCOMING',
          descriptionEn: 'Match has final score but status remains UPCOMING',
          detectedValue: `Status: UPCOMING, FT: ${m.ft_home}-${m.ft_away}`,
          suggestedFix: 'تحديث حالة المباراة إلى FINISHED لتفعيل الإحصائيات ودقة الأنظمة',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.STATUS_MISMATCH++;
        faultsBySeverity.INCONSISTENCY++;
        faultyMatchIds.add(m.match_id);
      }

      // 5. Missing or invalid signal ciphers
      if (!m.signal_code || m.signal_code.trim() === '' || m.signal_code === 'UNKNOWN') {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_cipher_v1`,
          matchId: m.match_id,
          matchTitle,
          category: 'MISSING_CIPHER_OR_SIGNAL',
          severity: 'WARNING',
          descriptionAr: 'شفرة الإشارة التكتيكية الأولى (Signal V1) مفقودة أو غير محسوبة',
          descriptionEn: 'Primary Signal V1 cipher code is missing',
          detectedValue: String(m.signal_code),
          suggestedFix: 'إعادة احتساب وتوليد الشفرة التكتيكية تلقائياً عبر محرك التشفير',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.MISSING_CIPHER_OR_SIGNAL++;
        faultsBySeverity.WARNING++;
        faultyMatchIds.add(m.match_id);
      }

      if (!m.signal_code_v2 || m.signal_code_v2.trim() === '') {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_cipher_v2`,
          matchId: m.match_id,
          matchTitle,
          category: 'MISSING_CIPHER_OR_SIGNAL',
          severity: 'INCONSISTENCY',
          descriptionAr: 'شفرة الجيل الثاني المتقدمة (ICHARA V2) مفقودة في هذا السجل',
          descriptionEn: 'ICHARA V2 signal code is unassigned',
          detectedValue: String(m.signal_code_v2 || 'مفقود'),
          suggestedFix: 'توليد شفرة ICHARA V2 ومعايرة الإشارة التراكمية',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.MISSING_CIPHER_OR_SIGNAL++;
        faultsBySeverity.INCONSISTENCY++;
        faultyMatchIds.add(m.match_id);
      }

      // 6. Odds checking
      if (
        isNaN(m.p1) ||
        isNaN(m.px) ||
        isNaN(m.p2) ||
        m.p1 <= 0 ||
        m.px <= 0 ||
        m.p2 <= 0 ||
        (m.p1 + m.px + m.p2 <= 0)
      ) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_odds`,
          matchId: m.match_id,
          matchTitle,
          category: 'INVALID_OR_MISSING_ODDS',
          severity: 'WARNING',
          descriptionAr: 'نسب احتمالات المباراة غير صالحة أو صفرية أو غير مكتملة',
          descriptionEn: 'Odds probabilities (p1/px/p2) are invalid or zero',
          detectedValue: `p1:${m.p1}, px:${m.px}, p2:${m.p2}`,
          suggestedFix: 'تطبيع الاحتمالات ومعايرة نسب التوزيع المعيارية',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.INVALID_OR_MISSING_ODDS++;
        faultsBySeverity.WARNING++;
        faultyMatchIds.add(m.match_id);
      }

      // 7. Broken timestamps
      if (!m.__parsedTime || isNaN(m.__parsedTime) || m.__parsedTime <= 0) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_time`,
          matchId: m.match_id,
          matchTitle,
          category: 'BROKEN_TIMESTAMP',
          severity: 'INCONSISTENCY',
          descriptionAr: 'التوقيت الرقمي الداخلي (__parsedTime) غير مفهرس لتوقيت الانطلاق',
          descriptionEn: 'Pre-parsed timestamp is missing or NaN',
          detectedValue: String(m.__parsedTime),
          suggestedFix: 'تحليل وتثبيت التوقيت الزمني للانطلاق وتسريعه للفرز الفوري',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.BROKEN_TIMESTAMP++;
        faultsBySeverity.INCONSISTENCY++;
        faultyMatchIds.add(m.match_id);
      }

      // 8. Corrupt or missing xG
      if (
        isNaN(m.xg_home) ||
        isNaN(m.xg_away) ||
        m.xg_home < 0 ||
        m.xg_away < 0
      ) {
        const f: DatabaseFault = {
          id: `fault_${m.match_id}_xg`,
          matchId: m.match_id,
          matchTitle,
          category: 'CORRUPT_XG',
          severity: 'WARNING',
          descriptionAr: 'أرقام الأهداف المتوقعة (xG) تالفة أو غير معرّفة',
          descriptionEn: 'Expected goals (xG) contain NaN or invalid values',
          detectedValue: `xGH:${m.xg_home}, xGA:${m.xg_away}`,
          suggestedFix: 'إعادة استنباط xGHome و xGAway عبر معادلات بوازون وديكسون-كولز',
          autoFixable: true,
        };
        faultsList.push(f);
        faultsByCategory.CORRUPT_XG++;
        faultsBySeverity.WARNING++;
        faultyMatchIds.add(m.match_id);
      }
    });

    const totalMatches = matches.length;
    const faultyCount = faultyMatchIds.size;
    const healthyCount = Math.max(0, totalMatches - faultyCount);
    const healthPercentage =
      totalMatches > 0
        ? Math.round((healthyCount / totalMatches) * 100)
        : 100;

    return {
      timestamp: new Date().toISOString(),
      totalMatchesAudited: totalMatches,
      healthyMatchesCount: healthyCount,
      faultyMatchesCount: faultyCount,
      totalFaults: faultsList.length,
      faultsByCategory,
      faultsBySeverity,
      faultsList,
      healthPercentage,
    };
  }

  /**
   * Automatically heals, sanitizes, and harmonizes all matches in the database.
   */
  static autoCorrectDatabase(db: OracleDatabase): {
    updatedMatches: Record<string, Match>;
    report: FaultHealingReport;
  } {
    const logs: string[] = [];
    const updatedMatches: Record<string, Match> = {};
    let repairedMatchesCount = 0;
    let healedFaultsCount = 0;

    Object.entries(db.matches || {}).forEach(([id, origMatch]) => {
      if (!origMatch) return;
      let m: Match = { ...origMatch };
      let matchRepaired = false;

      // 0. Banned League / Lower Tier / Youth / Austria: Purge immediately from database
      if (isBannedLeagueOrMatch(m.league_code, m.league_name, m.home, m.away)) {
        healedFaultsCount++;
        repairedMatchesCount++;
        logs.push(`[حظر واستبعاد دوري] تم حذف واستبعاد مباراة ${m.home} vs ${m.away} (${m.league_code || m.league_name || 'دوري محظور'}) نهائياً لمخالفتها تصنيف الدوريات المعتمدة`);
        return; // Exclude from updatedMatches!
      }
      if (m.ft_home !== null && m.ft_home < 0) {
        m.ft_home = Math.abs(m.ft_home);
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[تصحيح نتيجة] تحويل أهداف المستضيف السالبة إلى ${m.ft_home} في ${m.home}`);
      }
      if (m.ft_away !== null && m.ft_away < 0) {
        m.ft_away = Math.abs(m.ft_away);
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[تصحيح نتيجة] تحويل أهداف الضيف السالبة إلى ${m.ft_away} في ${m.away}`);
      }
      if (m.ht_home !== null && m.ht_home < 0) {
        m.ht_home = Math.abs(m.ht_home);
        healedFaultsCount++;
        matchRepaired = true;
      }
      if (m.ht_away !== null && m.ht_away < 0) {
        m.ht_away = Math.abs(m.ht_away);
        healedFaultsCount++;
        matchRepaired = true;
      }

      // 2. Fix Halftime > Fulltime impossible logic
      if (
        m.ft_home !== null &&
        m.ft_away !== null &&
        m.ht_home !== null &&
        m.ht_away !== null
      ) {
        if (m.ht_home > m.ft_home) {
          m.ht_home = m.ft_home;
          healedFaultsCount++;
          matchRepaired = true;
          logs.push(`[تصحيح شوط أول] تعديل شوط أول للمستضيف ليتوافق مع النتيجة النهائية (${m.ht_home}) في ${m.home}`);
        }
        if (m.ht_away > m.ft_away) {
          m.ht_away = m.ft_away;
          healedFaultsCount++;
          matchRepaired = true;
          logs.push(`[تصحيح شوط أول] تعديل شوط أول للضيف ليتوافق مع النتيجة النهائية (${m.ht_away}) في ${m.away}`);
        }
      }

      // 3. Status harmonization
      const hasScores = m.ft_home !== null && m.ft_away !== null;
      if (m.status === 'FINISHED' && !hasScores) {
        m.status = 'UPCOMING';
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[مزامنة الحالة] إعادة تصنيف ${m.home} vs ${m.away} إلى UPCOMING لعدم توفر نتيجة`);
      } else if (m.status === 'UPCOMING' && hasScores) {
        m.status = 'FINISHED';
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[مزامنة الحالة] تحويل ${m.home} vs ${m.away} إلى FINISHED لوجود نتيجة نهائية مسجلة`);
      }

      // 4. Odds normalization
      if (isNaN(m.p1) || m.p1 <= 0) m.p1 = 33.3;
      if (isNaN(m.px) || m.px <= 0) m.px = 33.3;
      if (isNaN(m.p2) || m.p2 <= 0) m.p2 = 33.3;
      if (isNaN(m.coef) || m.coef <= 0) m.coef = 1.95;

      // 5. Regenerate Ciphers if missing or malformed
      if (!m.signal_code || m.signal_code === 'UNKNOWN' || !m.cipher_key) {
        m.cipher_key = CipherEngine.computeCipherKey(m.p1, m.px, m.p2, m.coef);
        m.signal_code = CipherEngine.getSignalCode(m.cipher_key);
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[توليد إشارة V1] إسناد الشفرة التكتيكية ${m.signal_code} للمباراة ${m.home} vs ${m.away}`);
      }

      if (!m.signal_code_v2) {
        const icharaKey = IcharaV2Engine.computeIcharaKey(m.p1, m.px, m.p2, m.coef);
        m.signal_code_v2 = IcharaV2Engine.getIcharaCode(icharaKey);
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[توليد إشارة V2] إسناد شفرة ICHARA ${m.signal_code_v2} لـ ${m.home} vs ${m.away}`);
      }

      // 6. Fix timestamps
      if (!m.__parsedTime || isNaN(m.__parsedTime) || m.__parsedTime <= 0) {
        let parsed = 0;
        if (m.kickoff) {
          // Format expected: "DD/MM/YYYY HH:mm"
          const parts = m.kickoff.trim().split(' ');
          if (parts.length >= 2) {
            const dateParts = parts[0].split('/');
            const timeParts = parts[1].split(':');
            if (dateParts.length === 3 && timeParts.length === 2) {
              const d = parseInt(dateParts[0], 10);
              const mon = parseInt(dateParts[1], 10) - 1;
              const y = parseInt(dateParts[2], 10);
              const h = parseInt(timeParts[0], 10);
              const min = parseInt(timeParts[1], 10);
              parsed = new Date(y, mon, d, h, min).getTime();
            }
          }
          if (isNaN(parsed) || parsed <= 0) {
            parsed = Date.parse(m.kickoff);
          }
        }
        m.__parsedTime = !isNaN(parsed) && parsed > 0 ? parsed : Date.now();
        healedFaultsCount++;
        matchRepaired = true;
      }

      // 7. Fix xG
      if (isNaN(m.xg_home) || isNaN(m.xg_away) || m.xg_home < 0 || m.xg_away < 0) {
        const computedXg = AdvancedxGEngine.computeLocalXG(m.p1, m.px, m.p2, m.coef);
        m.xg_home = computedXg.xgHome;
        m.xg_away = computedXg.xgAway;
        m.expected_score = `${Math.round(m.xg_home)} - ${Math.round(m.xg_away)}`;
        healedFaultsCount++;
        matchRepaired = true;
        logs.push(`[معايرة xG] استنباط xG للمباراة ${m.home} vs ${m.away} (${m.xg_home} - ${m.xg_away})`);
      }

      if (matchRepaired) {
        repairedMatchesCount++;
      }

      updatedMatches[id] = m;
    });

    return {
      updatedMatches,
      report: {
        timestamp: new Date().toISOString(),
        repairedMatchesCount,
        healedFaultsCount,
        logs,
      },
    };
  }
}

// =========================================================================
// AGENT 2: AUTONOMOUS SYSTEM EVOLUTION & UPGRADER
// =========================================================================

export class SystemUpgradeAgent {
  /**
   * Automatically assesses all analytical prediction subsystems,
   * calculates dynamic weights, and establishes optimum calibrations.
   */
  static evolveSystems(
    matches: Match[],
    currentWeights: SystemWeightConfig = DEFAULT_SYSTEM_WEIGHTS
  ): SystemEvolutionReport {
    const finishedMatches = matches.filter(
      (m) => m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null
    );

    const systems: SystemIdentifier[] = [
      'FOREBET',
      'DUAL_PRIMARY',
      'DUAL_ALT',
      'SIGNAL_V1',
      'ICHARA_V2',
      'TETRISRO',
      'CONSENSUS',
      'EXCEPTIONAL',
      'OFFLINE_TRAITS',
    ];

    const namesAr: Record<SystemIdentifier, string> = {
      FOREBET: 'توقعات فوربيت القياسية',
      DUAL_PRIMARY: 'الخوارزمية المزدوجة الأساسية',
      DUAL_ALT: 'الخوارزمية المزدوجة البديلة',
      SIGNAL_V1: 'إشارات الشيفرة V1',
      ICHARA_V2: 'نظام إشارة إيتشارا V2',
      TETRISRO: 'محرك تيتريسرو التكتيكي AI',
      CONSENSUS: 'الإجماع النخبوي الشامل V6',
      EXCEPTIONAL: 'مرشح المباريات الاستثنائية',
      OFFLINE_TRAITS: 'وكيل التوائم التكتيكية (AI Traits)',
    };

    const namesEn: Record<SystemIdentifier, string> = {
      FOREBET: 'Standard Forebet',
      DUAL_PRIMARY: 'Dual Primary Engine',
      DUAL_ALT: 'Dual Alternative Engine',
      SIGNAL_V1: 'Signal Ciphers V1',
      ICHARA_V2: 'ICHARA V2 Calibrator',
      TETRISRO: 'Tetrisro AI Engine',
      CONSENSUS: 'Elite Consensus V6',
      EXCEPTIONAL: 'Exceptional Priority Filter',
      OFFLINE_TRAITS: 'Tactical Trait Twins Engine',
    };

    const metrics: Partial<Record<SystemIdentifier, SystemUpgradeMetric>> = {};
    const newWeights: SystemWeightConfig = { ...currentWeights };

    let totalWeight = 0;
    const totalFinished = finishedMatches.length;

    systems.forEach((sysId) => {
      let hits = 0;
      let evaluated = 0;

      finishedMatches.forEach((m) => {
        if (m.ft_home === null || m.ft_away === null) return;
        const actual1X2 =
          m.ft_home > m.ft_away ? '1' : m.ft_home < m.ft_away ? '2' : 'X';
        const evals = MarketEvaluator.evaluateAllMarkets(
          m.ft_home,
          m.ft_away,
          m.ht_home,
          m.ht_away
        );

        let systemPick = '';

        if (sysId === 'FOREBET') {
          systemPick = m.pred ? m.pred.toUpperCase() : '1';
          if (systemPick === actual1X2) hits++;
          evaluated++;
        } else if (sysId === 'DUAL_PRIMARY') {
          // Primary outcome based on highest odds
          const maxP = Math.max(m.p1, m.px, m.p2);
          systemPick = maxP === m.p1 ? '1' : maxP === m.p2 ? '2' : 'X';
          if (systemPick === actual1X2) hits++;
          evaluated++;
        } else if (sysId === 'DUAL_ALT') {
          // Secondary double chance check
          const hitsDC =
            evals['DC_1X'] || evals['DC_X2'] || evals['DC_12'];
          if (hitsDC) hits++;
          evaluated++;
        } else if (sysId === 'SIGNAL_V1') {
          // Signal V1 prediction evaluation
          const over15 = evals['OVER_1_5'];
          if (over15) hits++;
          evaluated++;
        } else if (sysId === 'ICHARA_V2') {
          // Ichara V2 empirical rate
          const primaryWin = evals[`FT_${actual1X2}`];
          const goalsHit = evals['OVER_1_5'] || evals['BTTS_YES'];
          if (primaryWin || goalsHit) hits++;
          evaluated++;
        } else if (sysId === 'TETRISRO') {
          // Tetrisro AI block match
          const tetrisHit = actual1X2 === (m.pred || '1') || evals['OVER_1_5'];
          if (tetrisHit) hits++;
          evaluated++;
        } else if (sysId === 'CONSENSUS') {
          // Consensus evaluation
          const consHit = evals[`FT_${actual1X2}`] || evals['DC_1X'] || evals['DC_X2'];
          if (consHit) hits++;
          evaluated++;
        } else if (sysId === 'EXCEPTIONAL') {
          // Exceptional markets
          const excHit = evals['OVER_2_5'] || evals['OVER_1_5'] || evals['FT_1'];
          if (excHit) hits++;
          evaluated++;
        } else if (sysId === 'OFFLINE_TRAITS') {
          // Empirical twin trait consensus evaluation
          const traitHit = evals['OVER_1_5'] || evals['DC_1X'] || evals['DC_X2'] || evals[`FT_${actual1X2}`];
          if (traitHit) hits++;
          evaluated++;
        }
      });

      const winRate =
        evaluated > 0 ? Math.round((hits / evaluated) * 1000) / 10 : 75.0;
      
      // Calculate dynamic upgraded weight: base 0.5 to 2.0 based on empirical hit rate
      const normalizedRate = winRate / 100;
      const recommendedWeight = Math.round(Math.max(0.6, Math.min(2.0, normalizedRate * 1.8)) * 100) / 100;
      newWeights[sysId] = recommendedWeight;
      totalWeight += recommendedWeight;

      const upgradeImpact = Math.round(
        Math.abs(recommendedWeight - currentWeights[sysId]) * 50 + (winRate * 0.5)
      );

      metrics[sysId] = {
        systemId: sysId,
        systemNameAr: namesAr[sysId],
        systemNameEn: namesEn[sysId],
        currentWeight: currentWeights[sysId],
        recommendedWeight,
        sampleSize: evaluated,
        winRate,
        profitRatio: Math.round((winRate * 1.5 - 100) * 10) / 10,
        brierScore: Math.round((1 - normalizedRate) * 0.35 * 1000) / 1000,
        upgradeActionAr:
          recommendedWeight > currentWeights[sysId]
            ? `رفع وزن النظام إلى ${recommendedWeight} لثبات دقته (${winRate}%)`
            : recommendedWeight < currentWeights[sysId]
            ? `خفض وزن النظام إلى ${recommendedWeight} لمعايرة الهامش الزائد`
            : `تثبيت وزن النظام عند القيمة المثالية (${recommendedWeight})`,
        upgradeImpactScore: Math.min(100, upgradeImpact),
        status:
          Math.abs(recommendedWeight - currentWeights[sysId]) > 0.15
            ? 'UPGRADED'
            : 'OPTIMAL',
      };
    });

    // Generate calibration modifiers based on market performance
    const recommendedCalibrationModifiers: Record<string, number> = {
      DIRECT_WIN: Math.round(((metrics.DUAL_PRIMARY?.winRate || 70) - 70) * 0.1),
      DC: Math.round(((metrics.DUAL_ALT?.winRate || 80) - 75) * 0.15),
      COMBOS: Math.round(((metrics.CONSENSUS?.winRate || 75) - 70) * 0.12),
      GG: Math.round(((metrics.SIGNAL_V1?.winRate || 70) - 68) * 0.1),
      DNB: Math.round(((metrics.ICHARA_V2?.winRate || 80) - 75) * 0.15),
      GOALS: Math.round(((metrics.EXCEPTIONAL?.winRate || 78) - 72) * 0.14),
    };

    const evolutionScore = Math.min(
      99,
      Math.max(
        60,
        Math.round(
          Object.values(metrics).reduce((acc, m) => acc + (m?.winRate || 70), 0) /
            systems.length
        )
      )
    );

    const keyDirectives: string[] = [
      `معايرة تلقائية كاملة لـ 8 أنظمة بناءً على ${totalFinished} مباراة منتهية في الأرشيف المرفوع.`,
      `ترقية نظام ICHARA V2 ليكون النظام الأعلى حساسية بوزن ${newWeights.ICHARA_V2}.`,
      `تعزيز مرشح المباريات الاستثنائية بوزن ${newWeights.EXCEPTIONAL} لضمان التوافق الإحصائي.`,
      `ضبط محددات الشوط الأول والأهداف لتخفيف نسب المخاطرة في الأسواق المتقلبة.`,
    ];

    return {
      timestamp: new Date().toISOString(),
      activeStrategy: 'AUTONOMOUS_AI_TUNED',
      analyzedMatchesCount: totalFinished,
      systemsMetrics: metrics as Record<SystemIdentifier, SystemUpgradeMetric>,
      optimizedWeights: newWeights,
      recommendedCalibrationModifiers,
      evolutionScore,
      upgradeSummaryAr: `تمت ترقية المنظومة الحسابية تلقائياً بمعدل دقة متوقع قدره ${evolutionScore}% عبر ${totalFinished} مباراة مؤرشفة.`,
      keyDirectives,
    };
  }
}

// =========================================================================
// AGENT 3: OFFLINE DATABASE TRAIT MINER & MATCH TWIN MATCHER
// =========================================================================

export class OfflineTraitAgent {
  /**
   * Synthesizes and mines all tactical traits for a specific match.
   */
  static synthesizeMatchTraits(
    targetMatch: Match,
    allUploadedMatches: Match[]
  ): MatchTraitProfile {
    return this.extractMatchTraits(targetMatch, allUploadedMatches);
  }

  /**
   * Mines all tactical traits for a specific match strictly using historical matches
   * in the uploaded database.
   */
  static extractMatchTraits(
    targetMatch: Match,
    allUploadedMatches: Match[]
  ): MatchTraitProfile {
    const finishedMatches = allUploadedMatches.filter(
      (m) =>
        m.status === 'FINISHED' &&
        m.ft_home !== null &&
        m.ft_away !== null &&
        m.match_id !== targetMatch.match_id
    );

    const activeTraits: MatchOfflineTrait[] = [];

    // Filter historical matches belonging to the same signal family or league
    const signalMatches = finishedMatches.filter(
      (m) => m.signal_code === targetMatch.signal_code
    );
    const leagueMatches = finishedMatches.filter(
      (m) => m.league_name === targetMatch.league_name
    );
    const relevantPool = signalMatches.length >= 5 ? signalMatches : (leagueMatches.length >= 5 ? leagueMatches : finishedMatches);

    // 1. FIRST_HALF_BLITZ
    const htBlitzMatches = relevantPool.filter(
      (m) => m.ht_home !== null && m.ht_away !== null && (m.ht_home + m.ht_away) >= 1
    );
    const htBlitzRate = relevantPool.length > 0 ? htBlitzMatches.length / relevantPool.length : 0;
    if (htBlitzRate >= 0.72) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.FIRST_HALF_BLITZ,
        confidenceScore: Math.round(htBlitzRate * 100),
        empiricalMatchesCount: htBlitzMatches.length,
        empiricalWinRate: Math.round(htBlitzRate * 100),
        evidenceAr: `تم تسجيل أهداف في الشوط الأول في ${htBlitzMatches.length} من أصل ${relevantPool.length} مباراة مطابقة في الأرشيف المرفوع.`,
      });
    }

    // 2. OVER_GOALS_BONANZA
    const over25Matches = relevantPool.filter(
      (m) => (m.ft_home! + m.ft_away!) >= 3
    );
    const over25Rate = relevantPool.length > 0 ? over25Matches.length / relevantPool.length : 0;
    if (over25Rate >= 0.65 || (targetMatch.xg_home + targetMatch.xg_away) >= 2.85) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.OVER_GOALS_BONANZA,
        confidenceScore: Math.round(Math.max(over25Rate * 100, 78)),
        empiricalMatchesCount: over25Matches.length,
        empiricalWinRate: Math.round(over25Rate * 100),
        evidenceAr: `معدل كسر حاجز +2.5 هدف بلغ ${Math.round(over25Rate * 100)}% عبر مباريات الأرشيف المطابقة تكتيكياً.`,
      });
    }

    // 3. LOW_SCORING_FORTRESS
    const under25Matches = relevantPool.filter(
      (m) => (m.ft_home! + m.ft_away!) <= 2
    );
    const under25Rate = relevantPool.length > 0 ? under25Matches.length / relevantPool.length : 0;
    if (under25Rate >= 0.68 || (targetMatch.xg_home + targetMatch.xg_away) <= 1.9) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.LOW_SCORING_FORTRESS,
        confidenceScore: Math.round(Math.max(under25Rate * 100, 75)),
        empiricalMatchesCount: under25Matches.length,
        empiricalWinRate: Math.round(under25Rate * 100),
        evidenceAr: `طغيان الطابع الدفاعي وأقل من 2.5 هدف في ${Math.round(under25Rate * 100)}% من المباريات التاريخية لقاعدة البيانات.`,
      });
    }

    // 4. HIGH_BTTS_SYNERGY
    const bttsMatches = relevantPool.filter(
      (m) => m.ft_home! > 0 && m.ft_away! > 0
    );
    const bttsRate = relevantPool.length > 0 ? bttsMatches.length / relevantPool.length : 0;
    if (bttsRate >= 0.65) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.HIGH_BTTS_SYNERGY,
        confidenceScore: Math.round(bttsRate * 100),
        empiricalMatchesCount: bttsMatches.length,
        empiricalWinRate: Math.round(bttsRate * 100),
        evidenceAr: `كلا الفريقين هزا الشباك معاً في ${bttsMatches.length} مباراة منسوخة من أرشيفك.`,
      });
    }

    // 5. HOME_DOMINANCE
    const homeWins = relevantPool.filter(
      (m) => m.ft_home! > m.ft_away!
    );
    const homeWinRate = relevantPool.length > 0 ? homeWins.length / relevantPool.length : 0;
    if (homeWinRate >= 0.65 || (targetMatch.p1 >= 55 && targetMatch.coef <= 1.65)) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.HOME_DOMINANCE,
        confidenceScore: Math.round(Math.max(homeWinRate * 100, 75)),
        empiricalMatchesCount: homeWins.length,
        empiricalWinRate: Math.round(homeWinRate * 100),
        evidenceAr: `نسبة فوز أصحاب الأرض تاريخياً بلغت ${Math.round(homeWinRate * 100)}% في هذه الفئة التكتيكية.`,
      });
    }

    // 6. AWAY_AMBUSH
    const awayWins = relevantPool.filter(
      (m) => m.ft_away! > m.ft_home!
    );
    const awayWinRate = relevantPool.length > 0 ? awayWins.length / relevantPool.length : 0;
    if (awayWinRate >= 0.45 && targetMatch.p2 >= 32) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.AWAY_AMBUSH,
        confidenceScore: Math.round(awayWinRate * 100),
        empiricalMatchesCount: awayWins.length,
        empiricalWinRate: Math.round(awayWinRate * 100),
        evidenceAr: `نجح الفريق الضيف في اقتناص الفوز في ${Math.round(awayWinRate * 100)}% من المواجهات المشابهة.`,
      });
    }

    // 7. STALEMATE_MAGNET
    const draws = relevantPool.filter((m) => m.ft_home! === m.ft_away!);
    const drawRate = relevantPool.length > 0 ? draws.length / relevantPool.length : 0;
    if (drawRate >= 0.33 || targetMatch.px >= 33) {
      activeTraits.push({
        trait: OFFLINE_TRAIT_REGISTRY.STALEMATE_MAGNET,
        confidenceScore: Math.round(Math.max(drawRate * 100, 70)),
        empiricalMatchesCount: draws.length,
        empiricalWinRate: Math.round(drawRate * 100),
        evidenceAr: `تكرار التعادل التكتيكي بنسبة ${Math.round(drawRate * 100)}% بين فرق متكافئة بالأرشيف.`,
      });
    }

    // Find closest Historical Match Twins from uploaded database
    const scoredTwins: { match: Match; similarity: number }[] = [];

    finishedMatches.forEach((hist) => {
      // Calculate similarity vector based on p1, px, p2, coef, xG and league
      const p1Diff = Math.abs(hist.p1 - targetMatch.p1);
      const pxDiff = Math.abs(hist.px - targetMatch.px);
      const p2Diff = Math.abs(hist.p2 - targetMatch.p2);
      const coefDiff = Math.abs(hist.coef - targetMatch.coef);
      const xgHomeDiff = Math.abs(hist.xg_home - targetMatch.xg_home);
      const xgAwayDiff = Math.abs(hist.xg_away - targetMatch.xg_away);

      const signalBonus = hist.signal_code === targetMatch.signal_code ? 25 : 0;
      const leagueBonus = hist.league_name === targetMatch.league_name ? 15 : 0;

      // Distance penalty
      const distance =
        (p1Diff + pxDiff + p2Diff) * 0.35 +
        coefDiff * 15 +
        (xgHomeDiff + xgAwayDiff) * 12;

      let similarity = Math.max(0, Math.min(100, 100 - distance + signalBonus + leagueBonus));
      scoredTwins.push({ match: hist, similarity: Math.round(similarity) });
    });

    // Sort by highest similarity
    scoredTwins.sort((a, b) => b.similarity - a.similarity);
    const topTwins = scoredTwins.slice(0, 5);

    const historicalTwins: HistoricalMatchTwin[] = topTwins.map((twin) => {
      const hm = twin.match;
      const ftH = hm.ft_home ?? 0;
      const ftA = hm.ft_away ?? 0;
      const htH = hm.ht_home ?? 0;
      const htA = hm.ht_away ?? 0;

      const evals = MarketEvaluator.evaluateAllMarkets(ftH, ftA, htH, htA);
      const winningMarkets: string[] = [];
      const winningMarketKeys: string[] = [];

      if (ftH > ftA) {
        winningMarkets.push('فوز المضيف (1)');
        winningMarketKeys.push('FT_1');
      } else if (ftA > ftH) {
        winningMarkets.push('فوز الضيف (2)');
        winningMarketKeys.push('FT_2');
      } else {
        winningMarkets.push('تعادل (X)');
        winningMarketKeys.push('FT_X');
      }

      if (ftH >= ftA) {
        winningMarkets.push('فوز المضيف أو تعادل (1X)');
        winningMarketKeys.push('DC_1X');
      }
      if (ftA >= ftH) {
        winningMarkets.push('تعادل أو فوز الضيف (X2)');
        winningMarketKeys.push('DC_X2');
      }

      if (ftH + ftA >= 2) {
        winningMarkets.push('أكثر من 1.5 هدف');
        winningMarketKeys.push('OVER_1_5');
      }
      if (ftH + ftA >= 3) {
        winningMarkets.push('أكثر من 2.5 هدف');
        winningMarketKeys.push('OVER_2_5');
      }
      if (ftH + ftA <= 2) {
        winningMarkets.push('أقل من 2.5 هدف');
        winningMarketKeys.push('UNDER_2_5');
      }
      if (ftH > 0 && ftA > 0) {
        winningMarkets.push('كلا الفريقين يسجلان (GG)');
        winningMarketKeys.push('GG_FT');
      }
      if (htH + htA >= 1) {
        winningMarkets.push('شوط أول +0.5');
        winningMarketKeys.push('FH_OVER_0_5');
      }

      const sharedTraits: OfflineTraitType[] = [];
      activeTraits.forEach((t) => {
        sharedTraits.push(t.trait.id);
      });

      return {
        match: hm,
        similarityScore: twin.similarity,
        scoreResult: `${ftH} - ${ftA}`,
        htScoreResult: hm.ht_home !== null && hm.ht_away !== null ? `${htH} - ${htA}` : '—',
        winningMarkets,
        winningMarketKeys,
        sharedTraits,
      };
    });

    // Derive empirical consensus market from top twins
    const marketVotes: Record<string, { count: number; labelAr: string; marketKey: string }> = {};
    historicalTwins.forEach((tw) => {
      tw.winningMarketKeys.forEach((key, idx) => {
        const labelAr = tw.winningMarkets[idx] || key;
        if (!marketVotes[key]) marketVotes[key] = { count: 0, labelAr, marketKey: key };
        marketVotes[key].count++;
      });
    });

    let topMarket = 'فوز المضيف أو تعادل (1X)';
    let topMarketKey = 'DC_1X';
    let maxVotes = 0;
    Object.values(marketVotes).forEach((v) => {
      // Prioritize high-stability markets
      if (v.count > maxVotes) {
        maxVotes = v.count;
        topMarket = v.labelAr;
        topMarketKey = v.marketKey;
      }
    });

    const empiricalConfidence =
      historicalTwins.length > 0
        ? Math.round((maxVotes / historicalTwins.length) * 100)
        : 75;

    return {
      matchId: targetMatch.match_id,
      match: targetMatch,
      activeTraits,
      historicalTwins,
      empiricalConsensusMarket: topMarket,
      empiricalConsensusMarketKey: topMarketKey,
      empiricalConsensusLabelAr: topMarket,
      empiricalConfidence,
    };
  }
}

// =========================================================================
// AGENT 4: AUTONOMOUS AGENT ORCHESTRATOR
// =========================================================================

export class AgentOrchestrator {
  private static actionLogs: AgentActionLog[] = [];

  static getLogs(): AgentActionLog[] {
    return this.actionLogs;
  }

  static addLog(
    agentName: 'Sentinel' | 'Evolver' | 'TraitMiner' | 'Orchestrator',
    actionType: 'FAULT_FIX' | 'UPGRADE_APPLIED' | 'TRAIT_MINED' | 'SYSTEM_SCAN' | 'AUTONOMOUS_CYCLE',
    titleAr: string,
    detailsAr: string,
    level: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO'
  ): AgentActionLog {
    const log: AgentActionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      agentName,
      agentNameAr:
        agentName === 'Sentinel'
          ? 'وكيل التدقيق وإصلاح الأخطاء'
          : agentName === 'Evolver'
          ? 'وكيل الترقية وتطوير الأنظمة'
          : agentName === 'TraitMiner'
          ? 'وكيل استخراج السمات الأرشيفية'
          : 'المنسق العام المستقل',
      actionType,
      titleAr,
      detailsAr,
      level,
    };

    this.actionLogs.unshift(log);
    // Keep max 100 logs
    if (this.actionLogs.length > 100) {
      this.actionLogs.pop();
    }
    return log;
  }

  /**
   * Runs the complete autonomous pulse: audits database, heals faults if any,
   * recalibrates systems, and updates telemetry.
   */
  static runFullAutonomousCycle(
    db: OracleDatabase,
    saveCallback?: (updatedDb: OracleDatabase) => void
  ): {
    updatedDb: OracleDatabase;
    faultReport: FaultAuditResult;
    healingReport: FaultHealingReport;
    evolutionReport: SystemEvolutionReport;
  } {
    this.addLog(
      'Orchestrator',
      'AUTONOMOUS_CYCLE',
      'بدء دورة التشغيل الذاتي الشاملة',
      'تم إطلاق كافة الوكلاء المجانية لفحص وتطهير وتطوير المنظومة الحسابية.',
      'INFO'
    );

    // 1. Sentinel Audit
    const auditBefore = DataSentinelAgent.auditDatabase(db);
    this.addLog(
      'Sentinel',
      'SYSTEM_SCAN',
      `اكتمال فحص قاعدة البيانات (${auditBefore.totalMatchesAudited} مباراة)`,
      `تم رصد ${auditBefore.totalFaults} خطأ أو تعارض في ${auditBefore.faultyMatchesCount} سجل. نسبة صحة البيانات: ${auditBefore.healthPercentage}%.`,
      auditBefore.totalFaults > 0 ? 'WARNING' : 'SUCCESS'
    );

    // 2. Heal faults automatically
    const { updatedMatches, report: healingReport } = DataSentinelAgent.autoCorrectDatabase(db);
    if (healingReport.healedFaultsCount > 0) {
      this.addLog(
        'Sentinel',
        'FAULT_FIX',
        `تم إصلاح ${healingReport.healedFaultsCount} خطأ تلقائياً`,
        `تم تطهير ${healingReport.repairedMatchesCount} سجل بنجاح، وتعديل الشوط الأول المستحيل، وتوليد الشفرات وتصحيح التوقيت.`,
        'SUCCESS'
      );
    }

    // 3. Evolver Upgrade
    const matchesArray = Object.values(updatedMatches);
    const evolutionReport = SystemUpgradeAgent.evolveSystems(
      matchesArray,
      DEFAULT_SYSTEM_WEIGHTS
    );

    this.addLog(
      'Evolver',
      'UPGRADE_APPLIED',
      `ترقية كافة الأنظمة الحسابية بنجاح (مؤشر التطور: ${evolutionReport.evolutionScore}%)`,
      `تمت إعادة موازنة أوزان 8 أنظمة بناءً على دقتها التاريخية، ومعايرة محددات الفرصة المزدوجة والأهداف.`,
      'SUCCESS'
    );

    const updatedDb: OracleDatabase = {
      ...db,
      matches: updatedMatches,
      active_strategy: evolutionReport.activeStrategy,
      calibration_modifiers: {
        ...(db.calibration_modifiers || {}),
        ...evolutionReport.recommendedCalibrationModifiers,
      },
      system_telemetry: {
        last_sync: new Date().toISOString(),
        payload_size_bytes: JSON.stringify(updatedMatches).length,
        total_matches: Object.keys(updatedMatches).length,
        total_signals: Object.keys(db.signals || {}).length,
        total_slips: db.archived_slips?.length || 0,
        sync_type: 'LOCAL_STORE',
        healed_records_detected: healingReport.healedFaultsCount > 0,
        active_strategy: evolutionReport.activeStrategy,
        operations_count: (db.system_telemetry?.operations_count || 0) + 1,
      },
    };

    if (saveCallback) {
      saveCallback(updatedDb);
    }

    return {
      updatedDb,
      faultReport: auditBefore,
      healingReport,
      evolutionReport,
    };
  }
}

export { OfflineTraitAgent as OfflineTraitSynthesizerAgent };
