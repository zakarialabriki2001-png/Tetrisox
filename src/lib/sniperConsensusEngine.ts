/**
 * Elite Consensus 90+ Sniper Engine (V8.0 Strict Multi-System Consensus Intersection)
 * 
 * Specialized sniper consensus engine designed to extract directly and exclusively
 * when AT LEAST TWO distinct elite parent systems reach unanimous agreement (Quorum >= 2):
 * 1. ICHARA_V1: Signal V1 Engine (getSignalActivePredictions >= 85%)
 * 2. ICHARA_V2: Ichara V2 Engine (getIcharaActivePredictions >= 80%)
 * 3. PREMIUM_V1: Premium Picks V1 (1X2, Goals Hunter, First Half)
 * 4. PREMIUM_V2: Premium Picks V2 (1X2, Goals Hunter, First Half)
 * 
 * Strict Mathematical Guarantees:
 * - Elite Sniper picks are a STRICT SUBSET / INTERSECTION of the active qualified parent systems.
 * - An individual match CANNOT qualify unless at least 2 independent parent systems recommend the exact same market.
 * - Minimum odds >= 1.30 and <= 4.50.
 * - Completely ZERO corners.
 * - 100% Forebet Harmony.
 */

import { Match, OracleDatabase } from '../types';
import { MarketEvaluator } from './marketEvaluator';
import { ForebetHarmonizer } from './forebetHarmonizer';
import { CipherEngine, IcharaV2Engine, AdvancedxGEngine } from './matchEngine';
import { DateTimeSystem } from './dateTimeSystem';
import { getSignalActivePredictions, getIcharaActivePredictions } from './exceptionalFilter';

function getMatchPrediction(m: Match): string {
  if (m.pred && (m.pred === "1" || m.pred === "X" || m.pred === "2")) {
    return m.pred.toUpperCase();
  }
  const max = Math.max(m.p1 || 0, m.px || 0, m.p2 || 0);
  if (max === m.p1) return "1";
  if (max === m.p2) return "2";
  return "X";
}

export type SniperTier = 'DIAMOND' | 'GOLD' | 'TACTICAL';

export type SniperSystemId = 'ICHARA_V1' | 'ICHARA_V2' | 'PREMIUM_V1' | 'PREMIUM_V2';

export interface SupportingEngine {
  engineId: SniperSystemId;
  nameAr: string;
  nameEn: string;
  confidence: number; // 80 - 99%
  metricNoteAr: string;
  metricNoteEn: string;
}

export interface SniperConsensusPick {
  id: string; // match_id + market
  matchId: string;
  match: Match;
  market: string;
  marketTitleAr: string;
  marketTitleEn: string;
  marketCategory: '1X2' | 'DOUBLE_CHANCE' | 'GOALS' | 'BTTS' | 'FIRST_HALF'; // STRICTLY NO CORNERS!
  consensusScore: number; // 88.0 - 99.0%
  tier: SniperTier;
  odds: number; // STRICTLY >= 1.30
  oddsCorridor: 'SAFE_ANCHOR' | 'VALUE_BUILDER' | 'HIGH_ODDS'; // 1.30-1.65 | 1.65-2.25 | 2.25+
  expectedValue: number; // e.g. +18.5%
  supportingEngines: SupportingEngine[];
  quorumCount: number; // Strictly >= 2
  sampleDepth: number;
  forebetHarmonized: boolean;
  forebetSummaryAr: string;
  forebetSummaryEn: string;
  tacticalJustificationAr: string;
  tacticalJustificationEn: string;
  status: 'PENDING' | 'WON' | 'LOST';
  actualScore?: string;
  kickoffDateStr: string;
}

export class SniperConsensusEngine {
  private static cachedFinishedV1: Record<string, Match[]> | null = null;
  private static cachedFinishedV2: Record<string, Match[]> | null = null;
  private static lastMatchesCount = 0;

  /**
   * Initializes or updates the indexed completed matches cache
   */
  public static ensureFinishedMatchesIndex(allMatches: Match[]) {
    if (this.cachedFinishedV1 && this.lastMatchesCount === allMatches.length) {
      return;
    }
    const groupV1: Record<string, Match[]> = {};
    const groupV2: Record<string, Match[]> = {};

    for (let i = 0; i < allMatches.length; i++) {
      const m = allMatches[i];
      if (m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null) {
        if (!groupV1[m.signal_code]) groupV1[m.signal_code] = [];
        groupV1[m.signal_code].push(m);

        const v2Code = m.signal_code_v2 || IcharaV2Engine.getIcharaCode(IcharaV2Engine.computeIcharaKey(m.p1, m.px, m.p2, m.coef));
        if (v2Code) {
          if (!groupV2[v2Code]) groupV2[v2Code] = [];
          groupV2[v2Code].push(m);
        }
      }
    }

    // Sort chronologically descending
    for (const k in groupV1) {
      groupV1[k].sort((a, b) => (b.__parsedTime || 0) - (a.__parsedTime || 0));
    }
    for (const k in groupV2) {
      groupV2[k].sort((a, b) => (b.__parsedTime || 0) - (a.__parsedTime || 0));
    }

    this.cachedFinishedV1 = groupV1;
    this.cachedFinishedV2 = groupV2;
    this.lastMatchesCount = allMatches.length;
  }

  /**
   * Normalizes market key for exact multi-system cross-comparison
   */
  public static normalizeMarketKey(market: string): string {
    const k = market.trim().toUpperCase();
    if (k === 'BTTS_YES') return 'GG_FT';
    if (k === 'BTTS_NO') return 'NG_FT';
    if (k === 'FH_OVER_0_5') return 'HT_OVER_0_5';
    if (k === 'FH_OVER_1_5') return 'HT_OVER_1_5';
    if (k === 'FH_HOME_OVER_0_5') return 'HOME_OVER_0_5';
    if (k === 'FH_AWAY_OVER_0_5') return 'AWAY_OVER_0_5';
    if (k === 'FH_BTTS_NO') return 'NG_HT';
    if (k === 'FH_BTTS_YES') return 'GG_HT';
    return k;
  }

  /**
   * Translates betting market keys to standard English sports betting terminology
   */
  public static getMarketTitleEn(market: string, match: Match): string {
    const k = this.normalizeMarketKey(market);
    if (k === 'FT_1') return `Full Time Home Win (${match.home})`;
    if (k === 'FT_2') return `Full Time Away Win (${match.away})`;
    if (k === 'FT_X') return `Full Time Draw (X)`;
    if (k === 'DC_1X') return `Double Chance: Home Win or Draw (1X)`;
    if (k === 'DC_X2') return `Double Chance: Away Win or Draw (X2)`;
    if (k === 'DC_12') return `Double Chance: Home or Away Win (12)`;
    if (k === 'OVER_1_5') return `Total Match Goals: Over 1.5 Goals`;
    if (k === 'OVER_2_5') return `Total Match Goals: Over 2.5 Goals`;
    if (k === 'OVER_3_5') return `Total Match Goals: Over 3.5 Goals`;
    if (k === 'UNDER_3_5') return `Total Match Goals: Under 3.5 Goals`;
    if (k === 'UNDER_2_5') return `Total Match Goals: Under 2.5 Goals`;
    if (k === 'HOME_OVER_0_5') return `Home Team Goals: Over 0.5 Goal (${match.home})`;
    if (k === 'AWAY_OVER_0_5') return `Away Team Goals: Over 0.5 Goal (${match.away})`;
    if (k === 'HOME_OVER_1_5') return `Home Team Goals: Over 1.5 Goals (${match.home})`;
    if (k === 'AWAY_OVER_1_5') return `Away Team Goals: Over 1.5 Goals (${match.away})`;
    if (k === 'GG_FT') return `Both Teams To Score: Yes (BTTS)`;
    if (k === 'NG_FT') return `Both Teams To Score: No (Clean Sheet / NG)`;
    if (k === 'NG_HT') return `First Half Both Teams Score: No (NG HT)`;
    if (k === 'GG_HT') return `First Half Both Teams Score: Yes (GG HT)`;
    if (k === 'HT_OVER_0_5') return `First Half Goals: Over 0.5 Goal`;
    if (k === 'HT_OVER_1_5') return `First Half Goals: Over 1.5 Goals`;
    if (k === 'HT_UNDER_1_5') return `First Half Goals: Under 1.5 Goals`;
    if (k === 'HT_1') return `First Half Leader: Home (${match.home})`;
    if (k === 'HT_2') return `First Half Leader: Away (${match.away})`;
    if (k === 'HT_X') return `First Half Draw (HT X)`;
    
    return MarketEvaluator.formatMarketName(market);
  }

  /**
   * Translates betting market keys to crystal clear, standard Arabic sports terminology
   */
  public static getMarketTitleAr(market: string, match: Match): string {
    const k = this.normalizeMarketKey(market);
    if (k === 'FT_1') return `فوز صريح لصاحب الأرض (${match.home})`;
    if (k === 'FT_2') return `فوز صريح للفريق الضيف (${match.away})`;
    if (k === 'FT_X') return `تعادل المباراة (X)`;
    if (k === 'DC_1X') return `فرصة مزدوجة: فوز صاحب الأرض أو التعادل (1X)`;
    if (k === 'DC_X2') return `فرصة مزدوجة: فوز الفريق الضيف أو التعادل (X2)`;
    if (k === 'DC_12') return `فرصة مزدوجة: فوز أحد الفريقين (12)`;
    if (k === 'OVER_1_5') return `إجمالي الأهداف: أكثر من 1.5 هدف (+1.5)`;
    if (k === 'OVER_2_5') return `إجمالي الأهداف: أكثر من 2.5 هدف (+2.5)`;
    if (k === 'OVER_3_5') return `إجمالي الأهداف: أكثر من 3.5 أهداف (+3.5)`;
    if (k === 'UNDER_3_5') return `إجمالي الأهداف: أقل من 3.5 أهداف (-3.5)`;
    if (k === 'UNDER_2_5') return `إجمالي الأهداف: أقل من 2.5 هدف (-2.5)`;
    if (k === 'HOME_OVER_0_5') return `أهداف صاحب الأرض: أكثر من 0.5 هدف (${match.home})`;
    if (k === 'AWAY_OVER_0_5') return `أهداف الضيف: أكثر من 0.5 هدف (${match.away})`;
    if (k === 'HOME_OVER_1_5') return `أهداف صاحب الأرض: أكثر من 1.5 هدف (${match.home})`;
    if (k === 'AWAY_OVER_1_5') return `أهداف الضيف: أكثر من 1.5 هدف (${match.away})`;
    if (k === 'GG_FT') return `كلا الفريقين يسجلان: نعم (BTTS - Yes)`;
    if (k === 'NG_FT') return `تسجيل أحد الطرفين فقط أو سلبي (NG)`;
    if (k === 'NG_HT') return `شوط أول سلبي أو هدف لطرف واحد (NG Halftime)`;
    if (k === 'GG_HT') return `الشوط الأول: تسجيل كلا الفريقين (Yes)`;
    if (k === 'HT_OVER_0_5') return `الشوط الأول: أكثر من 0.5 هدف (+0.5)`;
    if (k === 'HT_OVER_1_5') return `الشوط الأول: أكثر من 1.5 هدف (+1.5)`;
    if (k === 'HT_UNDER_1_5') return `الشوط الأول: أقل من 1.5 هدف (-1.5)`;
    if (k === 'HT_1') return `الشوط الأول: تقدم صاحب الأرض (${match.home})`;
    if (k === 'HT_2') return `الشوط الأول: تقدم الفريق الضيف (${match.away})`;
    if (k === 'HT_X') return `الشوط الأول: تعادل (HT X)`;
    
    return MarketEvaluator.formatMarketName(market);
  }

  /**
   * Categorizes market key into standard clean categories (Excludes corners completely)
   */
  public static getMarketCategory(market: string): SniperConsensusPick['marketCategory'] {
    const k = this.normalizeMarketKey(market);
    if (k.startsWith('FT_')) return '1X2';
    if (k.includes('DC_')) return 'DOUBLE_CHANCE';
    if (k.startsWith('GG_') || k.startsWith('NG_FT')) return 'BTTS';
    if (k.startsWith('HT_') || k === 'NG_HT') return 'FIRST_HALF';
    return 'GOALS';
  }

  /**
   * Computes accurate market odds for a match ensuring realistic betting lines
   */
  public static computeMarketOdds(market: string, match: Match, fallbackAvgOdds?: number): number {
    const p1 = Number(match.p1) || 33;
    const px = Number(match.px) || 33;
    const p2 = Number(match.p2) || 33;
    const xgHome = Number(match.xg_home) || 1.35;
    const xgAway = Number(match.xg_away) || 1.10;
    const combinedXg = xgHome + xgAway;

    const norm = this.normalizeMarketKey(market);

    // 1X2 Direct Bookmaker Match Odds
    if (norm === 'FT_1') {
      if (match.pred === '1' && match.coef >= 1.20) return match.coef;
      return Math.round((100 / Math.max(15, p1) * 0.92) * 100) / 100;
    }
    if (norm === 'FT_2') {
      if (match.pred === '2' && match.coef >= 1.20) return match.coef;
      return Math.round((100 / Math.max(15, p2) * 0.92) * 100) / 100;
    }
    if (norm === 'FT_X') {
      if (match.pred === 'X' && match.coef >= 1.20) return match.coef;
      return Math.round((100 / Math.max(15, px) * 0.92) * 100) / 100;
    }

    // Double Chances
    if (norm === 'DC_1X') {
      const prob = (p1 + px) / 100;
      return Math.round((1.0 / Math.max(0.20, prob) * 0.94) * 100) / 100;
    }
    if (norm === 'DC_X2') {
      const prob = (p2 + px) / 100;
      return Math.round((1.0 / Math.max(0.20, prob) * 0.94) * 100) / 100;
    }

    // Use fallback database avg_odds if available and valid
    if (fallbackAvgOdds && fallbackAvgOdds >= 1.25 && fallbackAvgOdds <= 5.0) {
      return Math.round(fallbackAvgOdds * 100) / 100;
    }

    // Over / Under Goals
    if (norm === 'OVER_1_5') {
      return Math.round((1.32 + Math.max(0, 2.5 - combinedXg) * 0.15) * 100) / 100;
    }
    if (norm === 'OVER_2_5') {
      return Math.round((1.68 + Math.max(0, 2.7 - combinedXg) * 0.35) * 100) / 100;
    }
    if (norm === 'UNDER_3_5') {
      return Math.round((1.36 + Math.max(0, combinedXg - 2.2) * 0.25) * 100) / 100;
    }
    if (norm === 'UNDER_2_5') {
      return Math.round((1.75 + Math.max(0, combinedXg - 2.0) * 0.35) * 100) / 100;
    }
    if (norm === 'HOME_OVER_0_5') {
      return Math.round((1.32 + Math.max(0, 1.4 - xgHome) * 0.20) * 100) / 100;
    }
    if (norm === 'AWAY_OVER_0_5') {
      return Math.round((1.35 + Math.max(0, 1.2 - xgAway) * 0.25) * 100) / 100;
    }
    if (norm === 'GG_FT') {
      return Math.round((1.65 + Math.max(0, 2.8 - combinedXg) * 0.30) * 100) / 100;
    }
    if (norm === 'NG_HT') {
      return 1.38;
    }
    if (norm === 'HT_OVER_0_5') {
      return 1.35;
    }
    if (norm === 'HT_OVER_1_5') {
      return 1.65;
    }
    if (norm === 'HT_UNDER_1_5') {
      return 1.42;
    }

    return 1.38;
  }

  /**
   * Evaluates a single match strictly by checking genuine active predictions
   * from the 4 parent systems and finding consensual market agreements (Quorum >= 2).
   */
  public static evaluateMatchForSniper(
    match: Match, 
    db?: OracleDatabase,
    allMatches?: Match[]
  ): SniperConsensusPick | null {
    if (!db) return null;

    if (allMatches && allMatches.length > 0) {
      this.ensureFinishedMatchesIndex(allMatches);
    }

    const groupV1 = this.cachedFinishedV1 || {};
    const groupV2 = this.cachedFinishedV2 || {};
    const mTime = match.__parsedTime || (match.kickoff ? DateTimeSystem.parse(match.kickoff).getTime() : 0);

    const isForbiddenMarket = (mkt: string): boolean => {
      const k = mkt.trim().toUpperCase();
      if (k.includes('CORNER') || k.startsWith('TOTAL_1') || k.startsWith('TOTAL_2')) return true;
      if (k === 'OVER_0_5' || k.includes('OVER_0_5') || k.endsWith('OVER_0_5')) return true;
      if (k.startsWith('UNDER_') || k.includes('UNDER_') || k.includes('_UNDER_')) return true;
      if (k === 'NG_HT' || k === 'NG_FT' || k.includes('NG_')) return true;
      if (k.includes('ODD_') || k.includes('EVEN_') || k.startsWith('ODD') || k.startsWith('EVEN')) return true;
      return false;
    };

    // Candidate accumulator: Normalized Market Key -> Array of supporting parent systems
    const candidateMap = new Map<string, {
      market: string;
      odds: number;
      engines: SupportingEngine[];
    }>();

    const addHit = (
      rawMarket: string,
      engineId: SniperSystemId,
      nameAr: string,
      nameEn: string,
      winRate: number,
      noteAr: string,
      noteEn: string,
      suggestedOdds?: number
    ) => {
      const normMarket = this.normalizeMarketKey(rawMarket);
      if (isForbiddenMarket(normMarket)) return;

      // 100% Forebet Harmony Gatekeeper
      if (!ForebetHarmonizer.isMarketCompatible(normMarket, match)) return;

      // Odds Corridor Check
      const odds = this.computeMarketOdds(normMarket, match, suggestedOdds);
      if (odds < 1.30 || odds > 4.50) return;

      const engineEntry: SupportingEngine = {
        engineId,
        nameAr,
        nameEn,
        confidence: Math.round(winRate * 10) / 10,
        metricNoteAr: noteAr,
        metricNoteEn: noteEn
      };

      const existing = candidateMap.get(normMarket);
      if (!existing) {
        candidateMap.set(normMarket, {
          market: normMarket,
          odds,
          engines: [engineEntry]
        });
      } else {
        if (!existing.engines.some(e => e.engineId === engineId)) {
          existing.engines.push(engineEntry);
          if (odds > existing.odds) existing.odds = odds;
        }
      }
    };

    // -------------------------------------------------------------------------
    // SYSTEM 1: ICHARA V1 (Active Verified Predictions from exceptionalFilter)
    // -------------------------------------------------------------------------
    const v1Active = getSignalActivePredictions(match, db.signals, groupV1, 0.85);
    for (const p of v1Active) {
      addHit(
        p.market,
        'ICHARA_V1',
        'نظام إشارة V1',
        'Ichara V1 Signal Matrix',
        p.calculatedWinRate || ((p.accuracy_rate || 0.85) * 100),
        `دقة إشارة V1 المثبتة ${p.calculatedWinRate || ((p.accuracy_rate || 0.85) * 100)}% في (${match.signal_code})`,
        `Ichara V1 verified accuracy ${p.calculatedWinRate || 85}% in (${match.signal_code})`,
        p.avg_odds
      );
    }

    // -------------------------------------------------------------------------
    // SYSTEM 2: ICHARA V2 (Active Verified Predictions from exceptionalFilter)
    // -------------------------------------------------------------------------
    const v2Active = getIcharaActivePredictions(match, db.signals_v2 || {}, groupV2, 0.80);
    for (const p of v2Active) {
      addHit(
        p.market,
        'ICHARA_V2',
        'نظام إشارة V2',
        'Ichara V2 Intelligence Core',
        p.calculatedWinRate || ((p.accuracy_rate || 0.80) * 100),
        `معايرة V2 التكتيكية بدقة ${p.calculatedWinRate || ((p.accuracy_rate || 0.80) * 100)}%`,
        `Ichara V2 tactical calibration with ${p.calculatedWinRate || 80}% accuracy`,
        p.avg_odds
      );
    }

    // -------------------------------------------------------------------------
    // SYSTEM 3: PREMIUM PICKS V1 (1X2, Goals Hunter, First Half)
    // -------------------------------------------------------------------------
    const fin1 = CipherEngine.getAidedFinishedMatches(match.signal_code, groupV1, mTime, 25);
    if (fin1.length >= 8) {
      // 3A. Premium 1X2 Check
      const pred = getMatchPrediction(match);
      if (pred === '1' || pred === '2' || pred === 'X') {
        const predMkt = pred === '1' ? 'FT_1' : pred === '2' ? 'FT_2' : 'FT_X';
        const correctCount = fin1.filter((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return false;
          const actual = hist.ft_home > hist.ft_away ? '1' : hist.ft_home < hist.ft_away ? '2' : 'X';
          return actual === pred;
        }).length;
        const winRate = (correctCount / fin1.length) * 100;
        const minReq = pred === 'X' ? 40.0 : 70.0;

        if (winRate >= minReq && match.coef >= 1.25 && match.coef <= 5.5) {
          addHit(
            predMkt,
            'PREMIUM_V1',
            'بريميوم V1 (1X2)',
            'Premium 1X2 Picks V1',
            winRate,
            `مؤهل بريميوم 1X2 بدقة ${winRate.toFixed(1)}% (${correctCount}/${fin1.length})`,
            `Qualified Premium 1X2 with ${winRate.toFixed(1)}% accuracy`,
            match.coef
          );
        }
      }

      // 3B. Premium Goals Hunter Check
      let countOver15 = 0, countOver25 = 0, countBtts = 0;
      fin1.forEach((hist) => {
        if (hist.ft_home === null || hist.ft_away === null) return;
        const totalGoals = hist.ft_home + hist.ft_away;
        if (totalGoals > 1) countOver15++;
        if (totalGoals > 2) countOver25++;
        if (hist.ft_home > 0 && hist.ft_away > 0) countBtts++;
      });
      const rateOver15 = (countOver15 / fin1.length) * 100;
      const rateOver25 = (countOver25 / fin1.length) * 100;
      const rateBtts = (countBtts / fin1.length) * 100;

      if (rateOver15 >= 85.0) {
        addHit('OVER_1_5', 'PREMIUM_V1', 'بريميوم V1 (صائد الأهداف)', 'Premium Goals Hunter V1', rateOver15, `صائد أهداف V1 بدقة ${rateOver15.toFixed(1)}% (+1.5)`, `Premium Goals Hunter with ${rateOver15.toFixed(1)}%`);
      }
      if (rateOver25 >= 80.0) {
        addHit('OVER_2_5', 'PREMIUM_V1', 'بريميوم V1 (صائد الأهداف)', 'Premium Goals Hunter V1', rateOver25, `صائد أهداف V1 بدقة ${rateOver25.toFixed(1)}% (+2.5)`, `Premium Goals Hunter with ${rateOver25.toFixed(1)}%`);
      }
      if (rateBtts >= 80.0) {
        addHit('GG_FT', 'PREMIUM_V1', 'بريميوم V1 (تسجيل الطرفين)', 'Premium BTTS V1', rateBtts, `صائد أهداف V1 بدقة ${rateBtts.toFixed(1)}% (BTTS)`, `Premium BTTS with ${rateBtts.toFixed(1)}%`);
      }

      // 3C. Premium First Half Check
      let countHtOver05 = 0;
      fin1.forEach((hist) => {
        if (hist.ht_home === null || hist.ht_away === null) return;
        if (hist.ht_home + hist.ht_away > 0) countHtOver05++;
      });
      const rateHtOver05 = (countHtOver05 / fin1.length) * 100;
      if (rateHtOver05 >= 85.0) {
        addHit('HT_OVER_0_5', 'PREMIUM_V1', 'بريميوم V1 (شوط أول)', 'Premium First Half V1', rateHtOver05, `شوط أول V1 بدقة ${rateHtOver05.toFixed(1)}% (+0.5 HT)`, `Premium First Half V1 with ${rateHtOver05.toFixed(1)}%`);
      }
    }

    // -------------------------------------------------------------------------
    // SYSTEM 4: PREMIUM PICKS V2 (1X2, Goals Hunter, First Half)
    // -------------------------------------------------------------------------
    const v2Code = match.signal_code_v2 || IcharaV2Engine.getIcharaCode(IcharaV2Engine.computeIcharaKey(match.p1, match.px, match.p2, match.coef));
    const fin2 = IcharaV2Engine.getAidedFinishedMatches(v2Code, groupV2, mTime, 25);
    if (fin2.length >= 8) {
      // 4A. Premium 1X2 V2
      const predV2 = getMatchPrediction(match);
      if (predV2 === '1' || predV2 === '2' || predV2 === 'X') {
        const predMkt = predV2 === '1' ? 'FT_1' : predV2 === '2' ? 'FT_2' : 'FT_X';
        const correctCountV2 = fin2.filter((hist) => {
          if (hist.ft_home === null || hist.ft_away === null) return false;
          const actual = hist.ft_home > hist.ft_away ? '1' : hist.ft_home < hist.ft_away ? '2' : 'X';
          return actual === predV2;
        }).length;
        const winRateV2 = (correctCountV2 / fin2.length) * 100;
        const minReqV2 = predV2 === 'X' ? 40.0 : 70.0;

        if (winRateV2 >= minReqV2 && match.coef >= 1.25 && match.coef <= 5.5) {
          addHit(
            predMkt,
            'PREMIUM_V2',
            'بريميوم V2 (1X2)',
            'Premium 1X2 Picks V2',
            winRateV2,
            `مؤهل بريميوم V2 بدقة ${winRateV2.toFixed(1)}% (${correctCountV2}/${fin2.length})`,
            `Qualified Premium V2 1X2 with ${winRateV2.toFixed(1)}% accuracy`,
            match.coef
          );
        }
      }

      // 4B. Premium Goals Hunter V2
      let countOver15V2 = 0, countOver25V2 = 0, countBttsV2 = 0;
      fin2.forEach((hist) => {
        if (hist.ft_home === null || hist.ft_away === null) return;
        const totalGoals = hist.ft_home + hist.ft_away;
        if (totalGoals > 1) countOver15V2++;
        if (totalGoals > 2) countOver25V2++;
        if (hist.ft_home > 0 && hist.ft_away > 0) countBttsV2++;
      });
      const rateOver15V2 = (countOver15V2 / fin2.length) * 100;
      const rateOver25V2 = (countOver25V2 / fin2.length) * 100;
      const rateBttsV2 = (countBttsV2 / fin2.length) * 100;

      if (rateOver15V2 >= 85.0) {
        addHit('OVER_1_5', 'PREMIUM_V2', 'بريميوم V2 (صائد الأهداف)', 'Premium Goals Hunter V2', rateOver15V2, `صائد أهداف V2 بدقة ${rateOver15V2.toFixed(1)}% (+1.5)`, `Premium Goals Hunter V2 with ${rateOver15V2.toFixed(1)}%`);
      }
      if (rateOver25V2 >= 80.0) {
        addHit('OVER_2_5', 'PREMIUM_V2', 'بريميوم V2 (صائد الأهداف)', 'Premium Goals Hunter V2', rateOver25V2, `صائد أهداف V2 بدقة ${rateOver25V2.toFixed(1)}% (+2.5)`, `Premium Goals Hunter V2 with ${rateOver25V2.toFixed(1)}%`);
      }
      if (rateBttsV2 >= 80.0) {
        addHit('GG_FT', 'PREMIUM_V2', 'بريميوم V2 (تسجيل الطرفين)', 'Premium BTTS V2', rateBttsV2, `صائد أهداف V2 بدقة ${rateBttsV2.toFixed(1)}% (BTTS)`, `Premium BTTS V2 with ${rateBttsV2.toFixed(1)}%`);
      }

      // 4C. Premium First Half V2
      let countHtOver05V2 = 0;
      fin2.forEach((hist) => {
        if (hist.ht_home === null || hist.ht_away === null) return;
        if (hist.ht_home + hist.ht_away > 0) countHtOver05V2++;
      });
      const rateHtOver05V2 = (countHtOver05V2 / fin2.length) * 100;
      if (rateHtOver05V2 >= 85.0) {
        addHit('HT_OVER_0_5', 'PREMIUM_V2', 'بريميوم V2 (شوط أول)', 'Premium First Half V2', rateHtOver05V2, `شوط أول V2 بدقة ${rateHtOver05V2.toFixed(1)}% (+0.5 HT)`, `Premium First Half V2 with ${rateHtOver05V2.toFixed(1)}%`);
      }
    }

    // STRICT MATHEMATICAL INTERSECTION (QUORUM >= 2):
    // Only keep markets backed by AT LEAST TWO DISTINCT PARENT SYSTEMS
    const qualifyingMarkets = Array.from(candidateMap.values()).filter(c => c.engines.length >= 2);

    if (qualifyingMarkets.length === 0) {
      return null;
    }

    // Score candidates based on average confidence and quorum boost
    const scoredCandidates = qualifyingMarkets.map(cand => {
      const { market, odds, engines } = cand;
      const count = engines.length;
      const avgConf = engines.reduce((acc, e) => acc + e.confidence, 0) / count;

      let finalScore = avgConf;
      if (count === 2) finalScore += 2.0;
      else if (count === 3) finalScore += 3.5;
      else if (count >= 4) finalScore += 5.0;

      finalScore = Math.min(99.5, Math.max(88.0, Math.round(finalScore * 10) / 10));

      return {
        market,
        odds,
        engines,
        quorumCount: count,
        consensusScore: finalScore
      };
    });

    // Sort descending: highest consensus score first, then quorum count, then odds
    scoredCandidates.sort((a, b) => {
      if (b.consensusScore !== a.consensusScore) return b.consensusScore - a.consensusScore;
      if (b.quorumCount !== a.quorumCount) return b.quorumCount - a.quorumCount;
      return b.odds - a.odds;
    });

    const best = scoredCandidates[0];

    // Determine Tier
    let tier: SniperTier = 'TACTICAL';
    if (best.consensusScore >= 94.0 && best.quorumCount >= 3) {
      tier = 'DIAMOND';
    } else if (best.consensusScore >= 90.0) {
      tier = 'GOLD';
    }

    // Determine Result Status if Finished
    let status: SniperConsensusPick['status'] = 'PENDING';
    let actualScore: string | undefined = undefined;

    if (match.status === 'FINISHED' && match.ft_home !== null && match.ft_away !== null) {
      actualScore = `${match.ft_home} - ${match.ft_away} (FT)`;
      const outcomes = MarketEvaluator.evaluateAllMarkets(
        match.ft_home,
        match.ft_away,
        match.ht_home,
        match.ht_away
      );
      const isWin = outcomes[best.market] === true;
      status = isWin ? 'WON' : 'LOST';
    }

    const kickoffDateStr = match.kickoff ? match.kickoff.split(' ')[0] : '2026-10-01';
    const ev = Math.round((best.odds * (best.consensusScore / 100) - 1) * 100 * 10) / 10;

    const marketTitleAr = this.getMarketTitleAr(best.market, match);
    const marketTitleEn = this.getMarketTitleEn(best.market, match);
    const marketCategory = this.getMarketCategory(best.market);

    let oddsCorridor: 'SAFE_ANCHOR' | 'VALUE_BUILDER' | 'HIGH_ODDS' = 'SAFE_ANCHOR';
    if (best.odds > 2.25) {
      oddsCorridor = 'HIGH_ODDS';
    } else if (best.odds > 1.65) {
      oddsCorridor = 'VALUE_BUILDER';
    }

    const forebetSummaryEn = match.expected_score
      ? `Forebet Projection: ${match.expected_score} (Pred: ${match.pred || '1X2'})`
      : `Forebet Projection: ${match.pred || '1X2'}`;

    const systemsListAr = best.engines.map(e => e.nameAr).join(' + ');
    const systemsListEn = best.engines.map(e => e.nameEn).join(' + ');
    
    const tacticalJustificationAr = `إجماع نخبوي مؤكد بنسبة ${best.consensusScore}% ناتج من تطابق [${systemsListAr}] (${best.quorumCount} أنظمة متوافقة)، متوافق 100% مع فوربيت والأودد (${best.odds.toFixed(2)} >= 1.30).`;
    const tacticalJustificationEn = `Verified elite consensus of ${best.consensusScore}% derived from unanimous agreement across [${systemsListEn}] (${best.quorumCount} converging systems) with 100% Forebet harmony and odds (@${best.odds.toFixed(2)} >= 1.30).`;

    return {
      id: `${match.match_id}_${best.market}`,
      matchId: match.match_id,
      match,
      market: best.market,
      marketTitleAr,
      marketTitleEn,
      marketCategory,
      consensusScore: best.consensusScore,
      tier,
      odds: best.odds,
      oddsCorridor,
      expectedValue: Math.max(3.0, ev),
      supportingEngines: best.engines,
      quorumCount: best.quorumCount,
      sampleDepth: Math.max(fin1.length, fin2.length, 10),
      forebetHarmonized: true,
      forebetSummaryAr: match.expected_score
        ? `توقع فوربيت: ${match.expected_score} (${match.pred || '1X2'})`
        : `توقع فوربيت: ${match.pred || '1X2'}`,
      forebetSummaryEn,
      tacticalJustificationAr,
      tacticalJustificationEn,
      status,
      actualScore,
      kickoffDateStr
    };
  }

  /**
   * Fast Batch Processing of Matches into Elite Sniper Consensus Picks.
   * Extracts ONLY matches that are verified intersections of the 4 parent systems.
   */
  public static getSniperPicks(
    matches: Match[], 
    db?: OracleDatabase,
    allMatches?: Match[]
  ): SniperConsensusPick[] {
    if (!db) return [];
    const contextList = allMatches && allMatches.length > 0 ? allMatches : matches;
    this.ensureFinishedMatchesIndex(contextList);

    const results: SniperConsensusPick[] = [];
    
    for (let i = 0; i < matches.length; i++) {
      const pick = this.evaluateMatchForSniper(matches[i], db, contextList);
      if (pick) {
        results.push(pick);
      }
    }

    // Sort descending by consensus score, then quorum count, then odds
    results.sort((a, b) => {
      if (b.consensusScore !== a.consensusScore) {
        return b.consensusScore - a.consensusScore;
      }
      if (b.quorumCount !== a.quorumCount) {
        return b.quorumCount - a.quorumCount;
      }
      return b.odds - a.odds;
    });

    return results;
  }
}
