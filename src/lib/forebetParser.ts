import { Match } from '../types';
import { CipherEngine, AdvancedxGEngine, IcharaV2Engine, isBannedLeagueOrMatch, LEAGUE_MAP } from './matchEngine';

export function resolveLeagueName(code: string): string {
  if (LEAGUE_MAP[code]) return LEAGUE_MAP[code];
  
  // Dynamic parsing of typical Forebet league codes (e.g. Lv1, FiWC, UzC)
  const prefix = code.substring(0, 2);
  let country = "";
  switch (prefix) {
    case 'Es': country = 'Spain'; break;
    case 'Ar': country = 'Argentina'; break;
    case 'Co': country = 'Colombia'; break;
    case 'Mx': country = 'Mexico'; break;
    case 'Us': country = 'USA'; break;
    case 'Br': country = 'Brazil'; break;
    case 'Aw': country = 'Aruba'; break;
    case 'Bo': country = 'Bolivia'; break;
    case 'Ve': country = 'Venezuela'; break;
    case 'Jm': country = 'Jamaica'; break;
    case 'Ru': country = 'Russia'; break;
    case 'At': country = 'Austria'; break;
    case 'By': country = 'Belarus'; break;
    case 'Be': country = 'Belgium'; break;
    case 'Bg': country = 'Bulgaria'; break;
    case 'Dk': country = 'Denmark'; break;
    case 'Ee': country = 'Estonia'; break;
    case 'Fo': country = 'Faroe Islands'; break;
    case 'Gr': country = 'Greece'; break;
    case 'Is': country = 'Iceland'; break;
    case 'Ie': country = 'Ireland'; break;
    case 'No': country = 'Norway'; break;
    case 'Si': country = 'Slovenia'; break;
    case 'Se': country = 'Sweden'; break;
    case 'Ch': country = 'Switzerland'; break;
    case 'Py': country = 'Paraguay'; break;
    case 'Ec': country = 'Ecuador'; break;
    case 'Cl': country = 'Chile'; break;
    case 'Cw': country = 'Curaçao'; break;
    case 'Ua': country = 'Ukraine'; break;
    case 'Kz': country = 'Kazakhstan'; break;
    case 'Tz': country = 'Tanzania'; break;
    case 'Am': country = 'Armenia'; break;
    case 'Uz': country = 'Uzbekistan'; break;
    case 'Rw': country = 'Rwanda'; break;
    case 'Kg': country = 'Kyrgyzstan'; break;
    case 'Lv': country = 'Latvia'; break;
    case 'Fi': country = 'Finland'; break;
    case 'Ba': country = 'Bosnia'; break;
    case 'Hr': country = 'Croatia'; break;
    case 'Sl': country = 'Sierra Leone'; break;
    case 'Il': country = 'Israel'; break;
    case 'Fr': country = 'France'; break;
    case 'De': country = 'Germany'; break;
    case 'It': country = 'Italy'; break;
    case 'En': country = 'England'; break;
    default: {
      // If code starts with single letter + digit (like E17)
      if (code.startsWith('E') && /^\d/.test(code.substring(1))) {
        return `Europe Under-${code.substring(1)}`;
      }
      country = code.substring(0, 2).toUpperCase();
    }
  }

  // Check suffix
  const suffix = code.substring(2);
  let type = "";
  if (suffix === 'C' || suffix === 'Cs' || code.endsWith('C')) {
    type = " Cup";
  } else if (suffix === 'W' || suffix === 'Ws' || code.endsWith('W')) {
    type = " Women League";
  } else if (suffix === 'WC' || code.endsWith('WC')) {
    type = " Women Cup";
  } else if (suffix === 'R' || suffix === 'Res' || code.endsWith('R')) {
    type = " Reserves Division";
  } else if (suffix === '1') {
    type = " Division 1";
  } else if (suffix === '2') {
    type = " Division 2";
  } else if (suffix === '3') {
    type = " Division 3";
  } else if (suffix === '4') {
    type = " Division 4";
  } else if (suffix) {
    type = ` Division ${suffix}`;
  }

  return `${country}${type}`.trim();
}

export class ForebetParser {
  /**
   * Parses the prediction and odds component including merged score-odds (e.g. "0-24.33" or "1-13.30")
   * Highly optimized to handle compressed pasting formats like "353926X0 - 02.2519°3.10" or "1787520 - 33.1726°-"
   */
  static parseForecast(line: string) {
    const trimmed = line.trim();

    // First detect prediction character (1, X or 2)
    const predictorMatch = trimmed.match(/^(\d+)([1X2])(.*)$/i);
    if (!predictorMatch) {
      // Fallback to simpler decimal parsing if no match
      const fallbackMatch = trimmed.match(/^(\d{2})(\d{2})(\d{2})([1X2])\s*([0-9xX\-\.\s]*)/i);
      if (!fallbackMatch) return null;
      const p1 = parseInt(fallbackMatch[1], 10);
      const px = parseInt(fallbackMatch[2], 10);
      const p2 = parseInt(fallbackMatch[3], 10);
      const pred = fallbackMatch[4].toUpperCase();
      const rest = fallbackMatch[5].trim();
      let coef = 1.5;
      let scoreF = "1-1";
      const decimalMatch = rest.match(/(\d+\.\d+)/);
      if (decimalMatch) {
        coef = parseFloat(decimalMatch[1]);
        const scoreClean = rest.substring(0, rest.indexOf(decimalMatch[1])).match(/(\d+)\s*-\s*(\d+)/);
        if (scoreClean) scoreF = `${scoreClean[1]}-${scoreClean[2]}`;
      }
      return { p1, px, p2, pred, coef, scoreF, avgTotalGoals: undefined, weatherCondition: undefined };
    }

    const probDigits = predictorMatch[1];
    const pred = predictorMatch[2].toUpperCase();
    const rest = predictorMatch[3].trim();

    // Dynamically split probDigits into p1, px, p2
    let p1 = 33, px = 33, p2 = 34;
    let foundSplit = false;

    // Try all length combinations. Since probabilities sum to ~100%, we find the slice that adds to ~100
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 2; j++) {
        const k = probDigits.length - i - j;
        if (k >= 1 && k <= 2) {
          const a = parseInt(probDigits.substring(0, i), 10);
          const b = parseInt(probDigits.substring(i, i + j), 10);
          const c = parseInt(probDigits.substring(i + j), 10);
          if (a + b + c >= 90 && a + b + c <= 105) {
            p1 = a;
            px = b;
            p2 = c;
            foundSplit = true;
            break;
          }
        }
      }
      if (foundSplit) break;
    }

    if (!foundSplit) {
      // Fallbacks for standard length sequences
      if (probDigits.length === 6) {
        p1 = parseInt(probDigits.substring(0, 2), 10);
        px = parseInt(probDigits.substring(2, 4), 10);
        p2 = parseInt(probDigits.substring(4, 6), 10);
      } else if (probDigits.length === 5) {
        p1 = parseInt(probDigits.substring(0, 2), 10);
        px = parseInt(probDigits.substring(2, 3), 10);
        p2 = parseInt(probDigits.substring(3, 5), 10);
      }
    }

    // Normalize probabilities to sum exactly to 100%
    const pSum = p1 + px + p2;
    if (pSum > 0 && pSum !== 100) {
      const scale = 100 / pSum;
      p1 = Math.round(p1 * scale);
      px = Math.round(px * scale);
      p2 = 100 - (p1 + px);
    }

    let coef = 1.5;
    let scoreF = "1-1";
    let avgTotalGoals: number | undefined = undefined;
    let weatherCondition: string | undefined = undefined;

    // Try to parse out the Correct Score and expected goals
    // Format usually H - A (representing predicted correct score) followed by Expected Goals (e.g., "0 - 02.25")
    const scoreAndXgMatch = rest.match(/^(\d+)\s*-\s*(\d)(\d+\.\d+)(.*)$/);
    if (scoreAndXgMatch) {
      const hScore = scoreAndXgMatch[1];
      const aScore = scoreAndXgMatch[2];
      scoreF = `${hScore}-${aScore}`;
      avgTotalGoals = parseFloat(scoreAndXgMatch[3]);

      const trailing = scoreAndXgMatch[4].trim();
      const tempMatch = trailing.match(/^(\d+)°/);
      if (tempMatch) {
        weatherCondition = `${tempMatch[1]}°C`;
        const coefPart = trailing.substring(tempMatch[0].length).trim();
        const coefMatch = coefPart.match(/(\d+\.\d+)/);
        if (coefMatch) {
          coef = parseFloat(coefMatch[1]);
        }
      } else {
        const coefMatch = trailing.match(/(\d+\.\d+)/);
        if (coefMatch) {
          coef = parseFloat(coefMatch[1]);
        }
      }
    } else {
      // Traditional splits
      const mergeMatch = rest.match(/^(\d+)\s*-\s*(\d)(\d+\.\d+)/);
      if (mergeMatch) {
        const hScore = mergeMatch[1];
        const aScore = mergeMatch[2];
        coef = parseFloat(mergeMatch[3]);
        scoreF = `${hScore}-${aScore}`;
      } else {
        const decimalMatch = rest.match(/(\d+\.\d+)/);
        if (decimalMatch) {
          coef = parseFloat(decimalMatch[1]);
          const scoreClean = rest.substring(0, rest.indexOf(decimalMatch[1])).match(/(\d+)\s*-\s*(\d+)/);
          if (scoreClean) {
            scoreF = `${scoreClean[1]}-${scoreClean[2]}`;
          }
        } else {
          const scoreClean = rest.match(/(\d+)\s*-\s*(\d+)/);
          if (scoreClean) {
            scoreF = `${scoreClean[1]}-${scoreClean[2]}`;
          }
        }
      }
    }

    return { p1, px, p2, pred, coef, scoreF, avgTotalGoals, weatherCondition };
  }

  /**
   * Safe regular expression parser extracting all stats tables copied from Forebet html grids.
   * Utilizes a highly stable Kickoff-Centered scanning logic.
   */
  static parseClipboard(text: string): Match[] {
    const list: Match[] = [];
    if (!text || !text.trim()) return list;

    // Normalizes carriage lines and filters empty lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let lastSeenLeague = 'International';
    let lastSeenLeagueCode = 'Int';

    const dateWithTimeRegex = /^\d{2}[\/\.]\d{2}[\/\.]\d{4}\s+\d{1,2}:\d{2}$/;
    
    // Scan all lines
    for (let k = 0; k < lines.length; k++) {
      const line = lines[k];

      // Update basic league header context if found
      if (
        line.includes('Spain La Liga') || 
        line.includes('Spain Segunda') ||
        line.includes('Argentina Liga Professional') ||
        line.includes('Argentina Liga Profesional') ||
        line.includes('Colombia Primera A') ||
        line.includes('Mexico Liga MX') ||
        line.includes('USA Major League Soccer') ||
        line.includes('England Premier League') ||
        line.includes('Italy Serie A') ||
        line.includes('Germany Bundesliga') ||
        line.includes('France Ligue 1')
      ) {
        lastSeenLeague = line;
        if (line.includes('La Liga')) lastSeenLeagueCode = 'Es1';
        else if (line.includes('Argentina')) lastSeenLeagueCode = 'Ar1';
        else if (line.includes('Colombia')) lastSeenLeagueCode = 'Co1';
        else if (line.includes('Mexico')) lastSeenLeagueCode = 'Mx1';
        else if (line.includes('USA Major')) lastSeenLeagueCode = 'Us1';
        else if (line.includes('Premier League')) lastSeenLeagueCode = 'EPL';
        else if (line.includes('Italy Serie A')) lastSeenLeagueCode = 'It1';
        else if (line.includes('Bundesliga')) lastSeenLeagueCode = 'De1';
        else if (line.includes('Ligue 1')) lastSeenLeagueCode = 'Fr1';
        continue;
      }

      // Check if this line is a Kickoff Date and Time
      if (dateWithTimeRegex.test(line)) {
        // Detect postponed matches and skip/ignore them automatically
        let isPostponed = false;
        const startScan = Math.max(0, k - 6);
        const endScan = Math.min(lines.length, k + 12);
        for (let idx = startScan; idx < endScan; idx++) {
          const lowerLine = lines[idx].toLowerCase();
          if (
            lowerLine.includes('postponed') ||
            lowerLine.includes('postp') ||
            lowerLine.includes('postpone') ||
            lowerLine.includes('مؤجل') ||
            lowerLine.includes('مؤجلة')
          ) {
            isPostponed = true;
            break;
          }
        }
        if (isPostponed) {
          continue; // Skip parsing and block this postponed match from entering the system
        }

        // Kickoff is at line `k`
        // Trace back up to 8 lines above kickoff to gather candidate team names
        let home = '';
        let away = '';
        const foundLines: string[] = [];
        
        for (let j = k - 1; j >= Math.max(0, k - 8); j--) {
          const checkLine = lines[j].trim();
          if (!checkLine) continue;
          
          // Identify if this checkLine represents noise to ignore as a team name:
          const isDateOrTime = dateWithTimeRegex.test(checkLine) || /^\d{2}[\/\.]\d{2}[\/\.]?\d{0,4}$/.test(checkLine);
          const isProbabilities = /^\d{5,6}[1X2]/i.test(checkLine) || /^\d{2}\s+\d{2}\s+\d{2}/.test(checkLine);
          const isScore = /^\s*(?:FT|HT|AET|PEN|Pen\.)?\s*\d{1,2}\s*-\s*\d{1,2}/i.test(checkLine) || /^\s*\(\s*\d{1,2}\s*-\s*\d{1,2}\s*\)/.test(checkLine);
          const isReserved = ['FT', 'HT', 'PRE', 'VIEW', 'AET', 'PEN', 'VS', 'PREDICTIONS', 'PREDICTION', '1X2'].includes(checkLine.toUpperCase());
          const isLeagueCode = checkLine.length >= 2 && checkLine.length <= 5 &&
            /^[A-Za-z][a-zA-Z0-9]{1,4}$/.test(checkLine) &&
            !['FT', 'HT', 'PRE', 'VIEW', 'AET', 'PEN', 'VS', 'LIVE', 'SCORE', 'TIME', 'DATE', '1X2'].includes(checkLine.toUpperCase());
          
          if (!isDateOrTime && !isProbabilities && !isScore && !isReserved && !isLeagueCode) {
            foundLines.push(checkLine);
          }
          
          if (foundLines.length >= 2) break;
        }

        if (foundLines.length >= 2) {
          // Backward scan means foundLines[0] is Away (closer to kickoff) and foundLines[1] is Home
          away = foundLines[0];
          home = foundLines[1];
        } else {
          // Safe fallback
          if (k - 2 >= 0) {
            home = lines[k - 2];
            away = lines[k - 1];
          } else {
            continue;
          }
        }

        // Clean up common regional decorations and spacing artifacts
        const cleanTeamName = (name: string): string => {
          return name
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\b(SP|RJ|PR|BA|RS|DF|MG|SC|PE|CE|RN)\b/g, '') // Brazilian state codes
            .replace(/\b(FC|CF|AC|FK|F\.C\.|C\.F\.)\b/i, '')       // standard football tags
            .replace(/\s+/g, ' ')
            .trim();
        };

        const cleanedHome = cleanTeamName(home) || home;
        const cleanedAway = cleanTeamName(away) || away;
        const kickoff = line.trim();

        // Skip parsing if home or away are recognized date headers or numbers (flicker artifacts)
        if (/^\d{2}[\/\.]\d{2}[\/\.]\d{4}$/.test(cleanedHome) || /^\d{2}[\/\.]\d{2}[\/\.]\d{4}$/.test(cleanedAway)) continue;

        let currentLeagueCode = lastSeenLeagueCode;
        let currentLeague = lastSeenLeague;

        // Check if there is a league code indicator line at `k - 3`
        if (k - 3 >= 0) {
          const potentialCode = lines[k - 3];
          const codeVal = potentialCode.trim();
          if (
            codeVal.length >= 2 && 
            codeVal.length <= 5 && 
            /^[A-Za-z][a-zA-Z0-9]{1,4}$/.test(codeVal) &&
            !['FT', 'HT', 'PRE', 'VIEW', 'AET', 'PEN', 'VS', 'LIVE', 'SCORE', 'TIME', 'DATE', '1X2'].includes(codeVal.toUpperCase())
          ) {
            currentLeagueCode = codeVal;
            currentLeague = resolveLeagueName(codeVal);
          }
        }

        // BANNED LEAGUE & COMPETITION SHIELD:
        // Automatically check and discard lower-tier leagues (4/5/6), Austrian competitions,
        // youth competitions (U15-U23), and German lower tiers (Bundesliga 4/5).
        if (isBannedLeagueOrMatch(currentLeagueCode, currentLeague, cleanedHome, cleanedAway)) {
          continue; // Permanently discard from entering the system
        }

        // Probability line is usually at `k + 1`
        if (k + 1 >= lines.length) continue;
        const forecastLine = lines[k + 1];
        const parsedForecast = ForebetParser.parseForecast(forecastLine);
        if (!parsedForecast) continue;

        const { p1, px, p2, pred, coef, avgTotalGoals: fcAvg, weatherCondition: fcWeather } = parsedForecast;

        const normalP1 = p1;
        const normalPX = px;
        const normalP2 = p2;

        // Compute advanced safe cohesive cipher keys for both Signal Systems
        const cipher = CipherEngine.computeCipherKey(normalP1, normalPX, normalP2, coef);
        const code = CipherEngine.getSignalCode(cipher);

        const icharaKey = IcharaV2Engine.computeIcharaKey(normalP1, normalPX, normalP2, coef);
        const icharaCode = IcharaV2Engine.getIcharaCode(icharaKey);

        // Scan subsequent lines for HT and FT scores + granular optional metadata
        let ftHome: number | null = null;
        let ftAway: number | null = null;
        let htHome: number | null = null;
        let htAway: number | null = null;
        let status: 'UPCOMING' | 'FINISHED' = 'UPCOMING';

        let avgTotalGoals = fcAvg;
        let weatherCondition = fcWeather;
        let leagueRound: string | undefined = undefined;

        for (let s = k + 2; s < Math.min(lines.length, k + 12); s++) {
          const scanLine = lines[s].trim();

          // Break early if we hit another kickoff or probability line to avoid overlapping
          if (dateWithTimeRegex.test(scanLine)) break;
          if (/^\d{4,6}[1X2]/i.test(scanLine)) break;

          // Extract Average Goals if not already parsed
          const avgGoalsMatch = scanLine.match(/(?:Average goals|Avg\.? goals|Avg\s+goals|Expected goals|Expected_Goals|Avg:)\s*:?\s*(\d+(?:\.\d+)?)/i);
          if (avgGoalsMatch) {
            avgTotalGoals = parseFloat(avgGoalsMatch[1]);
          }

          // Extract Weather if not already parsed
          const weatherMatch = scanLine.match(/(?:Weather|Temp|Temperature|Forecast|Conditions|Weather forecast:?)\s*:?\s*([A-Za-z0-9°C°F\s,\.\/\-]+)/i);
          if (weatherMatch) {
            weatherCondition = weatherMatch[1].trim();
          }

          // Extract Round/Matchday
          const roundMatch = scanLine.match(/(?:Round|Matchday|Week|Group|Phase)\s*:?\s*([0-9A-Za-z\s\-]+)/i);
          if (roundMatch) {
            leagueRound = roundMatch[1].trim();
          }

          // Skip score parse checks if line contains decimals (odds) unless it is a score line with trailing stuff
          if ((scanLine.includes('.') && !scanLine.includes('-') && !/^\s*\d\s*-\s*\d/i.test(scanLine)) || /^\s*\d{5,}/.test(scanLine) || scanLine.length > 25) {
            continue;
          }

          // Highly lenient score line regex: matches FT scores followed by optional HT scores and optional trailing characters (like views, hyphens, etc.)
          const scoreMatch = scanLine.match(/^\s*(?:FT|HT|AET|PEN|Pen\.)?\s*(\d{1,2})\s*-\s*(\d{1,2})(?:\s*\(\s*(\d{1,2})\s*-\s*(\d{1,2})\s*\))?[\-\s\d]*$/i);
          if (scoreMatch) {
            ftHome = parseInt(scoreMatch[1], 10);
            ftAway = parseInt(scoreMatch[2], 10);
            if (scoreMatch[3] !== undefined && scoreMatch[4] !== undefined) {
              htHome = parseInt(scoreMatch[3], 10);
              htAway = parseInt(scoreMatch[4], 10);
            }
            status = 'FINISHED';
          }
        }

        const cleanHomeId = cleanedHome.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanAwayId = cleanedAway.toLowerCase().replace(/[^a-z0-9]/g, '');
        const datePart = kickoff.split(' ')[0] || '';
        const cleanDateId = datePart.replace(/[\/\.\s:]/g, '-');
        const matchId = `${cleanHomeId}_${cleanAwayId}_${cleanDateId}`;
        
        const xgAndExpected = AdvancedxGEngine.computeLocalXG(normalP1, normalPX, normalP2, coef, htHome !== null ? `${htHome}-${htAway}` : null);

        list.push({
          match_id: matchId,
          league_code: currentLeagueCode,
          league_name: currentLeague,
          home: cleanedHome,
          away: cleanedAway,
          kickoff,
          p1: normalP1,
          px: normalPX,
          p2: normalP2,
          pred,
          coef,
          status,
          ft_home: ftHome,
          ft_away: ftAway,
          ht_home: htHome,
          ht_away: htAway,
          cipher_key: cipher,
          signal_code: code,
          signal_code_v2: icharaCode,
          xg_home: xgAndExpected.xgHome,
          xg_away: xgAndExpected.xgAway,
          expected_score: xgAndExpected.expectedScore,
          confidence_tier: xgAndExpected.confidence,
          risk_flag: xgAndExpected.riskFlag,
          avg_total_goals: avgTotalGoals,
          weather_condition: weatherCondition,
          league_round: leagueRound
        });
      }
    }

    return list;
  }
}
export default ForebetParser;
