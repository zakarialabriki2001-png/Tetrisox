import { ForebetHarmonizer } from "./forebetHarmonizer";
import { Match, SignalSummary } from '../types';
import { CipherEngine, IcharaV2Engine } from './matchEngine';
import { MarketEvaluator } from './marketEvaluator';
import { LocalOfflineTrainer, IMPORTANT_MARKETS } from './signalTrainer';
import { ButterflyCrossLearningEngine } from './butterflyCrossLearningEngine';
import { ButterflyGovernorEngine } from './butterflyGovernorEngine';

export type ExceptionalCategory = 
  | 'all'
  | 'exceptional_only'
  | 'over_25_35'
  | 'over_15'
  | 'home_win'
  | 'away_win';

export interface ExceptionalInfo {
  isExceptional: boolean;
  categories: Set<'over_25_35' | 'over_15' | 'home_win' | 'away_win'>;
  primaryLabelAr: string;
  labelsAr: string[];
}

/**
 * Checks if a specific market key represents an "exceptional" target market:
 * +2.5, +1.5, Home Win (1), Away Win (2), +3.5+
 */
export function isExceptionalMarket(market: string): boolean {
  const m = market.trim().toUpperCase();

  // Over 2.5 and Over 3.5+
  if (
    m === 'OVER_2_5' ||
    m === 'OVER_3_5' ||
    m === 'OVER_4_5' ||
    m === 'OVER_5_5' ||
    m === 'WIN_AND_OVER_2_5' ||
    m === 'HOME_OVER_2_5' ||
    m === 'AWAY_OVER_2_5'
  ) {
    return true;
  }

  // Over 1.5
  if (
    m === 'OVER_1_5' ||
    m === 'HT_OVER_1_5' ||
    m === 'SH_OVER_1_5' ||
    m === 'WIN_AND_OVER_1_5' ||
    m === 'HOME_OVER_1_5' ||
    m === 'AWAY_OVER_1_5'
  ) {
    return true;
  }

  // Home Win (فوز المضيف)
  if (
    m === 'FT_1' ||
    m === 'HT_1' ||
    m === 'SH_1' ||
    m === 'HOME_WIN_CLEAN_SHEET' ||
    m === 'WIN_AND_GG'
  ) {
    return true;
  }

  // Away Win (فوز المستضيف)
  if (
    m === 'FT_2' ||
    m === 'HT_2' ||
    m === 'SH_2' ||
    m === 'AWAY_WIN_CLEAN_SHEET'
  ) {
    return true;
  }

  return false;
}

/**
 * Maps market key to category
 */
export function getMarketCategory(market: string): 'over_25_35' | 'over_15' | 'home_win' | 'away_win' | null {
  const m = market.trim().toUpperCase();

  if (
    m === 'OVER_2_5' ||
    m === 'OVER_3_5' ||
    m === 'OVER_4_5' ||
    m === 'OVER_5_5' ||
    m === 'WIN_AND_OVER_2_5' ||
    m === 'HOME_OVER_2_5' ||
    m === 'AWAY_OVER_2_5'
  ) {
    return 'over_25_35';
  }

  if (
    m === 'OVER_1_5' ||
    m === 'HT_OVER_1_5' ||
    m === 'SH_OVER_1_5' ||
    m === 'WIN_AND_OVER_1_5' ||
    m === 'HOME_OVER_1_5' ||
    m === 'AWAY_OVER_1_5'
  ) {
    return 'over_15';
  }

  if (
    m === 'FT_1' ||
    m === 'HT_1' ||
    m === 'SH_1' ||
    m === 'HOME_WIN_CLEAN_SHEET' ||
    m === 'WIN_AND_GG'
  ) {
    return 'home_win';
  }

  if (
    m === 'FT_2' ||
    m === 'HT_2' ||
    m === 'SH_2' ||
    m === 'AWAY_WIN_CLEAN_SHEET'
  ) {
    return 'away_win';
  }

  return null;
}

/**
 * Gets a clean short label in Arabic and English for an exceptional market
 */
export function getMarketShortBadge(market: string): { labelAr: string; labelEn: string; tag: string } {
  const m = market.trim().toUpperCase();
  if (m === 'OVER_2_5' || m === 'WIN_AND_OVER_2_5' || m === 'HOME_OVER_2_5' || m === 'AWAY_OVER_2_5') {
    return { labelAr: '+2.5 أهداف', labelEn: 'Over 2.5', tag: '+2.5' };
  }
  if (m === 'OVER_3_5' || m === 'OVER_4_5' || m === 'OVER_5_5') {
    return { labelAr: '+3.5 أهداف', labelEn: 'Over 3.5+', tag: '+3.5' };
  }
  if (m === 'OVER_1_5' || m === 'HT_OVER_1_5' || m === 'SH_OVER_1_5' || m === 'WIN_AND_OVER_1_5' || m === 'HOME_OVER_1_5' || m === 'AWAY_OVER_1_5') {
    return { labelAr: '+1.5 أهداف', labelEn: 'Over 1.5', tag: '+1.5' };
  }
  if (m === 'FT_1' || m === 'HT_1' || m === 'SH_1' || m === 'HOME_WIN_CLEAN_SHEET' || m === 'WIN_AND_GG') {
    return { labelAr: 'فوز المضيف (1)', labelEn: 'Home Win (1)', tag: 'فوز المضيف' };
  }
  if (m === 'FT_2' || m === 'HT_2' || m === 'SH_2' || m === 'AWAY_WIN_CLEAN_SHEET') {
    return { labelAr: 'فوز المستضيف (2)', labelEn: 'Away Win (2)', tag: 'فوز المستضيف' };
  }
  return { labelAr: market, labelEn: market, tag: market };
}

/**
 * Determines targeted candidate markets based strictly on the match's tactical profile and signal identity.
 * This prevents testing 15 random markets per match which caused false-positive flood (700+ matches).
 */
function getTargetedCandidateMarkets(
  m: Match,
  sigTopPredictions: Array<{ market: string }> = []
): string[] {
  const targeted = new Set<string>();

  // 1. Always prioritize the signal's certified top-performing predictions
  sigTopPredictions.forEach((p) => {
    if (p && p.market) targeted.add(p.market);
  });

  const pred = (m.pred || '').toUpperCase();
  const forebetScore = ForebetHarmonizer.parseExpectedScore(m.expected_score);
  const xgH = Number(m.xg_home) || 0;
  const xgA = Number(m.xg_away) || 0;
  const totalXg = xgH + xgA;

  // 2. Add targeted directional markets matching the match's statistical profile
  if (pred === '1' || (forebetScore && forebetScore.expHome > forebetScore.expAway)) {
    targeted.add('FT_1');
    targeted.add('DC_1X');
    if (xgH >= 1.5) targeted.add('HOME_OVER_1_5');
  } else if (pred === '2' || (forebetScore && forebetScore.expAway > forebetScore.expHome)) {
    targeted.add('FT_2');
    targeted.add('DC_X2');
    if (xgA >= 1.5) targeted.add('AWAY_OVER_1_5');
  } else if (pred === 'X' || (forebetScore && forebetScore.isDraw)) {
    targeted.add('FT_X');
    targeted.add('DC_1X');
    targeted.add('DC_X2');
  }

  // 3. Add targeted goal dynamic markets matching xG profile
  if (totalXg >= 2.6 || (forebetScore && forebetScore.totalGoals >= 3)) {
    targeted.add('OVER_1_5');
    targeted.add('OVER_2_5');
    if (xgH >= 1.0 && xgA >= 1.0) targeted.add('GG_FT');
  } else if (totalXg <= 2.1 || (forebetScore && forebetScore.totalGoals <= 2)) {
    targeted.add('UNDER_2_5');
    targeted.add('UNDER_3_5');
    targeted.add('NG_FT');
  }

  return Array.from(targeted);
}

/**
 * Computes a multi-factor tactical classification weight for a market prediction:
 * Fuses historical win rate, Forebet directional agreement, expected score convergence, and odds value.
 * This completely eliminates random, illogical, or conflicting suggestions.
 */
function computeTacticalMarketWeight(
  market: string,
  m: Match,
  accuracyRate: number,
  odds: number,
  lastMatches: Match[]
): number {
  let score = accuracyRate * 50; // Max 50 points from accuracy

  const forebetScore = ForebetHarmonizer.parseExpectedScore(m.expected_score);
  const pred = (m.pred || '').toUpperCase();
  const p1 = m.p1 || 0;
  const p2 = m.p2 || 0;
  const px = m.px || 0;
  const xgH = Number(m.xg_home) || 0;
  const xgA = Number(m.xg_away) || 0;
  const totalXg = xgH + xgA;

  // 1. Forebet Direct Alignment Bonus (Up to +25 points)
  if (market === 'FT_1' || market === 'DNB_1' || market === 'DC_1X') {
    if (pred === '1') score += 20;
    if (p1 >= 50) score += 5;
    if (forebetScore && forebetScore.expHome > forebetScore.expAway) score += 5;
  } else if (market === 'FT_2' || market === 'DNB_2' || market === 'DC_X2') {
    if (pred === '2') score += 20;
    if (p2 >= 50) score += 5;
    if (forebetScore && forebetScore.expAway > forebetScore.expHome) score += 5;
  } else if (market === 'FT_X') {
    if (pred === 'X' || (forebetScore && forebetScore.isDraw)) score += 20;
    if (px >= 30) score += 5;
  } else if (market === 'OVER_1_5' || market === 'OVER_2_5') {
    if (forebetScore && forebetScore.totalGoals >= (market === 'OVER_2_5' ? 3 : 2)) score += 20;
    if (totalXg >= (market === 'OVER_2_5' ? 2.5 : 1.9)) score += 5;
  } else if (market === 'UNDER_2_5' || market === 'UNDER_3_5') {
    if (forebetScore && forebetScore.totalGoals <= (market === 'UNDER_2_5' ? 2 : 3)) score += 20;
    if (totalXg <= (market === 'UNDER_2_5' ? 2.3 : 3.0)) score += 5;
  } else if (market === 'GG_FT') {
    if (forebetScore && forebetScore.expHome >= 1 && forebetScore.expAway >= 1) score += 20;
    if (xgH >= 1.0 && xgA >= 1.0) score += 5;
  } else if (market === 'NG_FT') {
    if (forebetScore && (forebetScore.expHome === 0 || forebetScore.expAway === 0)) score += 20;
  }

  // 2. Recency Form Weighting (Up to +10 points)
  if (lastMatches.length >= 5) {
    const recent5 = lastMatches.slice(0, 5);
    const recent5Wins = recent5.filter((hist) => {
      if (hist.ft_home === null || hist.ft_away === null) return false;
      const outcomes = MarketEvaluator.evaluateAllMarkets(hist.ft_home, hist.ft_away, hist.ht_home, hist.ht_away);
      return outcomes[market] === true;
    }).length;
    score += (recent5Wins / 5) * 10;
  }

  // 3. Odds Value Corridor (+10 points for solid odds 1.30 - 2.10)
  if (odds >= 1.30 && odds <= 2.10) {
    score += 10;
  } else if (odds > 2.10 && odds <= 2.60) {
    score += 6;
  } else if (odds >= 1.25) {
    score += 3;
  }

  return Math.round(score * 10) / 10;
}

/**
 * Evaluates active predictions for a match in the Signal Picks system (85%+ accuracy on last 15)
 * ROOT INTEGRATION: Strictly harmonizes with Forebet's predictions (1X2, expected score, goals).
 * DYNAMIC WEIGHTING: Eliminates randomness through multi-factor tactical conviction ranking.
 * ELITE FILTERING: Strictly excludes low-conviction matches to prevent signal overflow.
 */
export function getSignalActivePredictions(
  m: Match,
  dbSignals: Record<string, SignalSummary>,
  finishedMatchesBySignal: Record<string, Match[]>,
  minAccuracyRatio?: number
): Array<{ market: string; avg_odds?: number; accuracy_rate?: number; calculatedWinRate?: number; tacticalWeight?: number }> {
  const sigInfo = dbSignals[m.signal_code];
  if (!sigInfo) return [];

  const mTime = m.__parsedTime || (m.kickoff ? LocalOfflineTrainer.parseKickoffDate(m.kickoff).getTime() : 0);
  // Maximum historical depth inspection: up to 25 completed games
  const finishedForSignal = CipherEngine.getAidedFinishedMatches(
    m.signal_code,
    finishedMatchesBySignal,
    mTime,
    25
  );
  const deepSample = finishedForSignal.slice(0, 25);
  // Strict depth requirement: at least 10 historical matches in the cluster
  if (deepSample.length < 10) return [];

  const req = minAccuracyRatio !== undefined ? minAccuracyRatio : 0.85;

  // Use targeted candidate markets aligned with match stance and certified predictions
  const candidateMarkets = getTargetedCandidateMarkets(m, sigInfo.top_predictions || []);

  const valid: Array<{
    market: string;
    avg_odds: number;
    accuracy_rate: number;
    calculatedWinRate: number;
    tacticalWeight: number;
  }> = [];

  // Autonomous Butterfly Governor Pre-Match Council Verification
  const governorVerdict = ButterflyGovernorEngine.evaluateMatchCouncil(m, deepSample);

  for (const market of candidateMarkets) {
    // 1. Strict Root Forebet Compatibility Gatekeeper
    if (!ForebetHarmonizer.isMarketCompatible(market, m)) {
      continue; // Strictly reject any prediction contradicting Forebet
    }

    // 2. Supreme Governor Autonomous Veto Guard:
    // If council vetoed due to severe draw trap or tactical lock, block risky direct 1X2 wins
    if (governorVerdict.decision === 'VETOED' && (market === 'FT_1' || market === 'FT_2')) {
      continue;
    }

    const successCount = deepSample.filter((hist) => {
      if (hist.ft_home === null || hist.ft_away === null) return false;
      const outcomes = MarketEvaluator.evaluateAllMarkets(
        hist.ft_home,
        hist.ft_away,
        hist.ht_home,
        hist.ht_away
      );
      return outcomes[market] === true;
    }).length;

    const rawRate = deepSample.length > 0 ? successCount / deepSample.length : 0;
    const butterflyCalib = ButterflyCrossLearningEngine.getCalibratedSubsystemWeight('SIGNAL_V1', 1.0, []);
    const rate = Math.min(0.99, Math.max(0.50, rawRate * butterflyCalib.calibratedWeight));
    const oddsEstimate = LocalOfflineTrainer.estimateMarketOdds(market, m);

    // Safeguard for NG_HT
    if (market === 'NG_HT') {
      let htGoalsSum = 0;
      deepSample.forEach((hist) => {
        if (hist.ht_home !== null && hist.ht_away !== null) {
          htGoalsSum += (hist.ht_home + hist.ht_away);
        }
      });
      if ((htGoalsSum / (deepSample.length || 1)) > 1.05) continue;
    }

    // Strict threshold: Must clear 85%+ and realistic odds >= 1.30 and tactical weight >= 60
    if (rate >= req && oddsEstimate >= 1.30 && oddsEstimate <= 3.80) {
      const tacticalWeight = computeTacticalMarketWeight(market, m, rate, oddsEstimate, deepSample);
      if (tacticalWeight >= 60.0) {
        valid.push({
          market,
          avg_odds: oddsEstimate,
          accuracy_rate: rate,
          calculatedWinRate: parseFloat((rate * 100).toFixed(1)),
          tacticalWeight
        });
      }
    }
  }

  // Sort by tactical weight descending, then win rate, then odds
  valid.sort((a, b) => (b.tacticalWeight !== a.tacticalWeight)
    ? b.tacticalWeight - a.tacticalWeight
    : (b.calculatedWinRate !== a.calculatedWinRate)
      ? b.calculatedWinRate - a.calculatedWinRate
      : b.avg_odds - a.avg_odds
  );

  return valid.slice(0, 3);
}

/**
 * Evaluates active predictions for a match in the Ichara V2 system (80%+ accuracy, odds >= 1.30, strict NG_HT)
 * ROOT INTEGRATION: Strictly harmonizes with Forebet's predictions (1X2, expected score, goals).
 * DYNAMIC WEIGHTING: Eliminates randomness through multi-factor tactical conviction ranking.
 * ELITE FILTERING: Strictly excludes low-conviction matches to prevent signal overflow.
 */
export function getIcharaActivePredictions(
  m: Match,
  dbSignalsV2: Record<string, SignalSummary>,
  finishedMatchesBySignalV2: Record<string, Match[]>,
  minAccuracyRatio?: number
): Array<{ market: string; avg_odds?: number; accuracy_rate?: number; calculatedWinRate?: number; tacticalWeight?: number }> {
  const sigCode = m.signal_code_v2;
  if (!sigCode || !dbSignalsV2) return [];
  const sigInfo = dbSignalsV2[sigCode];
  if (!sigInfo) return [];

  const mTime = m.__parsedTime || (m.kickoff ? LocalOfflineTrainer.parseKickoffDate(m.kickoff).getTime() : 0);
  // Maximum historical depth inspection: up to 25 completed games
  const finishedForSignal = IcharaV2Engine.getAidedFinishedMatches(
    sigCode,
    finishedMatchesBySignalV2,
    mTime,
    25
  );
  const deepSample = finishedForSignal.slice(0, 25);
  // Strict depth requirement: at least 10 historical matches in the cluster
  if (deepSample.length < 10) return [];

  const candidateMarkets = getTargetedCandidateMarkets(m, sigInfo.top_predictions || []);

  const valid: Array<{
    market: string;
    avg_odds: number;
    accuracy_rate: number;
    calculatedWinRate: number;
    tacticalWeight: number;
  }> = [];

  // Autonomous Butterfly Governor Pre-Match Council Verification
  const governorVerdict = ButterflyGovernorEngine.evaluateMatchCouncil(m, deepSample);

  for (const market of candidateMarkets) {
    // 1. Strict Root Forebet Compatibility Gatekeeper
    if (!ForebetHarmonizer.isMarketCompatible(market, m)) {
      continue; // Strictly reject any prediction contradicting Forebet
    }

    // 2. Supreme Governor Autonomous Veto Guard:
    // If council vetoed due to severe draw trap or tactical lock, block risky direct 1X2 wins
    if (governorVerdict.decision === 'VETOED' && (market === 'FT_1' || market === 'FT_2')) {
      continue;
    }

    const successes = deepSample.filter((hist) => {
      if (hist.ft_home === null || hist.ft_away === null) return false;
      const outcomes = MarketEvaluator.evaluateAllMarkets(
        hist.ft_home,
        hist.ft_away,
        hist.ht_home,
        hist.ht_away
      );
      return outcomes[market] === true;
    }).length;

    const rawRate = successes / (deepSample.length || 1);
    const butterflyCalib = ButterflyCrossLearningEngine.getCalibratedSubsystemWeight('ICHARA_V2', 1.0, []);
    const rate = Math.min(0.99, Math.max(0.50, rawRate * butterflyCalib.calibratedWeight));
    let req = minAccuracyRatio !== undefined ? minAccuracyRatio : 0.80;

    if (market === 'NG_HT') {
      req = 0.90;
      let htGoalsSum = 0;
      let countHtBttsYes = 0;
      deepSample.forEach((hist) => {
        if (hist.ht_home !== null && hist.ht_away !== null) {
          const totalFh = hist.ht_home + hist.ht_away;
          htGoalsSum += totalFh;
          if (hist.ht_home > 0 && hist.ht_away > 0) countHtBttsYes++;
        }
      });
      const avgHtGoals = deepSample.length > 0 ? htGoalsSum / deepSample.length : 0;
      const rateHtBttsYes = deepSample.length > 0 ? countHtBttsYes / deepSample.length : 0;
      const uHtXgH = (m.xg_home || 1) * 0.45;
      const uHtXgA = (m.xg_away || 1) * 0.45;
      const uHtGoalH = uHtXgH < 0.4 ? 0 : uHtXgH < 1.2 ? 1 : 2;
      const uHtGoalA = uHtXgA < 0.4 ? 0 : uHtXgA < 1.2 ? 1 : 2;

      if (avgHtGoals > 1.00 || rateHtBttsYes > 0.08 || (uHtGoalH !== 0 && uHtGoalA !== 0)) {
        continue;
      }
    }

    const oddsEstimate = LocalOfflineTrainer.estimateMarketOdds(market, m);
    // Strict threshold: Must clear 80%+ (or 90% for NG_HT) with odds >= 1.30 and tactical weight >= 58
    if (rate >= req && oddsEstimate >= 1.30 && oddsEstimate <= 3.80) {
      const tacticalWeight = computeTacticalMarketWeight(market, m, rate, oddsEstimate, deepSample);
      if (tacticalWeight >= 58.0) {
        valid.push({
          market,
          avg_odds: oddsEstimate,
          accuracy_rate: rate,
          calculatedWinRate: parseFloat((rate * 100).toFixed(1)),
          tacticalWeight
        });
      }
    }
  }

  // Sort by tactical weight descending, then win rate, then odds
  valid.sort((a, b) => (b.tacticalWeight !== a.tacticalWeight)
    ? b.tacticalWeight - a.tacticalWeight
    : (b.calculatedWinRate !== a.calculatedWinRate)
      ? b.calculatedWinRate - a.calculatedWinRate
      : b.avg_odds - a.avg_odds
  );

  return valid.slice(0, 3);
}

/**
 * Extracts exceptional metadata from active predictions of a match
 */
export function analyzeMatchExceptional(
  activePredictions: Array<{ market: string }>
): ExceptionalInfo {
  const categories = new Set<'over_25_35' | 'over_15' | 'home_win' | 'away_win'>();
  const labels: string[] = [];

  for (const p of activePredictions) {
    const cat = getMarketCategory(p.market);
    if (cat) {
      categories.add(cat);
      const badge = getMarketShortBadge(p.market);
      if (!labels.includes(badge.tag)) {
        labels.push(badge.tag);
      }
    }
  }

  const isExceptional = categories.size > 0;
  const primaryLabelAr = labels.join(' • ');

  return {
    isExceptional,
    categories,
    primaryLabelAr,
    labelsAr: labels,
  };
}

/**
 * Filters and sorts a match list:
 * - When filterCategory !== 'all': keeps only matches that match category
 * - When exceptionalFirst is true: puts matches with exceptional predictions FIRST, regardless of kickoff time!
 */
export function processMatchesWithExceptionalSort(
  matches: Match[],
  getPredictions: (m: Match) => Array<{ market: string; avg_odds?: number; accuracy_rate?: number; [key: string]: any }>,
  filterCategory: ExceptionalCategory,
  exceptionalFirst: boolean,
  forebetFilterActive = false
): {
  processedMatches: Match[];
  totalExceptionalCount: number;
  categoryCounts: {
    all: number;
    exceptional_only: number;
    over_25_35: number;
    over_15: number;
    home_win: number;
    away_win: number;
  };
  exceptionalInfoMap: Map<string, ExceptionalInfo>;
  activePredictionsMap: Map<string, Array<{ market: string; avg_odds?: number; accuracy_rate?: number; [key: string]: any }>>;
} {
  const exceptionalInfoMap = new Map<string, ExceptionalInfo>();
  const activePredictionsMap = new Map<string, Array<{ market: string; avg_odds?: number; accuracy_rate?: number; [key: string]: any }>>();
  const categoryCounts = {
    all: 0,
    exceptional_only: 0,
    over_25_35: 0,
    over_15: 0,
    home_win: 0,
    away_win: 0,
  };

  // Precompute exceptional metadata for all matches & strictly prevent empty cards
  const validMatches: Match[] = [];
  for (const m of matches) {
    let preds = getPredictions(m);
    // ROOT REQUIREMENT: Always filter predictions for strict Forebet harmony
    preds = ForebetHarmonizer.filterCompatiblePredictions(preds, m);
    if (!preds || preds.length === 0) {
      continue;
    }

    activePredictionsMap.set(m.match_id, preds);
    validMatches.push(m);
    categoryCounts.all++;

    const info = analyzeMatchExceptional(preds);
    exceptionalInfoMap.set(m.match_id, info);

    if (info.isExceptional) {
      categoryCounts.exceptional_only++;
      if (info.categories.has('over_25_35')) categoryCounts.over_25_35++;
      if (info.categories.has('over_15')) categoryCounts.over_15++;
      if (info.categories.has('home_win')) categoryCounts.home_win++;
      if (info.categories.has('away_win')) categoryCounts.away_win++;
    }
  }

  // Filter according to category
  let filtered = validMatches.filter((m) => {
    const info = exceptionalInfoMap.get(m.match_id);
    if (!info) return false;

    switch (filterCategory) {
      case 'exceptional_only':
        return info.isExceptional;
      case 'over_25_35':
        return info.categories.has('over_25_35');
      case 'over_15':
        return info.categories.has('over_15');
      case 'home_win':
        return info.categories.has('home_win');
      case 'away_win':
        return info.categories.has('away_win');
      case 'all':
      default:
        return true;
    }
  });

  // Sort: if exceptionalFirst is true, partition or sort exceptional matches FIRST!
  if (exceptionalFirst) {
    filtered = [...filtered].sort((a, b) => {
      const aInfo = exceptionalInfoMap.get(a.match_id);
      const bInfo = exceptionalInfoMap.get(b.match_id);
      const aExc = aInfo?.isExceptional ? 1 : 0;
      const bExc = bInfo?.isExceptional ? 1 : 0;

      // Exceptional matches first
      if (aExc !== bExc) {
        return bExc - aExc;
      }
      // If both exceptional or both non-exceptional, keep chronological kickoff order
      return (a.__parsedTime || 0) - (b.__parsedTime || 0);
    });
  } else {
    // Normal chronological order
    filtered = [...filtered].sort((a, b) => (a.__parsedTime || 0) - (b.__parsedTime || 0));
  }

  return {
    processedMatches: filtered,
    totalExceptionalCount: categoryCounts.exceptional_only,
    categoryCounts,
    exceptionalInfoMap,
    activePredictionsMap,
  };
}
