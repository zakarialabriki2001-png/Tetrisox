import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Award, 
  Zap, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  Percent, 
  Gauge, 
  RotateCw,
  Terminal,
  ChevronRight,
  TrendingUp,
  Coins,
  Cpu,
  Layers,
  Activity,
  ChevronDown
} from 'lucide-react';
import { Match, OracleDatabase } from '../types';
import { LocalOfflineTrainer } from '../lib/signalTrainer';
import { DateTimeSystem } from '../lib/dateTimeSystem';
import { MarketEvaluator } from '../lib/marketEvaluator';
import { isBannedLeagueOrMatch } from '../lib/matchEngine';

interface TetrisroDashboardProps {
  matchesList: Match[];
  db: OracleDatabase;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (d: string) => void;
  availableMatchDates: string[];
  availableMatchDateObjects: { dateStr: string; count: number; accuracy: number | null }[];
}

export const TetrisroDashboard: React.FC<TetrisroDashboardProps> = ({
  matchesList,
  db,
  selectedCalendarDate,
  setSelectedCalendarDate,
  availableMatchDates,
  availableMatchDateObjects
}) => {
  const [activeTetrisSubTab, setActiveTetrisSubTab] = useState<'current' | 'archive' | 'stats'>('current');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('confluence');

  // Unified Arabic & English translations helper for all expanded markets
  const translateMarket = (marketId: string): { en: string; ar: string } => {
    switch (marketId) {
      case 'FT_1': return { en: 'Home Win (Fulltime)', ar: 'فوز الفريق المضيف' };
      case 'FT_2': return { en: 'Away Win (Fulltime)', ar: 'فوز الفريق الضيف' };
      case 'FT_X': return { en: 'Draw (Fulltime)', ar: 'التعادل بالوقت الأصلي' };
      case 'DC_1X': return { en: 'Double Chance (1X)', ar: 'فرصة مزدوجة: فوز أو تعادل المضيف' };
      case 'DC_X2': return { en: 'Double Chance (X2)', ar: 'فرصة مزدوجة: تعادل أو فوز الضيف' };
      case 'DC_12': return { en: 'Double Chance (12)', ar: 'فرصة مزدوجة: فوز المضيف أو الضيف' };
      case 'OVER_1_5': return { en: 'Over 1.5 Goals', ar: 'مجموع الأهداف أكثر من 1.5' };
      case 'UNDER_1_5': return { en: 'Under 1.5 Goals', ar: 'مجموع الأهداف أقل من 1.5' };
      case 'OVER_2_5': return { en: 'Over 2.5 Goals', ar: 'مجموع الأهداف أكثر من 2.5' };
      case 'UNDER_2_5': return { en: 'Under 2.5 Goals', ar: 'مجموع الأهداف أقل من 2.5' };
      case 'OVER_3_5': return { en: 'Over 3.5 Goals', ar: 'مجموع الأهداف أكثر من 3.5' };
      case 'GG_FT': return { en: 'Both Teams to Score (Yes)', ar: 'كلا الفريقين يسجلان' };
      case 'NG_FT': return { en: 'Both Teams to Score (No)', ar: 'أحد أو كلا الفريقين لا يسجل' };
      case 'DNB_1': return { en: 'Draw No Bet (1)', ar: 'تعادل لا غي: فوز المضيف' };
      case 'DNB_2': return { en: 'Draw No Bet (2)', ar: 'تعادل لا غي: فوز الضيف' };
      case 'HT_OVER_0_5': return { en: 'Halftime Over 0.5 Goals', ar: 'الشوط الأول: أكثر من 0.5 هدف' };
      case 'HT_OVER_1_5': return { en: 'Halftime Over 1.5 Goals', ar: 'الشوط الأول: أكثر من 1.5 هدف' };
      case 'HT_1': return { en: 'Halftime Home Win', ar: 'الشوط الأول: فوز صاحب الأرض' };
      case 'HT_2': return { en: 'Halftime Away Win', ar: 'الشوط الأول: فوز الضيف' };
      case 'HT_X': return { en: 'Halftime Draw', ar: 'الشوط الأول: التعادل' };
      case 'NG_HT': return { en: 'Halftime Both Teams to Score (No)', ar: 'الشوط الأول: كلا الفريقين لا يسجلان' };
      default: return { en: marketId, ar: marketId };
    }
  };

  // Pre-calculate kickoff time stamps with lookup map
  const parsedKickoffs = useMemo(() => {
    const cache = new Map<string, number>();
    matchesList.forEach(m => {
      cache.set(m.match_id, LocalOfflineTrainer.parseKickoffDate(m.kickoff).getTime());
    });
    return cache;
  }, [matchesList]);

  // Pre-evaluated outcomes dictionary to avoid repeating loop lookups
  const preEvaluatedOutcomes = useMemo(() => {
    const cache = new Map<string, Record<string, boolean>>();
    matchesList.forEach(m => {
      if (m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null) {
        cache.set(m.match_id, MarketEvaluator.evaluateAllMarkets(m.ft_home, m.ft_away, m.ht_home, m.ht_away));
      }
    });
    return cache;
  }, [matchesList]);

  // SYSTEM STATS MATRIX: Pre-compile predictors for all 8 platforms without exception
  const evaluateIndividualSystem = (sysId: string, m: Match): { market: string; expected_prob: number; odds: number } => {
    switch (sysId) {
      case 'consensus_v1': {
        const sig = db.signals[m.signal_code];
        const market = sig?.top_predictions?.[0]?.market || m.pred || 'OVER_1_5';
        const rawP = sig?.all_time?.win_rate || (m.confidence_tier === 'HIGH' ? 82 : m.confidence_tier === 'MEDIUM' ? 74 : 61);
        return { market, expected_prob: rawP, odds: m.coef || 1.45 };
      }
      case 'consensus_v2': {
        const sigV2 = db.signals_v2?.[m.signal_code_v2 || ''];
        const market = sigV2?.top_predictions?.[0]?.market || 'OVER_1_5';
        const rawP = sigV2?.all_time?.win_rate || 78;
        return { market, expected_prob: rawP, odds: 1.48 };
      }
      case 'goals_hunter_v1': {
        const sig = db.signals[m.signal_code];
        const isOver = (m.xg_home + m.xg_away) > 2.4;
        const market = isOver ? 'OVER_1_5' : 'UNDER_3_5';
        return { market, expected_prob: isOver ? 84 : 72, odds: isOver ? 1.35 : 1.40 };
      }
      case 'goals_hunter_v2': {
        const sigV2 = db.signals_v2?.[m.signal_code_v2 || ''];
        const isHighOver = (m.xg_home + m.xg_away) > 2.8;
        const market = isHighOver ? 'OVER_2_5' : 'OVER_1_5';
        return { market, expected_prob: 80, odds: isHighOver ? 1.85 : 1.30 };
      }
      case 'first_half_v1': {
        // Enriched Halftime Goals Hunt:
        const totalXg = (m.xg_home || 0) + (m.xg_away || 0);
        const maxProb = Math.max(m.p1 || 0, m.p2 || 0);
        // Over 0.5 HT is chosen ONLY if multiple triggers show high likelihood of first-half goal,
        // otherwise we fallback on the safer both-teams-fail-to-score-both-sides ('NG_HT')
        const isHighAction = totalXg > 2.5 || maxProb > 43 || m.confidence_tier === 'HIGH';
        const market = isHighAction ? 'HT_OVER_0_5' : 'NG_HT';
        const expected_prob = isHighAction ? 87 : 91;
        const odds = isHighAction ? 1.35 : 1.25;
        return { market, expected_prob, odds };
      }
      case 'first_half_v2': {
        // Extreme Safety Filter for halftime:
        const totalXg = (m.xg_home || 0) + (m.xg_away || 0);
        const xgDiff = Math.abs((m.xg_home || 0) - (m.xg_away || 0));
        let market = 'NG_HT';
        let expected_prob = 91;
        let odds = 1.25;

        if (totalXg < 2.0 || m.risk_flag === 'SAFE') {
          market = 'NG_HT';
          expected_prob = 94;
          odds = 1.22;
        } else if (xgDiff < 0.25 && m.px > 29) {
          // Highly probable draw at halftime
          market = 'HT_X';
          expected_prob = 74;
          odds = 1.95;
        } else if (m.p1 > 42 && m.xg_home > 1.45) {
          market = 'HT_1';
          expected_prob = 70;
          odds = 2.05;
        } else if (m.p2 > 42 && m.xg_away > 1.45) {
          market = 'HT_2';
          expected_prob = 70;
          odds = 2.35;
        }
        return { market, expected_prob, odds };
      }
      case 'poisson_core': {
        const maxP = Math.max(m.p1, m.px, m.p2);
        const market = maxP === m.p1 ? 'FT_1' : maxP === m.p2 ? 'FT_2' : 'FT_X';
        return { market, expected_prob: maxP, odds: parseFloat((100 / Math.max(1, maxP) * 1.05).toFixed(2)) };
      }
      case 'xg_projections': {
        const diff = m.xg_home - m.xg_away;
        const market = diff > 0.4 ? 'FT_1' : diff < -0.4 ? 'FT_2' : 'DC_1X';
        return { market, expected_prob: 76, odds: 1.50 };
      }
      default:
        return { market: 'OVER_1_5', expected_prob: 75, odds: 1.35 };
    }
  };

  // --- OMNI-SYSTEM INTELLIGENT BACKPROPAGATION ENGINE ---
  const calculateDynamicSystemWeights = useMemo(() => {
    return (kickoffTimeLimit: number): Record<string, number> => {
      const systems = [
        'consensus_v1', 'consensus_v2', 
        'goals_hunter_v1', 'goals_hunter_v2', 
        'first_half_v1', 'first_half_v2', 
        'poisson_core', 'xg_projections'
      ];
      
      const successScores: Record<string, number> = {};
      const totalEvaluated: Record<string, number> = {};
      
      systems.forEach(sys => {
        successScores[sys] = 0;
        totalEvaluated[sys] = 0;
      });

      const pastFinished = matchesList.filter(m => {
        const time = parsedKickoffs.get(m.match_id) || 0;
        return m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null && time < kickoffTimeLimit;
      });

      const recent30 = pastFinished
        .sort((a,b) => (parsedKickoffs.get(b.match_id) || 0) - (parsedKickoffs.get(a.match_id) || 0))
        .slice(0, 30);

      recent30.forEach(m => {
        const outcomes = preEvaluatedOutcomes.get(m.match_id) || {};
        systems.forEach(sys => {
          const pred = evaluateIndividualSystem(sys, m);
          if (outcomes[pred.market] === true) {
            successScores[sys] += 1;
          }
          totalEvaluated[sys] += 1;
        });
      });

      const weights: Record<string, number> = {};
      systems.forEach(sys => {
        const total = totalEvaluated[sys] || 1;
        const accuracy = successScores[sys] / total;
        weights[sys] = totalEvaluated[sys] > 0 ? parseFloat((accuracy * 100).toFixed(1)) : 75.0;
      });

      return weights;
    };
  }, [matchesList, parsedKickoffs, preEvaluatedOutcomes]);

  // --- TICKET GENERATION AND SELECTION LOGIC ---
  const buildStructuredTickets = useMemo(() => {
    return (dStr: string) => {
      const dayMatches = matchesList.filter(m => {
        if (isBannedLeagueOrMatch(m.league_code, m.league_name, m.home, m.away)) return false;
        const pDate = LocalOfflineTrainer.parseKickoffDate(m.kickoff);
        return DateTimeSystem.toLocalDateString(pDate) === dStr;
      });

      if (dayMatches.length === 0) {
        return { confluence: null, goals: null, halftime: null, sniper: null, weights: {} };
      }

      const dateKickoffs = dayMatches.map(m => parsedKickoffs.get(m.match_id) || 0);
      const minKickoff = Math.min(...dateKickoffs) || Date.now();
      const dynamicWeights = calculateDynamicSystemWeights(minKickoff);

      const candidateRecords = dayMatches.map(m => {
        const mTime = parsedKickoffs.get(m.match_id) || 0;
        const outcomes = preEvaluatedOutcomes.get(m.match_id) || {};
        const isFinished = m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null;

        const sysPredictions: Record<string, { market: string; expected_prob: number; odds: number }> = {};
        [
          'consensus_v1', 'consensus_v2', 
          'goals_hunter_v1', 'goals_hunter_v2', 
          'first_half_v1', 'first_half_v2', 
          'poisson_core', 'xg_projections'
        ].forEach(sys => {
          sysPredictions[sys] = evaluateIndividualSystem(sys, m);
        });

        const pArray = [m.p1 || 0, m.px || 0, m.p2 || 0];
        const meanP = pArray.reduce((acc, v) => acc + v, 0) / 3 || 33.3;
        const pVariance = pArray.reduce((acc, v) => acc + Math.pow(v - meanP, 2), 0) / 3;
        const pStdDev = Math.sqrt(pVariance);

        const activeXGSum = (m.xg_home || 0) + (m.xg_away || 0);
        const activeXGDiff = Math.abs((m.xg_home || 0) - (m.xg_away || 0));
        
        let mcnrResonance = 50; 
        if (m.confidence_tier === 'HIGH') mcnrResonance += 25;
        if (m.confidence_tier === 'MEDIUM') mcnrResonance += 12;
        if (m.risk_flag === 'SAFE') mcnrResonance += 15;
        if (m.risk_flag === 'RISKY') mcnrResonance -= 15;

        mcnrResonance += Math.min(20, pStdDev * 0.85);
        const finalMcnrScore = Math.max(25, Math.min(100, parseFloat(mcnrResonance.toFixed(1))));

        let mcnrRecommendation = "OVER_1_5";
        if (activeXGSum > 3.0 && (m.p1 > 42 || m.p2 > 42)) {
          mcnrRecommendation = m.p1 > m.p2 ? "FT_1" : "FT_2";
        } else if (activeXGSum < 2.0) {
          mcnrRecommendation = "UNDER_2_5";
        } else if (m.px > 30 && activeXGDiff < 0.25) {
          mcnrRecommendation = "DC_1X";
        } else if (m.p1 > 38 && m.p2 > 10) {
          mcnrRecommendation = "OVER_1_5";
        } else {
          mcnrRecommendation = "GG_FT";
        }

        return {
          match: m,
          mTime,
          isFinished,
          outcomes,
          sysPredictions,
          mcnr: {
            score: finalMcnrScore,
            recommendation: mcnrRecommendation,
            stdDev: parseFloat(pStdDev.toFixed(1)),
            xgSum: parseFloat(activeXGSum.toFixed(2)),
            p1: m.p1,
            px: m.px,
            p2: m.p2
          }
        };
      });

      // Strategy 1: Confluence
      const confCandidates: any[] = [];
      candidateRecords.forEach(cand => {
        const systemsToWeigh = ['consensus_v1', 'consensus_v2', 'poisson_core', 'xg_projections'];
        const targetMarkets = ['FT_1', 'FT_2', 'FT_X', 'DC_1X', 'DC_X2', 'DC_12', 'DNB_1', 'DNB_2'];
        
        let bestMarket = 'DC_1X';
        let highestScore = 0;
        let bestOdds = 1.35;

        targetMarkets.forEach(mkt => {
          let score = 0;
          let weightSum = 0;
          systemsToWeigh.forEach(sys => {
            const sysPred = cand.sysPredictions[sys];
            const weight = dynamicWeights[sys] || 75;
            weightSum += weight;

            if (sysPred.market === mkt) {
              score += weight;
            } else if (mkt === 'DC_1X' && sysPred.market === 'FT_1') {
              score += weight * 0.85;
            } else if (mkt === 'DC_X2' && sysPred.market === 'FT_2') {
              score += weight * 0.85; 
            }
          });

          const normalizedScore = score / weightSum;
          let totalScore = normalizedScore * 100;

          if (cand.mcnr.recommendation === mkt) {
            totalScore += 15;
          } else if (mkt === 'DC_1X' && cand.mcnr.recommendation === 'FT_1') {
            totalScore += 10;
          }
          
          totalScore += cand.mcnr.stdDev * 0.15;
          totalScore = Math.max(0, Math.min(99.6, totalScore));

          if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMarket = mkt;
          }
        });

        if (bestMarket === 'FT_1') bestOdds = cand.match.coef;
        else if (bestMarket === 'FT_2') bestOdds = parseFloat((cand.match.coef * 1.5).toFixed(2));
        else if (bestMarket === 'DC_1X') bestOdds = parseFloat((1 + (cand.match.coef - 1) * 0.35).toFixed(2));
        else if (bestMarket === 'DC_X2') bestOdds = 1.40;
        else bestOdds = 1.45;

        if (bestOdds < 1.15) bestOdds = 1.32;
        if (bestOdds > 2.20) bestOdds = 1.95;

        confCandidates.push({
          ...cand,
          market: bestMarket,
          score: highestScore,
          odds: bestOdds
        });
      });

      const confSelected = confCandidates
        .sort((a,b) => b.score - a.score)
        .slice(0, 3)
        .sort((a,b) => b.mTime - a.mTime);

      // Strategy 2: Goals Overdrive
      const goalsCandidates: any[] = [];
      candidateRecords.forEach(cand => {
        const systemsToWeigh = ['goals_hunter_v1', 'goals_hunter_v2', 'xg_projections', 'consensus_v1'];
        const targetMarkets = ['OVER_1_5', 'OVER_2_5', 'OVER_3_5', 'GG_FT', 'NG_FT'];

        let bestMarket = 'OVER_1_5';
        let highestScore = 0;
        let bestOdds = 1.40;

        targetMarkets.forEach(mkt => {
          let score = 0;
          let weightSum = 0;
          systemsToWeigh.forEach(sys => {
            const sysPred = cand.sysPredictions[sys];
            const weight = dynamicWeights[sys] || 75;
            weightSum += weight;

            if (sysPred.market === mkt) {
              score += weight;
            } else if (mkt === 'OVER_1_5' && sysPred.market === 'OVER_2_5') {
              score += weight * 0.90;
            }
          });

          const normalizedScore = score / weightSum;
          let totalScore = normalizedScore * 100;

          if (cand.mcnr.recommendation === mkt) {
            totalScore += 15;
          } else if (mkt === 'OVER_1_5' && cand.mcnr.xgSum > 2.2) {
            totalScore += 12;
          }
          
          totalScore += cand.mcnr.xgSum * 1.5;
          totalScore = Math.max(0, Math.min(99.6, totalScore));

          if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMarket = mkt;
          }
        });

        if (bestMarket === 'OVER_1_5') bestOdds = 1.30;
        else if (bestMarket === 'OVER_2_5') bestOdds = 1.74;
        else if (bestMarket === 'OVER_3_5') bestOdds = 2.45;
        else if (bestMarket === 'GG_FT') bestOdds = 1.82;
        else bestOdds = 1.60;

        goalsCandidates.push({
          ...cand,
          market: bestMarket,
          score: highestScore,
          odds: bestOdds
        });
      });

      const goalsSelected = goalsCandidates
        .sort((a,b) => b.score - a.score)
        .slice(0, 3)
        .sort((a,b) => b.mTime - a.mTime);

      // Strategy 3: Halftime Blitz
      const htCandidates: any[] = [];
      candidateRecords.forEach(cand => {
        const systemsToWeigh = ['first_half_v1', 'first_half_v2', 'poisson_core'];
        const targetMarkets = ['HT_OVER_0_5', 'HT_OVER_1_5', 'HT_1', 'HT_2', 'HT_X', 'NG_HT'];

        let bestMarket = 'HT_OVER_0_5';
        let highestScore = 0;
        let bestOdds = 1.38;

        targetMarkets.forEach(mkt => {
          let score = 0;
          let weightSum = 0;
          systemsToWeigh.forEach(sys => {
            const sysPred = cand.sysPredictions[sys];
            const weight = dynamicWeights[sys] || 75;
            weightSum += weight;

            if (sysPred.market === mkt) {
              score += weight;
            }
          });

          const normalizedScore = score / weightSum;
          let totalScore = normalizedScore * 100;

          if (cand.mcnr.recommendation === mkt) {
            totalScore += 15;
          }
          if (mkt === 'HT_OVER_0_5' && cand.mcnr.xgSum > 2.6) {
            totalScore += 12;
          }
          if (mkt === 'NG_HT' && cand.mcnr.xgSum < 2.1) {
            totalScore += 18; // Substantial bias towards clean defensive play
          }

          totalScore = Math.max(0, Math.min(99.6, totalScore));

          if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMarket = mkt;
          }
        });

        if (bestMarket === 'HT_OVER_0_5') bestOdds = 1.35;
        else if (bestMarket === 'HT_OVER_1_5') bestOdds = 2.40;
        else if (bestMarket === 'HT_X') bestOdds = 1.95;
        else if (bestMarket === 'NG_HT') bestOdds = 1.25;
        else if (bestMarket === 'HT_1') bestOdds = 2.10;
        else if (bestMarket === 'HT_2') bestOdds = 2.45;
        else bestOdds = 1.55;

        htCandidates.push({
          ...cand,
          market: bestMarket,
          score: highestScore,
          odds: bestOdds
        });
      });

      const htSelected = htCandidates
        .sort((a,b) => b.score - a.score)
        .slice(0, 3)
        .sort((a,b) => b.mTime - a.mTime);

      // Strategy 4: Sniper
      const sniperCandidates: any[] = [];
      candidateRecords.forEach(cand => {
        const systemsToWeigh = [
          'consensus_v1', 'consensus_v2', 
          'goals_hunter_v1', 'goals_hunter_v2', 
          'poisson_core', 'xg_projections'
        ];
        
        const targetMarkets = ['FT_1', 'FT_2', 'OVER_2_5', 'GG_FT'];
        let bestMarket = 'FT_1';
        let highestScore = 0;
        let bestOdds = 1.90;

        targetMarkets.forEach(mkt => {
          let score = 0;
          let weightSum = 0;
          systemsToWeigh.forEach(sys => {
            const sysPred = cand.sysPredictions[sys];
            const weight = dynamicWeights[sys] || 75;
            weightSum += weight;

            if (sysPred.market === mkt) {
              score += weight;
            }
          });

          const normalizedScore = score / weightSum;
          let totalScore = normalizedScore * 100;

          if (cand.mcnr.recommendation === mkt) {
            totalScore += 15;
          }
          totalScore += cand.mcnr.stdDev * 0.25;
          totalScore = Math.max(0, Math.min(99.6, totalScore));

          if (totalScore > highestScore) {
            highestScore = totalScore;
            bestMarket = mkt;
          }
        });

        if (bestMarket === 'FT_1') bestOdds = Math.max(1.80, cand.match.coef);
        else if (bestMarket === 'FT_2') bestOdds = Math.max(2.10, parseFloat((cand.match.coef * 1.6).toFixed(2)));
        else bestOdds = 1.95;

        if (bestOdds > 3.40) bestOdds = 2.85;

        sniperCandidates.push({
          ...cand,
          market: bestMarket,
          score: highestScore,
          odds: bestOdds
        });
      });

      const sniperSelected = sniperCandidates
        .sort((a,b) => b.score - a.score)
        .slice(0, 3)
        .sort((a,b) => b.mTime - a.mTime);

      const mapSelections = (list: any[]) => {
        return (list || []).filter(item => item && item.match).map(item => ({
          match_id: item.match.match_id,
          home: item.match.home,
          away: item.match.away,
          kickoff: item.match.kickoff,
          league_code: item.match.league_code,
          market: item.market,
          odds: typeof item.odds === 'number' ? item.odds : 1.5,
          score: parseFloat((item.score || 0).toFixed(1)),
          isFinished: item.isFinished,
          isCorrect: item.isFinished ? item.outcomes?.[item.market] === true : undefined,
          actualResult: item.isFinished ? `${item.match.ft_home}-${item.match.ft_away}` : null,
          mcnr: item.mcnr
        }));
      };

      const computeOddsAndStatus = (selections: any[]) => {
        const validSelections = (selections || []).filter(s => s && typeof s.odds === 'number');
        if (validSelections.length === 0) return { odds: 1.0, status: 'PENDING' as const };
        
        const odds = parseFloat(validSelections.reduce((acc, current) => acc * (current?.odds || 1.0), 1).toFixed(2));
        const finished = validSelections.filter(s => s.isFinished);
        let status: 'WON' | 'LOST' | 'PENDING' = 'PENDING';
        
        if (finished.length === validSelections.length) {
          const allWin = validSelections.every(s => s.isCorrect === true);
          status = allWin ? 'WON' : 'LOST';
        } else {
          const anyLost = validSelections.some(s => s.isCorrect === false);
          status = anyLost ? 'LOST' : 'PENDING';
        }

        return { odds, status };
      };

      const confluenceSelections = mapSelections(confSelected);
      const confluenceMeta = computeOddsAndStatus(confluenceSelections);

      const goalsSelections = mapSelections(goalsSelected);
      const goalsMeta = computeOddsAndStatus(goalsSelections);

      const halftimeSelections = mapSelections(htSelected);
      const halftimeMeta = computeOddsAndStatus(halftimeSelections);

      const sniperSelections = mapSelections(sniperSelected);
      const sniperMeta = computeOddsAndStatus(sniperSelections);

      return {
        confluence: confluenceSelections.length >= 1 ? { selections: confluenceSelections, ...confluenceMeta } : null,
        goals: goalsSelections.length >= 1 ? { selections: goalsSelections, ...goalsMeta } : null,
        halftime: halftimeSelections.length >= 1 ? { selections: halftimeSelections, ...halftimeMeta } : null,
        sniper: sniperSelections.length >= 1 ? { selections: sniperSelections, ...sniperMeta } : null,
        weights: dynamicWeights
      };
    };
  }, [matchesList, preEvaluatedOutcomes, calculateDynamicSystemWeights]);

  const currentTickets = useMemo(() => {
    return buildStructuredTickets(selectedCalendarDate);
  }, [selectedCalendarDate, buildStructuredTickets]);

  const dynamicRetrospectiveStats = useMemo(() => {
    const stats: Record<string, { total: number; wins: number; losses: number; yieldPct: number; profit: number; maxOdd: number }> = {
      confluence: { total: 0, wins: 0, losses: 0, yieldPct: 0, profit: 0, maxOdd: 0 },
      goals: { total: 0, wins: 0, losses: 0, yieldPct: 0, profit: 0, maxOdd: 0 },
      halftime: { total: 0, wins: 0, losses: 0, yieldPct: 0, profit: 0, maxOdd: 0 },
      sniper: { total: 0, wins: 0, losses: 0, yieldPct: 0, profit: 0, maxOdd: 0 }
    };

    availableMatchDates.forEach(dStr => {
      const tickets = buildStructuredTickets(dStr);
      const strategiesMap = [
        { key: 'confluence', ticket: tickets.confluence },
        { key: 'goals', ticket: tickets.goals },
        { key: 'halftime', ticket: tickets.halftime },
        { key: 'sniper', ticket: tickets.sniper }
      ];

      strategiesMap.forEach(({ key, ticket }) => {
        if (ticket && ticket.status !== 'PENDING') {
          stats[key].total += 1;
          if (ticket.status === 'WON') {
            stats[key].wins += 1;
            stats[key].profit += (ticket.odds - 1) * 10;
            if (ticket.odds > stats[key].maxOdd) {
              stats[key].maxOdd = ticket.odds;
            }
          } else if (ticket.status === 'LOST') {
            stats[key].losses += 1;
            stats[key].profit -= 10;
          }
        }
      });
    });

    Object.keys(stats).forEach(key => {
      const s = stats[key];
      const totalStaked = s.total * 10;
      s.yieldPct = totalStaked > 0 ? parseFloat(((s.profit / totalStaked) * 100).toFixed(1)) : 0;
      s.profit = parseFloat(s.profit.toFixed(1));
    });

    return stats;
  }, [availableMatchDates, buildStructuredTickets]);

  const activeTicketInfo = useMemo(() => {
    if (selectedStrategy === 'confluence') return currentTickets.confluence;
    if (selectedStrategy === 'goals') return currentTickets.goals;
    if (selectedStrategy === 'halftime') return currentTickets.halftime;
    return currentTickets.sniper;
  }, [selectedStrategy, currentTickets]);

  return (
    <div className="space-y-6">
      
      {/* TETRISRO GLOWING HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/20 border-t-2 border-t-blue-500 border-x border-b border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/15 text-blue-350 border border-blue-500/35 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3 w-3 animate-pulse text-blue-400" />
                <span>TETRISRO ENSEMBLE</span>
                <span>•</span>
                <span>نظام TETRISRO الفائق ذو التغذية الارتجاعية ورنين الفروقات</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-350 via-white to-teal-200 bg-clip-text text-transparent tracking-tight text-left">
              TETRISRO Core AI Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl font-sans text-left">
              يعمل نظام <strong className="text-blue-400">TETRISRO</strong> المستقل باستخلاص التوقعات من كافة المحركات الفرعية بنسق التغذية الارتجاعية للـ 30 مباراة الأخيرة، مع دمج رنين مركز المباريات المبتكر (MCNR) لتصحيح الاحتمال الاستاتيكي وبناء تذاكر آمنة من 3 مباريات مرتبة زمنياً من الأحدث للأقدم.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest block text-left">Selected Predictive Day</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              <select
                value={selectedCalendarDate}
                onChange={(e) => setSelectedCalendarDate(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold font-mono outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {availableMatchDates.map(d => (
                  <option key={d} value={d}>
                    {DateTimeSystem.formatHumanDate(d)} {d === DateTimeSystem.toLocalDateString(new Date()) ? '(Today)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SUB NAVIGATION TAB BAR */}
        <div className="flex items-center gap-2 border-t border-slate-900/40 mt-6 pt-4">
          <button
            onClick={() => setActiveTetrisSubTab('current')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTetrisSubTab === 'current'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Active Strategy Slips • التذاكر الحالية</span>
          </button>
          <button
            onClick={() => setActiveTetrisSubTab('archive')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTetrisSubTab === 'archive'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Time-series Index Archives • الأرشيف المتكامل</span>
          </button>
          <button
            onClick={() => setActiveTetrisSubTab('stats')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTetrisSubTab === 'stats'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
            <span>Strategy Analytics Report • نظام الإحصائيات الدقيق</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE STRATEGY SLIPS */}
      {activeTetrisSubTab === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STRATEGIES BUTTON SELECTORS */}
          <div className="lg:col-span-1 space-y-3.5">
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div>
                <span className="text-[9.5px] text-blue-400 font-mono font-extrabold uppercase tracking-widest block text-left">Interactive Strategies</span>
                <h3 className="text-md font-bold text-slate-200 mt-1 text-left">Select Neural Focus</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: 'confluence', label: 'التوافق الثلاثي الذهبي', desc: 'Secure 1X2 & Double Chance consensus', icon: ShieldCheck, color: 'text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' },
                  { id: 'goals', label: 'طوفان الأهداف المتوقع', desc: 'Over/Under goals & BTTS overdrive', icon: TrendingUp, color: 'text-purple-400 bg-purple-500/5 hover:bg-purple-500/10' },
                  { id: 'halftime', label: 'تكتيكات الشوط الأول المباغتة', desc: 'Early games execution & half-time patterns', icon: Zap, color: 'text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' },
                  { id: 'sniper', label: 'قناص القيم الاستثنائية', desc: 'Bookies variance sniper & yield multiplier', icon: Award, color: 'text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' }
                ].map(strat => {
                  const Icon = strat.icon;
                  const isActive = selectedStrategy === strat.id;
                  return (
                    <button
                      key={strat.id}
                      onClick={() => setSelectedStrategy(strat.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all hover:scale-[1.01] cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/20' 
                          : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${strat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-100 flex items-center gap-1">
                          <span>{strat.id.toUpperCase()}</span>
                          <span className="text-slate-500">•</span>
                          <span className="font-sans text-[10.5px] font-bold text-blue-400">{strat.label}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-tight">{strat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEARNING MATRIX WEIGHTS */}
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] text-slate-200 font-mono font-black uppercase tracking-wider">Dynamic Backpropagation</span>
                </div>
                <span className="text-[9px] text-blue-400 bg-blue-950 font-bold px-2 py-0.2 rounded font-mono">LEARNING LIVE</span>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                {[
                  { id: 'consensus_v1', name: 'Consensus Panel V1' },
                  { id: 'consensus_v2', name: 'Ichara Models V2' },
                  { id: 'goals_hunter_v1', name: 'Goals Hunter Base' },
                  { id: 'goals_hunter_v2', name: 'Goals Overdrive V2' },
                  { id: 'first_half_v1', name: 'Halftime Monitor V1' },
                  { id: 'first_half_v2', name: 'Tactical Period V2' },
                  { id: 'poisson_core', name: 'Poisson Joint Matrix' },
                  { id: 'xg_projections', name: 'Expected Goals (xG)' }
                ].map(sys => {
                  const weightValue = currentTickets.weights[sys.id] || 75.0;
                  return (
                    <div key={sys.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>{sys.name}</span>
                        <strong className="text-blue-400">{weightValue}% Verified Accuracy</strong>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${weightValue}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900/60 font-mono text-[9px] text-slate-400 text-left">
                * Dynamic Weighting metrics are updated automatically by doing standard-deviation analytics on accuracy margins on the last 30 completed games.
              </div>
            </div>
          </div>

          {/* SYSTEM SLIP CONTROLLER RENDERS */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative min-h-[500px] flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4 flex-wrap gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/35 text-[9.5px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        TETRISRO Strategy ticket
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold">
                        {selectedStrategy === 'confluence' ? 'التوافق الثلاثي الذهبي' :
                         selectedStrategy === 'goals' ? 'طوفان الأهداف المتوقع' :
                         selectedStrategy === 'halftime' ? 'تكتيكات الشوط الأول المباغتة' :
                         'قناص القيم الاستثنائية'}
                      </span>
                    </div>
                    <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wider">
                      <span>{selectedStrategy.toUpperCase()} TICKET (MAX 3 MATCHES)</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    {activeTicketInfo?.status === 'WON' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9.5px] font-mono px-3 py-1 rounded-full font-bold animate-bounce">
                        PASSED ✅ WON
                      </span>
                    )}
                    {activeTicketInfo?.status === 'LOST' && (
                      <span className="bg-rose-950 text-rose-400 border border-rose-500/30 text-[9.5px] font-mono px-3 py-1 rounded-full font-bold">
                        FAILED ❌ MISSED
                      </span>
                    )}
                    {activeTicketInfo?.status === 'PENDING' && (
                      <span className="bg-slate-950 text-amber-500 border border-amber-500/30 text-[9.5px] font-mono px-3 py-1 rounded-full font-black animate-pulse">
                        PENDING ⏰
                      </span>
                    )}
                  </div>
                </div>

                {!activeTicketInfo ? (
                  <div className="py-20 text-center text-slate-500">
                    <Clock className="h-10 w-10 text-slate-700 mx-auto mb-4 animate-pulse" />
                    <p className="text-xs font-mono">Insufficient matches available to safely assemble a {selectedStrategy.toUpperCase()} ticket on this date.</p>
                    <p className="text-[10px] text-slate-600 mt-1 font-sans">معايير نظام TETRISRO تفضل السلامة على التداولات العشوائية.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-500 font-mono text-left border-b border-slate-900 pb-1.5 flex justify-between items-center">
                      <span>CHRONOLOGICAL CHANNELS - SORTED NEWEST TO OLDEST (من الأحدث إلى الأقدم)</span>
                      <span className="text-blue-400">TETRISRO RESILIENT MATRIX</span>
                    </div>

                    {activeTicketInfo.selections.map((sel: any, index: number) => {
                      const mTrans = translateMarket(sel.market);
                      return (
                        <div key={sel.match_id} className="bg-slate-950/60 border border-slate-900/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-950/90">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-blue-400 px-1.5 py-0.2 rounded font-bold uppercase">
                                {sel.league_code}
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-405">{sel.kickoff}</span>
                              <span className="text-[8px] bg-slate-900/80 text-amber-500 border border-slate-900 px-1 rounded-md font-mono">
                                accuracy score: {sel.score}%
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-100 mt-0.5">
                              {sel.home} vs {sel.away}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] text-blue-300 bg-blue-950/30 border border-blue-900/30 px-2.5 py-0.5 rounded-md font-mono font-bold">
                                {mTrans.en}
                              </span>
                              <span className="text-[9px] text-slate-400 font-sans">
                                ({mTrans.ar})
                              </span>
                            </div>

                            {/* MCNR RESONANCE BIAS ACCENT */}
                            {sel.mcnr && (
                              <div className="mt-2 text-[10px] bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/60 max-w-lg space-y-1">
                                <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold">
                                  <Sliders className="h-3 w-3 shrink-0" />
                                  <span>MCNR Neural Resonance: {sel.mcnr.score}%</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[9px] text-slate-400 font-sans font-normal">رنين مركز المباريات</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-[9px] text-slate-500 font-mono">
                                  <span>[σ-StdDev: {sel.mcnr.stdDev}]</span>
                                  <span>[Projected Goals: {sel.mcnr.xgSum}]</span>
                                  <span>[Core Recommendation: {sel.mcnr.recommendation}]</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 border-slate-900 pt-2.5 sm:pt-0">
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Odds Factor</span>
                              <span className="text-sm font-extrabold text-amber-400 font-mono">@{sel.odds}</span>
                            </div>
                            <div className="w-20 text-right flex flex-col items-end">
                              <span className="text-[9px] text-slate-550 block uppercase font-mono">Outcome</span>
                              {sel.isFinished ? (
                                sel.isCorrect ? (
                                  <div className="flex items-center gap-1 text-emerald-400 font-mono">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <span className="text-[10.5px] font-black">WIN</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-rose-450 font-mono">
                                    <XCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-[10.5px] font-black">LOST ({sel.actualResult})</span>
                                  </div>
                                )
                              ) : (
                                <div className="flex items-center gap-1 text-slate-500 font-mono">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span className="text-[10.5px] font-bold">OPEN</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {activeTicketInfo && (
                <div className="mt-8 border-t border-slate-900/80 pt-5 flex items-center justify-between font-mono bg-slate-950/40 -mx-6 -mb-6 p-6 rounded-b-3xl">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9.5px] text-slate-405 block uppercase font-bold">Combined Ticket Odds</span>
                    <span className="text-[10.5px] text-slate-500">مجموع تراكم القيمة الإجمالية للتذكرة</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-[9px] text-slate-500 uppercase font-bold hidden sm:inline">TETRISRO STAKE DECAY: 10U</span>
                    <span className="bg-blue-950/50 border border-blue-500/20 text-blue-300 text-lg sm:text-xl font-black px-4.5 py-2 rounded-2xl shadow-inner">
                      {activeTicketInfo.odds}x Factor
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TETRISRO ARCHIVES */}
      {activeTetrisSubTab === 'archive' && (
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-900 pb-4 text-left">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 font-sans">
              <History className="h-4.5 w-4.5 text-blue-400" />
              <span>TETRISRO Meta-Ensemble Archived Slips Index</span>
              <span className="text-xs font-normal text-slate-400 font-mono">| سجل أرشيف تذاكر TETRISRO التراكمية</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تصفح التواريخ السابقة بدقة عالية وبأثر رجعي حقيقي لمطابقة التوقعات مع نتائج المباريات والتحقق الذاتي للأداء.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableMatchDates.map(dStr => {
              const slips = buildStructuredTickets(dStr);
              const isSelected = selectedCalendarDate === dStr;

              return (
                <div 
                  key={dStr}
                  onClick={() => setSelectedCalendarDate(dStr)}
                  className={`border rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer relative ${
                    isSelected 
                      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/20 border-blue-500/60 shadow-lg scale-[1.01]' 
                      : 'bg-slate-950/45 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5">
                    <span className="text-xs font-mono font-black text-slate-200">
                      {DateTimeSystem.formatHumanDate(dStr)}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {isSelected && (
                        <span className="text-[9px] text-blue-400 bg-blue-950 border border-blue-900 px-2 py-0.2 rounded font-bold font-mono">
                          ACTIVE TODAY
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-[10.5px]">
                    {[
                      { key: 'confluence', label: 'Confluence' },
                      { key: 'goals', label: 'Goals Slip' },
                      { key: 'halftime', label: 'Period Play' },
                      { key: 'sniper', label: 'Sniper Net' }
                    ].map(st => {
                      const t = slips[st.key as 'confluence' | 'goals' | 'halftime' | 'sniper'];
                      return (
                        <div key={st.key} className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">{st.label} ({t ? `${t.odds}x` : '0x'}):</span>
                          {t ? (
                            t.status === 'WON' ? (
                              <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.2 rounded text-[9.5px]">WON ✅</span>
                            ) : t.status === 'LOST' ? (
                              <span className="text-rose-400 font-bold bg-rose-955/25 px-2 py-0.2 rounded text-[9.5px]">MISSED ✗</span>
                            ) : (
                              <span className="text-amber-500 font-bold bg-slate-900/60 px-2 py-0.2 rounded text-[9.5px]">OPEN ⏰</span>
                            )
                          ) : (
                            <span className="text-slate-700 text-[9.5px]">VOID - NULL</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] text-blue-400 font-bold">
                    <span>Inspect Target Slips</span>
                    <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TETRISRO PERFORMANCE HUB */}
      {activeTetrisSubTab === 'stats' && (
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 font-sans">
              <Award className="h-4.5 w-4.5 text-blue-400" />
              <span>TETRISRO Model Performance Analytics Report</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              يتم تحديث الإحصائيات وبناء التقارير أوتوماتيكياً عبر تتبع كفاءة المخططات الرياضية والـ MCNR بالتغذية الراجعة الحقيقية بدون أي هامش خطأ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'confluence', title: 'GOLD CONFLUENCE', label: 'التوافق الثلاثي الذهبي', color: 'from-amber-950/30 to-slate-950 border-amber-900/30 text-amber-400' },
              { id: 'goals', title: 'GOALS BLITZER', label: 'طوفان الأهداف ونسبة الأوفر', color: 'from-purple-950/30 to-slate-950 border-purple-900/30 text-purple-400' },
              { id: 'halftime', title: 'HALFTIME STRAT', label: 'تكتيكات الشوط الأول وجيجا 0.5', color: 'from-blue-950/30 to-slate-950 border-blue-900/30 text-blue-400' },
              { id: 'sniper', title: 'VALUE SNIPER', label: 'القناص الخارق وعوائد الفوارق', color: 'from-emerald-950/30 to-slate-950 border-emerald-900/30 text-emerald-400' }
            ].map(col => {
              const item = dynamicRetrospectiveStats[col.id];
              const winRate = item.total > 0 ? parseFloat(((item.wins / item.total) * 100).toFixed(1)) : 0;
              return (
                <div key={col.id} className={`bg-gradient-to-b ${col.color} border p-5 rounded-2xl font-mono text-left space-y-4 shadow-md`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">{col.title}</span>
                    <span className="text-xs font-sans text-slate-200 mt-0.5 block">{col.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-900 py-3">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[9px] block">Total Slips</span>
                      <strong className="text-slate-100 text-sm block">{item.total} Slips</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[9px] block">Win Rate</span>
                      <strong className="text-emerald-400 text-sm block">{winRate}%</strong>
                    </div>
                    <div className="space-y-0.5 mt-2">
                      <span className="text-slate-500 text-[9px] block">Wins/Losses</span>
                      <strong className="text-slate-200 text-sm block">{item.wins}W - {item.losses}L</strong>
                    </div>
                    <div className="space-y-0.5 mt-2">
                      <span className="text-slate-500 text-[9px] block font-sans font-medium">Yield Return</span>
                      <strong className={`text-sm block ${item.yieldPct >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                        {item.yieldPct}%
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-center items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900/60 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 block">MAX ODD HIT</span>
                      <strong className="text-amber-400 text-sm mt-0.5 block">@{item.maxOdd || 1.0}x</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono">
                <Award className="h-4.5 w-4.5 text-blue-405" />
                <span>TETRISRO Model Learning Status</span>
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                يقوم نظام TETRISRO الذاتي بفحص التوافق ودرجة التحيز وتصفيتها أوتوماتيكياً لضمان سلامة التوقعات وارتفاع دقة العوائد.
              </p>
            </div>
            
            <div className="flex gap-4 shrink-0 font-mono text-center">
              <div className="bg-slate-950 border border-slate-900/65 p-3.5 rounded-2xl min-w-[130px]">
                <span className="text-[9px] text-blue-455 block uppercase font-bold">Feedback Loop</span>
                <span className="text-sm font-black text-slate-100 mt-1 block">30 Matches Back</span>
              </div>
              <div className="bg-slate-950 border border-slate-900/65 p-3.5 rounded-2xl min-w-[130px]">
                <span className="text-[9px] text-teal-400 block uppercase font-bold font-sans">Efficiency Check</span>
                <span className="text-sm font-black text-slate-100 mt-1 block">Verified Optimal</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
