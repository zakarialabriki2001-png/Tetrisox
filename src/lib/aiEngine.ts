import { Match, SignalSummary, SignalPrediction } from '../types';
import { MarketEvaluator } from './marketEvaluator';

export class AIEngine {
  /**
   * Deeply analyzes historical matches of a specific signal to discover hidden trends,
   * streak continuations, momentum, and calculate a realistic AI confidence score.
   */
  static analyzeSignalData(matches: Match[], currentSignals: Partial<SignalSummary>): {
    confidence: number;
    patterns: string[];
    adjusted_predictions: SignalPrediction[];
  } {
    if (matches.length === 0) return { confidence: 0, patterns: [], adjusted_predictions: [] };

    let totalGoals = 0;
    let bttsCount = 0;
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    
    // Recent momentum
    let recentWins = 0;
    const sorted = [...matches].sort((a, b) => (b.__parsedTime || 0) - (a.__parsedTime || 0));
    const last5 = sorted.slice(0, 5);

    sorted.forEach((m, idx) => {
      if (m.ft_home !== null && m.ft_away !== null) {
        totalGoals += (m.ft_home + m.ft_away);
        if (m.ft_home > 0 && m.ft_away > 0) bttsCount++;
        
        if (m.ft_home > m.ft_away) homeWins++;
        else if (m.ft_away > m.ft_home) awayWins++;
        else draws++;
      }
    });

    const avgGoals = totalGoals / sorted.length;
    const bttsRate = bttsCount / sorted.length;
    
    // Pattern identification
    const patterns: string[] = [];
    if (avgGoals > 2.7) patterns.push('High Scoring Synergy (Over 2.5)');
    else if (avgGoals < 1.8) patterns.push('Defensive Lock (Low Goals)');
    
    if (bttsRate > 0.65) patterns.push('Consistent BTTS (GG)');
    
    const homeWinRate = homeWins / sorted.length;
    const awayWinRate = awayWins / sorted.length;
    if (homeWinRate > 0.6) patterns.push('Home Dominance Bias');
    if (awayWinRate > 0.6) patterns.push('Away Dominance Bias');

    // Dynamic AI Confidence computation based on volume and recent streak
    let confidence = 0;
    const baseWinRate = currentSignals.all_time?.win_rate || 0;
    
    // Volume multiplier (plateaus at 20 matches)
    const volumeWeight = Math.min(sorted.length / 20, 1.0);
    
    // AI momentum boost based on last 5 matches
    const recentWinRate = last5.reduce((acc, m) => {
      // rough heuristic if we correctly predicted the market most often
      // We will look at top predictions from currentSignals
      if (!currentSignals.top_predictions || currentSignals.top_predictions.length === 0) return acc;
      
      const referenceMarket = currentSignals.top_predictions[0].market;
      if (m.ft_home !== null && m.ft_away !== null) {
        const evals = MarketEvaluator.evaluateAllMarkets(m.ft_home, m.ft_away, m.ht_home, m.ht_away);
        if (evals[referenceMarket] === true) {
          return acc + 1;
        }
      }
      return acc;
    }, 0) / (last5.length || 1);

    confidence = (baseWinRate * 0.4) + (recentWinRate * 100 * 0.4) + (volumeWeight * 20);

    // Apply EMA error penalties if any (penalty for unpredictability)
    if (currentSignals.ema_error_h && currentSignals.ema_error_a) {
      const volatility = Math.abs(currentSignals.ema_error_h) + Math.abs(currentSignals.ema_error_a);
      if (volatility > 1.5) {
        confidence -= 5; // deduct 5% confidence for high volatility
        patterns.push('High Volatility Warning');
      }
    }

    if (recentWinRate === 1.0 && last5.length >= 3) {
      patterns.push('🔥 Winning Streak');
      confidence += 5; // bonus
    }

    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    // Machine Learning style parameter adjustment
    // Adjust top prediction probabilities based on momentum weight
    const adjusted_predictions = (currentSignals.top_predictions || []).map(p => {
      // momentumImpact uses percentage scale (0-100)
      const momentumImpact = (recentWinRate * 100 - p.accuracy_rate * 100) * 0.15; 
      return {
        ...p,
        accuracy_rate: Math.min(1.0, Math.max(0.0, p.accuracy_rate + (momentumImpact / 100)))
      };
    });

    return { confidence, patterns, adjusted_predictions };
  }
}
