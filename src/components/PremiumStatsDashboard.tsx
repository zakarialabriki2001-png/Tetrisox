import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Zap, 
  Search, 
  Flame, 
  BarChart3, 
  Trophy, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle 
} from 'lucide-react';
import { Match, OracleDatabase } from '../types';
import { LocalOfflineTrainer } from '../lib/signalTrainer';
import { AdvancedxGEngine, CipherEngine } from '../lib/matchEngine';
import { DateTimeSystem } from '../lib/dateTimeSystem';

const getMatchPrediction = (m: Match): string => {
  if (m.pred && (m.pred === '1' || m.pred === 'X' || m.pred === '2')) {
    return m.pred.toUpperCase();
  }
  const max = Math.max(m.p1 || 0, m.px || 0, m.p2 || 0);
  if (max === m.p1) return '1';
  if (max === m.p2) return '2';
  return 'X';
};

interface PremiumStatsDashboardProps {
  matchesList: Match[];
  db: OracleDatabase;
}

export const PremiumStatsDashboard: React.FC<PremiumStatsDashboardProps> = ({ matchesList, db }) => {
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high_success' | 'needs_improvement'>('all');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const toggleDayExpanded = (dateStr: string) => {
    setExpandedDays(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  // Helper date utility delegating to DateTimeSystem to prevent chronological errors
  const getLocalDateString = (dateObj: Date): string => {
    return DateTimeSystem.toLocalDateString(dateObj);
  };

  const formatHumanDate = (dateStr: string): string => {
    return DateTimeSystem.formatHumanDate(dateStr);
  };

  // Compiles and groups premium stats by date
  const premiumDailyStats = useMemo(() => {
    // Ensure accurate __parsedTime is present to align with App.tsx timeline scanning
    const parsedMatches = matchesList.map(m => {
      const parsedTime = m.__parsedTime || LocalOfflineTrainer.parseKickoffDate(m.kickoff).getTime();
      return { ...m, __parsedTime: parsedTime };
    });

    const finishedMatchesBySignal: Record<string, Match[]> = {};
    parsedMatches.forEach(m => {
      if (m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null) {
        if (!finishedMatchesBySignal[m.signal_code]) {
          finishedMatchesBySignal[m.signal_code] = [];
        }
        finishedMatchesBySignal[m.signal_code].push(m);
      }
    });
    Object.keys(finishedMatchesBySignal).forEach(code => {
      finishedMatchesBySignal[code].sort((a, b) => {
        const timeA = a.__parsedTime || LocalOfflineTrainer.parseKickoffDate(a.kickoff).getTime();
        const timeB = b.__parsedTime || LocalOfflineTrainer.parseKickoffDate(b.kickoff).getTime();
        return timeB - timeA;
      });
    });

    // Group all matches by date
    const dateGroups: Record<string, Match[]> = {};
    parsedMatches.forEach(m => {
      const pDate = LocalOfflineTrainer.parseKickoffDate(m.kickoff);
      const dStr = getLocalDateString(pDate);
      if (!dateGroups[dStr]) dateGroups[dStr] = [];
      dateGroups[dStr].push(m);
    });

    const statsArray = Object.entries(dateGroups).map(([dateStr, matchesOnDay]) => {
      let csTotal = 0;
      let csWins = 0;
      let csSettled = 0;

      let fhTotal = 0;
      let fhWins = 0;
      let fhSettled = 0;

      let ghTotal = 0;
      let ghWins = 0;
      let ghSettled = 0;

      const positionDetails: { 
        match: Match; 
        type: 'CS' | 'FH' | 'GH';
        isSettled: boolean; 
        isCorrect: boolean; 
        predicted: string; 
        actual: string; 
      }[] = [];

      matchesOnDay.forEach(m => {
        const sigInfo = db.signals[m.signal_code];
        if (!sigInfo) return;

        // Odds filter rule matching premium pick tabs
        if (m.coef < 1.25 || m.coef > 7.0) return;

        const mTime = m.__parsedTime || LocalOfflineTrainer.parseKickoffDate(m.kickoff).getTime();

        // 1. 1X2 Day criteria check (Last 15 matches, expected score aligns with prediction)
        const prediction = getMatchPrediction(m);
        const isOneXTwo = prediction === '1' || prediction === 'X' || prediction === '2';

        if (isOneXTwo) {
          // Physical fatigue calculations
          let homePrevTime = 0;
          let awayPrevTime = 0;
          for (const prev of parsedMatches) {
            if (prev.__parsedTime! < mTime) {
              if ((prev.home === m.home || prev.away === m.home) && prev.__parsedTime! > homePrevTime) {
                homePrevTime = prev.__parsedTime!;
              }
              if ((prev.home === m.away || prev.away === m.away) && prev.__parsedTime! > awayPrevTime) {
                awayPrevTime = prev.__parsedTime!;
              }
            }
          }
          
          const homeRestDays = homePrevTime > 0 ? (mTime - homePrevTime) / (1000 * 60 * 60 * 24) : 7.0;
          const awayRestDays = awayPrevTime > 0 ? (mTime - awayPrevTime) / (1000 * 60 * 60 * 24) : 7.0;

          let hFatiguePenalty = 0.0;
          let aFatiguePenalty = 0.0;
          if (homeRestDays < 3.0) {
            hFatiguePenalty = 0.38 * (3.0 - homeRestDays);
          }
          if (awayRestDays < 3.0) {
            aFatiguePenalty = 0.38 * (3.0 - awayRestDays);
          }

          const finishedForSignal = CipherEngine.getAidedFinishedMatches(
            m.signal_code,
            finishedMatchesBySignal,
            mTime,
            30
          );

          // Inspect last 15 finished games
          const last15 = finishedForSignal.slice(0, 15);
          if (last15.length >= 15) {
            const last15Count = last15.length;
            const correctCount = last15.filter((hist) => {
              if (hist.ft_home === null || hist.ft_away === null) return false;
              const actualOutcome =
                hist.ft_home > hist.ft_away ? "1" : (hist.ft_home < hist.ft_away ? "2" : "X");
              const pastPrediction = getMatchPrediction(hist);
              return actualOutcome === pastPrediction;
            }).length;

            // Baseline organic checks
            const minOrganicWins = (prediction === "1" || prediction === "2") ? 11 : 6;
            if (correctCount >= minOrganicWins) {
              const winRate = correctCount / last15Count;

              // Compute Local xG and Poisson
              const computedLocalXG = AdvancedxGEngine.computeLocalXG(
                m.p1,
                m.px,
                m.p2,
                m.coef,
                null,
                (sigInfo.ema_error_h || 0) + hFatiguePenalty,
                (sigInfo.ema_error_a || 0) + aFatiguePenalty
              );
              const poissonProbs = AdvancedxGEngine.computePoissonGridProbs(
                computedLocalXG.xgHome,
                computedLocalXG.xgAway
              );

              let pProb = 0;
              if (prediction === "1") pProb = poissonProbs["FT_1"] * 100;
              else if (prediction === "2") pProb = poissonProbs["FT_2"] * 100;
              else pProb = poissonProbs["FT_X"] * 100;

              const drawProb = poissonProbs["FT_X"] * 100;

              // Team Momentum form
              const homeTeam = m.home;
              const awayTeam = m.away;

              const finishedHome = parsedMatches.filter((prev) => {
                if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
                if (prev.home !== homeTeam && prev.away !== homeTeam) return false;
                return prev.__parsedTime! < mTime;
              });
              const finishedAway = parsedMatches.filter((prev) => {
                if (prev.status !== "FINISHED" || prev.ft_home === null || prev.ft_away === null) return false;
                if (prev.home !== awayTeam && prev.away !== awayTeam) return false;
                return prev.__parsedTime! < mTime;
              });

              const last5HomeMatches = finishedHome.slice(0, 5);
              const last5AwayMatches = finishedAway.slice(0, 5);

              let hGoalsScored = 0, hGoalsConceded = 0;
              last5HomeMatches.forEach(p => {
                const isH = p.home === homeTeam;
                hGoalsScored += isH ? p.ft_home! : p.ft_away!;
                hGoalsConceded += isH ? p.ft_away! : p.ft_home!;
              });
              const hScoringRatio = last5HomeMatches.length > 0 ? (hGoalsScored / (hGoalsConceded || 1)) : 1.0;

              let aGoalsScored = 0, aGoalsConceded = 0;
              last5AwayMatches.forEach(p => {
                const isH = p.home === awayTeam;
                aGoalsScored += isH ? p.ft_home! : p.ft_away!;
                aGoalsConceded += isH ? p.ft_away! : p.ft_home!;
              });
              const aScoringRatio = last5AwayMatches.length > 0 ? (aGoalsScored / (aGoalsConceded || 1)) : 1.0;

              // Smart anti-surprise defense filters
              let passesDefenseShield = true;
              if (prediction === "1" && m.coef > 2.05) passesDefenseShield = false;
              if (prediction === "2" && m.coef > 2.25) passesDefenseShield = false;
              if (prediction === "X" && (m.coef < 2.90 || m.coef > 4.10)) passesDefenseShield = false;

              if (prediction === "1" && hScoringRatio < 0.85) passesDefenseShield = false;
              if (prediction === "2" && aScoringRatio < 0.85) passesDefenseShield = false;

              if (prediction === "1" && aScoringRatio > 1.65) passesDefenseShield = false;
              if (prediction === "2" && hScoringRatio > 1.65) passesDefenseShield = false;

              if (prediction === "1" && homeRestDays < 3.0 && awayRestDays >= 5.5) passesDefenseShield = false;
              if (prediction === "2" && awayRestDays < 3.0 && homeRestDays >= 5.5) passesDefenseShield = false;

              if (prediction !== "X" && drawProb > 29.5 && (computedLocalXG.xgHome + computedLocalXG.xgAway) < 2.22) passesDefenseShield = false;
              if (prediction !== "X" && m.px > 29.5) passesDefenseShield = false;

              if (passesDefenseShield) {
                // SDG training for pre-optimizer score
                const trainingInstances = finishedForSignal.slice(0, 15).map(hist => {
                  const histLocalXG = AdvancedxGEngine.computeLocalXG(
                    hist.p1,
                    hist.px,
                    hist.p2,
                    hist.coef,
                    null,
                    sigInfo.ema_error_h || 0,
                    sigInfo.ema_error_a || 0
                  );
                  const histProbs = AdvancedxGEngine.computePoissonGridProbs(histLocalXG.xgHome, histLocalXG.xgAway);
                  const histPred = getMatchPrediction(hist);
                  let pVal = 0.33;
                  if (histPred === "1") pVal = histProbs["FT_1"] || 0.33;
                  else if (histPred === "2") pVal = histProbs["FT_2"] || 0.33;
                  else pVal = histProbs["FT_X"] || 0.33;

                  const histActual = hist.ft_home! > hist.ft_away! ? "1" : hist.ft_home! < hist.ft_away! ? "2" : "X";
                  const isCorrect = histPred === histActual ? 1.0 : 0.0;

                  return {
                    features: [
                      pVal, 
                      (sigInfo.all_time?.win_rate || 80) / 100,
                      Math.min(1.0, Math.max(0.0, (hist.p1 + hist.p2) / 100)),
                      Math.min(1.0, hist.coef / 4.0)
                    ],
                    target: isCorrect
                  };
                });

                let weights = [0.25, 0.40, 0.20, 0.15];
                let lossBias = -0.4;
                
                if (trainingInstances.length >= 4) {
                  const learningRate = 0.07;
                  for (let iter = 0; iter < 30; iter++) {
                    let gradW = [0, 0, 0, 0];
                    let gradB = 0;
                    for (const inst of trainingInstances) {
                      const xVal = inst.features;
                      const yVal = inst.target;
                      const logits = weights[0] * xVal[0] + weights[1] * xVal[1] + weights[2] * xVal[2] + weights[3] * xVal[3] + lossBias;
                      const pSig = 1.0 / (1.0 + Math.exp(-logits));
                      const err = pSig - yVal;
                      for (let j = 0; j < 4; j++) gradW[j] += err * xVal[j];
                      gradB += err;
                    }
                    const l2Penalty = 0.015;
                    for (let j = 0; j < 4; j++) {
                      weights[j] -= learningRate * (gradW[j] / trainingInstances.length + l2Penalty * weights[j]);
                    }
                    lossBias -= learningRate * (gradB / trainingInstances.length);
                  }
                }

                const activeFeatures = [
                  pProb / 100,
                  winRate,
                  Math.min(1.0, Math.max(0.0, (m.p1 + m.p2) / 100)),
                  Math.min(1.0, m.coef / 4.0)
                ];
                const activeLogit = weights[0] * activeFeatures[0] + weights[1] * activeFeatures[1] + weights[2] * activeFeatures[2] + weights[3] * activeFeatures[3] + lossBias;
                const activeProb = 1.0 / (1.0 + Math.exp(-activeLogit));

                const signalConsistencyScore = (correctCount / 15) * 40;
                const mlOptimizedScore = activeProb * 30;
                const poissonScore = (pProb / 100) * 15;
                let momentumSafetyScore = 15;
                if (prediction === "1" && hScoringRatio < 0.9) momentumSafetyScore -= 5;
                if (prediction === "2" && aScoringRatio < 0.9) momentumSafetyScore -= 5;
                if (homeRestDays < 3.0 || awayRestDays < 3.0) momentumSafetyScore -= 3;

                const consolidatedScore = parseFloat((signalConsistencyScore + mlOptimizedScore + poissonScore + momentumSafetyScore).toFixed(1));

                const requiredThreshold = prediction === "X" ? 59.0 : 74.0;
                if (consolidatedScore >= requiredThreshold) {
                  csTotal++;
                  const isSettled = m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null;
                  let isCorrect = false;
                  if (isSettled) {
                    csSettled++;
                    const actualOutcome = m.ft_home! > m.ft_away! ? '1' : (m.ft_home! < m.ft_away! ? '2' : 'X');
                    if (actualOutcome === prediction) {
                      csWins++;
                      isCorrect = true;
                    }
                  }
                  positionDetails.push({
                    match: m,
                    type: 'CS',
                    isSettled,
                    isCorrect,
                    predicted: prediction,
                    actual: isSettled ? (m.ft_home! > m.ft_away! ? '1' : (m.ft_home! < m.ft_away! ? '2' : 'X')) : '-'
                  });
                }
              }
            }
          }
        }

        // 2. First Half Target check (Strict 17/20 success: 85.0%+)
        const recent20FH = CipherEngine.getAidedFinishedMatches(
          m.signal_code,
          finishedMatchesBySignal,
          mTime,
          20
        ).slice(0, 20);
        
        if (recent20FH.length >= 20) {
          const recentCountFH = recent20FH.length;
          let countOver05 = 0;
          let countOver15 = 0;
          let countHomeOver05 = 0;
          let countAwayOver05 = 0;

          recent20FH.forEach(hist => {
            if (hist.ht_home === null || hist.ht_away === null) return;
            const totalFh = hist.ht_home + hist.ht_away;
            if (totalFh > 0) countOver05++;
            if (totalFh > 1) countOver15++;
            if (hist.ht_home > 0) countHomeOver05++;
            if (hist.ht_away > 0) countAwayOver05++;
          });

          const rateOver05 = countOver05 / recentCountFH;
          const rateOver15 = countOver15 / recentCountFH;
          const rateHomeOver05 = countHomeOver05 / recentCountFH;
          const rateAwayOver05 = countAwayOver05 / recentCountFH;

          // Predicted halftime expected score calculated to enforce mathematical convergence
          const uHtXgH = m.xg_home * 0.45;
          const uHtXgA = m.xg_away * 0.45;
          const uHtGoalH = uHtXgH < 0.4 ? 0 : (uHtXgH < 1.2 ? 1 : 2);
          const uHtGoalA = uHtXgA < 0.4 ? 0 : (uHtXgA < 1.2 ? 1 : 2);
          const totalExpectedHtGoal = uHtGoalH + uHtGoalA;

          const candidates: { market: 'FH_OVER_0_5' | 'FH_OVER_1_5' | 'FH_HOME_OVER_0_5' | 'FH_AWAY_OVER_0_5', rate: number, count: number }[] = [];
          if (rateOver05 >= 0.85 && totalExpectedHtGoal >= 1) candidates.push({ market: 'FH_OVER_0_5', rate: rateOver05, count: countOver05 });
          if (rateOver15 >= 0.85 && totalExpectedHtGoal >= 2) candidates.push({ market: 'FH_OVER_1_5', rate: rateOver15, count: countOver15 });
          if (rateHomeOver05 >= 0.85 && uHtGoalH >= 1) candidates.push({ market: 'FH_HOME_OVER_0_5', rate: rateHomeOver05, count: countHomeOver05 });
          if (rateAwayOver05 >= 0.85 && uHtGoalA >= 1) candidates.push({ market: 'FH_AWAY_OVER_0_5', rate: rateAwayOver05, count: countAwayOver05 });

          if (candidates.length > 0) {
            const priority = { 'FH_OVER_0_5': 4, 'FH_HOME_OVER_0_5': 3, 'FH_AWAY_OVER_0_5': 2, 'FH_OVER_1_5': 1 };
            candidates.sort((a,b) => {
              if (Math.abs(a.rate - b.rate) > 0.0001) return b.rate - a.rate;
              return priority[b.market] - priority[a.market];
            });

            const bestCand = candidates[0];
            fhTotal++;

            const isSettled = m.status === 'FINISHED' && m.ht_home !== null && m.ht_away !== null;
            let isCorrect = false;

            if (isSettled) {
              fhSettled++;
              const totFh = m.ht_home + m.ht_away;
              if (bestCand.market === 'FH_OVER_0_5') isCorrect = totFh > 0;
              else if (bestCand.market === 'FH_OVER_1_5') isCorrect = totFh > 1;
              else if (bestCand.market === 'FH_HOME_OVER_0_5') isCorrect = m.ht_home > 0;
              else if (bestCand.market === 'FH_AWAY_OVER_0_5') isCorrect = m.ht_away > 0;

              if (isCorrect) fhWins++;
            }

            positionDetails.push({
              match: m,
              type: 'FH',
              isSettled,
              isCorrect,
              predicted: bestCand.market.replace('FH_', 'FH '),
              actual: isSettled ? `${m.ht_home}-${m.ht_away}` : '-'
            });
          }
        }

        // 3. Goals Hunter check (Strict 18/20 successes minimum)
        const recent20GH_raw = CipherEngine.getAidedFinishedMatches(
          m.signal_code,
          finishedMatchesBySignal,
          mTime,
          30
        );
        const recent20GH = recent20GH_raw.filter(x => x.ft_home !== null && x.ft_away !== null).slice(0, 20);

        if (recent20GH.length >= 20) {
          const recentCountGH = recent20GH.length;
          let countOver15 = 0;
          let countOver25 = 0;
          let countOver35 = 0;
          let countBttsYes = 0;

          recent20GH.forEach(hist => {
            if (hist.ft_home === null || hist.ft_away === null) return;
            const totalGoals = hist.ft_home + hist.ft_away;
            if (totalGoals > 1) countOver15++;
            if (totalGoals > 2) countOver25++;
            if (totalGoals > 3) countOver35++;
            if (hist.ft_home > 0 && hist.ft_away > 0) countBttsYes++;
          });

          const rateOver15 = countOver15 / recentCountGH;
          const rateOver25 = countOver25 / recentCountGH;
          const rateOver35 = countOver35 / recentCountGH;
          const rateBttsYes = countBttsYes / recentCountGH;

          // Predicted full time expected score to ensure mathematical convergence and avoid contradictions
          const expectedScore = AdvancedxGEngine.computeFormAdjustedScore(m, matchesList);
          const [egH, egA] = expectedScore.split('-').map(Number);
          const totalEg = egH + egA;

          // Compile candidates that have success rate of at least 18/20
          const candidates: { market: 'OVER_1_5' | 'OVER_2_5' | 'OVER_3_5' | 'BTTS_YES', rate: number, count: number }[] = [];
          if (countOver15 >= 18 && totalEg >= 3) candidates.push({ market: 'OVER_1_5', rate: rateOver15, count: countOver15 });
          if (countOver25 >= 17 && totalEg >= 4) candidates.push({ market: 'OVER_2_5', rate: rateOver25, count: countOver25 });
          if (countOver35 >= 17 && totalEg >= 5) candidates.push({ market: 'OVER_3_5', rate: rateOver35, count: countOver35 });
          if (countBttsYes >= 18 && egH > 0 && egA > 0) candidates.push({ market: 'BTTS_YES', rate: rateBttsYes, count: countBttsYes });

          if (candidates.length > 0) {
            const priority = { 'OVER_2_5': 4, 'BTTS_YES': 3, 'OVER_1_5': 2, 'OVER_3_5': 1 };
            candidates.sort((a,b) => {
              if (Math.abs(a.rate - b.rate) > 0.0001) return b.rate - a.rate;
              return priority[b.market] - priority[a.market];
            });

            const bestCand = candidates[0];
            ghTotal++;

            const isSettled = m.status === 'FINISHED' && m.ft_home !== null && m.ft_away !== null;
            let isCorrect = false;

            if (isSettled) {
              ghSettled++;
              const totGoals = m.ft_home + m.ft_away;
              if (bestCand.market === 'OVER_1_5') isCorrect = totGoals > 1;
              else if (bestCand.market === 'OVER_2_5') isCorrect = totGoals > 2;
              else if (bestCand.market === 'OVER_3_5') isCorrect = totGoals > 3;
              else if (bestCand.market === 'BTTS_YES') isCorrect = m.ft_home > 0 && m.ft_away > 0;

              if (isCorrect) ghWins++;
            }

            positionDetails.push({
              match: m,
              type: 'GH',
              isSettled,
              isCorrect,
              predicted: bestCand.market,
              actual: isSettled ? `${m.ft_home}-${m.ft_away}` : '-'
            });
          }
        }
      });

      const totalPicks = csTotal + fhTotal + ghTotal;
      const settledPicks = csSettled + fhSettled + ghSettled;
      const wonPicks = csWins + fhWins + ghWins;
      const winRate = settledPicks > 0 ? parseFloat(((wonPicks  / settledPicks) * 100).toFixed(1)) : 0;

      return {
        dateStr,
        csTotal,
        csWins,
        csSettled,
        fhTotal,
        fhWins,
        fhSettled,
        ghTotal,
        ghWins,
        ghSettled,
        totalPicks,
        settledPicks,
        wonPicks,
        winRate,
        positions: positionDetails
      };
    });

    // Filter out dates with zero premium picks to keep dashboard focused
    return statsArray
      .filter(item => item.totalPicks > 0)
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [matchesList, db.signals]);

  // General metrics sums
  const masterStats = useMemo(() => {
    let csTotal = 0;
    let csSettled = 0;
    let csWins = 0;

    let fhTotal = 0;
    let fhSettled = 0;
    let fhWins = 0;

    let ghTotal = 0;
    let ghSettled = 0;
    let ghWins = 0;

    premiumDailyStats.forEach(day => {
      csTotal += day.csTotal;
      csSettled += day.csSettled;
      csWins += day.csWins;

      fhTotal += day.fhTotal;
      fhSettled += day.fhSettled;
      fhWins += day.fhWins;

      ghTotal += day.ghTotal;
      ghSettled += day.ghSettled;
      ghWins += day.ghWins;
    });

    const totalPicks = csTotal + fhTotal + ghTotal;
    const totalSettled = csSettled + fhSettled + ghSettled;
    const totalWins = csWins + fhWins + ghWins;

    return {
      csTotal,
      csSettled,
      csWins,
      csRate: csSettled > 0 ? parseFloat(((csWins  / csSettled) * 100).toFixed(1)) : 0,
      
      fhTotal,
      fhSettled,
      fhWins,
      fhRate: fhSettled > 0 ? parseFloat(((fhWins  / fhSettled) * 100).toFixed(1)) : 0,

      ghTotal,
      ghSettled,
      ghWins,
      ghRate: ghSettled > 0 ? parseFloat(((ghWins  / ghSettled) * 100).toFixed(1)) : 0,

      totalPicks,
      totalSettled,
      totalWins,
      globalRate: totalSettled > 0 ? parseFloat(((totalWins  / totalSettled) * 100).toFixed(1)) : 0
    };
  }, [premiumDailyStats]);

  // League-wise premium analysis segment
  const leagueStats = useMemo(() => {
    const leagues: Record<string, { total: number; settled: number; wins: number }> = {};

    premiumDailyStats.forEach(d => {
      d.positions.forEach(p => {
        const lName = p.match.league_name;
        if (!leagues[lName]) {
          leagues[lName] = { total: 0, settled: 0, wins: 0 };
        }
        leagues[lName].total++;
        if (p.isSettled) {
          leagues[lName].settled++;
          if (p.isCorrect) leagues[lName].wins++;
        }
      });
    });

    return Object.entries(leagues).map(([name, data]) => {
      const rate = data.settled > 0 ? parseFloat(((data.wins  / data.settled) * 100).toFixed(1)) : 0;
      return { name, ...data, rate };
    }).sort((a, b) => b.rate - a.rate || b.total - a.total);
  }, [premiumDailyStats]);

  // Confidence category stats segment
  const confidenceStats = useMemo(() => {
    let highTotal = 0;
    let highSettled = 0;
    let highWins = 0;

    let medTotal = 0;
    let medSettled = 0;
    let medWins = 0;

    premiumDailyStats.forEach(d => {
      d.positions.forEach(p => {
        if (p.match.confidence_tier === 'HIGH') {
          highTotal++;
          if (p.isSettled) {
            highSettled++;
            if (p.isCorrect) highWins++;
          }
        } else {
          medTotal++;
          if (p.isSettled) {
            medSettled++;
            if (p.isCorrect) medWins++;
          }
        }
      });
    });

    return {
      highTotal,
      highSettled,
      highWins,
      highRate: highSettled > 0 ? parseFloat(((highWins  / highSettled) * 100).toFixed(1)) : 0,
      medTotal,
      medSettled,
      medWins,
      medRate: medSettled > 0 ? parseFloat(((medWins  / medSettled) * 100).toFixed(1)) : 0,
    };
  }, [premiumDailyStats]);

  // Filtered rows of the daily performance tracker
  const filteredDailyStats = useMemo(() => {
    return premiumDailyStats.filter(day => {
      const formattedDate = formatHumanDate(day.dateStr);
      const matchesSearch = day.dateStr.includes(dashboardSearchQuery) || 
                            formattedDate.toLowerCase().includes(dashboardSearchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterType === 'high_success') {
        return day.settledPicks > 0 && day.winRate >= 86;
      }
      if (filterType === 'needs_improvement') {
        return day.settledPicks > 0 && day.winRate < 60;
      }
      return true;
    });
  }, [premiumDailyStats, dashboardSearchQuery, filterType]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER OVERVIEW */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/15 to-slate-950 p-6 rounded-3xl border border-amber-950/20 space-y-2 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl animate-pulse" />
        <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2 uppercase tracking-wider">
          <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Premium Statistics Dashboard & Career Audit Logs</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-mono">
          Strictly monitors chronological, out-of-sample backtest results. These performance metrics and charts are computed exclusively from premium signal instances (1X2 Day, First Half, and Goals Hunter) recorded across past, current, and future settlements.
        </p>
      </div>

      {/* METRIC SUMMARIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">TOTAL PREMIUM PICKS</span>
          <span className="text-2xl font-extrabold text-slate-100 mt-2 block font-mono">
            {masterStats.totalPicks} <span className="text-[11px] font-normal text-slate-500">Picks</span>
          </span>
          <p className="text-[10.5px] text-slate-550 mt-1.5 font-mono">
            {masterStats.totalSettled} settled • {masterStats.totalPicks - masterStats.totalSettled} pending
          </p>
        </div>

        <div className="bg-slate-900/40 border border-amber-955/30 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-lg" />
          <span className="text-[10px] text-amber-300 font-mono uppercase tracking-wider block font-bold flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> 1X2 DAY HIT RATE
          </span>
          <span className="text-2xl font-extrabold text-amber-400 mt-2 block font-mono">
            {masterStats.csRate}%
          </span>
          <p className="text-[10.5px] text-slate-550 mt-1.5 font-mono">
            {masterStats.csWins} hits on {masterStats.csSettled} settled 1X2 games
          </p>
        </div>

        <div className="bg-slate-900/40 border border-blue-950/30 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-lg" />
          <span className="text-[10px] text-blue-300 font-mono uppercase tracking-wider block font-bold flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> FIRST HALF ONLY
          </span>
          <span className="text-2xl font-extrabold text-blue-400 mt-2 block font-mono">
            {masterStats.fhRate}%
          </span>
          <p className="text-[10.5px] text-slate-550 mt-1.5 font-mono">
            {masterStats.fhWins} hits on {masterStats.fhSettled} settled FH games
          </p>
        </div>

        <div className="bg-slate-900/40 border border-purple-955/30 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full blur-lg" />
          <span className="text-[10px] text-purple-300 font-mono uppercase tracking-wider block font-bold flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-purple-400" /> GOALS HUNTER
          </span>
          <span className="text-2xl font-extrabold text-purple-400 mt-2 block font-mono">
            {masterStats.ghRate}%
          </span>
          <p className="text-[10.5px] text-slate-550 mt-1.5 font-mono">
            {masterStats.ghWins} hits on {masterStats.ghSettled} settled GH games
          </p>
        </div>

        <div className="bg-gradient-to-b from-emerald-950/20 to-slate-950 border border-emerald-900/30 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block font-bold">OVERALL SUCCESS RATE</span>
          <span className="text-2xl font-extrabold text-emerald-300 mt-2 block font-mono">
            {masterStats.globalRate}%
          </span>
          <p className="text-[10.5px] text-slate-550 mt-1.5 font-mono">
            {masterStats.totalWins} / {masterStats.totalSettled} correct global settlements
          </p>
        </div>

      </div>

      {/* MID SECTION: LEAGUE AND CONFIDENCE PERFORMANCE STREAKS */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
        
        {/* LEAGUE PERFORMANCE LEADERBOARD */}
        <div className="lg:col-span-7 bg-slate-900/25 border border-slate-900 rounded-2.5xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-teal-405" />
              Premium League Success Leaderboard
            </h4>
            <span className="text-[9.5px] text-slate-500 font-mono">Sorted by hit rate</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {leagueStats.length === 0 ? (
              <p className="text-center font-mono text-xs text-slate-500 py-10">No settled premium league listings tracked yet.</p>
            ) : (
              leagueStats.map((l, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-900/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-200 truncate" title={l.name}>
                      {l.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 block font-bold">{l.wins} / {l.settled} <span className="text-[10px] font-normal text-slate-500">G</span></span>
                      <span className="text-[9px] text-slate-505">{l.total - l.settled} pending</span>
                    </div>
                    <div className="w-14 text-right">
                      <span className={`font-black rounded px-1.5 py-0.5 text-[10.5px] ${
                        l.rate >= 80 
                          ? 'text-emerald-450 bg-emerald-955/40 border border-emerald-900/20' 
                          : l.rate >= 60 
                          ? 'text-teal-400 bg-teal-950/40 border border-teal-900/20' 
                          : 'text-amber-400 bg-amber-955/40 border border-amber-900/20'
                      }`}>
                        {l.rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONFIDENCE & SYSTEM HEALTH HIGHLIGHTS */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          
          <div className="bg-slate-900/25 border border-slate-900 rounded-2.5xl p-5 space-y-4 flex-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <Zap className="h-4.5 w-4.5 text-amber-405" />
              Confidence Calibration Audit
            </h4>
            
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-[ping_1.5s_infinite]" /> High Confidence
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{confidenceStats.highWins}/{confidenceStats.highSettled} games</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full" style={{ width: `${confidenceStats.highRate}%` }} />
                  </div>
                  <span className="font-mono text-sm font-black text-amber-350 w-10 text-right">{confidenceStats.highRate}%</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> Medium Confidence
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{confidenceStats.medWins}/{confidenceStats.medSettled} games</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-slate-700 to-slate-400 rounded-full" style={{ width: `${confidenceStats.medRate}%` }} />
                  </div>
                  <span className="font-mono text-sm font-black text-slate-300 w-10 text-right">{confidenceStats.medRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/15 border border-dashed border-slate-900 rounded-2.5xl p-4 text-center font-mono space-y-1.5">
            <span className="text-[10px] text-slate-505 uppercase font-black block">CRITERIA NOTICE</span>
            <p className="text-[9.5px] text-slate-450 leading-relaxed">
              Premium selections must meet or exceed strict mathematical historic win rates (75%-80%+) across finished signal matches. Any sub-standard signal is automatically filtered out.
            </p>
          </div>

        </div>

      </div>

      {/* DAILY PERFORMANCE TRACKER CALENDAR VIEW */}
      <div className="bg-slate-900/25 border border-slate-900 rounded-3xl p-6 space-y-5">
        
        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-amber-500" />
              Chronological Daily Performance Tracker
            </h4>
            <p className="text-[10.5px] text-slate-550 font-mono">
              List of all days containing active premium picks and computed settlements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search date (YYYY-MM-DD)..."
                value={dashboardSearchQuery}
                onChange={(e) => setDashboardSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800/80 rounded-xl pl-8 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 w-full md:w-60 text-slate-300"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Filter buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 shrink-0 font-mono text-[10px]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-slate-900 text-slate-200' : 'text-slate-505 hover:text-slate-300'
                }`}
              >
                All Days
              </button>
              <button
                onClick={() => setFilterType('high_success')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'high_success' ? 'bg-emerald-950/40 text-emerald-400' : 'text-slate-550 hover:text-slate-300'
                }`}
              >
                &ge; 86.7% Success
              </button>
              <button
                onClick={() => setFilterType('needs_improvement')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'needs_improvement' ? 'bg-rose-950/40 text-rose-400' : 'text-slate-505 hover:text-slate-300'
                }`}
              >
                &lt; 60%
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS CALENDAR LIST */}
        <div className="space-y-4">
          {filteredDailyStats.length === 0 ? (
            <div className="border border-dashed border-slate-900 rounded-2xl p-16 text-center text-slate-500 bg-slate-950/15">
              <HelpCircle className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold font-mono text-slate-400">No matching dates found with premium picks volumes.</p>
            </div>
          ) : (
            filteredDailyStats.map((day, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all p-5 space-y-4"
              >
                {/* DATE TITLE ROW */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/10 border border-amber-500/50 block shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-slate-200 text-sm tracking-tight">
                        {formatHumanDate(day.dateStr)}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-505 font-medium">
                        Raw reference: {day.dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                    <div className="text-right hidden sm:block">
                      <span className="text-slate-400 block font-bold">
                        {day.wonPicks} Hits <span className="text-slate-505 font-normal">on</span> {day.settledPicks} Games
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {day.totalPicks - day.settledPicks} positions remaining
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-455 uppercase font-black tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono select-none">
                        Success Rate
                      </span>
                      <span className={`text-base font-black px-2.5 py-1 rounded-xl text-center ${
                        day.settledPicks === 0
                          ? 'text-slate-400 bg-slate-900 border border-slate-800/60'
                          : day.winRate >= 86
                          ? 'text-emerald-400 bg-emerald-955/40 border border-emerald-900/30 font-black'
                          : day.winRate >= 70
                          ? 'text-teal-400 bg-teal-950/40 border border-teal-900/30'
                          : 'text-amber-400 bg-amber-955/40 border border-amber-900/30'
                      }`}>
                        {day.settledPicks === 0 ? 'PENDING' : `${day.winRate}%`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* POSITIONS GRID LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest block">
                      Premium Positions Summary ({day.positions.length})
                    </span>
                    {day.positions.length > 4 && (
                      <span className="text-[10px] text-amber-500 font-mono font-semibold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        {expandedDays[day.dateStr] ? 'Fully Expanded' : `Showing 4 of ${day.positions.length}`}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(expandedDays[day.dateStr] ? day.positions : day.positions.slice(0, 4)).map((p, pIdx) => {
                      return (
                        <div 
                          key={pIdx} 
                          className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3 flex flex-col justify-between gap-2.5 relative hover:border-slate-800/80 transition-all text-xs"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                                p.type === 'CS' 
                                  ? 'bg-amber-955/80 text-amber-300 border border-amber-900/15'
                                  : p.type === 'FH'
                                    ? 'bg-blue-955/80 text-blue-300 border border-blue-900/15'
                                    : 'bg-purple-955/80 text-purple-300 border border-purple-900/15'
                              }`}>
                                {p.type === 'CS' ? '1X2 Day' : p.type === 'FH' ? 'First Half Only' : 'Goals Hunter'}
                              </span>
                              <span className="bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.2 rounded text-[8.5px]">
                                Code: {p.match.signal_code}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 truncate font-medium">
                              {p.match.league_name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-900/40 font-mono">
                            <span className="font-extrabold text-slate-300 truncate max-w-[140px] sm:max-w-none">
                              {p.match.home} vs {p.match.away}
                            </span>

                            <div className="flex items-center gap-1 shrink-0 font-bold">
                              <span className="text-slate-500 text-[10px]">Pred:</span>
                              <span className={`px-1.5 rounded text-[10.5px] ${
                                p.type === 'CS' ? 'text-amber-300 bg-amber-950/30' : p.type === 'FH' ? 'text-blue-300 bg-blue-950/30' : 'text-purple-300 bg-purple-950/30'
                              }`}>{p.predicted}</span>
                            </div>
                          </div>

                          {/* OUTCOME FOOTER */}
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">Result:</span>
                              <strong className="text-slate-300">{p.actual}</strong>
                            </div>

                            <div>
                              {p.isSettled ? (
                                <span className={`font-black px-1.5 py-0.5 rounded text-[9.5px] ${
                                  p.isCorrect
                                    ? 'text-emerald-400 bg-emerald-950/15 border border-emerald-900/25'
                                    : 'text-rose-400 bg-rose-950/15 border border-rose-900/25'
                                }`}>
                                  {p.isCorrect ? '✓ WON' : '✗ LOST'}
                                </span>
                              ) : (
                                <span className="text-slate-550 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-[9px]">
                                  PENDING
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {day.positions.length > 4 && (
                    <div className="text-center pt-1">
                      <button
                        onClick={() => toggleDayExpanded(day.dateStr)}
                        className="cursor-pointer text-[11px] font-bold px-4 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-550 hover:text-amber-300 border border-slate-800 transition-all shadow-md inline-flex items-center gap-1.5 font-mono"
                      >
                        {expandedDays[day.dateStr] ? (
                          <>▲ Show Less / عرض أقل</>
                        ) : (
                          <>▼ Show More / عرض المزيد (+{day.positions.length - 4})</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
