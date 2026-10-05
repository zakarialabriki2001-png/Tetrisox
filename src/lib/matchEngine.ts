/**
 * Oracle Math AI - Deterministic Mathematical Algorithms
 */

export const LEAGUE_MAP: Record<string, string> = {
  Es1: "Spain La Liga",
  Ar1: "Argentina Liga Profesional",
  Co1: "Colombia Primera A",
  Mx1: "Mexico Liga MX",
  Us1: "USA Major League Soccer",
  Us4: "USA USL League Two",
  BrC: "Brazil Copa",
  BrP: "Brazil Campeonato Paulista",
  Aw1: "Aruba Division di Honor",
  Bo1: "Bolivia Division Profesional",
  Ve1: "Venezuela Primera Division",
  Jm: "Jamaica Premier League",
  L1: "England League One",
  PLC: "England Premier League Cup",
  De6: "Germany Junioren Bundesliga",
  DeW: "Germany DFB Pokal Women",
  Ru4: "Russia Division 2 - West",
  At2: "Austria 2. Liga",
  AtE: "Austria Regionalliga East",
  AtL: "Austria Landesliga",
  AtW: "Austria Regionalliga West",
  By1: "Belarus Vysshaya Liga",
  BeC: "Belgium Belgian Cup",
  Be4: "Belgium Second Amateur Division",
  Bg1: "Bulgaria Parva Liga",
  Dk2: "Denmark 1. Division",
  DkC: "Denmark DBUs Landspokal",
  Ee2: "Estonia Esiliiga",
  FoC: "Faroe Islands Cup",
  Fo2: "Faroe Islands 1. Deild",
  Gr3: "Greece Gamma Ethniki",
  IsC: "Icelandic Cup",
  Is3: "Iceland 2. Division",
  IeC: "Ireland FAI Cup",
  No3: "Norway 2. Division",
  SiW: "Slovenia SZNL Women",
  Se2: "Sweden Superettan",
  Se3: "Sweden Div 1 Norra",
  Se4: "Sweden Div 1 Sodra",
  SeC: "Sweden Svenska Cupen",
  Ch1: "Switzerland Super League",
  BrB: "Brazil Campeonato U20",
  BrW: "Brazil Campeonato Paulista Women",
  ArR: "Argentina Reserve League",
  Co2: "Colombia Primera B",
};

/**
 * Permanently bans low-tier leagues, Austrian competitions, youth matches, and German lower tiers:
 * 1. Bundesliga 4/5/6 and German lower tiers (De4, De5, De6, Regionalliga, Oberliga, Junioren Bundesliga, etc.)
 * 2. Austria Landesliga in all its forms & all Austrian competitions (country banned: At*, Austria, Landesliga, Österreich)
 * 3. Youth competitions under 18/17/16/15/19/20/21/23 (U19, U18, U17, U16, U15, PlY, etc., and team names containing youth tags)
 * 4. Lower tier leagues: tiers 4, 5, 6 (codes ending in 4, 5, 6, Division 4/5/6, Tier 4/5/6, Amateur, Second Amateur, Oberliga, etc.)
 */
export function isBannedLeagueOrMatch(
  leagueCode?: string,
  leagueName?: string,
  homeTeam?: string,
  awayTeam?: string
): boolean {
  const code = (leagueCode || '').trim();
  const codeUpper = code.toUpperCase();
  const name = (leagueName || '').trim().toLowerCase();
  const home = (homeTeam || '').trim().toLowerCase();
  const away = (awayTeam || '').trim().toLowerCase();

  // 1. AUSTRIA: Cancel this country completely ("austria landesliga بكافة اطيافه الغي هذا البلد من النظام")
  if (codeUpper.startsWith('AT') || codeUpper.startsWith('AUT')) return true;
  if (name.includes('austria') || name.includes('österreich') || name.includes('austrian')) return true;
  if (name.includes('landesliga')) return true;
  if (home.includes('austria') || away.includes('austria')) return true;

  // 2. YOUTH COMPETITIONS: Under 18/17/16/15/19/20/21/23
  if (
    codeUpper.endsWith('Y') ||
    codeUpper.includes('U19') ||
    codeUpper.includes('U18') ||
    codeUpper.includes('U17') ||
    codeUpper.includes('U16') ||
    codeUpper.includes('U15') ||
    codeUpper.includes('U20') ||
    codeUpper.includes('U21') ||
    codeUpper.includes('U23') ||
    codeUpper === 'PLY' ||
    codeUpper === 'BRB'
  ) {
    return true;
  }

  const youthRegex = /\b(u-?15|u-?16|u-?17|u-?18|u-?19|u-?20|u-?21|u-?23|under-?\s*(?:15|16|17|18|19|20|21|23)|sub-?\s*(?:15|16|17|18|19|20|21|23)|junioren|juniors|junior|youth|primavera|primavera\s*[1-4]|youth\s*league|torneo\s*juvenil|campeonato\s*u\d+)\b/i;
  if (youthRegex.test(name)) return true;
  if (name.includes('شباب') || name.includes('ناشئين') || name.includes('أشبال')) return true;

  // Check team names for youth designations (e.g., Viktoria Köln U19, Raków Częstochowa U19):
  const teamYouthRegex = /\b(u-?15|u-?16|u-?17|u-?18|u-?19|u-?20|u-?21|u-?23|juniors?|junioren|youth|primavera)\b/i;
  if (teamYouthRegex.test(home) || teamYouthRegex.test(away)) return true;

  // 3. LOWER TIER LEAGUES: Tiers 4, 5, 6
  // Check code suffix digit: e.g. Us4, Es4, Es5, De4, De5, De6, It4, Se4, Cz4, Pl4, Nl4, Ru4, Be4, Gr4, Ar4, Jp4, Th4, etc.
  if (/^[A-Za-z]{1,4}[4-9][A-Za-z]*$/i.test(code)) return true;

  // 4. BUNDESLIGA 4/5 & German lower tiers (De4, De5, De6, Regionalliga, Oberliga, Junioren)
  if (codeUpper.startsWith('DE') && /^[A-Z]{2}[4-9]/i.test(codeUpper)) return true;
  if (name.includes('bundesliga') && /(?:4|5|6|iv|v|vi|u19|u17|junioren)/i.test(name)) return true;
  if (name.includes('germany') && /(?:regionalliga|oberliga|landesliga|verbandsliga|bayernliga|hessenliga|westfalenliga)/i.test(name)) return true;

  // Check league name for lower tiers 4, 5, 6 and amateur divisions:
  const lowerTierNameRegex = /\b(?:division\s*[4-9]|tier\s*[4-9]|[4-9]th\s*division|[4-9]\.\s*(?:division|liga)|league\s*(?:two|4|5|6)|serie\s*d|tercera|segunda\s*rfef|tercera\s*rfef|second\s*amateur|third\s*amateur|amateur\s*division|oberliga|regionalliga|landesliga|verbandsliga)\b/i;
  if (lowerTierNameRegex.test(name)) return true;

  return false;
}

export class CipherEngine {
  /**
   * RESTRUCTURED 1000-SIGNAL BALANCED ENGINE (REBUILT FOR MAXIMUM RESOLUTION)
   * Uniform partition density without code collisions.
   * Uses 10 symmetrical match stance sectors, 10 granular confidence levels, 2 draw protection/tactical risk tiers,
   * and 5 bookmaker coefficient classes using dynamic implied-probability validation.
   * Maps every conceivable match profile to a discrete integer strictly in [1, 1000].
   */
  static computeCipherKey(
    p1: number,
    px: number,
    p2: number,
    coef: number,
  ): number {
    // Normalize probabilities so np1 + npx + np2 always equals exactly 100
    const sum = (p1 || 0) + (px || 0) + (p2 || 0) || 100;
    const np1 = Math.max(0, Math.min(100, Math.round(((p1 || 0) / sum) * 100)));
    const npx = Math.max(0, Math.min(100, Math.round(((px || 0) / sum) * 100)));
    const np2 = Math.max(0, Math.min(100, 100 - np1 - npx));

    // 1. Symmetrical Match Outlook Selector (10 levels: 0 to 9) - Slices the Margin (np1 - np2)
    const diff = np1 - np2;
    let sectorClass = 4; // Default to neutral leaning home

    if (diff >= 45) {
      sectorClass = 0; // Ultra Home Heavy (Banker)
    } else if (diff >= 30) {
      sectorClass = 1; // Heavy Home Advantage
    } else if (diff >= 18) {
      sectorClass = 2; // Clear Home Stable
    } else if (diff >= 8) {
      sectorClass = 3; // Slim Home Favorite
    } else if (diff >= 0) {
      sectorClass = 4; // Balanced Neutral Leaning Home
    } else if (diff >= -6) {
      sectorClass = 5; // Balanced Neutral Leaning Away
    } else if (diff >= -14) {
      sectorClass = 6; // Slim Away Favorite
    } else if (diff >= -24) {
      sectorClass = 7; // Clear Away Stable
    } else if (diff >= -40) {
      sectorClass = 8; // Heavy Away Advantage
    } else {
      sectorClass = 9; // Ultra Away Heavy (Banker)
    }

    // 2. Confidence/Strength Class (10 levels: 0 to 9) - Slices the Peak Expectation (maxP)
    const maxP = Math.max(np1, npx, np2);
    let confidenceClass = 5;

    if (maxP >= 75) {
      confidenceClass = 0; // Elite certainty 90%+
    } else if (maxP >= 68) {
      confidenceClass = 1; // Prime dominance 85%+
    } else if (maxP >= 62) {
      confidenceClass = 2; // Strong advantage 80%+
    } else if (maxP >= 56) {
      confidenceClass = 3; // Confident edge 75%+
    } else if (maxP >= 50) {
      confidenceClass = 4; // Decisive strategy 70%+
    } else if (maxP >= 45) {
      confidenceClass = 5; // Moderate strategic edge 65%+
    } else if (maxP >= 40) {
      confidenceClass = 6; // Slim strategic lean 60%+
    } else if (maxP >= 36) {
      confidenceClass = 7; // Contested lean 55%+
    } else if (maxP >= 32) {
      confidenceClass = 8; // Volatile speculative 50%+
    } else {
      confidenceClass = 9; // Equalized dogfight
    }

    // 3. Draw Insurance Risk Margin (2 levels: 0 or 1) - Split at median draw probability
    const insuranceRisk = (npx >= 28 || (np1 + np2) < 70) ? 1 : 0;

    // 4. Odds Coefficient Class (5 levels: 0 to 4) - Slices Bookmaker Odds Values
    const estimatedCoef = (100 / (maxP || 33)) * 0.90;
    const finalCoef = (!coef || coef <= 1.05 || isNaN(coef) || (coef === 1.5 && Math.abs(coef - estimatedCoef) > 0.75))
      ? estimatedCoef
      : coef;

    let coefClass = 2;
    if (finalCoef < 1.45) {
      coefClass = 0; // Banker micro odds
    } else if (finalCoef < 1.85) {
      coefClass = 1; // Solid value low odds
    } else if (finalCoef < 2.35) {
      coefClass = 2; // Balanced medium odds
    } else if (finalCoef < 3.25) {
      coefClass = 3; // High return odds
    } else {
      coefClass = 4; // Speculative underdog giant odds
    }

    // Perfect Bijection Multi-Dimensional Grid formula (10 x 10 x 2 x 5 = 1000)
    // Strictly mapping each state to flat integers in interval [1, 1000] without collisions or gaps
    const signalNumber =
      (sectorClass * 100) +
      (confidenceClass * 10) +
      (insuranceRisk * 5) +
      coefClass +
      1;

    return Math.max(1, Math.min(1000, signalNumber));
  }

  static getSignalCode(cipherKey: number): string {
    const signalNum = Math.max(1, Math.min(1000, cipherKey));
    return `C${String(signalNum).padStart(3, "0")}`;
  }

  /**
   * Decodes a signal code C001 - C1000 back to its original dimensions,
   * delivering a detailed bilingual (Arabic & English) mathematical signature on demand.
   */
  static getSignatureForCode(code: string): {
    nameAr: string;
    nameEn: string;
    badge: string;
    attributes: string[];
    color: string;
  } {
    const num = parseInt(code.replace(/[^\d]/g, ""), 10);
    const zeroIndex = Math.max(0, Math.min(999, (isNaN(num) ? 1 : num) - 1));

    // Decode grid dimensions (10 x 10 x 2 x 5 = 1000)
    const sectorClass = Math.floor(zeroIndex / 100);
    const remainder1 = zeroIndex % 100;
    const confidenceClass = Math.floor(remainder1 / 10);
    const remainder2 = remainder1 % 10;
    const insuranceRisk = Math.floor(remainder2 / 5);
    const coefClass = remainder2 % 5;

    const sectors = [
      { en: "Ultra Home Dominant", ar: "سيادة تامة لصاحب الأرض", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40" },
      { en: "Heavy Home Advantage", ar: "تفوق قوي لصاحب الأرض", color: "text-teal-400 border-teal-500/30 bg-teal-950/40" },
      { en: "Stable Home Forward", ar: "أفضلية مستقرة لصاحب الأرض", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/40" },
      { en: "Slim Home Favorite", ar: "أفضلية طفيفة لصاحب الأرض", color: "text-sky-400 border-sky-500/30 bg-sky-950/40" },
      { en: "Balanced Neutral (Leaning Home)", ar: "متوازن (ميل طفيف للأرض)", color: "text-slate-400 border-slate-500/30 bg-slate-950/40" },
      { en: "Balanced Neutral (Leaning Away)", ar: "متوازن (ميل طفيف للضيوف)", color: "text-slate-400 border-slate-500/30 bg-slate-950/40" },
      { en: "Slim Away Favorite", ar: "أفضلية طفيفة لضيوف الأرض", color: "text-violet-400 border-violet-500/30 bg-violet-950/40" },
      { en: "Stable Away Forward", ar: "أفضلية مستقرة لضيوف الأرض", color: "text-purple-400 border-purple-500/30 bg-purple-950/40" },
      { en: "Heavy Away Advantage", ar: "تفوق قوي لضيوف الأرض", color: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/40" },
      { en: "Ultra Away Dominant", ar: "سيادة تامة لضيوف الأرض", color: "text-rose-400 border-rose-500/30 bg-rose-950/40" }
    ];

    const confidences = [
      { en: "Level 10 Sovereign Elite (90%+)", ar: "المستوى 10: يقين سيادي نخبوي (90%+)" },
      { en: "Level 9 Prime Dominance (85%+)", ar: "المستوى 9: هيمنة أولية عالية (85%+)" },
      { en: "Level 8 Strong Superiority (80%+)", ar: "المستوى 8: تفوق استراتيجي قوي (80%+)" },
      { en: "Level 7 Confident Edge (75%+)", ar: "المستوى 7: ثقة تكتيكية واضحة (75%+)" },
      { en: "Level 6 Decisive Edge (70%+)", ar: "المستوى 6: أسبقية حاسمة مدروسة (70%+)" },
      { en: "Level 5 Moderate Balance (65%+)", ar: "المستوى 5: توازن معتدل إيجابي (65%+)" },
      { en: "Level 4 Slim Strategic Lean (60%+)", ar: "المستوى 4: ميل تكتيكي طفيف (60%+)" },
      { en: "Level 3 Contested Lean (55%+)", ar: "المستوى 3: منافسة محتدمة وميل نسبي (55%+)" },
      { en: "Level 2 Speculative Volatility (50%+)", ar: "المستوى 2: تقلبات ومضاربة حذرة (50%+)" },
      { en: "Level 1 Flat Dogfight (<50%)", ar: "المستوى 1: صراع متكافئ عالي الحذر (<50%)" }
    ];

    const insurances = [
      { en: "Low Draw Risk (Direct Attack)", ar: "أمان تعادلي (تركيز على الحسم)" },
      { en: "High Draw Risk (Double Chance Insured)", ar: "خطر تعادل مرتفع (تأمين مزدوج)" }
    ];

    const coefficients = [
      { en: "Micro-Yield Banker Odds (<1.45)", ar: "عوائد آمنة منخفضة (<1.45)" },
      { en: "Secure Value Odds (1.45-1.85)", ar: "عوائد قيم واعدة (1.45-1.85)" },
      { en: "Medium Balanced Odds (1.85-2.40)", ar: "عوائد معتدلة متوازنة (1.85-2.40)" },
      { en: "High Premium Odds (2.40-3.40)", ar: "عوائد تجارية عالية (2.40-3.40)" },
      { en: "Volatile Speculative Odds (>=3.40)", ar: "مخاطرة مضاربة عالية (>=3.40)" }
    ];

    const sector = sectors[sectorClass] || sectors[4];
    const confidence = confidences[confidenceClass] || confidences[5];
    const insurance = insurances[insuranceRisk] || insurances[0];
    const coefVal = coefficients[coefClass] || coefficients[2];

    const nameEn = `${sector.en} [${confidence.en}]`;
    const nameAr = `بصمة: ${sector.ar} (${confidence.ar})`;
    const badge = `${code} [${sector.en.split(' ')[0]}:${confidence.en.split(' ')[0]}]`;

    const attributes = [
      `البصمة: ${sector.ar}`,
      `الثقة: ${confidence.ar}`,
      `التأمين: ${insurance.ar}`,
      `العوائد المتوقعة: ${coefVal.ar}`,
      `Sector: ${sector.en}`,
      `Confidence: ${confidence.en}`,
      `Insurance: ${insurance.en}`,
      `Odds Category: ${coefVal.en}`
    ];

    return {
      nameAr,
      nameEn,
      badge,
      attributes,
      color: sector.color
    };
  }

  static _parseKickoff(kickoffStr: string): number {
    if (!kickoffStr || typeof kickoffStr !== 'string') return 0;
    const cleaned = kickoffStr.trim().replace(/\s+/g, ' ');
    const parts = cleaned.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '00:00';
    const dateParts = datePart.split(/[\/\-\.]/);
    if (dateParts.length < 3) {
      const nativeParse = new Date(kickoffStr);
      return isNaN(nativeParse.getTime()) ? 0 : nativeParse.getTime();
    }
    const timeParts = timePart.split(':');
    const hour = parseInt(timeParts[0] || '0', 10);
    const minute = parseInt(timeParts[1] || '0', 10);
    let day = 1, month = 0, year = 1970;
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[2], 10);
    } else {
      const p1 = parseInt(dateParts[0], 10);
      const p2 = parseInt(dateParts[1], 10);
      const p3 = parseInt(dateParts[2], 10);
      if (p3 > 1000) {
        year = p3;
        day = p1;
        month = p2 - 1;
      } else if (p1 > 1000) {
        year = p1;
        day = p3;
        month = p2 - 1;
      } else {
        year = 2000 + p3;
        day = p1;
        month = p2 - 1;
      }
    }
    return new Date(year, month, day, hour, minute).getTime();
  }

  /**
   * Fetches compatible finished matches prioritizing the requested signal strictly.
   * If primary signal group has fewer than requiredCount matches, intelligently supplements
   * with look-ahead-bias-safe historical matches from nearest neighbor codes in the same sector & confidence class.
   */
  static getAidedFinishedMatches(
    targetSignalCode: string,
    finishedMatchesBySignal: Record<string, any[]>,
    mTime: number,
    requiredCount = 15
  ): any[] {
    const primaryGroup = finishedMatchesBySignal[targetSignalCode] || [];
    const withParsed = primaryGroup.map(hist => {
      if (hist.__parsedTime === undefined || hist.__parsedTime === null) {
        hist.__parsedTime = hist.kickoff ? this._parseKickoff(hist.kickoff) : 0;
      }
      return hist;
    });
    const filtered = withParsed
      .filter((hist) => hist.__parsedTime < mTime)
      .sort((a, b) => b.__parsedTime - a.__parsedTime);

    if (filtered.length >= requiredCount) {
      return filtered.slice(0, requiredCount);
    }

    // Intelligent Nearest-Neighbor pooling if primary group has sparse history (< requiredCount)
    const num = parseInt(targetSignalCode.replace(/[^\d]/g, ""), 10);
    if (isNaN(num)) return filtered;
    const zeroIndex = Math.max(0, Math.min(999, num - 1));
    const targetSector = Math.floor(zeroIndex / 100);
    const targetConf = Math.floor((zeroIndex % 100) / 10);

    const existingMatchIds = new Set(filtered.map((m) => m.match_id));
    const pool: any[] = [...filtered];

    for (const [codeKey, matches] of Object.entries(finishedMatchesBySignal)) {
      if (codeKey === targetSignalCode) continue;
      const cNum = parseInt(codeKey.replace(/[^\d]/g, ""), 10);
      if (isNaN(cNum)) continue;
      const cZero = Math.max(0, Math.min(999, cNum - 1));
      const cSector = Math.floor(cZero / 100);
      const cConf = Math.floor((cZero % 100) / 10);

      if (cSector === targetSector && cConf === targetConf) {
        for (const m of matches) {
          const t = m.__parsedTime ?? (m.kickoff ? this._parseKickoff(m.kickoff) : 0);
          if (t < mTime && !existingMatchIds.has(m.match_id)) {
            existingMatchIds.add(m.match_id);
            pool.push({ ...m, __parsedTime: t });
            if (pool.length >= requiredCount) break;
          }
        }
      }
      if (pool.length >= requiredCount) break;
    }

    pool.sort((a, b) => b.__parsedTime - a.__parsedTime);
    return pool.slice(0, requiredCount);
  }
}

export class IcharaV2Engine {
  /**
   * ICHARA V2 - ADVANCED HIGH-PRECISION RECALIBRATION ENGINE
   * Maps every tactical soccer matchup profile to exactly 1200 discrete bins (signals) strictly in [1, 1200].
   * Built on a brand-new philosophy:
   * 1. 10 Symmetrical Outlasts (Stance Sectors) - home vs away margin distribution.
   * 2. 8 Confidence Levels (Instead of 5) - significantly refining strategic certainty.
   * 3. 3 Goals Dynamics Philosophies (Defensive Low-xG, Balanced Tactical, Open Artillery Attack)
   * 4. 5 Coefficient Odds-Pillars for granular bookmaker risk adaptation.
   */
  static computeIcharaKey(
    p1: number,
    px: number,
    p2: number,
    coef: number,
  ): number {
    const sum = (p1 || 0) + (px || 0) + (p2 || 0) || 100;
    const np1 = Math.max(0, Math.min(100, Math.round(((p1 || 0) / sum) * 100)));
    const npx = Math.max(0, Math.min(100, Math.round(((px || 0) / sum) * 100)));
    const np2 = Math.max(0, Math.min(100, 100 - np1 - npx));

    // 1. Stance Sectors (10 levels)
    const diff = np1 - np2;
    let sectorClass = 4;
    if (diff >= 45) sectorClass = 0;
    else if (diff >= 30) sectorClass = 1;
    else if (diff >= 18) sectorClass = 2;
    else if (diff >= 8) sectorClass = 3;
    else if (diff >= 0) sectorClass = 4;
    else if (diff >= -6) sectorClass = 5;
    else if (diff >= -14) sectorClass = 6;
    else if (diff >= -24) sectorClass = 7;
    else if (diff >= -40) sectorClass = 8;
    else sectorClass = 9;

    // 2. 8-Level Confidence (0 to 7)
    const maxP = Math.max(np1, npx, np2);
    let confidenceClass = 3;
    if (maxP >= 75) confidenceClass = 0;
    else if (maxP >= 66) confidenceClass = 1;
    else if (maxP >= 58) confidenceClass = 2;
    else if (maxP >= 50) confidenceClass = 3;
    else if (maxP >= 43) confidenceClass = 4;
    else if (maxP >= 37) confidenceClass = 5;
    else if (maxP >= 32) confidenceClass = 6;
    else confidenceClass = 7;

    // 3. Goals Dynamics Philosophy (3 classes: 0, 1, or 2)
    // 0: Defensive Low-xG Shield (Under lean), 1: Balanced Tactical (2-3 goals), 2: Open High-Tempo Offensive Cannon (Over lean)
    let goalsPhilosophy = 1;
    if (npx >= 32 || (np1 + np2) < 66) {
      goalsPhilosophy = 0; // Defensive Low Goals
    } else if ((np1 + np2) >= 75) {
      goalsPhilosophy = 2; // Open High Volume
    }

    // 4. Odds Philosophy (5 classes: 0 to 4)
    const estimatedCoef = (100 / (maxP || 33)) * 0.90;
    const finalCoef = (!coef || coef <= 1.05 || isNaN(coef)) ? estimatedCoef : coef;
    let oddsClass = 2;
    if (finalCoef < 1.35) oddsClass = 0;
    else if (finalCoef < 1.70) oddsClass = 1;
    else if (finalCoef < 2.15) oddsClass = 2;
    else if (finalCoef < 2.95) oddsClass = 3;
    else oddsClass = 4;

    // Perfect Grid Bijection: 10 * 8 * 3 * 5 = 1200
    const key = (sectorClass * 120) + (confidenceClass * 15) + (goalsPhilosophy * 5) + oddsClass + 1;
    return Math.max(1, Math.min(1200, key));
  }

  static getIcharaCode(key: number): string {
    const num = Math.max(1, Math.min(1200, key));
    return `I${String(num).padStart(3, "0")}`;
  }

  /**
   * Decodes an ICHARA V2 code I001 - I1200 back to its original dimensions,
   * generating a gorgeous bilingual mathematical stance context profile.
   */
  static getSignatureForCode(code: string): {
    nameAr: string;
    nameEn: string;
    badge: string;
    attributes: string[];
    color: string;
  } {
    const num = parseInt(code.replace(/[^\d]/g, ""), 10);
    const zeroIndex = Math.max(0, Math.min(1199, (isNaN(num) ? 1 : num) - 1));

    // Decode grid dimensions: 10 * 8 * 3 * 5 = 1200
    const sectorClass = Math.floor(zeroIndex / 120);
    const remainder1 = zeroIndex % 120;
    const confidenceClass = Math.floor(remainder1 / 15);
    const remainder2 = remainder1 % 15;
    const goalsPhilosophy = Math.floor(remainder2 / 5);
    const oddsClass = remainder2 % 5;

    const sectors = [
      { en: "ICHARA Sovereign Home", ar: "سيادة إيكارا التامة للأرض", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40" },
      { en: "ICHARA Dominant Host", ar: "تفوق الأرض المستدام", color: "text-green-400 border-green-500/30 bg-green-950/40" },
      { en: "ICHARA Stable Host Advantage", ar: "أفضلية الأرض التكتيكية المستمرة", color: "text-teal-400 border-teal-500/30 bg-teal-950/40" },
      { en: "ICHARA Slim Favorite Host", ar: "أرجحية الأرض الطفيفة المدروسة", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/40" },
      { en: "ICHARA Equidistant Home Tilt", ar: "تعادل متكافئ (انحياز للأرض)", color: "text-slate-400 border-slate-500/30 bg-slate-950/40" },
      { en: "ICHARA Equidistant Visitor Tilt", ar: "تعادل متكافئ (انحياز للضيوف)", color: "text-gray-400 border-gray-500/30 bg-gray-950/40" },
      { en: "ICHARA Slim Favorite Visitor", ar: "أرجحية الضيوف الطفيفة المدروسة", color: "text-purple-400 border-purple-500/30 bg-purple-950/40" },
      { en: "ICHARA Stable Visitor Advantage", ar: "أفضلية الضيوف التكتيكية المستمرة", color: "text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-950/40" },
      { en: "ICHARA Dominant Visitor", ar: "تفوق الضيوف المستدام", color: "text-rose-400 border-rose-500/30 bg-rose-950/40" },
      { en: "ICHARA Sovereign Visitor", ar: "سلطة إيكارا التامة للضيوف", color: "text-pink-400 border-pink-500/30 bg-pink-950/40" }
    ];

    const confidences = [
      { en: "Sovereign Elite (Level 8)", ar: "مستوى السيادة النخبوي 8" },
      { en: "Prime Certitude (Level 7)", ar: "يقين أولي مرتفع 7" },
      { en: "Decisive Strategy (Level 6)", ar: "استراتيجية حاسمة 6" },
      { en: "Stable Equilibrium (Level 5)", ar: "توازن مستقر إيجابي 5" },
      { en: "Tactical Competency (Level 4)", ar: "قدرة تكتيكية معقولة 4" },
      { en: "Speculative Volatility (Level 3)", ar: "مضاربة تكتيكية متقلبة 3" },
      { en: "Chaos Dogfight (Level 2)", ar: "اشتباك فوضوي عادل 2" },
      { en: "Stochastic Extreme (Level 1)", ar: "عشوائي مطلق مرتفع 1" }
    ];

    const goals = [
      { en: "Defensive Tactical Shield (Low Goals)", ar: "درع دفاعي (شح تهديفي متوقع)" },
      { en: "Standard Tactical Flow (2-3 Goals)", ar: "إيقاع تكتيكي متوازن (2-3 أهداف)" },
      { en: "Open Artillery Attack (High Goals)", ar: "قذائف هجومية مفتوحة (كثافة أهداف عالية)" }
    ];

    const odds = [
      { en: "Ultra Safe Margin Floor (<1.35)", ar: "عوائد أرضية فائقة الأمان (<1.35)" },
      { en: "Optimized Standard Edge (1.35-1.70)", ar: "أفضلية قياسية معدلة (1.35-1.70)" },
      { en: "Balanced Reward Pivot (1.70-2.15)", ar: "محور العوائد المتوازن (1.70-2.15)" },
      { en: "High Yield Target (2.15-2.95)", ar: "عوائد مستهدفة عالية (2.15-2.95)" },
      { en: "Aggressive Speculator (>=2.95)", ar: "مضاربة عالية العدوانية (>=2.95)" }
    ];

    const sector = sectors[sectorClass] || sectors[4];
    const confidence = confidences[confidenceClass] || confidences[3];
    const goalPhil = goals[goalsPhilosophy] || goals[1];
    const oddsVal = odds[oddsClass] || odds[2];

    const nameEn = `${sector.en} [V2-L${8 - confidenceClass}]`;
    const nameAr = `إيكارا V2: ${sector.ar} - مستوى ${8 - confidenceClass}`;
    const badge = `${code} [${sector.en.split(' ')[1]}:L${8 - confidenceClass}]`;

    const attributes = [
      `فلسفة إيكارا: ${sector.ar}`,
      `يقين الإشارة: ${confidence.ar}`,
      `نمط الأهداف: ${goalPhil.ar}`,
      `نمط العائد: ${oddsVal.ar}`,
      `Sector: ${sector.en}`,
      `Level: ${8 - confidenceClass}`,
      `Goals Pattern: ${goalPhil.en}`,
      `Bookmaker Odds: ${oddsVal.en}`
    ];

    return {
      nameAr,
      nameEn,
      badge,
      attributes,
      color: sector.color
    };
  }

  /**
   * Fetches compatible finished matches prioritizing the requested ICHARA V2 signal strictly.
   * If primary signal group has fewer than requiredCount matches, intelligently supplements
   * with look-ahead-bias-safe historical matches from nearest neighbor codes in the same sector & confidence class.
   */
  static getAidedFinishedMatches(
    targetSignalCode: string,
    finishedMatchesBySignal: Record<string, any[]>,
    mTime: number,
    requiredCount = 30
  ): any[] {
    const primaryGroup = finishedMatchesBySignal[targetSignalCode] || [];
    const withParsed = primaryGroup.map(hist => {
      if (hist.__parsedTime === undefined || hist.__parsedTime === null) {
        hist.__parsedTime = hist.kickoff ? CipherEngine._parseKickoff(hist.kickoff) : 0;
      }
      return hist;
    });
    const filtered = withParsed
      .filter((hist) => hist.__parsedTime < mTime)
      .sort((a, b) => b.__parsedTime - a.__parsedTime);

    if (filtered.length >= requiredCount) {
      return filtered.slice(0, requiredCount);
    }

    // Intelligent Nearest-Neighbor pooling if primary group has sparse history (< requiredCount)
    const num = parseInt(targetSignalCode.replace(/[^\d]/g, ""), 10);
    if (isNaN(num)) return filtered;
    const zeroIndex = Math.max(0, Math.min(1199, num - 1));
    const targetSector = Math.floor(zeroIndex / 120);
    const targetConf = Math.floor((zeroIndex % 120) / 15);

    const existingMatchIds = new Set(filtered.map((m) => m.match_id));
    const pool: any[] = [...filtered];

    for (const [codeKey, matches] of Object.entries(finishedMatchesBySignal)) {
      if (codeKey === targetSignalCode) continue;
      const cNum = parseInt(codeKey.replace(/[^\d]/g, ""), 10);
      if (isNaN(cNum)) continue;
      const cZero = Math.max(0, Math.min(1199, cNum - 1));
      const cSector = Math.floor(cZero / 120);
      const cConf = Math.floor((cZero % 120) / 15);

      if (cSector === targetSector && cConf === targetConf) {
        for (const m of matches) {
          const t = m.__parsedTime ?? (m.kickoff ? CipherEngine._parseKickoff(m.kickoff) : 0);
          if (t < mTime && !existingMatchIds.has(m.match_id)) {
            existingMatchIds.add(m.match_id);
            pool.push({ ...m, __parsedTime: t });
            if (pool.length >= requiredCount) break;
          }
        }
      }
      if (pool.length >= requiredCount) break;
    }

    pool.sort((a, b) => b.__parsedTime - a.__parsedTime);
    return pool.slice(0, requiredCount);
  }
}

export interface DualPredictions {
  primaryMarket: string;
  primaryLabel: string;
  primaryOdds: number;
  primaryProb: number;
  altMarket: string;
  altLabel: string;
  altOdds: number;
  altProb: number;
}

export class AdvancedxGEngine {
  // mathematical Factorial helper
  static factorial(n: number): number {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  // Poisson PMF helper
  static poissonPMF(k: number, lambda: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  // Dixon-Coles joint probability adjustment parameter for soccer expectations
  static dixonColesAdjustment(
    h: number,
    a: number,
    lh: number,
    la: number,
  ): number {
    if (lh <= 0.01 || la <= 0.01) return 1.0;
    // Parameter rho controls low-scoring dependence correction (~ -0.06 in European leagues)
    const rho = -0.06;
    if (h === 0 && a === 0) return 1.0 - lh * la * rho;
    if (h === 1 && a === 0) return 1.0 + la * rho;
    if (h === 0 && a === 1) return 1.0 + lh * rho;
    if (h === 1 && a === 1) return 1.0 - rho;
    return 1.0;
  }

  /**
   * Generates highly accurate Poisson-inspired xG expectations with self-learning EMA corrections
   */
  static computeLocalXG(
    p1: number,
    px: number,
    p2: number,
    coef: number,
    htScore?: string | null,
    emaCorrectionH = 0,
    emaCorrectionA = 0,
  ): {
    xgHome: number;
    xgAway: number;
    expectedScore: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    riskFlag: "SAFE" | "CAUTION" | "RISKY";
    dnaProfile: string;
    scenarios: Record<string, number>;
  } {
    // Favorite bias coefficient modeling
    const strengthFav = Math.max(p1, p2);

    // Base goals expectation
    let expectedTotalGoals =
      2.4 + (strengthFav > 60 ? 0.3 : 0.0) - (px > 40 ? 0.4 : 0.0);
    if (coef > 3.5) expectedTotalGoals += 0.2;

    let shareHome = p1 / (p1 + p2 + 0.01);
    // Draw probability pulls expectation closer
    if (px > 35) {
      shareHome = shareHome * 0.7 + 0.15;
    }

    let xgHome = expectedTotalGoals * shareHome;
    let xgAway = expectedTotalGoals * (1.0 - shareHome);

    // Apply self-learning backpropagation EMA corrections if exists
    xgHome = Math.max(0.1, xgHome - emaCorrectionH);
    xgAway = Math.max(0.1, xgAway - emaCorrectionA);

    // Apply halftime real-match corrections if available
    if (htScore) {
      try {
        const parts = htScore.split("-");
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const a = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(a)) {
            xgHome = xgHome * 0.5 + h;
            xgAway = xgAway * 0.5 + a;
          }
        }
      } catch (e) {
        // Safe skip
      }
    }

    xgHome = Math.max(0.1, parseFloat(xgHome.toFixed(2)));
    xgAway = Math.max(0.1, parseFloat(xgAway.toFixed(2)));

    // Logical integer score projection
    const goalHome = xgHome < 0.6 ? 0 : xgHome < 1.6 ? 1 : xgHome < 2.6 ? 2 : 3;
    const goalAway = xgAway < 0.6 ? 0 : xgAway < 1.6 ? 1 : xgAway < 2.6 ? 2 : 3;
    const expectedScore = `${goalHome}-${goalAway}`;

    // --- Chameleon DNA Tactical Profile Classifier ---
    let dnaProfile = "NORMAL";
    const totalXG = xgHome + xgAway;
    const diffXG = Math.abs(xgHome - xgAway);

    if (totalXG < 1.9) {
      dnaProfile = "DEFENSIVE_WALL";
    } else if (totalXG > 3.2) {
      dnaProfile = "LEAKY_OPEN";
    } else if (diffXG > 1.1) {
      dnaProfile = xgHome > xgAway ? "ONE_SIDED_HOME" : "ONE_SIDED_AWAY";
    } else if (px > 38 && totalXG < 2.4) {
      dnaProfile = "DEAD_TRAP";
    } else if (coef > 3.0 && totalXG < 2.5) {
      dnaProfile = "CHAOS_LOW_XG";
    } else if (totalXG > 2.8) {
      dnaProfile = "HIGH_SCORING_NORMAL";
    }

    // --- Scenario Probabilities Generator (Chameleon v7.0) ---
    const scenarios: Record<string, number> = {
      DEAD: 0.1,
      FROZEN: 0.08,
      NORMAL: 0.5,
      SURPRISE: 0.15,
      EXPLOSION: 0.1,
      CHAOS: 0.07,
    };

    if (dnaProfile === "DEAD_TRAP" || dnaProfile === "DEFENSIVE_WALL") {
      scenarios.DEAD = 0.35;
      scenarios.FROZEN = 0.2;
      scenarios.NORMAL = 0.3;
      scenarios.SURPRISE = 0.05;
      scenarios.EXPLOSION = 0.05;
      scenarios.CHAOS = 0.05;
    } else if (
      dnaProfile === "LEAKY_OPEN" ||
      dnaProfile === "HIGH_SCORING_NORMAL"
    ) {
      scenarios.DEAD = 0.05;
      scenarios.FROZEN = 0.05;
      scenarios.NORMAL = 0.35;
      scenarios.SURPRISE = 0.15;
      scenarios.EXPLOSION = 0.3;
      scenarios.CHAOS = 0.1;
    } else if (dnaProfile === "CHAOS_LOW_XG") {
      scenarios.DEAD = 0.1;
      scenarios.FROZEN = 0.1;
      scenarios.NORMAL = 0.3;
      scenarios.SURPRISE = 0.2;
      scenarios.EXPLOSION = 0.1;
      scenarios.CHAOS = 0.2;
    }

    const confidence =
      strengthFav > 55 ? "HIGH" : strengthFav > 40 ? "MEDIUM" : "LOW";
    const riskFlag = coef < 1.5 ? "SAFE" : coef < 2.45 ? "CAUTION" : "RISKY";

    return {
      xgHome,
      xgAway,
      expectedScore,
      confidence,
      riskFlag,
      dnaProfile,
      scenarios,
    };
  }

  /**
   * Broader result-tracking form analyzer to calculate customized non-repetitive scores.
   * Uses Poisson bivariate joint expectations combined with standalone prediction direction weights
   * and a deterministic name-signature variance generator to guarantee highly realistic score diversity.
   */
  static _scoreCache = new Map<string, string>();
  static _lastMatchCount = 0;
  static _poissonCache = new Map<string, Record<string, number>>();

  static computeFormAdjustedScore(
    m: {
      match_id?: string;
      home: string;
      away: string;
      xg_home: number;
      xg_away: number;
      kickoff: string;
      pred?: string;
      p1?: number;
      px?: number;
      p2?: number;
      signal_code?: string;
      __parsedTime?: number;
    },
    allMatches: any[],
  ): string {
    const getPrediction = (match: any): string => {
      if (
        match.pred &&
        (match.pred === "1" || match.pred === "X" || match.pred === "2")
      ) {
        return match.pred.toUpperCase();
      }
      const p1 = match.p1 || 0;
      const px = match.px || 0;
      const p2 = match.p2 || 0;
      const max = Math.max(p1, px, p2);
      if (max === p1) return "1";
      if (max === p2) return "2";
      return "X";
    };

    const calculatedPred = getPrediction(m);

    if (m.match_id) {
      if (this._lastMatchCount !== allMatches.length) {
        this._scoreCache.clear();
        this._lastMatchCount = allMatches.length;
      }
      if (this._scoreCache.has(m.match_id)) {
        return this._scoreCache.get(m.match_id)!;
      }
    }

    const homeTeam = m.home;
    const awayTeam = m.away;
    const kickoffTime = m.__parsedTime || new Date(m.kickoff || 0).getTime();

    // Filter historical finished matches for the teams before the kickoff time to avoid look-ahead bias
    const finishedHome = allMatches.filter((prev) => {
      if (
        prev.status !== "FINISHED" ||
        (prev.home !== homeTeam && prev.away !== homeTeam)
      )
        return false;
      const t = prev.__parsedTime;
      return t == null || t < kickoffTime || kickoffTime === 0;
    });

    const finishedAway = allMatches.filter((prev) => {
      if (
        prev.status !== "FINISHED" ||
        (prev.home !== awayTeam && prev.away !== awayTeam)
      )
        return false;
      const t = prev.__parsedTime;
      return t == null || t < kickoffTime || kickoffTime === 0;
    });

    // Take up to last 5 recent matches
    const last5Home = finishedHome.slice(0, 5);
    const last5Away = finishedAway.slice(0, 5);

    let hScored = 1.25,
      hConceded = 1.25;
    let aScored = 1.25,
      aConceded = 1.25;

    if (last5Home.length > 0) {
      let scored = 0,
        conceded = 0;
      last5Home.forEach((p) => {
        if (p.ft_home === null || p.ft_away === null) return;
        const isH = p.home === homeTeam;
        const goalS = isH ? p.ft_home : p.ft_away;
        const goalC = isH ? p.ft_away : p.ft_home;
        scored += goalS;
        conceded += goalC;
      });
      hScored = scored / last5Home.length;
      hConceded = conceded / last5Home.length;
    }

    if (last5Away.length > 0) {
      let scored = 0,
        conceded = 0;
      last5Away.forEach((p) => {
        if (p.ft_home === null || p.ft_away === null) return;
        const isH = p.home === awayTeam;
        const goalS = isH ? p.ft_home : p.ft_away;
        const goalC = isH ? p.ft_away : p.ft_home;
        scored += goalS;
        conceded += goalC;
      });
      aScored = scored / last5Away.length;
      aConceded = conceded / last5Away.length;
    }

    // Dynamic Corrective Feedback Loop: Learning Goal Prediction Bias for this specific signal historical trend
    let signalEmaBiasHome = 0;
    let signalEmaBiasAway = 0;
    const sameSignalMatches = m.signal_code
      ? allMatches.filter((prev) => {
          if (
            prev.status !== "FINISHED" ||
            prev.ft_home === null ||
            prev.ft_away === null ||
            prev.signal_code !== m.signal_code
          )
            return false;
          const t = prev.__parsedTime;
          return t == null || t < kickoffTime || kickoffTime === 0;
        })
      : [];

    if (sameSignalMatches.length > 0) {
      // Sort chronologically ascending to train our EMA
      sameSignalMatches.sort(
        (a, b) => (a.__parsedTime || 0) - (b.__parsedTime || 0),
      );
      const alpha = 0.25; // learning coefficient
      sameSignalMatches.forEach((hist) => {
        const hBase = hist.xg_home;
        const aBase = hist.xg_away;
        const errH = hBase - hist.ft_home;
        const errA = aBase - hist.ft_away;
        signalEmaBiasHome = alpha * errH + (1 - alpha) * signalEmaBiasHome;
        signalEmaBiasAway = alpha * errA + (1 - alpha) * signalEmaBiasAway;
      });
    }

    // Blend base Poisson xG expectation with recent team scoring/conceding averages (Form weight)
    let adjXgHome = Math.max(
      0.15,
      m.xg_home * 0.5 + hScored * 0.25 + aConceded * 0.25,
    );
    let adjXgAway = Math.max(
      0.15,
      m.xg_away * 0.5 + aScored * 0.25 + hConceded * 0.25,
    );

    // Apply the learned corrective biases to subtract out systemic modeling drift or bookmaker inflation
    adjXgHome = Math.max(0.15, adjXgHome - signalEmaBiasHome * 0.5);
    adjXgAway = Math.max(0.15, adjXgAway - signalEmaBiasAway * 0.5);

    // Calculate maximum joint probability of scorelines from (0-0) to (4-4)
    let maxWeightedProb = -1;
    let bestHomeGoals = 1;
    let bestAwayGoals = 1;

    // Deterministic signature hash from metadata to inject subtle realistic variance
    // and prevent identical statistical templates from always outputting the same score.
    const teamString = `${homeTeam}_vs_${awayTeam}`;
    let nameHash = 0;
    for (let idx = 0; idx < teamString.length; idx++) {
      nameHash += teamString.charCodeAt(idx);
    }
    const signatureAndHourSeed =
      (nameHash +
        (m.kickoff ? m.kickoff.charCodeAt(m.kickoff.length - 1) : 0)) %
      100;

    for (let h = 0; h <= 4; h++) {
      for (let a = 0; a <= 4; a++) {
        // Core joint Poisson probability
        let prob =
          this.poissonPMF(h, adjXgHome) * this.poissonPMF(a, adjXgAway);

        // Direction alignment scaling factor
        const standalonePredict = calculatedPred;
        if (standalonePredict === "1") {
          if (h > a) {
            prob *= 2.8; // Favor home win outcomes
          } else if (h === a) {
            prob *= 0.15; // Low probability for drawers
          } else {
            prob *= 0.02; // Severely lower away win scores
          }
        } else if (standalonePredict === "X") {
          if (h === a) {
            prob *= 3.2; // Favor exact draws
          } else {
            prob *= 0.1; // Reduce non-draw scores
          }
        } else if (standalonePredict === "2") {
          if (a > h) {
            prob *= 2.8; // Favor away win outcomes
          } else if (h === a) {
            prob *= 0.15;
          } else {
            prob *= 0.02;
          }
        }

        // Apply a subtle deterministic variance to push close probabilities to different natural scores
        const deterministicVarianceId =
          (h * 7 + a * 3 + signatureAndHourSeed) % 15;
        if (deterministicVarianceId === 0) prob *= 1.15;
        else if (deterministicVarianceId === 1) prob *= 1.1;
        else if (deterministicVarianceId === 2) prob *= 1.05;
        else if (deterministicVarianceId === 3) prob *= 0.95;
        else if (deterministicVarianceId === 4) prob *= 0.9;

        if (prob > maxWeightedProb) {
          maxWeightedProb = prob;
          bestHomeGoals = h;
          bestAwayGoals = a;
        }
      }
    }

    // Secondary enforcement pattern: Make sure the score strictly aligns with the prediction layout
    let finalHomeGoals = bestHomeGoals;
    let finalAwayGoals = bestAwayGoals;
    const parentPrediction = calculatedPred;
    if (parentPrediction === "1" && finalHomeGoals <= finalAwayGoals) {
      finalHomeGoals = finalAwayGoals + 1;
    } else if (parentPrediction === "2" && finalAwayGoals <= finalHomeGoals) {
      finalAwayGoals = finalHomeGoals + 1;
    } else if (parentPrediction === "X" && finalHomeGoals !== finalAwayGoals) {
      // Balance out to nearest balanced draw
      const avgD = Math.round((finalHomeGoals + finalAwayGoals) / 2);
      finalHomeGoals = avgD;
      finalAwayGoals = avgD;
    }

    const resultScore = `${finalHomeGoals}-${finalAwayGoals}`;
    if (m.match_id) {
      this._scoreCache.set(m.match_id, resultScore);
    }
    return resultScore;
  }

  /**
   * Computes exact Poisson-based distribution probabilities for all IMPORTANT_MARKETS
   */
  static computePoissonGridProbs(
    lh: number,
    la: number,
  ): Record<string, number> {
    const key = `${lh.toFixed(4)}_${la.toFixed(4)}`;
    if (this._poissonCache.has(key)) {
      return this._poissonCache.get(key)!;
    }
    const probs: Record<string, number> = {};
    const maxGoals = 8;

    // Precompute PMF arrays
    const pmfHome: number[] = [];
    const pmfAway: number[] = [];
    for (let i = 0; i <= maxGoals; i++) {
      pmfHome.push(this.poissonPMF(i, lh));
      pmfAway.push(this.poissonPMF(i, la));
    }

    // 1X2, Over/Under, Halves sums
    let ft1 = 0;
    let ftX = 0;
    let ft2 = 0;
    const overUnder: Record<number, number> = {
      0.5: 0,
      1.5: 0,
      2.5: 0,
      3.5: 0,
      4.5: 0,
    };
    let gg = 0;
    let homeOver05 = 0;
    let homeOver15 = 0;
    let awayOver05 = 0;
    let awayOver15 = 0;
    let evenTotal = 0;

    for (let h = 0; h <= maxGoals; h++) {
      for (let a = 0; a <= maxGoals; a++) {
        const coefColes = this.dixonColesAdjustment(h, a, lh, la);
        const pScore = pmfHome[h] * pmfAway[a] * coefColes;

        if (h > a) ft1 += pScore;
        else if (h === a) ftX += pScore;
        else ft2 += pScore;

        const tot = h + a;
        Object.keys(overUnder).forEach((line) => {
          const l = parseFloat(line);
          if (tot > l) overUnder[l] += pScore;
        });

        if (h > 0 && a > 0) gg += pScore;
        if (h > 0.5) homeOver05 += pScore;
        if (h > 1.5) homeOver15 += pScore;
        if (a > 0.5) awayOver05 += pScore;
        if (a > 1.5) awayOver15 += pScore;
        if (tot % 2 === 0) evenTotal += pScore;
      }
    }

    probs["FT_1"] = ft1;
    probs["FT_X"] = ftX;
    probs["FT_2"] = ft2;
    probs["DC_1X"] = ft1 + ftX;
    probs["DC_X2"] = ft2 + ftX;

    probs["OVER_0_5"] = overUnder[0.5];
    probs["UNDER_0_5"] = 1 - overUnder[0.5];
    probs["OVER_1_5"] = overUnder[1.5];
    probs["UNDER_1_5"] = 1 - overUnder[1.5];
    probs["OVER_2_5"] = overUnder[2.5];
    probs["OVER_3_5"] = overUnder[3.5];
    probs["UNDER_3_5"] = 1 - overUnder[3.5];
    probs["OVER_4_5"] = overUnder[4.5];
    probs["UNDER_4_5"] = 1 - overUnder[4.5];

    probs["GG_FT"] = gg;
    probs["NG_FT"] = 1 - gg;

    probs["HOME_OVER_0_5"] = homeOver05;
    probs["HOME_OVER_1_5"] = homeOver15;
    probs["AWAY_OVER_0_5"] = awayOver05;
    probs["AWAY_OVER_1_5"] = awayOver15;

    probs["HOME_CLEAN_SHEET"] = pmfAway[0];
    probs["AWAY_CLEAN_SHEET"] = pmfHome[0];

    probs["EVEN_TOTAL_GOALS"] = evenTotal;
    probs["ODD_TOTAL_GOALS"] = 1 - evenTotal;

    // Halftime probabilities (H1 coefficient = 0.45)
    const htLh = lh * 0.45;
    const htLa = la * 0.45;
    const htPmfH: number[] = [];
    const htPmfA: number[] = [];
    for (let i = 0; i <= 5; i++) {
      htPmfH.push(this.poissonPMF(i, htLh));
      htPmfA.push(this.poissonPMF(i, htLa));
    }

    let ht1 = 0;
    let htX = 0;
    let ht2 = 0;
    let htO05 = 0;
    let htO15 = 0;
    let htBttsNo = 0;

    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        const coefColes = this.dixonColesAdjustment(h, a, htLh, htLa);
        const pScore = htPmfH[h] * htPmfA[a] * coefColes;
        if (h > a) ht1 += pScore;
        else if (h === a) htX += pScore;
        else ht2 += pScore;

        const tot = h + a;
        if (tot > 0.5) htO05 += pScore;
        if (tot > 1.5) htO15 += pScore;
        if (h === 0 || a === 0) htBttsNo += pScore;
      }
    }

    probs["HT_1"] = ht1;
    probs["HT_X"] = htX;
    probs["HT_2"] = ht2;
    probs["HT_OVER_0_5"] = htO05;
    probs["HT_OVER_1_5"] = htO15;
    probs["NG_HT"] = htBttsNo;

    // Second half probabilities (H2 coefficient = 0.55)
    const shLh = lh * 0.55;
    const shLa = la * 0.55;
    const shPmfH: number[] = [];
    const shPmfA: number[] = [];
    for (let i = 0; i <= 5; i++) {
      shPmfH.push(this.poissonPMF(i, shLh));
      shPmfA.push(this.poissonPMF(i, shLa));
    }

    let shO05 = 0;
    let shO15 = 0;

    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        const coefColes = this.dixonColesAdjustment(h, a, shLh, shLa);
        const pScore = shPmfH[h] * shPmfA[a] * coefColes;
        const tot = h + a;
        if (tot > 0.5) shO05 += pScore;
        if (tot > 1.5) shO15 += pScore;
      }
    }

    probs["SH_OVER_0_5"] = shO05;
    probs["SH_OVER_1_5"] = shO15;

    this._poissonCache.set(key, probs);
    return probs;
  }

  /**
   * Calculates the specific odds coefficient for any given market
   */
  static calculateMarketOdds(
    p1: number,
    px: number,
    p2: number,
    matchCoef: number,
    matchPred: string,
    market: string,
    emaErrorH = 0,
    emaErrorA = 0
  ): number {
    // If the market matches the match's direct predicted outcome, return matchCoef
    if (
      (market === "FT_1" && matchPred === "1") ||
      (market === "FT_2" && matchPred === "2") ||
      (market === "FT_X" && matchPred === "X")
    ) {
      return matchCoef || 1.80;
    }

    const defaultXG = this.computeLocalXG(p1, px, p2, matchCoef || 1.80, null, emaErrorH, emaErrorA);
    const poissonProbs = this.computePoissonGridProbs(defaultXG.xgHome, defaultXG.xgAway);

    const getOdds = (prob: number, factor = 1.05) => {
      const p = Math.max(1, prob * 100);
      return parseFloat(((100 / p) * factor).toFixed(2));
    };

    let pVal = poissonProbs[market];
    if (pVal === undefined) {
      return matchCoef || 1.80;
    }

    let factor = 1.05;

    if (market === "FT_1" || market === "FT_2") {
      factor = 1.08;
    } else if (market === "DC_1X" || market === "DC_X2") {
      factor = 1.03;
      if (px > 35) {
        pVal *= 1.15;
      }
    } else if (market === "OVER_1_5") {
      factor = 1.04;
    } else if (market === "UNDER_3_5") {
      factor = 1.04;
    } else if (market === "OVER_2_5") {
      factor = 1.06;
    } else if (market === "GG_FT") {
      factor = 1.06;
    } else if (market === "HOME_OVER_0_5" || market === "AWAY_OVER_0_5") {
      factor = 1.02;
    }

    if (market === "FT_1" && p1 > 60) pVal *= 1.06;
    if (market === "FT_2" && p2 > 60) pVal *= 1.06;

    pVal = Math.min(0.99, pVal);

    return getOdds(pVal, factor);
  }

  /**
   * Generates Primary and Alternative predictions utilizing mathematically correct Poisson grid values and optional EMA drift
   */
  static generateDualPredictions(
    p1: number,
    px: number,
    p2: number,
    coef: number,
    emaErrorH = 0,
    emaErrorA = 0,
  ): DualPredictions {
    const defaultXG = this.computeLocalXG(
      p1,
      px,
      p2,
      coef,
      null,
      emaErrorH,
      emaErrorA,
    );
    const poissonProbs = this.computePoissonGridProbs(
      defaultXG.xgHome,
      defaultXG.xgAway,
    );

    interface Candidate {
      market: string;
      label: string;
      prob: number;
      odds: number;
      category: string;
    }

    const candidates: Candidate[] = [];

    const getOdds = (prob: number, factor = 1.05) => {
      const p = Math.max(1, prob * 100);
      return parseFloat(((100 / p) * factor).toFixed(2));
    };

    // result
    candidates.push({
      market: "FT_1",
      label: "Home Win (Full-Time)",
      prob: poissonProbs["FT_1"] * 100,
      odds: getOdds(poissonProbs["FT_1"], 1.08),
      category: "RESULT",
    });
    candidates.push({
      market: "FT_2",
      label: "Away Win (Full-Time)",
      prob: poissonProbs["FT_2"] * 100,
      odds: getOdds(poissonProbs["FT_2"], 1.08),
      category: "RESULT",
    });

    // double chances
    candidates.push({
      market: "DC_1X",
      label: "Double Chance (Home or Draw)",
      prob: poissonProbs["DC_1X"] * 100,
      odds: getOdds(poissonProbs["DC_1X"], 1.03),
      category: "DC",
    });
    candidates.push({
      market: "DC_X2",
      label: "Double Chance (Draw or Away)",
      prob: poissonProbs["DC_X2"] * 100,
      odds: getOdds(poissonProbs["DC_X2"], 1.03),
      category: "DC",
    });

    // goals
    candidates.push({
      market: "OVER_1_5",
      label: "Match Goals: Over 1.5",
      prob: poissonProbs["OVER_1_5"] * 100,
      odds: getOdds(poissonProbs["OVER_1_5"], 1.04),
      category: "GOALS",
    });
    candidates.push({
      market: "UNDER_3_5",
      label: "Match Goals: Under 3.5",
      prob: poissonProbs["UNDER_3_5"] * 100,
      odds: getOdds(poissonProbs["UNDER_3_5"], 1.04),
      category: "GOALS",
    });
    candidates.push({
      market: "OVER_2_5",
      label: "Match Goals: Over 2.5",
      prob: poissonProbs["OVER_2_5"] * 100,
      odds: getOdds(poissonProbs["OVER_2_5"], 1.06),
      category: "GOALS",
    });

    // btts/cleans
    candidates.push({
      market: "GG_FT",
      label: "Both Teams to Score (GG - Yes)",
      prob: poissonProbs["GG_FT"] * 100,
      odds: getOdds(poissonProbs["GG_FT"], 1.06),
      category: "GG",
    });
    candidates.push({
      market: "HOME_OVER_0_5",
      label: "Home Score Over 0.5",
      prob: poissonProbs["HOME_OVER_0_5"] * 100,
      odds: getOdds(poissonProbs["HOME_OVER_0_5"], 1.02),
      category: "DIGITS",
    });
    candidates.push({
      market: "AWAY_OVER_0_5",
      label: "Away Score Over 0.5",
      prob: poissonProbs["AWAY_OVER_0_5"] * 100,
      odds: getOdds(poissonProbs["AWAY_OVER_0_5"], 1.02),
      category: "DIGITS",
    });

    // --- STRATEGIC ACCURACY CALIBRATORS ---
    // 1. High Draw Stabilization: prioritize double chances to prevent draw traps
    if (px > 35) {
      const dc1x = candidates.find((c) => c.market === "DC_1X");
      const dcx2 = candidates.find((c) => c.market === "DC_X2");
      if (dc1x) dc1x.prob *= 1.15;
      if (dcx2) dcx2.prob *= 1.15;
    }
    // 2. Favorite Bias Recalibration: strengthen strong favorite projections
    if (p1 > 60) {
      const f1 = candidates.find((c) => c.market === "FT_1");
      if (f1) f1.prob *= 1.06;
    } else if (p2 > 60) {
      const f2 = candidates.find((c) => c.market === "FT_2");
      if (f2) f2.prob *= 1.06;
    }

    // filter to those with odds >= 1.30
    const viable = candidates.filter((c) => c && typeof c.odds === "number" && c.odds >= 1.3);
    viable.sort((a, b) => (b?.prob ?? 0) - (a?.prob ?? 0));

    const defaultCand = candidates[0] || {
      market: "FT_1",
      label: "Home Win",
      odds: 1.55,
      prob: 52.0,
      category: "1X2",
    };

    const primary = viable[0] || candidates[4] || candidates[0] || defaultCand;
    const altCandidate =
      (primary && viable.find(
        (c) => c && c.market !== primary.market && c.category !== primary.category,
      )) ||
      (primary && viable.find((c) => c && c.market !== primary.market)) ||
      candidates[5] ||
      candidates[1] ||
      defaultCand;

    return {
      primaryMarket: primary?.market || "FT_1",
      primaryLabel: primary?.label || "Home Win",
      primaryOdds: primary?.odds ?? 1.55,
      primaryProb: parseFloat(((primary?.prob) ?? 50.0).toFixed(1)),
      altMarket: altCandidate?.market || "OVER_1_5",
      altLabel: altCandidate?.label || "Match Goals: Over 1.5",
      altOdds: altCandidate?.odds ?? 1.38,
      altProb: parseFloat(((altCandidate?.prob) ?? 55.0).toFixed(1)),
    };
  }
}
