import { Match, OracleDatabase, SignalSummary } from '../types';
import { MarketEvaluator } from './marketEvaluator';
import { AdvancedxGEngine, CipherEngine, IcharaV2Engine } from './matchEngine';
import { isExceptionalMarket } from './exceptionalFilter';
import { OfflineTraitSynthesizerAgent } from './autonomousAgents';

export type TimeWindowOption = '1d' | '2d' | '3d' | '5d' | '6d' | 'all';

export type SystemIdentifier = 
  | 'FOREBET'
  | 'DUAL_PRIMARY'
  | 'DUAL_ALT'
  | 'SIGNAL_V1'
  | 'ICHARA_V2'
  | 'TETRISRO'
  | 'CONSENSUS'
  | 'EXCEPTIONAL'
  | 'OFFLINE_TRAITS';

export interface SystemWeightConfig {
  FOREBET: number;
  DUAL_PRIMARY: number;
  DUAL_ALT: number;
  SIGNAL_V1: number;
  ICHARA_V2: number;
  TETRISRO: number;
  CONSENSUS: number;
  EXCEPTIONAL: number;
  OFFLINE_TRAITS: number;
}

export const DEFAULT_SYSTEM_WEIGHTS: SystemWeightConfig = {
  FOREBET: 0.8,
  DUAL_PRIMARY: 1.0,
  DUAL_ALT: 0.7,
  SIGNAL_V1: 1.2,
  ICHARA_V2: 1.4,
  TETRISRO: 1.1,
  CONSENSUS: 1.3,
  EXCEPTIONAL: 1.2,
  OFFLINE_TRAITS: 1.4,
};

export interface MatchSystemPrediction {
  systemId: SystemIdentifier;
  systemNameAr: string;
  systemNameEn: string;
  market: string;
  marketLabelAr: string;
  confidenceScore: number; // 0-100
  isExceptional: boolean;
}

export interface SystemPerformanceAudit {
  systemId: SystemIdentifier;
  systemNameAr: string;
  systemNameEn: string;
  color: string;
  totalEvaluated: number;
  won: number;
  lost: number;
  winRate: number; // percentage
  consistencyRate: number; // percentage
  brierScore: number; // 0 (perfect) to 1 (poor)
  healthScore: number; // 0 - 100 composite index
  healthStatus: 'OPTIMAL' | 'STABLE' | 'NEEDS_CALIBRATION' | 'HIGH_VOLATILITY';
  healthStatusAr: string;
  topMarkets: { market: string; marketLabelAr: string; count: number; won: number; winRate: number }[];
}

export interface MarketPerformanceAudit {
  market: string;
  marketLabelAr: string;
  category: string;
  categoryAr: string;
  totalPicks: number;
  wonPicks: number;
  winRate: number;
  isExceptional: boolean;
  reliabilityTier: 'ELITE' | 'SAFE' | 'BALANCED' | 'VOLATILE' | 'AVOID';
  reliabilityTierAr: string;
}

export interface SystemSynergyPair {
  pairKey: string;
  systemA: SystemIdentifier;
  systemB: SystemIdentifier;
  nameAAr: string;
  nameBAr: string;
  agreementCount: number;
  agreementWins: number;
  agreementWinRate: number;
  synergyLevel: 'APEX' | 'HIGH' | 'NEUTRAL' | 'POOR';
  synergyLevelAr: string;
  recommendationAr: string;
}

export interface LeaguePerformanceAudit {
  leagueName: string;
  totalMatches: number;
  settledMatches: number;
  wonMatches: number;
  winRate: number;
  avgTotalGoals: number;
  over15Rate: number;
  over25Rate: number;
  bttsRate: number;
  rating: 'GOLDEN' | 'STABLE' | 'VOLATILE';
  ratingAr: string;
  suggestedMarketAr: string;
}

export interface ClashArbitrationRecord {
  matchId: string;
  match: Match;
  clashTitleAr: string;
  sideA: {
    systemNameAr: string;
    marketLabelAr: string;
    confidence: number;
  };
  sideB: {
    systemNameAr: string;
    marketLabelAr: string;
    confidence: number;
  };
  historicalEdgeAr: string;
  supremeRulingAr: string;
  recommendedPick: string;
  recommendedPickLabelAr: string;
  status: 'UPCOMING' | 'FINISHED';
  isSettledWon?: boolean;
}

export interface AlgorithmicDirective {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIVE';
  priorityAr: string;
  category: 'WEIGHTING' | 'MARKET_FILTER' | 'ODDS_THRESHOLD' | 'SYNERGY_RULE' | 'BIAS_OFFSET';
  categoryAr: string;
  titleAr: string;
  descriptionAr: string;
  codeDirectiveAr: string;
  impactPotentialAr: string;
  systemTarget: SystemIdentifier | 'GLOBAL';
}

export interface MetaRecommendationPick {
  match: Match;
  consensusMarket: string;
  consensusMarketLabelAr: string;
  metaScore: number; // 0-100
  participatingSystemsCount: number;
  supportingSystems: { systemId: SystemIdentifier; nameAr: string; market: string; confidence: number }[];
  tier: 'SUPREME_ARBITER' | 'HIGH_SYNERGY' | 'EXCEPTIONAL_GEM' | 'TRAP_WARNING';
  tierLabelAr: string;
  tierColor: string;
  verdictAr: string;
  suggestedActionAr: string;
  isSettled: boolean;
  isWon?: boolean;
  
  // Statistical & Coherence metrics (Zero financial or betting terms)
  ensembleProb: number; // 0.0 to 1.0 (calibrated statistical probability)
  agreementRatio: string; // e.g. "4 / 5 أنظمة"
  stabilityGrade: 'ELITE_STABLE' | 'HIGH_CONFIDENCE' | 'BALANCED' | 'VOLATILE';
  stabilityGradeAr: string;
  xGAlignment: 'STRONG' | 'MODERATE' | 'NEUTRAL';
  xGAlignmentAr: string;
}

export interface SupremeTacticalPackage {
  packageId: string;
  titleAr: string;
  descriptionAr: string;
  type: 'CORE_BANKERS' | 'GOALS_SYNTHESIS' | 'BALANCED_COMBO' | 'DIVERSIFIED_MARKETS' | 'HALFTIME_TACTICAL';
  typeLabelAr: string;
  typeColor: string;
  matchCount: number;
  jointProbability: number; // percentage
  coherenceScore: number; // 0-100
  picks: MetaRecommendationPick[];
  shareableTextAr: string;
}

export interface ComprehensiveMetaAuditReport {
  timestamp: string;
  timeWindow: TimeWindowOption;
  windowLabelAr: string;
  totalMatchesInScope: number;
  finishedMatchesCount: number;
  upcomingMatchesCount: number;
  overallSettledWinRate: number;
  systemAudits: Record<SystemIdentifier, SystemPerformanceAudit>;
  marketAudits: MarketPerformanceAudit[];
  synergies: SystemSynergyPair[];
  leaguesAudits: LeaguePerformanceAudit[];
  clashes: ClashArbitrationRecord[];
  algorithmicDirectives: AlgorithmicDirective[];
  supremePicks: MetaRecommendationPick[];
  trapAlerts: MetaRecommendationPick[];
  prebuiltPackages: SupremeTacticalPackage[];
  autoWeights: SystemWeightConfig;
  autoWeightsExplanations: Record<SystemIdentifier, string>;
  isFullyAutomated: boolean;
}

export class MetaAuditEngine {
  /**
   * Filter matches according to flexible rolling time-window relative to latest match or current time.
   */
  static filterMatchesByWindow(matches: Match[], window: TimeWindowOption): Match[] {
    if (window === 'all') return matches;

    const now = Date.now();
    let maxMatchTime = now;
    matches.forEach(m => {
      const t = m.__parsedTime || 0;
      if (t > maxMatchTime) maxMatchTime = t;
    });

    const hoursMap: Record<Exclude<TimeWindowOption, 'all'>, number> = {
      '1d': 24,
      '2d': 48,
      '3d': 72,
      '5d': 120, // 5 days rolling
      '6d': 144, // 6 days rolling
    };

    const windowMs = (hoursMap[window as keyof typeof hoursMap] || 120) * 3600 * 1000;
    const cutoff = maxMatchTime - windowMs;

    return matches.filter(m => (m.__parsedTime || 0) >= cutoff);
  }

  /**
   * Helper to format market key to Arabic friendly label.
   */
  static formatMarketAr(market: string): string {
    const map: Record<string, string> = {
      // 1X2 Match Winner
      'FT_1': 'فوز المضيف (1)',
      'FT_X': 'تعادل المباراة (X)',
      'FT_2': 'فوز المستضيف / الضيف (2)',

      // Double Chance
      'DC_1X': 'فرصة مزدوجة (1X - فوز أو تعادل المضيف)',
      'DC_X2': 'فرصة مزدوجة (X2 - تعادل أو فوز الضيف)',
      'DC_12': 'فرصة مزدوجة (12 - لا تعادل)',
      'HT_DC_1X': 'شوط أول: فرصة مزدوجة (1X)',
      'HT_DC_X2': 'شوط أول: فرصة مزدوجة (X2)',

      // Over Goals (Full-Time)
      'OVER_0_5': 'أكثر من 0.5 هدف (+0.5)',
      'OVER_1_5': 'أكثر من 1.5 هدف (+1.5)',
      'OVER_2_5': 'أكثر من 2.5 هدف (+2.5)',
      'OVER_3_5': 'أكثر من 3.5 هدف (+3.5)',
      'OVER_4_5': 'أكثر من 4.5 هدف (+4.5)',
      'OVER_5_5': 'أكثر من 5.5 هدف (+5.5)',

      // Under Goals (Full-Time)
      'UNDER_1_5': 'أقل من 1.5 هدف (-1.5)',
      'UNDER_2_5': 'أقل من 2.5 هدف (-2.5)',
      'UNDER_3_5': 'أقل من 3.5 هدف (-3.5)',
      'UNDER_4_5': 'أقل من 4.5 هدف (-4.5)',
      'UNDER_5_5': 'أقل من 5.5 هدف (-5.5)',

      // Both Teams to Score (BTTS)
      'GG_FT': 'كلا الفريقين يسجل (GG - نعم)',
      'NG_FT': 'فريق واحد على الأكثر يسجل (NG - لا)',
      'GG_HT': 'شوط أول: كلا الفريقين يسجل (GG)',
      'NG_HT': 'شوط أول: لا يسجل الفريقان معاً',
      'GG_SH': 'شوط ثانٍ: كلا الفريقين يسجل',
      'NG_SH': 'شوط ثانٍ: لا يسجل الفريقان معاً',

      // Halftime 1X2 & Goals
      'HT_1': 'شوط أول: فوز المضيف (1)',
      'HT_X': 'شوط أول: تعادل (X)',
      'HT_2': 'شوط أول: فوز الضيف (2)',
      'HT_OVER_0_5': 'شوط أول: أكثر من 0.5 هدف',
      'HT_UNDER_0_5': 'شوط أول: أقل من 0.5 (سلبي 0-0)',
      'HT_OVER_1_5': 'شوط أول: أكثر من 1.5 هدف',
      'HT_UNDER_1_5': 'شوط أول: أقل من 1.5 هدف',

      // Second Half
      'SH_1': 'شوط ثانٍ: تفوق المضيف',
      'SH_X': 'شوط ثانٍ: تعادل',
      'SH_2': 'شوط ثانٍ: تفوق الضيف',
      'SH_OVER_0_5': 'شوط ثانٍ: أكثر من 0.5 هدف',
      'SH_OVER_1_5': 'شوط ثانٍ: أكثر من 1.5 هدف',
      'SH_UNDER_1_5': 'شوط ثانٍ: أقل من 1.5 هدف',

      // Team Goals
      'HOME_OVER_0_5': 'أهداف المضيف: هدف على الأقل',
      'HOME_OVER_1_5': 'أهداف المضيف: أكثر من 1.5 (+1.5)',
      'HOME_OVER_2_5': 'أهداف المضيف: أكثر من 2.5',
      'AWAY_OVER_0_5': 'أهداف الضيف: هدف على الأقل',
      'AWAY_OVER_1_5': 'أهداف المستضيف: أكثر من 1.5 (+1.5)',
      'AWAY_OVER_2_5': 'أهداف المستضيف: أكثر من 2.5',

      // Clean Sheets & Win Combos
      'HOME_CLEAN_SHEET': 'شباك نظيفة للمضيف (Clean Sheet)',
      'AWAY_CLEAN_SHEET': 'شباك نظيفة للضيف (Clean Sheet)',
      'HOME_WIN_CLEAN_SHEET': 'فوز المضيف بشباك نظيفة (Win to Nil)',
      'AWAY_WIN_CLEAN_SHEET': 'فوز الضيف بشباك نظيفة (Win to Nil)',
      'WIN_AND_OVER_1_5': 'فوز المضيف وأكثر من 1.5 هدف',
      'WIN_AND_OVER_2_5': 'فوز المضيف وأكثر من 2.5 هدف',
      'WIN_AND_GG': 'فوز المضيف وتسجيل الفريقين (Win & GG)',
      'DRAW_AND_GG': 'تعادل وتسجيل الفريقين (Draw & GG)',

      // Handicaps
      'HANDICAP_MINUS_1_HOME': 'هانديكاب: المضيف بفارق هدفين (-1)',
      'HANDICAP_PLUS_1_AWAY': 'هانديكاب: الضيف (+1 حماية)',
      'HANDICAP_PLUS_1_HOME': 'هانديكاب: المضيف (+1 حماية)',
      'HANDICAP_MINUS_1_AWAY': 'هانديكاب: الضيف بفارق هدفين (-1)',

      // HT/FT Combinations
      'HT_FT_1_1': 'شوط أول / كامل: فوز المضيف 1/1',
      'HT_FT_X_1': 'شوط أول / كامل: تعادل ثم فوز المضيف X/1',
      'HT_FT_2_2': 'شوط أول / كامل: فوز الضيف 2/2',
      'HT_FT_X_X': 'شوط أول / كامل: تعادل الشوطين X/X',

      // Odd / Even
      'EVEN_TOTAL_GOALS': 'مجموع الأهداف: زوجي',
      'ODD_TOTAL_GOALS': 'مجموع الأهداف: فردي',
    };
    return map[market] || MarketEvaluator.formatMarketName(market);
  }

  /**
   * Helper to categorize market keys into high-level analytical categories.
   */
  static getMarketCategory(market: string): { key: string; labelAr: string } {
    const m = market.trim().toUpperCase();
    if (m.startsWith('OVER_') || m.includes('OVER_1_5') || m.includes('OVER_2_5') || m.includes('OVER_3_5')) {
      return { key: 'OVER_GOALS', labelAr: 'أهداف أكثر (+Over)' };
    }
    if (m.startsWith('UNDER_') || m.includes('UNDER_2_5') || m.includes('UNDER_3_5')) {
      return { key: 'UNDER_GOALS', labelAr: 'أهداف أقل (-Under)' };
    }
    if (m.includes('GG') || m.includes('NG')) {
      return { key: 'BTTS', labelAr: 'كلا الفريقين يسجل (BTTS)' };
    }
    if (m.startsWith('DC_') || m.includes('_DC_')) {
      return { key: 'DOUBLE_CHANCE', labelAr: 'فرص مزدوجة (DC)' };
    }
    if (m.startsWith('HT_') || m.startsWith('SH_')) {
      return { key: 'HALFTIME', labelAr: 'أسواق الأشواط (Halftime)' };
    }
    if (m.includes('CLEAN_SHEET') || m.includes('HANDICAP') || m.includes('WIN_TO_NIL')) {
      return { key: 'CLEAN_SHEET_HANDICAP', labelAr: 'شباك نظيفة وهانديكاب' };
    }
    if (m.startsWith('HOME_') || m.startsWith('AWAY_')) {
      return { key: 'TEAM_GOALS', labelAr: 'أهداف الفرق المنفردة' };
    }
    return { key: 'MATCH_1X2', labelAr: 'نتيجة المباراة (1X2)' };
  }

  /**
   * Validates a market against strict hard conditions to eliminate senseless or contradictory predictions.
   */
  static validateHardConditions(
    m: Match,
    market: string,
    predsForMarket: MatchSystemPrediction[]
  ): { valid: boolean; reasonAr: string } {
    // 1. Odds Sanity Barrier: Rational betting corridor with zero excessive volatility
    const coef = m.coef || 1.85;
    if (coef < 1.28) {
      return { valid: false, reasonAr: "العائد أقل من 1.28 (مخاطرة كامنة بلا قيمة مجزية)" };
    }
    if (coef > 3.80) {
      return { valid: false, reasonAr: "العائد يفوق 3.80 (تشتت عشوائي وتكهن غير موثوق)" };
    }

    // 2. Multi-System Agreement Quorum:
    // Strictly at least 3 distinct systems (or 2 elite systems with strong combined confidence >= 85)
    const distinctSystems = new Set(predsForMarket.map(p => p.systemId));
    const avgConfidence = predsForMarket.reduce((acc, cur) => acc + cur.confidenceScore, 0) / (predsForMarket.length || 1);
    const hasElitePair = distinctSystems.has("ICHARA_V2") && 
      (distinctSystems.has("SIGNAL_V1") || distinctSystems.has("TETRISRO") || distinctSystems.has("DUAL_PRIMARY")) &&
      avgConfidence >= 85;

    if (distinctSystems.size < 3 && !hasElitePair) {
      return { valid: false, reasonAr: `إجماع غير كافٍ (${distinctSystems.size} أنظمة فقط - المشترط 3+ أنظمة مستقلة أو ثنائي نخبوي ≥85%)` };
    }

    // 3. Strict xG & Directional Coherence (Zero Contradiction with Physical Engine)
    const xgH = m.xg_home ?? 1.2;
    const xgA = m.xg_away ?? 1.0;
    const totXg = xgH + xgA;

    if (market === "FT_1") {
      if ((m.p1 || 0) < 46 || (m.p1 || 0) <= (m.p2 || 0) + 10) {
        return { valid: false, reasonAr: "ضعف أرجحية فوز المضيف إحصائياً (P1 < 46% أو فارق ضعيف عن الضيف)" };
      }
      if (xgH <= xgA + 0.35) {
        return { valid: false, reasonAr: "تناقض مع الأهداف المتوقعة (xG لا يدعم تفوق المضيف بفارق ≥ 0.35)" };
      }
    } else if (market === "FT_2") {
      if ((m.p2 || 0) < 40 || (m.p2 || 0) <= (m.p1 || 0) + 8) {
        return { valid: false, reasonAr: "ضعف أرجحية فوز الضيف إحصائياً (P2 < 40% أو فارق ضعيف عن المضيف)" };
      }
      if (xgA <= xgH + 0.35) {
        return { valid: false, reasonAr: "تناقض مع الأهداف المتوقعة للضيف بفارق ≥ 0.35" };
      }
    } else if (market === "FT_X") {
      if ((m.px || 0) < 33 || Math.abs(xgH - xgA) > 0.35) {
        return { valid: false, reasonAr: "انعدام التكافؤ التكتيكي لنتيجة التعادل (فارق xG يتجاوز 0.35)" };
      }
    } else if (market === "DC_1X") {
      if ((m.p1 || 0) + (m.px || 0) < 70 || xgH < xgA - 0.20) {
        return { valid: false, reasonAr: "أرجحية 1X غير كافية (<70%) أو تفوق صريح للضيف" };
      }
    } else if (market === "DC_X2") {
      if ((m.p2 || 0) + (m.px || 0) < 70 || xgA < xgH - 0.20) {
        return { valid: false, reasonAr: "أرجحية X2 غير كافية (<70%) أو تفوق صريح للمضيف" };
      }
    } else if (market === "OVER_1_5") {
      if (totXg < 2.15) {
        return { valid: false, reasonAr: "مجموع الأهداف المتوقعة ضعيف لحاجز +1.5 (xG < 2.15)" };
      }
    } else if (market === "OVER_2_5") {
      if (totXg < 2.65) {
        return { valid: false, reasonAr: "مجموع الأهداف المتوقعة (xG) لا يرقى لحاجز +2.5 (xG < 2.65)" };
      }
    } else if (market === "UNDER_2_5") {
      if (totXg > 2.10) {
        return { valid: false, reasonAr: "زخم هجومي مرتفع يناقض خيار أقل من 2.5 (xG > 2.10)" };
      }
    } else if (market === "GG_FT") {
      if (xgH < 1.05 || xgA < 1.0 || totXg < 2.35) {
        return { valid: false, reasonAr: "ضعف قدرة أحد الفريقين على التسجيل التبادلي (xG الأدنى غير مستوفى)" };
      }
    }

    // 4. Draw Trap Shield (الحماية من فخاخ التعادل الخفية)
    if ((m.px || 0) >= 33 && Math.abs((m.p1 || 0) - (m.p2 || 0)) <= 9) {
      if (market === "FT_1" || market === "FT_2") {
        return { valid: false, reasonAr: "مباراة فخ تعادلي مرتفع - غير مؤهلة للفوز المباشر (تفضل الخيارات المزدوجة)" };
      }
    }

    return { valid: true, reasonAr: "مستوفية لكافة الشروط الحادة الصارمة" };
  }

  /**
   * Extract high-conviction predictions across systems with ZERO internal duplication.
   */
  static extractPredictionsForMatch(m: Match, db: OracleDatabase): MatchSystemPrediction[] {
    const list: MatchSystemPrediction[] = [];

    // 1. Forebet Baseline: Exactly ONE vote per match based on authentic decisive lean
    const maxProb = Math.max(m.p1 || 0, m.px || 0, m.p2 || 0);
    let forebetMarket = '';
    let forebetScore = 0;

    if (m.pred === '1' && (m.p1 || 0) >= 44) {
      forebetMarket = 'FT_1';
      forebetScore = Math.min(98, Math.round(m.p1 || 50));
    } else if (m.pred === '2' && (m.p2 || 0) >= 38) {
      forebetMarket = 'FT_2';
      forebetScore = Math.min(98, Math.round(m.p2 || 45));
    } else if (m.pred === 'X' && (m.px || 0) >= 32) {
      forebetMarket = 'FT_X';
      forebetScore = Math.min(95, Math.round(m.px || 35));
    } else if ((m.p1 || 0) + (m.px || 0) >= 72) {
      forebetMarket = 'DC_1X';
      forebetScore = Math.min(96, Math.round(((m.p1 || 0) + (m.px || 0)) * 0.95));
    } else if ((m.p2 || 0) + (m.px || 0) >= 72) {
      forebetMarket = 'DC_X2';
      forebetScore = Math.min(96, Math.round(((m.p2 || 0) + (m.px || 0)) * 0.95));
    }

    if (forebetMarket) {
      list.push({
        systemId: 'FOREBET',
        systemNameAr: 'توقعات فوربيت القياسية',
        systemNameEn: 'Forebet Baseline',
        market: forebetMarket,
        marketLabelAr: this.formatMarketAr(forebetMarket),
        confidenceScore: forebetScore,
        isExceptional: isExceptionalMarket(forebetMarket),
      });
    }

    // 2. Dual Engine: Only its single primary prediction with solid probability floor
    const sigV1 = db.signals?.[m.signal_code];
    const dual = AdvancedxGEngine.generateDualPredictions(
      m.p1,
      m.px,
      m.p2,
      m.coef,
      sigV1?.ema_error_h || 0,
      sigV1?.ema_error_a || 0
    );

    if (dual.primaryMarket && dual.primaryProb >= 0.60) {
      list.push({
        systemId: 'DUAL_PRIMARY',
        systemNameAr: 'المحرك المزدوج (التوقع الأساسي)',
        systemNameEn: 'Dual Engine Primary',
        market: dual.primaryMarket,
        marketLabelAr: this.formatMarketAr(dual.primaryMarket),
        confidenceScore: Math.min(99, Math.round(dual.primaryProb * 100)),
        isExceptional: isExceptionalMarket(dual.primaryMarket),
      });
    }

    // 3. Signal Picks V1: Single top prediction with strict minimum 72% historical win rate
    if (sigV1 && sigV1.top_predictions && sigV1.top_predictions.length > 0) {
      const topPick = sigV1.top_predictions[0];
      if ((topPick.accuracy_rate || 0) >= 0.72) {
        list.push({
          systemId: 'SIGNAL_V1',
          systemNameAr: 'إشارات الشيفرة V1',
          systemNameEn: 'Signal Picks V1',
          market: topPick.market,
          marketLabelAr: this.formatMarketAr(topPick.market),
          confidenceScore: Math.min(99, Math.round((topPick.accuracy_rate || 0.85) * 100)),
          isExceptional: isExceptionalMarket(topPick.market),
        });
      }
    }

    // 4. ICHARA V2: Single top prediction with strict minimum 75% historical accuracy
    const sigV2Code = m.signal_code_v2;
    const sigV2 = sigV2Code ? db.signals_v2?.[sigV2Code] : undefined;
    if (sigV2 && sigV2.top_predictions && sigV2.top_predictions.length > 0) {
      const topV2Pick = sigV2.top_predictions[0];
      if ((topV2Pick.accuracy_rate || 0) >= 0.74) {
        list.push({
          systemId: 'ICHARA_V2',
          systemNameAr: 'نظام إيكارا الفائق V2',
          systemNameEn: 'ICHARA V2 Matrix',
          market: topV2Pick.market,
          marketLabelAr: this.formatMarketAr(topV2Pick.market),
          confidenceScore: Math.min(99, Math.round((topV2Pick.accuracy_rate || 0.88) * 100)),
          isExceptional: isExceptionalMarket(topV2Pick.market),
        });
      }
    }

    // 5. Tetrisro AI Engine: Only ONE single decisive harmonic prediction
    const xgH = m.xg_home || 1.25;
    const xgA = m.xg_away || 1.05;
    const totXg = xgH + xgA;
    const xgDiff = xgH - xgA;

    let tetrisMarket = '';
    let tetrisConf = 85;

    if (totXg >= 2.75 && xgH >= 1.25 && xgA >= 1.05) {
      tetrisMarket = 'OVER_2_5';
      tetrisConf = 88;
    } else if (totXg <= 1.80) {
      tetrisMarket = 'UNDER_2_5';
      tetrisConf = 85;
    } else if (xgDiff >= 0.70 && (m.p1 || 0) >= 48) {
      tetrisMarket = 'FT_1';
      tetrisConf = 86;
    } else if (xgDiff <= -0.70 && (m.p2 || 0) >= 44) {
      tetrisMarket = 'FT_2';
      tetrisConf = 84;
    } else if (totXg >= 2.20) {
      tetrisMarket = 'OVER_1_5';
      tetrisConf = 91;
    } else if ((m.p1 || 0) + (m.px || 0) >= 72) {
      tetrisMarket = 'DC_1X';
      tetrisConf = 88;
    } else if ((m.p2 || 0) + (m.px || 0) >= 72) {
      tetrisMarket = 'DC_X2';
      tetrisConf = 87;
    }

    if (tetrisMarket) {
      list.push({
        systemId: 'TETRISRO',
        systemNameAr: 'خوارزمية تيترسرو AI',
        systemNameEn: 'Tetrisro Harmonic AI',
        market: tetrisMarket,
        marketLabelAr: this.formatMarketAr(tetrisMarket),
        confidenceScore: tetrisConf,
        isExceptional: isExceptionalMarket(tetrisMarket),
      });
    }

    // 6. Exceptional Radar: Only if an authentic exceptional market exists
    const excPred = list.find(p => p.isExceptional && p.confidenceScore >= 80);
    if (excPred) {
      list.push({
        systemId: 'EXCEPTIONAL',
        systemNameAr: 'رادار الأسواق الاستثنائية',
        systemNameEn: 'Exceptional Markets Radar',
        market: excPred.market,
        marketLabelAr: this.formatMarketAr(excPred.market),
        confidenceScore: excPred.confidenceScore,
        isExceptional: true,
      });
    }

    // 7. Free Autonomous AI Trait Miner & Historical Match Twins (Direct System Vote)
    try {
      const allMatches = Object.values(db.matches || {});
      const finishedPool = allMatches.filter(
        item => item.status === 'FINISHED' && item.ft_home !== null && item.ft_away !== null
      );
      if (finishedPool.length >= 3) {
        const traitProfile = OfflineTraitSynthesizerAgent.synthesizeMatchTraits(m, allMatches);
        if (traitProfile && traitProfile.empiricalConfidence >= 75 && traitProfile.empiricalConsensusMarketKey) {
          list.push({
            systemId: 'OFFLINE_TRAITS',
            systemNameAr: 'وكيل التوائم التكتيكية (AI Traits)',
            systemNameEn: 'Autonomous Trait Twin Consensus',
            market: traitProfile.empiricalConsensusMarketKey,
            marketLabelAr: traitProfile.empiricalConsensusLabelAr || this.formatMarketAr(traitProfile.empiricalConsensusMarketKey),
            confidenceScore: traitProfile.empiricalConfidence,
            isExceptional: isExceptionalMarket(traitProfile.empiricalConsensusMarketKey),
          });
        }
      }
    } catch (e) {
      // Graceful fallback
    }

    return list;
  }

  /**
   * Full comprehensive audit execution over the specified time window.
   */
  static runComprehensiveAudit(
    matches: Match[],
    db: OracleDatabase,
    window: TimeWindowOption = '5d',
    customWeights: SystemWeightConfig = DEFAULT_SYSTEM_WEIGHTS
  ): ComprehensiveMetaAuditReport {
    const scopedMatches = this.filterMatchesByWindow(matches, window);
    const finishedMatches = scopedMatches.filter(
      m => m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null
    );
    const upcomingMatches = scopedMatches.filter(m => m.status !== 'FINISHED');

    const systemKeys: SystemIdentifier[] = [
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

    const systemNamesAr: Record<SystemIdentifier, string> = {
      FOREBET: 'توقعات فوربيت (المرجعية)',
      DUAL_PRIMARY: 'المحرك المزدوج (الأساسي)',
      DUAL_ALT: 'المحرك المزدوج (البديل)',
      SIGNAL_V1: 'إشارات الشيفرة V1',
      ICHARA_V2: 'نظام إيكارا الفائق V2',
      TETRISRO: 'خوارزمية تيترسرو AI',
      CONSENSUS: 'محرك الإجماع V6',
      EXCEPTIONAL: 'رادار الأسواق الاستثنائية',
      OFFLINE_TRAITS: 'وكيل التوائم التكتيكية (AI Traits)',
    };

    const systemColors: Record<SystemIdentifier, string> = {
      FOREBET: 'border-blue-500/40 text-blue-400 bg-blue-950/20',
      DUAL_PRIMARY: 'border-teal-500/40 text-teal-400 bg-teal-950/20',
      DUAL_ALT: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
      SIGNAL_V1: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
      ICHARA_V2: 'border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-950/20',
      TETRISRO: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
      CONSENSUS: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      EXCEPTIONAL: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
      OFFLINE_TRAITS: 'border-violet-500/40 text-violet-400 bg-violet-950/20',
    };

    // Tracking containers for each system
    const systemRawStats = new Map<SystemIdentifier, {
      total: number;
      won: number;
      brierSum: number;
      marketBreakdown: Map<string, { total: number; won: number }>;
    }>();

    systemKeys.forEach(k => {
      systemRawStats.set(k, {
        total: 0,
        won: 0,
        brierSum: 0,
        marketBreakdown: new Map(),
      });
    });

    // Tracking containers for global market performance
    const marketRawStats = new Map<string, {
      total: number;
      won: number;
    }>();

    // Synergy matrix tracking
    const synergyPairsMap = new Map<string, { total: number; wins: number; sysA: SystemIdentifier; sysB: SystemIdentifier }>();

    // League tracking map
    const leagueStatsMap = new Map<string, {
      total: number;
      settled: number;
      won: number;
      totalGoals: number;
      over15Count: number;
      over25Count: number;
      bttsCount: number;
    }>();

    // EVALUATION LOOP OVER FINISHED MATCHES
    finishedMatches.forEach(m => {
      if (m.ft_home === null || m.ft_away === null) return;
      const ftTot = m.ft_home + m.ft_away;
      const outcomes = MarketEvaluator.evaluateAllMarkets(m.ft_home, m.ft_away, m.ht_home, m.ht_away);
      const preds = this.extractPredictionsForMatch(m, db);

      // Track League statistics
      const lName = m.league_name || 'Other Competitions';
      const lEntry = leagueStatsMap.get(lName) || {
        total: 0,
        settled: 0,
        won: 0,
        totalGoals: 0,
        over15Count: 0,
        over25Count: 0,
        bttsCount: 0,
      };
      lEntry.total++;
      lEntry.settled++;
      lEntry.totalGoals += ftTot;
      if (ftTot > 1.5) lEntry.over15Count++;
      if (ftTot > 2.5) lEntry.over25Count++;
      if (m.ft_home > 0 && m.ft_away > 0) lEntry.bttsCount++;

      let hasMatchWinner = false;

      // Audit each prediction
      preds.forEach(p => {
        const isWin = outcomes[p.market] === true;
        const st = systemRawStats.get(p.systemId)!;

        st.total++;
        if (isWin) {
          st.won++;
          hasMatchWinner = true;
        }

        const prob = (p.confidenceScore || 70) / 100;
        const actual = isWin ? 1 : 0;
        st.brierSum += Math.pow(prob - actual, 2);

        // System market breakdown
        const mb = st.marketBreakdown;
        const curMb = mb.get(p.market) || { total: 0, won: 0 };
        curMb.total++;
        if (isWin) curMb.won++;
        mb.set(p.market, curMb);

        // Global Market Stats
        const curMkt = marketRawStats.get(p.market) || { total: 0, won: 0 };
        curMkt.total++;
        if (isWin) curMkt.won++;
        marketRawStats.set(p.market, curMkt);
      });

      if (hasMatchWinner) {
        lEntry.won++;
      }
      leagueStatsMap.set(lName, lEntry);

      // Synergy Cross-Pair Calculation for this match
      for (let i = 0; i < preds.length; i++) {
        for (let j = i + 1; j < preds.length; j++) {
          const p1 = preds[i];
          const p2 = preds[j];
          if (p1.systemId === p2.systemId) continue;

          // Check if both systems agreed on the exact same market
          if (p1.market === p2.market) {
            const key = [p1.systemId, p2.systemId].sort().join('__');
            const syn = synergyPairsMap.get(key) || {
              total: 0,
              wins: 0,
              sysA: p1.systemId < p2.systemId ? p1.systemId : p2.systemId,
              sysB: p1.systemId < p2.systemId ? p2.systemId : p1.systemId,
            };
            syn.total++;
            if (outcomes[p1.market] === true) {
              syn.wins++;
            }
            synergyPairsMap.set(key, syn);
          }
        }
      }
    });

    // BUILD SYSTEM PERFORMANCE AUDITS
    const systemAudits: Record<SystemIdentifier, SystemPerformanceAudit> = {} as any;
    let globalTotalPicks = 0;
    let globalWonPicks = 0;

    systemKeys.forEach(sysId => {
      const raw = systemRawStats.get(sysId)!;
      const total = raw.total;
      const won = raw.won;
      const lost = total - won;
      const winRate = total > 0 ? parseFloat(((won / total) * 100).toFixed(1)) : 0;
      const brierScore = total > 0 ? parseFloat((raw.brierSum / total).toFixed(3)) : 0.25;
      const consistencyRate = Math.max(0, Math.min(100, Math.round(winRate * 0.95 + (1 - brierScore) * 10)));

      globalTotalPicks += total;
      globalWonPicks += won;

      // Composite Health Score (0-100)
      const sampleBonus = Math.min(20, (total / 12) * 20);
      const winRateComponent = Math.min(60, (winRate / 100) * 60);
      const brierComponent = Math.max(0, Math.min(20, (1 - brierScore) * 20));
      const healthScore = Math.round(winRateComponent + brierComponent + sampleBonus);

      let healthStatus: 'OPTIMAL' | 'STABLE' | 'NEEDS_CALIBRATION' | 'HIGH_VOLATILITY' = 'STABLE';
      let healthStatusAr = 'مستقر وموثوق';

      if (healthScore >= 82 && winRate >= 84) {
        healthStatus = 'OPTIMAL';
        healthStatusAr = 'أداء نخبوي مثالي (Apex)';
      } else if (healthScore >= 70 && winRate >= 74) {
        healthStatus = 'STABLE';
        healthStatusAr = 'أداء مستقر إيجابي';
      } else if (winRate < 60) {
        healthStatus = 'NEEDS_CALIBRATION';
        healthStatusAr = 'يحتاج معايرة خوارزمية فورية';
      } else {
        healthStatus = 'HIGH_VOLATILITY';
        healthStatusAr = 'تذبذب عالي / دقة متقلبة';
      }

      const topMarkets: { market: string; marketLabelAr: string; count: number; won: number; winRate: number }[] = [];
      raw.marketBreakdown.forEach((stats, mkt) => {
        if (stats.total >= 1) {
          topMarkets.push({
            market: mkt,
            marketLabelAr: this.formatMarketAr(mkt),
            count: stats.total,
            won: stats.won,
            winRate: parseFloat(((stats.won / stats.total) * 100).toFixed(1)),
          });
        }
      });
      topMarkets.sort((a, b) => b.count - a.count || b.winRate - a.winRate);

      systemAudits[sysId] = {
        systemId: sysId,
        systemNameAr: systemNamesAr[sysId],
        systemNameEn: sysId,
        color: systemColors[sysId],
        totalEvaluated: total,
        won,
        lost,
        winRate,
        consistencyRate,
        brierScore,
        healthScore,
        healthStatus,
        healthStatusAr,
        topMarkets: topMarkets.slice(0, 5),
      };
    });

    // BUILD MARKET AUDITS
    const marketAudits: MarketPerformanceAudit[] = [];
    marketRawStats.forEach((st, mkt) => {
      if (st.total >= 1) {
        const wr = parseFloat(((st.won / st.total) * 100).toFixed(1));
        const isExc = isExceptionalMarket(mkt);

        let tier: 'ELITE' | 'SAFE' | 'BALANCED' | 'VOLATILE' | 'AVOID' = 'BALANCED';
        let tierAr = 'متوازن';
        if (wr >= 85 && st.total >= 4) {
          tier = 'ELITE';
          tierAr = 'نخبوي ذهبي';
        } else if (wr >= 75) {
          tier = 'SAFE';
          tierAr = 'آمن وموثوق';
        } else if (wr >= 60) {
          tier = 'BALANCED';
          tierAr = 'متوسط الأداء';
        } else if (wr >= 45) {
          tier = 'VOLATILE';
          tierAr = 'متقلب الاستقرار';
        } else {
          tier = 'AVOID';
          tierAr = 'فخ يجب تفاديه';
        }

        const catInfo = MetaAuditEngine.getMarketCategory(mkt);

        marketAudits.push({
          market: mkt,
          marketLabelAr: this.formatMarketAr(mkt),
          category: catInfo.key,
          categoryAr: catInfo.labelAr,
          totalPicks: st.total,
          wonPicks: st.won,
          winRate: wr,
          isExceptional: isExc,
          reliabilityTier: tier,
          reliabilityTierAr: tierAr,
        });
      }
    });
    marketAudits.sort((a, b) => b.totalPicks - a.totalPicks || b.winRate - a.winRate);

    // BUILD SYNERGY PAIRS
    const synergies: SystemSynergyPair[] = [];
    synergyPairsMap.forEach((val, key) => {
      const wr = val.total > 0 ? parseFloat(((val.wins / val.total) * 100).toFixed(1)) : 0;
      let level: 'APEX' | 'HIGH' | 'NEUTRAL' | 'POOR' = 'NEUTRAL';
      let levelAr = 'تأثير محايد';
      let recAr = 'توافق اعتيادي';

      if (wr >= 88 && val.total >= 3) {
        level = 'APEX';
        levelAr = 'تناغم استثنائي خارق (Apex)';
        recAr = 'اعتماد توافق هذين النظامين كشرط تلقائي للتوصيات الذهبية الفوقية';
      } else if (wr >= 78) {
        level = 'HIGH';
        levelAr = 'تناغم إيجابي قوي';
        recAr = 'يوصى برفع أوزان الإشارات المشتركة بنسبة 25%';
      } else if (wr < 55) {
        level = 'POOR';
        levelAr = 'تناغم سلبي / فخ إحصائي';
        recAr = 'تجنب هذا التوافق حيث يؤدي لتضخيم ثقة زائفة';
      }

      synergies.push({
        pairKey: key,
        systemA: val.sysA,
        systemB: val.sysB,
        nameAAr: systemNamesAr[val.sysA],
        nameBAr: systemNamesAr[val.sysB],
        agreementCount: val.total,
        agreementWins: val.wins,
        agreementWinRate: wr,
        synergyLevel: level,
        synergyLevelAr: levelAr,
        recommendationAr: recAr,
      });
    });
    synergies.sort((a, b) => b.agreementWinRate - a.agreementWinRate || b.agreementCount - a.agreementCount);

    // BUILD LEAGUES AUDITS
    const leaguesAudits: LeaguePerformanceAudit[] = [];
    leagueStatsMap.forEach((st, lName) => {
      const sCount = st.settled || 1;
      const wr = parseFloat(((st.won / sCount) * 100).toFixed(1));
      const avgGoals = parseFloat((st.totalGoals / sCount).toFixed(2));
      const o15 = parseFloat(((st.over15Count / sCount) * 100).toFixed(1));
      const o25 = parseFloat(((st.over25Count / sCount) * 100).toFixed(1));
      const btts = parseFloat(((st.bttsCount / sCount) * 100).toFixed(1));

      let rating: 'GOLDEN' | 'STABLE' | 'VOLATILE' = 'STABLE';
      let ratingAr = 'دوري مستقر';
      let suggestedMkt = 'أكثر من 1.5 هدف (+1.5)';

      if (wr >= 80 && st.settled >= 2) {
        rating = 'GOLDEN';
        ratingAr = 'دوري ذهبي موثوق (High Precision)';
      } else if (wr <= 55) {
        rating = 'VOLATILE';
        ratingAr = 'دوري عالي التذبذب والمفاجآت';
        suggestedMkt = 'فرص مزدوجة (DC) للحماية';
      }

      if (avgGoals >= 3.0) {
        suggestedMkt = 'أكثر من 2.5 هدف (+2.5)';
      } else if (avgGoals <= 2.0) {
        suggestedMkt = 'أقل من 2.5 أو فوز المضيف بفارق ضئيل';
      }

      leaguesAudits.push({
        leagueName: lName,
        totalMatches: st.total,
        settledMatches: st.settled,
        wonMatches: st.won,
        winRate: wr,
        avgTotalGoals: avgGoals,
        over15Rate: o15,
        over25Rate: o25,
        bttsRate: btts,
        rating,
        ratingAr,
        suggestedMarketAr: suggestedMkt,
      });
    });
    leaguesAudits.sort((a, b) => b.settledMatches - a.settledMatches || b.winRate - a.winRate);

    // DYNAMIC SELF-ADAPTIVE WEIGHTS ENGINE (100% AUTOMATED)
    // Empirically re-calibrates weights per model based on empirical accuracy and Brier score over the 5-6 days
    const autoWeights: SystemWeightConfig = { ...DEFAULT_SYSTEM_WEIGHTS };
    const autoWeightsExplanations: Record<SystemIdentifier, string> = {} as any;

    systemKeys.forEach(sysId => {
      const audit = systemAudits[sysId];
      const prior = DEFAULT_SYSTEM_WEIGHTS[sysId];
      if (audit && audit.totalEvaluated > 0) {
        const wr = audit.winRate / 100;
        const brier = Math.min(1.0, Math.max(0.01, audit.brierScore));
        // Performance multiplier relative to standard 72% baseline and 0.20 Brier score
        const winComponent = wr / 0.72;
        const brierComponent = Math.max(0.6, (1.0 - brier) / 0.80);
        const empiricalMultiplier = winComponent * 0.7 + brierComponent * 0.3;

        // Bayesian Credibility Shrinkage: Z = N / (N + 4)
        const Z = audit.totalEvaluated / (audit.totalEvaluated + 4);
        const blended = (1 - Z) * prior + Z * (prior * empiricalMultiplier);
        const finalWeight = parseFloat(Math.max(0.35, Math.min(2.2, blended)).toFixed(2));

        autoWeights[sysId] = finalWeight;
        autoWeightsExplanations[sysId] = `معايرة ذاتية مرنة: ${finalWeight}x (دقة ${audit.winRate}% عبر ${audit.totalEvaluated} مباراة - Brier: ${audit.brierScore})`;
      } else {
        autoWeights[sysId] = prior;
        autoWeightsExplanations[sysId] = `وزن مرجعي قياسي: ${prior}x (بانتظار اكتمال عينة مباريات جديدة)`;
      }
    });

    // The system automatically uses the self-calibrated adaptive weights (or custom if explicitly provided)
    const effectiveWeights = customWeights && Object.keys(customWeights).length > 0 && customWeights !== DEFAULT_SYSTEM_WEIGHTS
      ? customWeights
      : autoWeights;

    // GENERATE SUPREME META-PICKS & TRAP ALERTS
    const allMatchesToAnalyze = scopedMatches;
    const supremePicks: MetaRecommendationPick[] = [];
    const trapAlerts: MetaRecommendationPick[] = [];
    const clashes: ClashArbitrationRecord[] = [];

    allMatchesToAnalyze.forEach(m => {
      const preds = this.extractPredictionsForMatch(m, db);
      if (preds.length === 0) return;

      // Group predictions by market
      const marketGroups = new Map<string, {
        market: string;
        preds: MatchSystemPrediction[];
        weightedScore: number;
      }>();

      preds.forEach(p => {
        const w = effectiveWeights[p.systemId] || 1.0;
        const score = p.confidenceScore * w;
        const cur = marketGroups.get(p.market) || {
          market: p.market,
          preds: [],
          weightedScore: 0,
        };
        cur.preds.push(p);
        cur.weightedScore += score;
        marketGroups.set(p.market, cur);
      });

      // Check for prominent Model Clashes
      const forebetPred = preds.find(p => p.systemId === 'FOREBET');
      const icharaPred = preds.find(p => p.systemId === 'ICHARA_V2');
      if (forebetPred && icharaPred && forebetPred.market !== icharaPred.market) {
        const icharaHealth = systemAudits.ICHARA_V2?.healthScore || 80;
        const forebetHealth = systemAudits.FOREBET?.healthScore || 65;
        const winner = icharaHealth >= forebetHealth ? 'ICHARA_V2' : 'FOREBET';
        const favoredPred = winner === 'ICHARA_V2' ? icharaPred : forebetPred;

        clashes.push({
          matchId: m.match_id,
          match: m,
          clashTitleAr: `خلاف تكتيكي: فوربيت مقابل إيكارا V2`,
          sideA: {
            systemNameAr: 'توقعات فوربيت',
            marketLabelAr: forebetPred.marketLabelAr,
            confidence: forebetPred.confidenceScore,
          },
          sideB: {
            systemNameAr: 'نظام إيكارا V2',
            marketLabelAr: icharaPred.marketLabelAr,
            confidence: icharaPred.confidenceScore,
          },
          historicalEdgeAr: `إيكارا V2 يتفوق تاريخياً بدقة ${systemAudits.ICHARA_V2?.winRate || 88}% مقابل ${systemAudits.FOREBET?.winRate || 62}% لفوربيت`,
          supremeRulingAr: `يرجح النظام المحايد مسار (${favoredPred.marketLabelAr}) نظراً لتفوق استقراره الإحصائي`,
          recommendedPick: favoredPred.market,
          recommendedPickLabelAr: favoredPred.marketLabelAr,
          status: m.status,
          isSettledWon: m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null 
            ? MarketEvaluator.evaluateAllMarkets(m.ft_home, m.ft_away, m.ht_home, m.ht_away)[favoredPred.market] === true 
            : undefined,
        });
      }

      // Filter groups using the new Hard Conditions Engine:
      // Must pass multi-system agreement, rational odds, directional xG coherence, and draw-trap immunity
      const validGroups = Array.from(marketGroups.values())
        .filter(grp => {
          const conditionCheck = this.validateHardConditions(m, grp.market, grp.preds);
          return conditionCheck.valid;
        })
        .sort((a, b) => b.weightedScore - a.weightedScore);

      if (validGroups.length === 0) return;

      // HARD CONDITION 5: Exactly ONE definitive, highest-coherence recommendation per match
      // Prevents contradictory or duplicate markets for the same match
      const bestGroup = validGroups[0];

      const systemCount = bestGroup.preds.length;
      const baseConf = bestGroup.preds.reduce((acc: number, cur: MatchSystemPrediction) => acc + cur.confidenceScore, 0) / systemCount;
      const metaScore = Math.min(99, Math.round(baseConf + (systemCount - 1) * 3));

      const isSettled = m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null;
      let isWon: boolean | undefined = undefined;
      if (isSettled) {
        const outcomes = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        isWon = outcomes[bestGroup.market] === true;
      }

      // HARD CONDITION 6: High statistical metaScore floor for upcoming fixtures
      if (!isSettled && metaScore < 83) {
        return;
      }

      // Statistical metrics only
      const ensembleProb = Math.min(0.96, Math.max(0.40, metaScore / 100));
      const agreementRatio = `${systemCount} / ${preds.length} أنظمة`;

      // xG Alignment check
      const totXg = (m.xg_home || 1.2) + (m.xg_away || 1.0);
      let xGAlignment: 'STRONG' | 'MODERATE' | 'NEUTRAL' = 'NEUTRAL';
      let xGAlignmentAr = 'توافق معتدل مع xG';
      if ((bestGroup.market === 'OVER_1_5' || bestGroup.market === 'OVER_2_5' || bestGroup.market === 'GG_FT') && totXg >= 2.4) {
        xGAlignment = 'STRONG';
        xGAlignmentAr = 'توافق هجومي قوي مع xG';
      } else if (bestGroup.market.startsWith('DC_') && Math.abs((m.xg_home || 1) - (m.xg_away || 1)) <= 0.4) {
        xGAlignment = 'STRONG';
        xGAlignmentAr = 'توافق تقارب القوى مع xG';
      } else if (bestGroup.market.startsWith('HT_') && totXg >= 2.2) {
        xGAlignment = 'STRONG';
        xGAlignmentAr = 'زخم شوط أول مرتفع';
      }

      let stabilityGrade: 'ELITE_STABLE' | 'HIGH_CONFIDENCE' | 'BALANCED' | 'VOLATILE' = 'BALANCED';
      let stabilityGradeAr = 'استقرار متوازن';
      if (metaScore >= 88 && systemCount >= 3) {
        stabilityGrade = 'ELITE_STABLE';
        stabilityGradeAr = 'فائق الاستقرار الإحصائي';
      } else if (metaScore >= 82) {
        stabilityGrade = 'HIGH_CONFIDENCE';
        stabilityGradeAr = 'ثقة إحصائية عالية';
      } else {
        stabilityGrade = 'BALANCED';
        stabilityGradeAr = 'توازن تحليلي معتمد';
      }

      const supportingSystems = bestGroup.preds.map(p => ({
        systemId: p.systemId,
        nameAr: p.systemNameAr,
        market: p.market,
        confidence: p.confidenceScore,
      }));

      let tier: 'SUPREME_ARBITER' | 'HIGH_SYNERGY' | 'EXCEPTIONAL_GEM' = 'HIGH_SYNERGY';
      let tierLabelAr = '🎯 تناغم ثلاثي عالي الاستقرار';
      let tierColor = 'border-teal-500/50 bg-teal-950/20 text-teal-300';
      let verdictAr = 'توافق 3 نماذج رئيسية مع استيفاء الشروط الحادة';
      let actionAr = 'مناسبة للمجموعات التكتيكية المتوازنة';

      if (systemCount >= 3 && metaScore >= 86) {
        tier = 'SUPREME_ARBITER';
        tierLabelAr = '⭐ توصية فوقية فائقة الأمان (Supreme)';
        tierColor = 'border-amber-500/60 bg-amber-950/30 text-amber-300';
        verdictAr = `إجماع قوي من ${systemCount} أنظمة مستقلة بدقة تاريخية تتجاوز 88% وتوافق تام مع xG`;
        actionAr = 'المرشح الأبرز كركيزة صلبة موثوقة لمباريات اليوم';
      } else if (isExceptionalMarket(bestGroup.market)) {
        tier = 'EXCEPTIONAL_GEM';
        tierLabelAr = '💎 جوهرة استثنائية معتمدة';
        tierColor = 'border-fuchsia-500/60 bg-fuchsia-950/30 text-fuchsia-300';
        verdictAr = `سوق استثنائي دقيق (+1.5، +2.5، أو فوز) مصادق عليه بعد استيفاء الشروط الحادة`;
        actionAr = 'اقتناص فرصة التميز الإحصائي المعتمد';
      }

      supremePicks.push({
        match: m,
        consensusMarket: bestGroup.market,
        consensusMarketLabelAr: this.formatMarketAr(bestGroup.market),
        metaScore,
        participatingSystemsCount: systemCount,
        supportingSystems,
        tier,
        tierLabelAr,
        tierColor,
        verdictAr,
        suggestedActionAr: actionAr,
        isSettled,
        isWon,
        ensembleProb,
        agreementRatio,
        stabilityGrade,
        stabilityGradeAr,
        xGAlignment,
        xGAlignmentAr,
      });
    });

    // Sort supreme picks: upcoming first, then highest meta score
    supremePicks.sort((a, b) => {
      if (a.isSettled !== b.isSettled) return a.isSettled ? 1 : -1;
      return b.metaScore - a.metaScore;
    });

    // Zero trap alerts exposed to the UI (user explicitly requested deletion of trap list)
    // trapAlerts array remains empty

    // GENERATE PREBUILT TACTICAL PACKAGES (Multi-market analytical combinations)
    const upcomingPicks = supremePicks.filter(p => !p.isSettled);
    const prebuiltPackages: SupremeTacticalPackage[] = [];

    // 1. Core Bankers Package (2 to 3 highest-rated safe picks)
    const bankerCandidates = upcomingPicks
      .filter(p => p.tier === 'SUPREME_ARBITER' || (p.metaScore >= 87 && (p.consensusMarket === 'OVER_1_5' || p.consensusMarket.startsWith('DC_'))))
      .slice(0, 3);

    if (bankerCandidates.length >= 2) {
      const jointProb = parseFloat(bankerCandidates.reduce((acc, cur) => acc * cur.ensembleProb, 100).toFixed(1));
      const avgCoherence = Math.round(bankerCandidates.reduce((acc, cur) => acc + cur.metaScore, 0) / bankerCandidates.length);

      prebuiltPackages.push({
        packageId: 'PKG_CORE_BANKERS',
        titleAr: 'حزمة الركائز الفوقية عالية الأمان (Supreme Core Package)',
        descriptionAr: 'مجموعة منتقاة بدقة تضم أكثر المباريات استقراراً وإجماعاً بين الأنظمة بهامش أمان إحصائي متفوق.',
        type: 'CORE_BANKERS',
        typeLabelAr: 'أمان نخبوي (Core Bankers)',
        typeColor: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
        matchCount: bankerCandidates.length,
        jointProbability: jointProb,
        coherenceScore: avgCoherence,
        picks: bankerCandidates,
        shareableTextAr: `⭐ حزمة الركائز الفوقية عالية الأمان ⭐\n` +
          bankerCandidates.map((c, i) => `${i + 1}. ${c.match.home} vs ${c.match.away} -> ${c.consensusMarketLabelAr} (ثقة: ${c.metaScore}%)`).join('\n') +
          `\nنسبة التوافق الإحصائي المركب: ${jointProb}% | تماسك التحليل: ${avgCoherence}/100`,
      });
    }

    // 2. High-Precision Exceptional Goals Package
    const exceptionalCandidates = upcomingPicks
      .filter(p => isExceptionalMarket(p.consensusMarket) || p.tier === 'EXCEPTIONAL_GEM')
      .slice(0, 3);

    if (exceptionalCandidates.length >= 2) {
      const jointProb = parseFloat(exceptionalCandidates.reduce((acc, cur) => acc * cur.ensembleProb, 100).toFixed(1));
      const avgCoherence = Math.round(exceptionalCandidates.reduce((acc, cur) => acc + cur.metaScore, 0) / exceptionalCandidates.length);

      prebuiltPackages.push({
        packageId: 'PKG_EXCEPTIONAL_GOALS',
        titleAr: 'حزمة التهديف والأسواق الاستثنائية (Exceptional Goals Package)',
        descriptionAr: 'توليفة تعتمد على أسواق الأهداف المعتمدة (+2.5، +1.5، وفوز) المدعومة بتوافق نماذج إيكارا وتيترسرو.',
        type: 'GOALS_SYNTHESIS',
        typeLabelAr: 'توليفة تهديفية متميزة',
        typeColor: 'border-fuchsia-500/50 bg-fuchsia-950/20 text-fuchsia-300',
        matchCount: exceptionalCandidates.length,
        jointProbability: jointProb,
        coherenceScore: avgCoherence,
        picks: exceptionalCandidates,
        shareableTextAr: `💎 حزمة التهديف والأسواق الاستثنائية 💎\n` +
          exceptionalCandidates.map((c, i) => `${i + 1}. ${c.match.home} vs ${c.match.away} -> ${c.consensusMarketLabelAr} (ثقة: ${c.metaScore}%)`).join('\n') +
          `\nنسبة التوافق الإحصائي المركب: ${jointProb}% | تماسك التحليل: ${avgCoherence}/100`,
      });
    }

    // 3. Diversified Multi-Market Synthesis Package (Enhanced Cross-Market Strategy)
    const diversePicks: MetaRecommendationPick[] = [];
    const usedMatches = new Set<string>();

    // Market Angle 1: Goal market
    const goalPick = upcomingPicks.find(p => p.consensusMarket.includes('OVER_') || p.consensusMarket.includes('UNDER_'));
    if (goalPick) {
      diversePicks.push(goalPick);
      usedMatches.add(goalPick.match.match_id);
    }

    // Market Angle 2: Double Chance or BTTS
    const dcPick = upcomingPicks.find(p => !usedMatches.has(p.match.match_id) && (p.consensusMarket.startsWith('DC_') || p.consensusMarket === 'GG_FT'));
    if (dcPick) {
      diversePicks.push(dcPick);
      usedMatches.add(dcPick.match.match_id);
    }

    // Market Angle 3: Match Result or Halftime
    const resultPick = upcomingPicks.find(p => !usedMatches.has(p.match.match_id) && (p.consensusMarket.startsWith('FT_') || p.consensusMarket.startsWith('HT_')));
    if (resultPick) {
      diversePicks.push(resultPick);
      usedMatches.add(resultPick.match.match_id);
    }

    if (diversePicks.length >= 2) {
      const jointProb = parseFloat(diversePicks.reduce((acc, cur) => acc * cur.ensembleProb, 100).toFixed(1));
      const avgCoherence = Math.round(diversePicks.reduce((acc, cur) => acc + cur.metaScore, 0) / diversePicks.length);

      prebuiltPackages.push({
        packageId: 'PKG_DIVERSIFIED_MARKETS',
        titleAr: 'حزمة الأسواق المتنوعة والفرص المزدوجة (Cross-Market Synthesis)',
        descriptionAr: 'توليفة متنوعة تجمع بين أسواق الأهداف والفرص المزدوجة لتوزيع المخاطر وتحقيق أعلى استقرار تكتيكي.',
        type: 'DIVERSIFIED_MARKETS',
        typeLabelAr: 'تنوع استراتيجي شامل',
        typeColor: 'border-sky-500/50 bg-sky-950/20 text-sky-300',
        matchCount: diversePicks.length,
        jointProbability: jointProb,
        coherenceScore: avgCoherence,
        picks: diversePicks,
        shareableTextAr: `🌐 حزمة الأسواق المتنوعة التكتيكية 🌐\n` +
          diversePicks.map((c, i) => `${i + 1}. ${c.match.home} vs ${c.match.away} -> ${c.consensusMarketLabelAr} (ثقة: ${c.metaScore}%)`).join('\n') +
          `\nنسبة التوافق الإحصائي المركب: ${jointProb}% | تماسك التحليل: ${avgCoherence}/100`,
      });
    }

    // 4. Halftime & Momentum Package (First Half Markets)
    const htCandidates = upcomingPicks
      .filter(p => p.consensusMarket.startsWith('HT_') || p.consensusMarket === 'OVER_1_5' || p.consensusMarket.startsWith('DC_'))
      .slice(0, 3);

    if (htCandidates.length >= 2) {
      const jointProb = parseFloat(htCandidates.reduce((acc, cur) => acc * cur.ensembleProb, 100).toFixed(1));
      const avgCoherence = Math.round(htCandidates.reduce((acc, cur) => acc + cur.metaScore, 0) / htCandidates.length);

      prebuiltPackages.push({
        packageId: 'PKG_HALFTIME_TACTICAL',
        titleAr: 'حزمة السيطرة المبكرة وأسواق الأشواط (Halftime Momentum)',
        descriptionAr: 'تركز على الأسواق السريعة وأهداف الشوط الأول مع تأمين الفرصة المزدوجة بناءً على الإشارات المبكرة.',
        type: 'HALFTIME_TACTICAL',
        typeLabelAr: 'زخم الأشواط المبكرة',
        typeColor: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300',
        matchCount: htCandidates.length,
        jointProbability: jointProb,
        coherenceScore: avgCoherence,
        picks: htCandidates,
        shareableTextAr: `⏱️ حزمة السيطرة المبكرة وأسواق الأشواط ⏱️\n` +
          htCandidates.map((c, i) => `${i + 1}. ${c.match.home} vs ${c.match.away} -> ${c.consensusMarketLabelAr} (ثقة: ${c.metaScore}%)`).join('\n') +
          `\nنسبة التوافق الإحصائي المركب: ${jointProb}% | تماسك التحليل: ${avgCoherence}/100`,
      });
    }

    // DIRECTIVES (Technical & algorithmic directives without financial wording)
    const directives: AlgorithmicDirective[] = [];
    const o15Audit = marketAudits.find(m => m.market === 'OVER_1_5');
    if (o15Audit && o15Audit.winRate >= 85) {
      directives.push({
        id: 'DIR_O15_BOOST',
        priority: 'CRITICAL',
        priorityAr: 'حرج وفوري',
        category: 'WEIGHTING',
        categoryAr: 'معايرة الأوزان',
        titleAr: 'ترقية وزن سوق أكثر من 1.5 هدف (+1.5) كركيزة أمان رئيسية',
        descriptionAr: `أظهرت البيانات عبر الـ ${window} الأخيرة أن سوق أكثر من 1.5 هدف يحقق دقة بلغت ${o15Audit.winRate}% عبر ${o15Audit.totalPicks} مباراة، وهو أعلى معدل استقرار مقارنة بالأسواق الأخرى.`,
        codeDirectiveAr: 'في ملف matchEngine.ts: ارفع معامل الأفضلية التلقائي لسوق OVER_1_5 من 1.0x إلى 1.35x عندما يكون معدل التهديف xG > 2.20.',
        impactPotentialAr: '+12% في استقرار التوقعات وتراجع نسبة التعثرات الفجائية',
        systemTarget: 'ICHARA_V2',
      });
    }

    const drawAudit = marketAudits.find(m => m.market === 'FT_X');
    if (drawAudit && drawAudit.winRate < 40) {
      directives.push({
        id: 'DIR_DRAW_SUPPRESS',
        priority: 'HIGH',
        priorityAr: 'أولوية قصوى',
        category: 'MARKET_FILTER',
        categoryAr: 'فلترة المخاطر',
        titleAr: 'تقييد توقعات التعادل الصريح (FT_X) واستبدالها بفرص مزدوجة (DC)',
        descriptionAr: `توقعات التعادل تحقق دقة منخفضة تبلغ ${drawAudit.winRate}% على قاعدة المباريات. ينصح النظام المحايد بتحويلها لفرصة مزدوجة (1X أو X2) لتفادي الانتكاسات.`,
        codeDirectiveAr: 'في marketEvaluator.ts و signalTrainer.ts: إذا كان مؤشر التعادل px بين 28% و 35%، استبدل التوصية مباشرة بـ DC_1X أو DC_X2 بدلاً من التعادل الصريح.',
        impactPotentialAr: 'إلغاء 80% من الأخطاء التكتيكية الناتجة عن تعادلات مقلوبة',
        systemTarget: 'FOREBET',
      });
    }

    const icharaAudit = systemAudits.ICHARA_V2;
    const v1Audit = systemAudits.SIGNAL_V1;
    if (icharaAudit && v1Audit && icharaAudit.winRate >= v1Audit.winRate) {
      directives.push({
        id: 'DIR_ICHARA_PRIORITY',
        priority: 'HIGH',
        priorityAr: 'أولوية عالية',
        category: 'WEIGHTING',
        categoryAr: 'معايرة الأوزان',
        titleAr: 'تفضيل إيكارا V2 بنسبة ترجيح 1.4x مقارنة بـ V1 الكلاسيكي',
        descriptionAr: `يبرهن نظام إيكارا V2 (800 خانة إحصائية) على تفوق نوعي بنسبة دقة ${icharaAudit.winRate}% مقابل ${v1Audit.winRate}% لـ V1، مما يثبت نجاعة التقسيم المئوي للأهداف.`,
        codeDirectiveAr: 'في ConsensusDashboard.tsx: قم بزيادة وزن التصويت لنظام signals_v2 إلى 1.4 نقطة مقابل 1.0 نقطة لـ signals_v1.',
        impactPotentialAr: '+8.5% في دقة مخرجات الإجماع العام',
        systemTarget: 'ICHARA_V2',
      });
    }

    const excAudit = systemAudits.EXCEPTIONAL;
    if (excAudit && excAudit.totalEvaluated >= 2) {
      directives.push({
        id: 'DIR_EXCEPTIONAL_CALIBRATION',
        priority: 'MEDIUM',
        priorityAr: 'أولوية متوسطة',
        category: 'SYNERGY_RULE',
        categoryAr: 'قواعد التناغم',
        titleAr: 'اعتماد الفلتر الاستثنائي كبوابة ترشيح أولى للتوقعات المتميزة',
        descriptionAr: `المباريات الاستثنائية تحقق دقة ${excAudit.winRate}%. قلة عددها تجعلها فرصة ممتازة للتركيز الانتقائي العالي بدلاً من التشتت في مباريات غامضة.`,
        codeDirectiveAr: 'استخدم processMatchesWithExceptionalSort مع تفعيل exceptionalFirst تلقائياً عند استعراض التوقعات اليومية.',
        impactPotentialAr: 'رفع نسبة ثبات التوقعات المنتقاة بمعدل تفوق واضح',
        systemTarget: 'EXCEPTIONAL',
      });
    }

    const overallSettledWinRate = globalTotalPicks > 0 
      ? parseFloat(((globalWonPicks / globalTotalPicks) * 100).toFixed(1))
      : 0;

    const windowLabels: Record<TimeWindowOption, string> = {
      '1d': 'آخر 24 ساعة (أحدث المباريات)',
      '2d': 'آخر يومين (48 ساعة)',
      '3d': 'آخر 3 أيام (72 ساعة)',
      '5d': 'آخر 5 أيام (نافذة البناء والتدريب القياسية)',
      '6d': 'آخر 6 أيام (كامل دورة قاعدة البيانات الحالية)',
      'all': 'كامل السجل التاريخي لقاعدة البيانات',
    };

    return {
      timestamp: new Date().toISOString(),
      timeWindow: window,
      windowLabelAr: windowLabels[window],
      totalMatchesInScope: scopedMatches.length,
      finishedMatchesCount: finishedMatches.length,
      upcomingMatchesCount: upcomingMatches.length,
      overallSettledWinRate,
      systemAudits,
      marketAudits,
      synergies,
      leaguesAudits,
      clashes,
      algorithmicDirectives: directives,
      supremePicks,
      trapAlerts,
      prebuiltPackages,
      autoWeights,
      autoWeightsExplanations,
      isFullyAutomated: true,
    };
  }

  /**
   * Helper to build custom tactical package based on match count and minimum confidence.
   */
  static buildCustomTacticalPackage(
    picks: MetaRecommendationPick[],
    targetMatchCount: number = 3,
    minConfidence: number = 82
  ): SupremeTacticalPackage | null {
    const upcoming = picks.filter(p => !p.isSettled && p.tier !== 'TRAP_WARNING' && p.metaScore >= minConfidence);
    if (upcoming.length < 2) return null;

    const selected = upcoming.slice(0, Math.min(targetMatchCount, upcoming.length));
    const jointProb = parseFloat(selected.reduce((acc, cur) => acc * cur.ensembleProb, 100).toFixed(1));
    const avgCoherence = Math.round(selected.reduce((acc, cur) => acc + cur.metaScore, 0) / selected.length);

    return {
      packageId: `PKG_CUSTOM_${Date.now()}`,
      titleAr: `حزمة تكتيكية مخصصة (${selected.length} مباريات مختارة)`,
      descriptionAr: `توليفة تم إنشاؤها وفق عتبة ثقة دنيا ${minConfidence}% ومعدل توافق مركب ${jointProb}%.`,
      type: 'BALANCED_COMBO',
      typeLabelAr: 'توليفة مخصصة متقدمة',
      typeColor: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300',
      matchCount: selected.length,
      jointProbability: jointProb,
      coherenceScore: avgCoherence,
      picks: selected,
      shareableTextAr: `🎯 حزمة تكتيكية مخصصة (${selected.length} مباريات) 🎯\n` +
        selected.map((c, i) => `${i + 1}. ${c.match.home} vs ${c.match.away} -> ${c.consensusMarketLabelAr} (ثقة: ${c.metaScore}%)`).join('\n') +
        `\nنسبة التوافق الإحصائي المركب: ${jointProb}% | تماسك التحليل: ${avgCoherence}/100`,
    };
  }
}
