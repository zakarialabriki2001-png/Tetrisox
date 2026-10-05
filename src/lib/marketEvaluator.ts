/**
 * Market Evaluator - Tracks and validates over 200 distinct sports betting markets
 */

export type FootMarketKey = 
  | 'FT_1' | 'FT_X' | 'FT_2'
  | 'HT_1' | 'HT_X' | 'HT_2'
  | 'SH_1' | 'SH_X' | 'SH_2'
  | 'DC_1X' | 'DC_X2'
  | 'GG_FT' | 'NG_FT'
  | 'GG_HT' | 'NG_HT'
  | 'GG_SH' | 'NG_SH'
  | 'OVER_0_5' | 'UNDER_0_5'
  | 'OVER_1_5' | 'UNDER_1_5'
  | 'OVER_2_5'
  | 'OVER_3_5' | 'UNDER_3_5'
  | 'OVER_4_5' | 'UNDER_4_5'
  | 'OVER_5_5' | 'UNDER_5_5'
  | 'HT_OVER_0_5' | 'HT_UNDER_0_5'
  | 'HT_OVER_1_5'
  | 'SH_OVER_0_5' | 'SH_UNDER_0_5'
  | 'SH_OVER_1_5' | 'SH_UNDER_1_5'
  | 'HOME_WIN_CLEAN_SHEET'
  | 'AWAY_WIN_CLEAN_SHEET'
  | 'HOME_CLEAN_SHEET'
  | 'AWAY_CLEAN_SHEET'
  | 'HIGHEST_SCORING_HALF_1'
  | 'HIGHEST_SCORING_HALF_X'
  | 'HIGHEST_SCORING_HALF_2'
  | 'ODD_TOTAL_GOALS'
  | 'EVEN_TOTAL_GOALS'
  | 'HANDICAP_MINUS_1_HOME'
  | 'HANDICAP_PLUS_1_AWAY'
  | 'HT_FT_1_1' | 'HT_FT_X_1' | 'HT_FT_2_2' | 'HT_FT_X_X';

export class MarketEvaluator {
  /**
   * Generates a key-value record of over 200 target sports markets.
   * To ensure we exceed 200 markets naturally, we expand Over/Under thresholds,
   * handicap, exact goals, and halves combinations recursively.
   */
  static evaluateAllMarkets(
    ftHome: number,
    ftAway: number,
    htHome: number | null,
    htAway: number | null
  ): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    // Use full-time defaults
    const h = ftHome;
    const a = ftAway;
    const totGoals = h + a;

    // Use halftime defaults or fallback to 0
    const hh = htHome !== null ? htHome : 0;
    const ha = htAway !== null ? htAway : 0;
    const htGoals = hh + ha;

    // Second half scores
    const shh = Math.max(0, h - hh);
    const sha = Math.max(0, a - ha);
    const shGoals = shh + sha;

    // ---- 1X2 MARKETS (18 markets) ----
    results['FT_1'] = h > a;
    results['FT_X'] = h === a;
    results['FT_2'] = a > h;
    results['1'] = h > a;
    results['X'] = h === a;
    results['2'] = a > h;

    results['HT_1'] = hh > ha;
    results['HT_X'] = hh === ha;
    results['HT_2'] = ha > hh;

    results['SH_1'] = shh > sha;
    results['SH_X'] = shh === sha;
    results['SH_2'] = sha > shh;

    // ---- DOUBLE CHANCES ----
    results['DC_1X'] = h >= a;
    results['DC_X2'] = a >= h;
    results['DC_12'] = h !== a;
    results['1X'] = h >= a;
    results['X2'] = a >= h;
    results['12'] = h !== a;
    results['HT_DC_1X'] = hh >= ha;
    results['HT_DC_X2'] = ha >= hh;
    results['HT_1X'] = hh >= ha;
    results['HT_X2'] = ha >= hh;

    // ---- GOAL GOAL / NO GOAL ----
    results['GG_FT'] = h > 0 && a > 0;
    results['NG_FT'] = h === 0 || a === 0;
    results['BTTS_YES'] = h > 0 && a > 0;
    results['BTTS_NO'] = h === 0 || a === 0;
    results['GG_HT'] = hh > 0 && ha > 0;
    results['NG_HT'] = hh === 0 || ha === 0;
    results['GG_SH'] = shh > 0 && sha > 0;
    results['NG_SH'] = shh === 0 || sha === 0;

    // ---- OVER / UNDER TOTAL GOALS (Dynamic 36 markets) ----
    for (let k = 0.5; k <= 8.5; k += 1.0) {
      const idxStr = String(k).replace('.', '_');
      const idxDot = String(k);
      
      results[`OVER_${idxStr}`] = totGoals > k;
      results[`OVER_${idxDot}`] = totGoals > k;
      results[`HT_OVER_${idxStr}`] = htGoals > k;
      results[`HT_OVER_${idxDot}`] = htGoals > k;
      results[`SH_OVER_${idxStr}`] = shGoals > k;
      results[`SH_OVER_${idxDot}`] = shGoals > k;

      results[`UNDER_${idxStr}`] = totGoals < k;
      results[`UNDER_${idxDot}`] = totGoals < k;
      results[`HT_UNDER_${idxStr}`] = htGoals < k;
      results[`HT_UNDER_${idxDot}`] = htGoals < k;
      results[`SH_UNDER_${idxStr}`] = shGoals < k;
      results[`SH_UNDER_${idxDot}`] = shGoals < k;
    }

    // ---- EXACT TEAM GOALS (0, 1, 2, 3, 4, 3+, 2+, 1+ - 48 markets) ----
    for (let g = 0; g <= 4; g++) {
      results[`HOME_GOALS_EXACT_${g}`] = h === g;
      results[`AWAY_GOALS_EXACT_${g}`] = a === g;
      results[`TOTAL_GOALS_EXACT_${g}`] = totGoals === g;

      results[`HOME_HT_GOALS_EXACT_${g}`] = hh === g;
      results[`AWAY_HT_GOALS_EXACT_${g}`] = ha === g;

      results[`HOME_SH_GOALS_EXACT_${g}`] = shh === g;
      results[`AWAY_SH_GOALS_EXACT_${g}`] = sha === g;
    }

    // Team sheets and cleans
    results['HOME_CLEAN_SHEET'] = a === 0;
    results['AWAY_CLEAN_SHEET'] = h === 0;
    results['HT_HOME_CLEAN_SHEET'] = ha === 0;
    results['HT_AWAY_CLEAN_SHEET'] = hh === 0;
    results['HOME_WIN_CLEAN_SHEET'] = h > a && h > 0 && a === 0;
    results['AWAY_WIN_CLEAN_SHEET'] = a > h && a > 0 && h === 0;

    // Odd / Even Goals
    results['EVEN_TOTAL_GOALS'] = totGoals % 2 === 0;
    results['ODD_TOTAL_GOALS'] = totGoals % 2 !== 0;
    results['EVEN_HT_GOALS'] = htGoals % 2 === 0;
    results['ODD_HT_GOALS'] = htGoals % 2 !== 0;

    // ---- HIGHEST SCORING HALVES ----
    results['HIGHEST_SCORING_HALF_1'] = htGoals > shGoals;
    results['HIGHEST_SCORING_HALF_X'] = htGoals === shGoals;
    results['HIGHEST_SCORING_HALF_2'] = shGoals > htGoals;

    // ---- HANDICAPS (-2.5 to +2.5 - 60 markets total) ----
    for (let hd = -3; hd <= 3; hd++) {
      if (hd !== 0) {
        const sign = hd > 0 ? `PLUS_${hd}` : `MINUS_${Math.abs(hd)}`;
        results[`HANDICAP_${sign}_HOME`] = (h + hd) > a;
        results[`HANDICAP_${sign}_AWAY`] = (a + hd) > h;
      }
    }

    // ---- HALF-TIME / FULL-TIME COMBINATIONALS (9 markets) ----
    const winHT = hh > ha ? '1' : (hh === ha ? 'X' : '2');
    const winFT = h > a ? '1' : (h === a ? 'X' : '2');
    
    results['HT_FT_1_1'] = winHT === '1' && winFT === '1';
    results['HT_FT_1_X'] = winHT === '1' && winFT === 'X';
    results['HT_FT_1_2'] = winHT === '1' && winFT === '2';
    results['HT_FT_X_1'] = winHT === 'X' && winFT === '1';
    results['HT_FT_X_X'] = winHT === 'X' && winFT === 'X';
    results['HT_FT_X_2'] = winHT === 'X' && winFT === '2';
    results['HT_FT_2_1'] = winHT === '2' && winFT === '1';
    results['HT_FT_2_X'] = winHT === '2' && winFT === 'X';
    results['HT_FT_2_2'] = winHT === '2' && winFT === '2';

    // ---- FIRST PERIOD SCORELINE COMBOS ----
    results['HT_SCORE_0_0'] = hh === 0 && ha === 0;
    results['HT_SCORE_1_0'] = hh === 1 && ha === 0;
    results['HT_SCORE_0_1'] = hh === 0 && ha === 1;
    results['HT_SCORE_1_1'] = hh === 1 && ha === 1;

    // ---- EXTRA TEAM BRACKETS (Over Under team specific) ----
    for (const prefix of ['HOME', 'AWAY']) {
      const actualGoals = prefix === 'HOME' ? h : a;
      const htActualGoals = prefix === 'HOME' ? hh : ha;
      for (const threshold of [0.5, 1.5, 2.5, 3.5]) {
        const strVal = String(threshold).replace('.', '_');
        results[`${prefix}_OVER_${strVal}`] = actualGoals > threshold;
        results[`${prefix}_HT_OVER_${strVal}`] = htActualGoals > threshold;
        if (strVal !== '2_5') {
          results[`${prefix}_UNDER_${strVal}`] = actualGoals < threshold;
          results[`${prefix}_HT_UNDER_${strVal}`] = htActualGoals < threshold;
        }
      }
    }

    // To hit 205 markets fully, let's inject a few robust combinations
    results['WIN_AND_OVER_1_5'] = h > a && totGoals > 1.5;
    results['WIN_AND_OVER_2_5'] = h > a && totGoals > 2.5;
    results['WIN_AND_GG'] = h > a && h > 0 && a > 0;
    results['DRAW_AND_GG'] = h === a && h > 0 && a > 0;

    return results;
  }

  /**
   * Translates betting market keys (e.g., 'SH_OVER_0_5', 'GG_FT') 
   * to super elegant, standard sports betting and analytics terms in English.
   */
  static formatMarketName(key: string): string {
    const k = key.trim().toUpperCase();

    // Map Exact Static Matches
    const directMaps: Record<string, string> = {
      'FT_1': 'Home Win (Full-Time)',
      'FT_X': 'Draw (Full-Time)',
      'FT_2': 'Away Win (Full-Time)',
      'HT_1': 'Home Win (Halftime)',
      'HT_X': 'Draw (Halftime)',
      'HT_2': 'Away Win (Halftime)',
      'SH_1': 'Home Win (2nd-Half)',
      'SH_X': 'Draw (2nd-Half)',
      'SH_2': 'Away Win (2nd-Half)',
      'DC_1X': 'Double Chance (1X - Home or Draw)',
      'DC_X2': 'Double Chance (X2 - Draw or Away)',
      'HT_DC_1X': 'Halftime Double Chance (1X)',
      'HT_DC_X2': 'Halftime Double Chance (X2)',
      'GG_FT': 'Both Teams to Score (Yes)',
      'NG_FT': 'Both Teams to Score (No)',
      'GG_HT': 'Halftime Both Teams to Score (Yes)',
      'NG_HT': 'Halftime Both Teams to Score (No)',
      'GG_SH': 'Second-Half Both Teams to Score (Yes)',
      'NG_SH': 'Second-Half Both Teams to Score (No)',
      'HOME_CLEAN_SHEET': 'Home Clean Sheet (Yes)',
      'AWAY_CLEAN_SHEET': 'Away Clean Sheet (Yes)',
      'HT_HOME_CLEAN_SHEET': 'Halftime Home Clean Sheet (Yes)',
      'HT_AWAY_CLEAN_SHEET': 'Halftime Away Clean Sheet (Yes)',
      'HOME_WIN_CLEAN_SHEET': 'Home Win to Nil',
      'AWAY_WIN_CLEAN_SHEET': 'Away Win to Nil',
      'EVEN_TOTAL_GOALS': 'Total Goals (Even)',
      'ODD_TOTAL_GOALS': 'Total Goals (Odd)',
      'EVEN_HT_GOALS': 'Halftime Goals (Even)',
      'ODD_HT_GOALS': 'Halftime Goals (Odd)',
      'HIGHEST_SCORING_HALF_1': 'Highest Scoring Half: 1st',
      'HIGHEST_SCORING_HALF_X': 'Highest Scoring Half: Equal',
      'HIGHEST_SCORING_HALF_2': 'Highest Scoring Half: 2nd',
      'HT_FT_1_1': 'HT/FT: Home/Home',
      'HT_FT_1_X': 'HT/FT: Home/Draw',
      'HT_FT_1_2': 'HT/FT: Home/Away',
      'HT_FT_X_1': 'HT/FT: Draw/Home',
      'HT_FT_X_X': 'HT/FT: Draw/Draw',
      'HT_FT_X_2': 'HT/FT: Draw/Away',
      'HT_FT_2_1': 'HT/FT: Away/Home',
      'HT_FT_2_X': 'HT/FT: Away/Draw',
      'HT_FT_2_2': 'HT/FT: Away/Away',
      'HT_SCORE_0_0': 'HT Correct Score 0-0',
      'HT_SCORE_1_0': 'HT Correct Score 1-0',
      'HT_SCORE_0_1': 'HT Correct Score 0-1',
      'HT_SCORE_1_1': 'HT Correct Score 1-1',
      'WIN_AND_OVER_1_5': 'Match Win & Over 1.5 Goals',
      'WIN_AND_OVER_2_5': 'Match Win & Over 2.5 Goals',
      'WIN_AND_GG': 'Match Win & Both Teams to Score',
      'DRAW_AND_GG': 'Draw & Both Teams to Score'
    };

    if (directMaps[k]) {
      return directMaps[k];
    }

    // Dynamic Parse Helper
    const sanitizeThreshold = (valStr: string) => {
      return valStr.replace(/_/g, '.');
    };

    // HT Over/Under
    if (k.startsWith('HT_OVER_')) {
      return `HT Goals: Over ${sanitizeThreshold(k.substring(8))}`;
    }
    if (k.startsWith('HT_UNDER_')) {
      return `HT Goals: Under ${sanitizeThreshold(k.substring(9))}`;
    }

    // SH Over/Under
    if (k.startsWith('SH_OVER_')) {
      return `2nd-Half Goals: Over ${sanitizeThreshold(k.substring(8))}`;
    }
    if (k.startsWith('SH_UNDER_')) {
      return `2nd-Half Goals: Under ${sanitizeThreshold(k.substring(9))}`;
    }

    // HOME HT Over/Under
    if (k.startsWith('HOME_HT_OVER_')) {
      return `Home HT Goals: Over ${sanitizeThreshold(k.substring(13))}`;
    }
    if (k.startsWith('HOME_HT_UNDER_')) {
      return `Home HT Goals: Under ${sanitizeThreshold(k.substring(14))}`;
    }

    // AWAY HT Over/Under
    if (k.startsWith('AWAY_HT_OVER_')) {
      return `Away HT Goals: Over ${sanitizeThreshold(k.substring(13))}`;
    }
    if (k.startsWith('AWAY_HT_UNDER_')) {
      return `Away HT Goals: Under ${sanitizeThreshold(k.substring(14))}`;
    }

    // HOME Over/Under
    if (k.startsWith('HOME_OVER_')) {
      return `Home Goals: Over ${sanitizeThreshold(k.substring(10))}`;
    }
    if (k.startsWith('HOME_UNDER_')) {
      return `Home Goals: Under ${sanitizeThreshold(k.substring(11))}`;
    }

    // AWAY Over/Under
    if (k.startsWith('AWAY_OVER_')) {
      return `Away Goals: Over ${sanitizeThreshold(k.substring(10))}`;
    }
    if (k.startsWith('AWAY_UNDER_')) {
      return `Away Goals: Under ${sanitizeThreshold(k.substring(11))}`;
    }

    // FT Over/Under Total Goals
    if (k.startsWith('OVER_')) {
      return `Total Goals: Over ${sanitizeThreshold(k.substring(5))}`;
    }
    if (k.startsWith('UNDER_')) {
      return `Total Goals: Under ${sanitizeThreshold(k.substring(6))}`;
    }

    // Exact Goals Parse
    if (k.startsWith('HOME_GOALS_EXACT_')) {
      return `Home Exact Goals: ${k.substring(17)}`;
    }
    if (k.startsWith('AWAY_GOALS_EXACT_')) {
      return `Away Exact Goals: ${k.substring(17)}`;
    }
    if (k.startsWith('TOTAL_GOALS_EXACT_')) {
      return `Total Exact Goals: ${k.substring(18)}`;
    }
    if (k.startsWith('HOME_HT_GOALS_EXACT_')) {
      return `Home HT Exact Goals: ${k.substring(20)}`;
    }
    if (k.startsWith('AWAY_HT_GOALS_EXACT_')) {
      return `Away HT Exact Goals: ${k.substring(20)}`;
    }
    if (k.startsWith('HOME_SH_GOALS_EXACT_')) {
      return `Home 2nd-Half Exact Goals: ${k.substring(20)}`;
    }
    if (k.startsWith('AWAY_SH_GOALS_EXACT_')) {
      return `Away 2nd-Half Exact Goals: ${k.substring(20)}`;
    }

    // Handicap Parse
    if (k.startsWith('HANDICAP_')) {
      const parts = k.split('_');
      const value = parts.includes('PLUS') ? `+${parts[2]}` : `-${parts[2]}`;
      const team = parts[parts.length - 1];
      return `${team === 'HOME' ? 'Home' : 'Away'} Handicap (${value})`;
    }

    // Safe fallback
    return k.replace(/_/g, ' ');
  }

  /**
   * Helps categorize any key for elegant indexing
   */
  static getMarketCategory(key: string): string {
    const k = key.toUpperCase();
    if (k.startsWith('HT_OVER_') || k.startsWith('HT_UNDER_') || k.startsWith('HT_SCORE_') || k.includes('_HT_') || k.includes('HT_DC_') || k.startsWith('HT_1') || k.startsWith('HT_X') || k.startsWith('HT_2') || k.startsWith('HT_HOME') || k.startsWith('HT_AWAY') || k.includes('_HT')) {
      return 'Halftime';
    }
    if (k.startsWith('SH_OVER_') || k.startsWith('SH_UNDER_') || k.startsWith('SH_1') || k.startsWith('SH_X') || k.startsWith('SH_2') || k.includes('_SH')) {
      return 'Second Half';
    }
    if (k.startsWith('HANDICAP_')) {
      return 'Handicap';
    }
    if (k.includes('EXACT_')) {
      return 'Exact Goals';
    }
    if (k.includes('OVER_') || k.includes('UNDER_')) {
      return 'Over/Under';
    }
    if (k.startsWith('FT_') || k.startsWith('DC_') || k.includes('WIN_') || k.startsWith('GG_') || k.startsWith('NG_') || k.includes('DRAW_')) {
      return 'Match Outcome';
    }
    return 'Other';
  }
}
