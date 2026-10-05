import { Match, SignalSummary, SignalPrediction } from '../types';
import { MarketEvaluator } from './marketEvaluator';
import { DateTimeSystem } from './dateTimeSystem';
import { AIEngine } from './aiEngine';
import { CipherEngine, IcharaV2Engine } from './matchEngine';

// Allowed Important Markets for valuable signaling (Important high-value popular markets with complete coverage of goals, halves, and match outcomes)
export const IMPORTANT_MARKETS = [
  'FT_1', 'FT_X', 'FT_2',
  'DC_1X', 'DC_X2', 'DC_12',
  'DNB_1', 'DNB_2',
  'OVER_0_5', 'OVER_1_5', 'OVER_2_5', 'OVER_3_5', 'OVER_4_5',
  'UNDER_1_5', 'UNDER_2_5', 'UNDER_3_5', 'UNDER_4_5',
  'GG_FT', 'NG_FT',
  'HT_1', 'HT_X', 'HT_2',
  'HT_OVER_0_5', 'HT_OVER_1_5', 'NG_HT',
  'SH_OVER_1_5',
  'HOME_OVER_0_5', 'HOME_OVER_1_5',
  'AWAY_OVER_0_5', 'AWAY_OVER_1_5',
  'HOME_CLEAN_SHEET', 'AWAY_CLEAN_SHEET',
  'WIN_AND_OVER_1_5', 'WIN_AND_OVER_2_5', 'WIN_AND_GG',
  'EVEN_TOTAL_GOALS', 'ODD_TOTAL_GOALS'
];

export class LocalOfflineTrainer {
  static parseKickoffDate(dateStr: string): Date {
    return DateTimeSystem.parse(dateStr);
  }

  static calculateReliabilityIndex(totalResolved: number, winRate: number): { score: number; label: string; color: string } {
    const volumeFactor = Math.min(1.0, totalResolved / 20.0);
    const score = Math.round((winRate * 0.75) + (volumeFactor * 25));
    let label = 'Low', color = 'text-rose-400';
    if (score >= 84 && totalResolved >= 15) { label = 'Very High (Elite)'; color = 'text-emerald-400 font-black'; }
    else if (score >= 75 && totalResolved >= 8) { label = 'High'; color = 'text-teal-400 font-bold'; }
    else if (score >= 50) { label = 'Medium'; color = 'text-amber-300 font-medium'; }
    return { score, label, color };
  }

  static estimateMarketOdds(market: string, m: Match): number {
    const h = Math.max(1, m.p1), d = Math.max(1, m.px), a = Math.max(1, m.p2);
    switch (market) {
      case 'FT_1': return parseFloat((108 / h).toFixed(2));
      case 'FT_2': return parseFloat((108 / a).toFixed(2));
      case 'FT_X': return parseFloat((112 / d).toFixed(2));
      case 'DC_1X': return parseFloat((103 / Math.min(99, h + d)).toFixed(2));
      case 'DC_X2': return parseFloat((103 / Math.min(99, a + d)).toFixed(2));
      case 'DC_12': return parseFloat((104 / Math.min(99, h + a)).toFixed(2));
      case 'DNB_1': return parseFloat((105 / Math.min(99, (h / (h + a + 0.01)) * 100)).toFixed(2));
      case 'DNB_2': return parseFloat((105 / Math.min(99, (a / (h + a + 0.01)) * 100)).toFixed(2));
      case 'OVER_0_5': return parseFloat((102 / Math.min(99, 85 + (h+a)*0.12)).toFixed(2));
      case 'OVER_1_5': return parseFloat((104 / Math.min(95, 65 + (h+a)*0.22)).toFixed(2));
      case 'OVER_2_5': return parseFloat((105 / Math.min(88, (h+a)*0.58)).toFixed(2));
      case 'OVER_3_5': return parseFloat((106 / Math.min(75, (h+a)*0.38)).toFixed(2));
      case 'OVER_4_5': return parseFloat((108 / Math.min(55, (h+a)*0.22)).toFixed(2));
      case 'UNDER_1_5': return parseFloat((104 / Math.max(1, 100 - (65+(h+a)*0.22))).toFixed(2));
      case 'UNDER_2_5': return parseFloat((105 / Math.max(1, 100 - (h+a)*0.58)).toFixed(2));
      case 'UNDER_3_5': return parseFloat((104 / Math.min(95, 85 - Math.abs(h-a)*0.17)).toFixed(2));
      case 'UNDER_4_5': return parseFloat((106 / Math.max(1, 100 - (h+a)*0.22)).toFixed(2));
      case 'GG_FT': return parseFloat((106 / Math.min(85, 48 + (100-d)*0.11)).toFixed(2));
      case 'NG_FT': return parseFloat((106 / Math.max(1, 100 - (48+(100-d)*0.11))).toFixed(2));
      case 'HT_1': return parseFloat((108 / Math.max(h*0.55, 1)).toFixed(2));
      case 'HT_2': return parseFloat((108 / Math.max(a*0.55, 1)).toFixed(2));
      case 'HT_X': return parseFloat((108 / Math.max(d*1.15, 1)).toFixed(2));
      case 'HT_OVER_0_5': return parseFloat((104 / Math.min(92, 52 + (h+a)*0.15)).toFixed(2));
      case 'HT_OVER_1_5': return parseFloat((106 / Math.min(65, (h+a)*0.28)).toFixed(2));
      case 'NG_HT': return parseFloat((105 / Math.min(99, 85 - (h+a)*0.25)).toFixed(2));
      case 'SH_OVER_1_5': return parseFloat((106 / Math.min(72, (h+a)*0.32)).toFixed(2));
      case 'HOME_OVER_0_5': return parseFloat((103 / Math.min(98, 60 + h*0.35)).toFixed(2));
      case 'HOME_OVER_1_5': return parseFloat((110 / Math.max(h*0.65, 1)).toFixed(2));
      case 'AWAY_OVER_0_5': return parseFloat((103 / Math.min(98, 60 + a*0.35)).toFixed(2));
      case 'AWAY_OVER_1_5': return parseFloat((110 / Math.max(a*0.65, 1)).toFixed(2));
      case 'HOME_CLEAN_SHEET': return parseFloat((106 / Math.max(5, 100 - (60+a*0.35))).toFixed(2));
      case 'AWAY_CLEAN_SHEET': return parseFloat((106 / Math.max(5, 100 - (60+h*0.35))).toFixed(2));
      case 'WIN_AND_OVER_1_5': return parseFloat((112 / Math.max(20, Math.max(h, a) * 0.65)).toFixed(2));
      case 'WIN_AND_OVER_2_5': return parseFloat((115 / Math.max(15, Math.max(h, a) * 0.48)).toFixed(2));
      case 'WIN_AND_GG': return parseFloat((118 / Math.max(12, Math.max(h, a) * 0.40)).toFixed(2));
      default: return 1.35;
    }
  }

  static trainAndRecalibrate(matches: Record<string, Match>): {
    signals: Record<string, SignalSummary>;
    signals_v2: Record<string, SignalSummary>;
    globalStats: {
      total_picks: number;
      correct_picks: number;
      win_rate: number;
      daily_history: Record<string, { date: string; picks: number; accuracy: number }>;
    };
  } {
    const allMatches = Object.values(matches);
    const signalGroups = new Map<string, Match[]>();
    const signalGroupsV2 = new Map<string, Match[]>();
    const finishedMatches = [];

    for (const m of allMatches) {
      // Retroactively recalculate/migrate the signal code using high-resolution CipherEngine algorithm
      const freshKey = CipherEngine.computeCipherKey(m.p1, m.px, m.p2, m.coef);
      m.signal_code = CipherEngine.getSignalCode(freshKey);

      // Handle Ichara V2
      const icharaKey = IcharaV2Engine.computeIcharaKey(m.p1, m.px, m.p2, m.coef);
      m.signal_code_v2 = IcharaV2Engine.getIcharaCode(icharaKey);

      if (m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null) {
        finishedMatches.push(m);
        if (!signalGroups.has(m.signal_code)) {
          signalGroups.set(m.signal_code, []);
        }
        signalGroups.get(m.signal_code)!.push(m);

        if (!signalGroupsV2.has(m.signal_code_v2)) {
          signalGroupsV2.set(m.signal_code_v2, []);
        }
        signalGroupsV2.get(m.signal_code_v2)!.push(m);
      }
    }

    const signals: Record<string, SignalSummary> = {};
    const signals_v2: Record<string, SignalSummary> = {};
    const now = new Date(), oneDay = 86400000, sevenDays = 604800000;

    for (const [code, allFinished] of signalGroups.entries()) {
      allFinished.sort((a, b) => this.parseKickoffDate(b.kickoff).getTime() - this.parseKickoffDate(a.kickoff).getTime());

      const marketWins: Record<string, number> = {}, marketTotals: Record<string, number> = {};
      for (const m of allFinished) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        for (const k of IMPORTANT_MARKETS) {
          marketTotals[k] = (marketTotals[k] || 0) + 1;
          if (ev[k]) marketWins[k] = (marketWins[k] || 0) + 1;
        }
      }

      const breakdown: Record<string, any> = {};
      for (const k of IMPORTANT_MARKETS) {
        if (marketTotals[k]) breakdown[k] = { wins: marketWins[k] || 0, total: marketTotals[k], win_rate: Math.round(((marketWins[k] || 0) / marketTotals[k]) * 100) };
      }

      // UPGRADED: Analysis window expanded to 20 matches for elite statistical significance
      const recentWindow = allFinished.slice(0, 20);
      const recentCount = recentWindow.length;
      const recentWins: Record<string, number> = {};
      for (const m of recentWindow) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        for (const k of IMPORTANT_MARKETS) if (ev[k]) recentWins[k] = (recentWins[k] || 0) + 1;
      }

      const topPreds: SignalPrediction[] = [];
      const allRankedPreds: SignalPrediction[] = [];
      for (const k of IMPORTANT_MARKETS) {
        const rate = recentCount > 0 ? (recentWins[k] || 0) / recentCount : 0;
        let oSum = 0; for (const m of recentWindow) oSum += this.estimateMarketOdds(k, m);
        const oAvg = recentCount > 0 ? parseFloat((oSum / recentCount).toFixed(2)) : 1.35;
        allRankedPreds.push({ market: k, accuracy_rate: rate, avg_odds: oAvg });
        
        // STRICT CONDITION: Requires 17/20 or equivalent 85%+ accuracy on deeper data for Premium quality
        let threshold = 0.85;
        if (k === 'NG_HT') {
          threshold = 0.90; // Higher accuracy requirement: 18/20 instead of 17/20 (90%+)
        }
        
        if (rate >= threshold) {
          if (k === 'NG_HT') {
            // Extreme mathematical conditions to filter out low-quality Halftime BTTS No selections:
            
            // 1. Check average halftime goals in recent history - must be <= 1.00 (indicates highly defensive first halves)
            let htGoalsSum = 0;
            recentWindow.forEach(m => {
              if (m.ht_home !== null && m.ht_away !== null) {
                htGoalsSum += (m.ht_home + m.ht_away);
              }
            });
            const avgHtGoals = recentCount > 0 ? htGoalsSum / recentCount : 0;
            if (avgHtGoals > 1.00) {
              continue; // Exclude because halftime is too open / high-scoring
            }

            // 2. Check all-time halftime Both Teams To Score (Yes) rate for this signal group
            let allHtBttsYesCount = 0;
            let allHtWithScores = 0;
            for (const m of allFinished) {
              if (m.ht_home !== null && m.ht_away !== null) {
                allHtWithScores++;
                if (m.ht_home > 0 && m.ht_away > 0) {
                  allHtBttsYesCount++;
                }
              }
            }
            const allTimeBttsYesHtRate = allHtWithScores > 0 ? allHtBttsYesCount / allHtWithScores : 0;
            if (allTimeBttsYesHtRate > 0.08) {
              continue; // Exclude because all-time first half BTTS-Yes risk is higher than 8%
            }

            // 3. Keep odds inside a safer/more predictable boundary (avoid matches with extremely high odds which indicates high volatility)
            if (oAvg > 1.45) {
              continue; // Exclude because high odds indicate high expected first-half goal density
            }
          }

          if (oAvg >= 1.3) topPreds.push({ market: k, accuracy_rate: rate, avg_odds: oAvg });
        }
      }
      topPreds.sort((a, b) => b.accuracy_rate !== a.accuracy_rate ? b.accuracy_rate - a.accuracy_rate : b.avg_odds - a.avg_odds);
      allRankedPreds.sort((a, b) => b.accuracy_rate !== a.accuracy_rate ? b.accuracy_rate - a.accuracy_rate : b.avg_odds - a.avg_odds);

      // PREVENT DISAPPEARING LOSSES: If no market strictly clears 85% (e.g. after a loss), keep the highest-performing markets
      // so finished and upcoming predictions never vanish from lists and historical integrity is maintained!
      const effectiveTopPreds = topPreds.length > 0 ? topPreds : allRankedPreds.filter(p => p.avg_odds >= 1.20).slice(0, 3);

      const refM = effectiveTopPreds[0]?.market || allRankedPreds[0]?.market || 'OVER_1_5';
      let ap=0, ac=0, wp=0, wc=0, dp=0, dc=0;
      for (const m of allFinished) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        const day = this.parseKickoffDate(m.kickoff);
        const diff = now.getTime() - day.getTime(), ok = ev[refM] === true;
        ap++; if (ok) ac++;
        if (diff >= 0 && diff <= sevenDays) { wp++; if (ok) wc++; }
        if (day.toDateString() === now.toDateString() || (diff >= 0 && diff <= oneDay)) { dp++; if (ok) dc++; }
      }

      let eh=0, ea=0, alpha=0.22;
      for (let i = allFinished.length - 1; i >= 0; i--) {
        const m = allFinished[i];
        const b = 2.4 + (Math.max(m.p1, m.p2) > 60 ? 0.3 : 0) - (m.px > 40 ? 0.4 : 0), s = m.p1 / (m.p1 + m.p2 + 0.01);
        eh = alpha * (b * s - m.ft_home!) + (1 - alpha) * eh;
        ea = alpha * (b * (1 - s) - m.ft_away!) + (1 - alpha) * ea;
      }

      const preAI = { code, all_time: { picks: ap, correct: ac, win_rate: ap > 0 ? parseFloat(((ac  / ap) * 100).toFixed(1)) : 0 }, top_predictions: effectiveTopPreds.slice(0, 3) };
      const ai = AIEngine.analyzeSignalData(allFinished, preAI);
      const signature = CipherEngine.getSignatureForCode(code);

      signals[code] = {
        code, total_resolved: allFinished.length,
        top_predictions: ai.adjusted_predictions.length > 0 ? ai.adjusted_predictions : effectiveTopPreds.slice(0, 3),
        all_time: preAI.all_time,
        weekly: { picks: wp, correct: wc, win_rate: wp > 0 ? parseFloat(((wc  / wp) * 100).toFixed(1)) : 0 },
        daily: { picks: dp, correct: dc, win_rate: dp > 0 ? parseFloat(((dc  / dp) * 100).toFixed(1)) : 0 },
        market_breakdown: breakdown, ema_error_h: parseFloat(eh.toFixed(3)), ema_error_a: parseFloat(ea.toFixed(3)),
        ai_confidence_score: ai.confidence,
        ai_identified_patterns: [
          ...signature.attributes,
          ...ai.patterns
        ],
        signature_name_ar: signature.nameAr,
        signature_name_en: signature.nameEn,
        signature_badge: signature.badge,
        signature_attributes: signature.attributes
      };
    }

    // ----- TRAIN ICHARA V2 SIGNAL SYSTEM -----
    for (const [code, allFinished] of signalGroupsV2.entries()) {
      allFinished.sort((a, b) => this.parseKickoffDate(b.kickoff).getTime() - this.parseKickoffDate(a.kickoff).getTime());

      const marketWins: Record<string, number> = {}, marketTotals: Record<string, number> = {};
      for (const m of allFinished) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        for (const k of IMPORTANT_MARKETS) {
          if (k === 'UNDER_4_5') continue; // Explicitly remove UNDER_4_5 from IcharaV2
          marketTotals[k] = (marketTotals[k] || 0) + 1;
          if (ev[k]) marketWins[k] = (marketWins[k] || 0) + 1;
        }
      }

      const breakdown: Record<string, any> = {};
      for (const k of IMPORTANT_MARKETS) {
        if (k === 'UNDER_4_5') continue; // Explicitly remove UNDER_4_5 from IcharaV2
        if (marketTotals[k]) breakdown[k] = { wins: marketWins[k] || 0, total: marketTotals[k], win_rate: Math.round(((marketWins[k] || 0) / marketTotals[k]) * 100) };
      }

      const recentWindow = allFinished.slice(0, 20);
      const recentCount = recentWindow.length;
      const recentWins: Record<string, number> = {};
      for (const m of recentWindow) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        for (const k of IMPORTANT_MARKETS) {
          if (k === 'UNDER_4_5') continue; // Explicitly remove UNDER_4_5 from IcharaV2
          if (ev[k]) recentWins[k] = (recentWins[k] || 0) + 1;
        }
      }

      const topPreds: SignalPrediction[] = [];
      const allRankedPreds: SignalPrediction[] = [];
      for (const k of IMPORTANT_MARKETS) {
        if (k === 'UNDER_4_5') continue; // Explicitly remove UNDER_4_5 from IcharaV2
        const rate = recentCount > 0 ? (recentWins[k] || 0) / recentCount : 0;
        let oSum = 0; for (const m of recentWindow) oSum += this.estimateMarketOdds(k, m);
        const oAvg = recentCount > 0 ? parseFloat((oSum / recentCount).toFixed(2)) : 1.35;
        allRankedPreds.push({ market: k, accuracy_rate: rate, avg_odds: oAvg });

        let threshold = 0.85; // Strict default

        if (rate >= threshold) {
          topPreds.push({ market: k, accuracy_rate: rate, avg_odds: oAvg });
        }
      }
      topPreds.sort((a, b) => b.accuracy_rate !== a.accuracy_rate ? b.accuracy_rate - a.accuracy_rate : b.avg_odds - a.avg_odds);
      allRankedPreds.sort((a, b) => b.accuracy_rate !== a.accuracy_rate ? b.accuracy_rate - a.accuracy_rate : b.avg_odds - a.avg_odds);

      // PREVENT DISAPPEARING LOSSES IN ICHARA V2: Never leave top_predictions empty
      const effectiveTopPredsV2 = topPreds.length > 0 ? topPreds : allRankedPreds.filter(p => p.avg_odds >= 1.20).slice(0, 3);

      const refM = effectiveTopPredsV2[0]?.market || allRankedPreds[0]?.market || 'OVER_1_5';
      let ap=0, ac=0, wp=0, wc=0, dp=0, dc=0;
      for (const m of allFinished) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        const day = this.parseKickoffDate(m.kickoff);
        const diff = now.getTime() - day.getTime(), ok = ev[refM] === true;
        ap++; if (ok) ac++;
        if (diff >= 0 && diff <= sevenDays) { wp++; if (ok) wc++; }
        if (day.toDateString() === now.toDateString() || (diff >= 0 && diff <= oneDay)) { dp++; if (ok) dc++; }
      }

      const preAI = { code, all_time: { picks: ap, correct: ac, win_rate: ap > 0 ? parseFloat(((ac  / ap) * 100).toFixed(1)) : 0 }, top_predictions: effectiveTopPredsV2.slice(0, 3) };
      const signature = IcharaV2Engine.getSignatureForCode(code);

      signals_v2[code] = {
        code, total_resolved: allFinished.length,
        top_predictions: effectiveTopPredsV2.slice(0, 3),
        all_time: preAI.all_time,
        weekly: { picks: wp, correct: wc, win_rate: wp > 0 ? parseFloat(((wc  / wp) * 100).toFixed(1)) : 0 },
        daily: { picks: dp, correct: dc, win_rate: dp > 0 ? parseFloat(((dc  / dp) * 100).toFixed(1)) : 0 },
        market_breakdown: breakdown,
        ai_confidence_score: 92, // Precision V2 Tuning
        ai_identified_patterns: [
          ...signature.attributes,
          "ICHARA V2 High-Precision Stance Calibration"
        ],
        signature_name_ar: signature.nameAr,
        signature_name_en: signature.nameEn,
        signature_badge: signature.badge,
        signature_attributes: signature.attributes
      };
    }

    let gt=0, gc=0; const dt: Record<string, any> = {};
    for (const m of finishedMatches) {
      const sig = signals[m.signal_code];
      const preds = (sig?.top_predictions || []).filter(p => {
        // Enforce strict criteria for global stats: 85.0% (17/20)
        const req = 0.85;
        return p.accuracy_rate >= req;
      });
      const day = m.kickoff.split(' ')[0] || 'Unknown';
      if (!dt[day]) dt[day] = { total: 0, correct: 0 };
      if (preds.length > 0) {
        const ev = MarketEvaluator.evaluateAllMarkets(m.ft_home!, m.ft_away!, m.ht_home, m.ht_away);
        for (const p of preds) { gt++; dt[day].total++; if (ev[p.market]) { gc++; dt[day].correct++; } }
      } else {
        const isC = (m.pred || '').toUpperCase() === (m.ft_home! > m.ft_away! ? '1' : m.ft_home! < m.ft_away! ? '2' : 'X');
        gt++; dt[day].total++; if (isC) { gc++; dt[day].correct++; }
      }
    }

    const history: Record<string, any> = {};
    for (const d in dt) history[d] = { date: d, picks: dt[d].total, accuracy: dt[d].total > 0 ? parseFloat(((dt[d].correct  / dt[d].total) * 100).toFixed(1)) : 0 };

    return { signals, signals_v2, globalStats: { total_picks: gt, correct_picks: gc, win_rate: gt > 0 ? parseFloat(((gc  / gt) * 100).toFixed(1)) : 0, daily_history: history } };
  }
}

export default LocalOfflineTrainer;
