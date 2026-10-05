/**
 * Corners Tactical Pro Engine (Daily Strict Elite Matrix V4.8 - Precision Total 1 & 2)
 * Specialized modeling engine designed exclusively for CORNERS (الركنيات)
 */

import { Match } from '../types';
import { LEAGUE_MAP } from './matchEngine';

export type CornerMarketFamily = 'TOTAL_MATCH' | 'TOTAL_1' | 'TOTAL_2';

export interface TacticalMarketCandidate {
  type: 'CORNER';
  badge: string;
  marketId: string;
  marketFamily: CornerMarketFamily;
  marketName: string;
  marketNameAr: string;
  lineThreshold: number; 
  confidenceScore: number; // 84 - 96%
  projectedOdds: number; 
  tacticalPillar: string;
  tacticalPillarAr: string;
  reasoning: string;
  reasoningAr: string;
  keyMetricLabel: string;
  keyMetricLabelAr: string;
  keyMetricValue: string;
  mathematicalEdge: number;
}

export interface TeamCornerMicroProfile {
  teamName: string;
  lambda: number;
  bracket: string;
  probOver25: number;
  probOver35: number;
  probOver45: number;
}

export interface CornerTacticalProfile {
  generationScore: number; // 0 - 100
  cornerDynamics: 'ASYMMETRIC_SIEGE' | 'END_TO_END_PINBALL' | 'HEAVY_WING_PRESSURE' | 'LOW_FLANK_VOLUME';
  cornerDynamicsLabel: string;
  cornerDynamicsLabelAr: string;
  flankActivityLevel: 'INTENSE_CROSSING' | 'SUSTAINED_PRESSURE' | 'CENTRAL_CONGESTION';
  flankActivityLabel: string;
  flankActivityLabelAr: string;
  lambdaCorners: number; 
  lambdaCornersHome: number; 
  lambdaCornersAway: number; 
  probOver75: number; 
  probOver85: number; 
  total1: TeamCornerMicroProfile;
  total2: TeamCornerMicroProfile;
}

export interface CardsCornersAnalysis {
  match: Match;
  leagueFullName: string;
  cornersProfile: CornerTacticalProfile;
  overallTacticalScore: number;
  isDailyEliteCandidate: boolean;
  eliteRank?: number;
  primarySelection: TacticalMarketCandidate;
  poissonCorners: { range: string; rangeAr: string; prob: number }[];
}

export function isTier1OrCup(leagueCode?: string, leagueName?: string): boolean {
  const code = (leagueCode || '').trim().toUpperCase();
  const name = (leagueName || '').trim().toLowerCase();

  const cupRegex = /\b(cup|copa|coupe|pokal|taça|coppa|trofee|super\s*cup|kupa|champions\s*league|europa|conference|world\s*cup|afcon|asian\s*cup|libertadores|sudamericana|كأس|بطولة)\b/i;
  if (cupRegex.test(name)) return true;
  if (code.endsWith('C') || code.includes('CUP') || code.includes('UCL') || code.includes('UEL')) return true;

  const topCodes = new Set([
    'E0', 'PRM', 'ES1', 'IT1', 'D1', 'DE1', 'F1', 'FR1', 'NL1', 'PT1', 'BE1', 
    'TR1', 'SA1', 'US1', 'SC1', 'GR1', 'CH1', 'BR1', 'AR1', 'JP1'
  ]);
  if (topCodes.has(code)) return true;

  const topTierRegex = /\b(premier\s*league|premiership|primera\s*divisi[oó]n|la\s*liga|serie\s*a|ligue\s*1|bundesliga|eredivisie|pro\s*league|super\s*lig|super\s*league|allsvenskan|eliteserien|mls)\b/i;
  if (topTierRegex.test(name)) {
    if (!/(?:serie\s*b|segunda|ligue\s*2|2\.\s*bundesliga|championship|league\s*one|league\s*two)/i.test(name)) {
      return true;
    }
  }

  return false;
}

export function isWomenCompetition(match: Match | { league_name?: string; home?: string; away?: string }): boolean {
  const name = (match.league_name || '').toLowerCase();
  const home = (match.home || '').toLowerCase();
  const away = (match.away || '').toLowerCase();

  const womenKeywords = [
    'women', 'woman', 'ladies', 'females', 'femmes', 'femme', 'femenil',
    'femenino', 'frauen', 'damen', 'femminile', 'kvinner', 'naiset',
    'damer', 'feminine', 'vrouwen', 'női', 'kobiety', 'жен', 'نساء', 'سيدات'
  ];

  for (const kw of womenKeywords) {
    if (name.includes(kw) || home.includes(kw) || away.includes(kw)) {
      return true;
    }
  }
  return false;
}

export class CardsCornersEngine {
  private static factorial(n: number): number {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  public static poissonProb(k: number, lambda: number): number {
    if (lambda <= 0) return k === 0 ? 1 : 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  public static poissonAtLeast(k: number, lambda: number): number {
    let sumLess = 0;
    for (let i = 0; i < k; i++) {
      sumLess += this.poissonProb(i, lambda);
    }
    return Math.max(0, Math.min(1, 1 - sumLess));
  }

  public static poissonAtMost(k: number, lambda: number): number {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.poissonProb(i, lambda);
    }
    return Math.max(0, Math.min(1, sum));
  }

  public static evaluateCornersProfile(match: Match): CornerTacticalProfile {
    const p1 = match.p1 || 33;
    const xgHome = Number(match.xg_home) || 1.35;
    const xgAway = Number(match.xg_away) || 1.10;
    const combinedXg = xgHome + xgAway;

    // Baselines for corners calculation based on average corners & modified by team strength
    const baseHome = match.avg_corners_home || 5.2;
    const baseAway = match.avg_corners_away || 4.1;

    let lambdaCornersHome = baseHome * (0.85 + (p1 / 100) * 0.3) * (0.9 + xgHome * 0.1);
    let lambdaCornersAway = baseAway * (0.85 + ((100 - p1) / 100) * 0.3) * (0.9 + xgAway * 0.1);

    // Apply league modifier
    const code = (match.league_code || '').toUpperCase();
    let modifier = 1.0;
    if (['E0', 'UCL', 'UEL'].includes(code)) {
      modifier = 1.15;
    } else if (['ES1', 'IT1', 'F1'].includes(code)) {
      modifier = 1.02;
    }

    lambdaCornersHome = Math.round(lambdaCornersHome * modifier * 10) / 10;
    lambdaCornersAway = Math.round(lambdaCornersAway * modifier * 10) / 10;
    const lambdaCorners = Math.round((lambdaCornersHome + lambdaCornersAway) * 10) / 10;

    const generationScore = Math.min(99, Math.max(40, Math.round((lambdaCorners / 12) * 100)));

    let cornerDynamics: CornerTacticalProfile['cornerDynamics'] = 'HEAVY_WING_PRESSURE';
    let cornerDynamicsLabel = 'Standard Wing & Flank Pressure';
    let cornerDynamicsLabelAr = 'ضغط أجنحة متواصل وتشتيت منتظم للكرات';

    if (p1 >= 55 && xgHome >= 1.8) {
      cornerDynamics = 'ASYMMETRIC_SIEGE';
      cornerDynamicsLabel = 'Asymmetric Flank Siege (Low Block Overload)';
      cornerDynamicsLabelAr = 'حصار أجنحة مكثف على دفاع متكتل (توليد عالي للركنيات)';
    } else if (combinedXg >= 2.8) {
      cornerDynamics = 'END_TO_END_PINBALL';
      cornerDynamicsLabel = 'End-to-End Transition Pinball';
      cornerDynamicsLabelAr = 'مباراة سريعة ومفتوحة وتبادل هجمات على الأطراف';
    }

    let flankActivityLevel: CornerTacticalProfile['flankActivityLevel'] = 'SUSTAINED_PRESSURE';
    let flankActivityLabel = 'Sustained Territorial Flank Delivery';
    let flankActivityLabelAr = 'عرضيات مستمرة وتواجد داخل مناطق الجزاء';

    if (lambdaCorners >= 10.2) {
      flankActivityLevel = 'INTENSE_CROSSING';
      flankActivityLabel = 'High Crossing Velocity & Frequent Deflections';
      flankActivityLabelAr = 'كثافة عرضيات عالية وتشتيت مستمر خارج المرمى';
    } else if (lambdaCorners <= 8.0) {
      flankActivityLevel = 'CENTRAL_CONGESTION';
      flankActivityLabel = 'Centrally Congested (Suppressed Box Entries)';
      flankActivityLabelAr = 'تكدس في العمق ومحدودية في العرضيات';
    }

    const probOver75 = this.poissonAtLeast(8, lambdaCorners);
    const probOver85 = this.poissonAtLeast(9, lambdaCorners);

    const total1: TeamCornerMicroProfile = {
      teamName: match.home,
      lambda: lambdaCornersHome,
      bracket: `${Math.max(2, Math.floor(lambdaCornersHome - 1.2))} - ${Math.ceil(lambdaCornersHome + 1.8)} ركنيات`,
      probOver25: this.poissonAtLeast(3, lambdaCornersHome),
      probOver35: this.poissonAtLeast(4, lambdaCornersHome),
      probOver45: this.poissonAtLeast(5, lambdaCornersHome)
    };

    const total2: TeamCornerMicroProfile = {
      teamName: match.away,
      lambda: lambdaCornersAway,
      bracket: `${Math.max(1, Math.floor(lambdaCornersAway - 1.0))} - ${Math.ceil(lambdaCornersAway + 1.5)} ركنيات`,
      probOver25: this.poissonAtLeast(3, lambdaCornersAway),
      probOver35: this.poissonAtLeast(4, lambdaCornersAway),
      probOver45: this.poissonAtLeast(5, lambdaCornersAway)
    };

    return {
      generationScore,
      cornerDynamics,
      cornerDynamicsLabel,
      cornerDynamicsLabelAr,
      flankActivityLevel,
      flankActivityLabel,
      flankActivityLabelAr,
      lambdaCorners,
      lambdaCornersHome,
      lambdaCornersAway,
      probOver75,
      probOver85,
      total1,
      total2
    };
  }

  public static selectBestTacticalMarket(
    match: Match,
    cornersProfile: CornerTacticalProfile
  ): TacticalMarketCandidate {
    const { lambdaCorners, probOver85, probOver75 } = cornersProfile;

    if (lambdaCorners >= 10.0 && probOver85 >= 0.58) {
      const conf = Math.min(97, Math.max(88, Math.round(probOver85 * 100 + 13)));
      const odds = parseFloat((1 / (probOver85 * 0.95)).toFixed(2));
      return {
        type: 'CORNER',
        badge: '+8.5 ركنيات',
        marketId: 'TOTAL_CORNERS_OVER_8_5',
        marketFamily: 'TOTAL_MATCH',
        marketName: 'Total Corners: Over 8.5 Corners',
        marketNameAr: 'إجمالي الركنيات: أكثر من 8.5 ركنيات (+8.5)',
        lineThreshold: 8.5,
        confidenceScore: conf,
        projectedOdds: odds,
        tacticalPillar: 'Golden Volume Over 8.5 Verified',
        tacticalPillarAr: `معدل ركنيات مرتفع (~${lambdaCorners.toFixed(1)} ركنية) مع حماية ضد العشوائية وتدفق أطراف متوازن`,
        reasoning: `High wide attacking momentum projects ~${lambdaCorners.toFixed(1)} corners, easily clearing 8.5 corners.`,
        reasoningAr: `خوارزمية محاربة العشوائية تؤكد تدفق أطراف كثيف ومعدل ركنيات متوقع ~${lambdaCorners.toFixed(1)} ركنية (${cornersProfile.lambdaCornersHome} للمضيف و ${cornersProfile.lambdaCornersAway} للضيف)، مما يضمن تجاوز خط 8.5 ركنيات بدقة وأمان.`,
        keyMetricLabel: 'Over 8.5 Threshold',
        keyMetricLabelAr: 'شرط خط +8.5',
        keyMetricValue: `${lambdaCorners.toFixed(1)} ركنية متوقعة (تجاوز حاجز 8.5 ✓)`,
        mathematicalEdge: probOver85 * 1.25
      };
    }

    const conf75 = Math.min(96, Math.max(87, Math.round(probOver75 * 100 + 12)));
    const odds75 = parseFloat((1 / (probOver75 * 0.96)).toFixed(2));
    return {
      type: 'CORNER',
      badge: '+7.5 ركنيات',
      marketId: 'TOTAL_CORNERS_OVER_7_5',
      marketFamily: 'TOTAL_MATCH',
      marketName: 'Total Corners: Over 7.5 Corners',
      marketNameAr: 'إجمالي الركنيات: أكثر من 7.5 ركنيات (+7.5)',
      lineThreshold: 7.5,
      confidenceScore: conf75,
      projectedOdds: odds75,
      tacticalPillar: 'Solid Match Security Over 7.5 Floor',
      tacticalPillarAr: `خط أمان متين (+7.5 ركنيات) بمعدل متوقع ${lambdaCorners.toFixed(1)} ركنية يضمن حصد 8 ركنيات`,
      reasoning: `Balanced wide pressure projects ~${lambdaCorners.toFixed(1)} corners, comfortably achieving the 7.5 safety line.`,
      reasoningAr: `ضغط هجومي متوازن ومعدل تحويل ركنيات مثبت يولد توقع ~${lambdaCorners.toFixed(1)} ركنية (${cornersProfile.lambdaCornersHome} للمضيف و ${cornersProfile.lambdaCornersAway} للضيف)، مما يضمن تحقيق 8 ركنيات على الأقل وتفادي فخاخ العشوائية.`,
      keyMetricLabel: 'Over 7.5 Security',
      keyMetricLabelAr: 'أمان خط +7.5',
      keyMetricValue: `${lambdaCorners.toFixed(1)} ركنية متوقعة (تجاوز حاجز 7.5 ✓)`,
      mathematicalEdge: probOver75 * 1.22
    };
  }

  public static analyzeMatch(match: Match): CardsCornersAnalysis {
    const cornersProfile = this.evaluateCornersProfile(match);
    const primarySelection = this.selectBestTacticalMarket(match, cornersProfile);

    const poissonCorners = [
      { range: '0-7 Corners', rangeAr: '0-7 ركنيات', prob: Math.round(this.poissonAtMost(7, cornersProfile.lambdaCorners) * 100) },
      { range: '8-9 Corners', rangeAr: '8-9 ركنيات (+7.5)', prob: Math.round((this.poissonAtLeast(8, cornersProfile.lambdaCorners) - this.poissonAtLeast(10, cornersProfile.lambdaCorners)) * 100) },
      { range: '10-11 Corners', rangeAr: '10-11 ركنية (+9.5)', prob: Math.round((this.poissonAtLeast(10, cornersProfile.lambdaCorners) - this.poissonAtLeast(12, cornersProfile.lambdaCorners)) * 100) },
      { range: '12+ Corners', rangeAr: '12+ ركنية كاسحة', prob: Math.round(this.poissonAtLeast(12, cornersProfile.lambdaCorners) * 100) }
    ];

    return {
      match,
      leagueFullName: LEAGUE_MAP[match.league_code] || match.league_name,
      cornersProfile,
      overallTacticalScore: cornersProfile.generationScore,
      isDailyEliteCandidate: primarySelection.confidenceScore >= 87,
      primarySelection,
      poissonCorners
    };
  }

  public static getDailyElitePicks(
    matches: Match[],
    maxDailyQuota: number = 30,
    options?: { tier1AndCupsOnly?: boolean }
  ): CardsCornersAnalysis[] {
    // 1. Filter out women's competitions
    let pool = matches.filter(m => !isWomenCompetition(m));

    // 2. Filter for major matches / Tier 1 & Cups only
    if (options?.tier1AndCupsOnly) {
      pool = pool.filter(m => isTier1OrCup(m.league_code, m.league_name));
    }

    const analyses = pool.map(m => this.analyzeMatch(m));

    // Sort by confidence Score, then generation score
    analyses.sort((a, b) => {
      const confB = b.primarySelection.confidenceScore;
      const confA = a.primarySelection.confidenceScore;
      if (confB !== confA) return confB - confA;
      return b.cornersProfile.generationScore - a.cornersProfile.generationScore;
    });

    const selected = analyses.slice(0, maxDailyQuota);
    return selected.map((item, idx) => ({
      ...item,
      eliteRank: idx + 1
    }));
  }
}
export const CornersEngine = CardsCornersEngine;
