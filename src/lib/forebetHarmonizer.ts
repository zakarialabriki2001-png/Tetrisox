import { Match } from '../types';

export interface ForebetCompatibilityResult {
  isCompatible: boolean;
  conflictReasonAr?: string;
  forebetSummaryAr: string;
}

export interface ParsedForebetScore {
  expHome: number;
  expAway: number;
  totalGoals: number;
  isDraw: boolean;
  lean: '1' | 'X' | '2';
}

export class ForebetHarmonizer {
  /**
   * Parse Forebet expected score (e.g. "2 - 1", "3-0", "1:1", "0 - 0")
   */
  static parseExpectedScore(scoreStr?: string): ParsedForebetScore | null {
    if (!scoreStr || typeof scoreStr !== 'string') return null;
    const cleaned = scoreStr.trim();
    const parts = cleaned.split(/[-–:]/).map((s) => parseInt(s.trim(), 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const expHome = parts[0];
      const expAway = parts[1];
      const totalGoals = expHome + expAway;
      const isDraw = expHome === expAway;
      const lean: '1' | 'X' | '2' = expHome > expAway ? '1' : expAway > expHome ? '2' : 'X';
      return { expHome, expAway, totalGoals, isDraw, lean };
    }
    return null;
  }

  /**
   * Evaluates compatibility between a single market prediction and Forebet's forecast
   */
  static checkMarketCompatibility(market: string, match: Match): ForebetCompatibilityResult {
    const score = this.parseExpectedScore(match.expected_score);
    const pred = match.pred; // '1' | 'X' | '2'
    const p1 = match.p1 || 0;
    const px = match.px || 0;
    const p2 = match.p2 || 0;

    const forebetSummaryParts: string[] = [];
    if (pred) forebetSummaryParts.push(`توقع: ${pred}`);
    if (score) forebetSummaryParts.push(`النتيجة: ${score.expHome}-${score.expAway}`);
    if (p1 || p2) forebetSummaryParts.push(`(1: ${p1}% | X: ${px}% | 2: ${p2}%)`);
    const forebetSummaryAr = forebetSummaryParts.join(' ') || 'بيانات Forebet متوفرة';

    // 1. OUTCOME 1X2, DNB & DOUBLE CHANCE CHECKS
    if (market === 'FT_1' || market === 'DNB_1') {
      if (pred === '2') {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض صريح: النظام يتوقع فوز المضيف بينما Forebet يرجح فوز الضيف (${pred})`,
          forebetSummaryAr,
        };
      }
      if (score && score.expAway > score.expHome) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض بالنتيجة: Forebet يتوقع فوز الضيف بنتيجة ${score.expHome}-${score.expAway}`,
          forebetSummaryAr,
        };
      }
      if (p2 > p1 + 8) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض احتمالي: Forebet يمنح أفضلية صريحة للضيف (P2: ${p2}% مقابل P1: ${p1}%)`,
          forebetSummaryAr,
        };
      }
      if (market === 'FT_1' && p1 < 36) {
        return {
          isCompatible: false,
          conflictReasonAr: `ضعف احتمالي: نسبة فوز المضيف لدى Forebet (${p1}%) غير كافية لترشيح الفوز المباشر`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'FT_2' || market === 'DNB_2') {
      if (pred === '1') {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض صريح: النظام يتوقع فوز الضيف بينما Forebet يرجح فوز المضيف (${pred})`,
          forebetSummaryAr,
        };
      }
      if (score && score.expHome > score.expAway) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض بالنتيجة: Forebet يتوقع فوز المضيف بنتيجة ${score.expHome}-${score.expAway}`,
          forebetSummaryAr,
        };
      }
      if (p1 > p2 + 8) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض احتمالي: Forebet يمنح أفضلية صريحة للمضيف (P1: ${p1}% مقابل P2: ${p2}%)`,
          forebetSummaryAr,
        };
      }
      if (market === 'FT_2' && p2 < 34) {
        return {
          isCompatible: false,
          conflictReasonAr: `ضعف احتمالي: نسبة فوز الضيف لدى Forebet (${p2}%) غير كافية لترشيح الفوز المباشر`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'FT_X') {
      if (score && Math.abs(score.expHome - score.expAway) >= 2) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض صريح: النظام يتوقع تعادل بينما Forebet يتوقع فارق أهداف عريض (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
      if (p1 >= 55 || p2 >= 55) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض احتمالي: Forebet يرجح فوزاً حاسماً لأحد الفريقين بنسبة ≥ 55%`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'DC_1X') {
      if (pred === '2' && p2 >= 48 && score && score.expAway > score.expHome) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض مزدوج: Forebet يجزم بتفوق الضيف بنسبة ${p2}% ونتيجة ${score.expHome}-${score.expAway}`,
          forebetSummaryAr,
        };
      }
      if (score && score.expAway - score.expHome >= 2) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض نتيجي: Forebet يتوقع خسارة صريحة للمضيف بفارق هدفين فأكثر (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'DC_X2') {
      if (pred === '1' && p1 >= 48 && score && score.expHome > score.expAway) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض مزدوج: Forebet يجزم بتفوق المضيف بنسبة ${p1}% ونتيجة ${score.expHome}-${score.expAway}`,
          forebetSummaryAr,
        };
      }
      if (score && score.expHome - score.expAway >= 2) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض نتيجي: Forebet يتوقع خسارة صريحة للضيف بفارق هدفين فأكثر (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'DC_12') {
      if (pred === 'X' || (score && score.isDraw && px >= 30)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض تام: النظام يستبعد التعادل بينما Forebet يتوقع نتيجة تعادل صريحة (${score ? score.expHome + '-' + score.expAway : 'تعادل'})`,
          forebetSummaryAr,
        };
      }
    }

    // 2. TOTAL GOALS (OVER / UNDER) CHECKS WITH xG BACKING
    const xgHome = Number(match.xg_home) || 0;
    const xgAway = Number(match.xg_away) || 0;
    const combinedXg = xgHome + xgAway;

    if (market === 'OVER_1_5') {
      if (score && score.totalGoals < 2 && combinedXg > 0 && combinedXg < 1.75) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أكثر من 1.5 هدف بينما Forebet يتوقع ${score.totalGoals} هدف (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'OVER_2_5') {
      if (score && score.totalGoals < 3 && (combinedXg === 0 || combinedXg < 2.45)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أكثر من 2.5 هدف بينما Forebet يتوقع نتيجة شحيحة (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'OVER_3_5') {
      if (score && score.totalGoals < 4 && (combinedXg === 0 || combinedXg < 3.20)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أكثر من 3.5 هدف بينما Forebet يتوقع ${score.totalGoals} أهداف (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'UNDER_2_5') {
      if (score && score.totalGoals >= 3) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أقل من 2.5 هدف بينما Forebet يتوقع غزارة تهديفية (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
      if (combinedXg >= 2.80) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض xG: معدل الأهداف المتوقعة (${combinedXg.toFixed(2)}) يفوق سقف الأندر 2.5`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'UNDER_3_5') {
      if (score && score.totalGoals >= 4) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أقل من 3.5 هدف بينما Forebet يتوقع ${score.totalGoals} أهداف (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'UNDER_1_5') {
      if (score && score.totalGoals >= 2) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أقل من 1.5 هدف بينما Forebet يتوقع ${score.totalGoals} أهداف (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    // 3. BOTH TEAMS TO SCORE (GG / NG)
    if (market === 'GG_FT') {
      if (score && (score.expHome === 0 || score.expAway === 0)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض التسجيل المتبادل: Forebet يتوقع شباك نظيفة لأحد الطرفين (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
      if (xgHome > 0 && xgAway > 0 && (xgHome < 0.80 || xgAway < 0.80)) {
        return {
          isCompatible: false,
          conflictReasonAr: `ضعف هجومي: أحد الطرفين يمتلك xG ضعيف (${Math.min(xgHome, xgAway).toFixed(2)})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'NG_FT') {
      if (score && score.expHome >= 1 && score.expAway >= 1) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض التسجيل: Forebet يتوقع تسجيل الطرفين معاً (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    // 4. TEAM TOTALS & SPECIAL COMBINATIONS
    if (market === 'HOME_OVER_1_5') {
      if (score && score.expHome < 2 && (xgHome > 0 && xgHome < 1.60)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف المضيف: Forebet يتوقع تسجيل هدف واحد فقط أو أقل للمستضيف (${score.expHome} أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'AWAY_OVER_1_5') {
      if (score && score.expAway < 2 && (xgAway > 0 && xgAway < 1.50)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف الضيف: Forebet يتوقع تسجيل هدف واحد فقط أو أقل للضيف (${score.expAway} أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HOME_WIN_CLEAN_SHEET') {
      if (pred !== '1' || (score && (score.expAway > 0 || score.expHome <= score.expAway))) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض كلين شيت: Forebet لا يرجح فوز المضيف بشباك نظيفة (${score ? score.expHome + '-' + score.expAway : pred})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'AWAY_WIN_CLEAN_SHEET') {
      if (pred !== '2' || (score && (score.expHome > 0 || score.expAway <= score.expHome))) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض كلين شيت: Forebet لا يرجح فوز الضيف بشباك نظيفة (${score ? score.expHome + '-' + score.expAway : pred})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'WIN_AND_OVER_1_5') {
      if (score && (score.totalGoals < 2 || (pred === '1' && score.expHome <= score.expAway) || (pred === '2' && score.expAway <= score.expHome))) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض الفوز والأهداف: توقع Forebet (${score.expHome}-${score.expAway}) لا يطابق شروط الفوز مع +1.5`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'WIN_AND_OVER_2_5') {
      if (score && (score.totalGoals < 3 || (pred === '1' && score.expHome <= score.expAway) || (pred === '2' && score.expAway <= score.expHome))) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض الفوز والأهداف: توقع Forebet (${score.expHome}-${score.expAway}) لا يطابق شروط الفوز مع +2.5`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'WIN_AND_GG') {
      if (score && (score.expHome < 1 || score.expAway < 1 || (pred === '1' && score.expHome <= score.expAway) || (pred === '2' && score.expAway <= score.expHome))) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض الفوز والتسجيل المتبادل: توقع Forebet (${score.expHome}-${score.expAway}) لا يطابق شرط فوز فريق وتسجيل الطرفين`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'OVER_0_5') {
      if (score && score.totalGoals === 0 && combinedXg > 0 && combinedXg < 1.0) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض سلبي تام: Forebet يتوقع تعادل سلبي 0-0 دون أهداف`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'OVER_4_5') {
      if (score && score.totalGoals < 5 && (combinedXg === 0 || combinedXg < 3.80)) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أكثر من 4.5 هدف بينما Forebet يتوقع ${score.totalGoals} أهداف (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'UNDER_4_5') {
      if (score && score.totalGoals >= 5) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف: النظام يتوقع أقل من 4.5 هدف بينما Forebet يتوقع مباراة استعراضية كاسحة (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HOME_OVER_0_5') {
      if (score && score.expHome === 0 && xgHome > 0 && xgHome < 0.80) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف المضيف: Forebet لا يتوقع أي أهداف للمستضيف (0 أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'AWAY_OVER_0_5') {
      if (score && score.expAway === 0 && xgAway > 0 && xgAway < 0.80) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض أهداف الضيف: Forebet لا يتوقع أي أهداف للضيف (0 أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HOME_CLEAN_SHEET') {
      if (score && score.expAway > 0) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض كلين شيت: Forebet يتوقع تسجيل الضيف (${score.expAway} أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'AWAY_CLEAN_SHEET') {
      if (score && score.expHome > 0) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض كلين شيت: Forebet يتوقع تسجيل المضيف (${score.expHome} أهداف)`,
          forebetSummaryAr,
        };
      }
    }

    // 5. HALFTIME & SECOND HALF MARKETS
    if (market === 'HT_1') {
      if (pred === '2' || (score && score.expAway > score.expHome) || p1 < 40) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: عدم وضوح أسبقية المضيف في توقعات Forebet (${score ? score.expHome + '-' + score.expAway : pred})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HT_2') {
      if (pred === '1' || (score && score.expHome > score.expAway) || p2 < 38) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: تفوق المضيف في توقعات Forebet (${score ? score.expHome + '-' + score.expAway : pred})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HT_X') {
      if (score && Math.abs(score.expHome - score.expAway) >= 3) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: فارق أهداف شاسع متوقع لدى Forebet (${score.expHome}-${score.expAway})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'NG_HT') {
      if (score && score.totalGoals >= 4 && combinedXg >= 3.20) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: توقع مباراة نارية غزيرة الأهداف تبطل أمان NG الشوط الأول`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HT_OVER_0_5') {
      if (score && score.totalGoals === 0 && combinedXg < 1.40) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: توقع تعادل سلبي 0-0 عقيم`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'HT_OVER_1_5') {
      if (score && score.totalGoals < 3 && combinedXg < 2.70) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط أول: مجمل أهداف المباراة المتوقع (${score.totalGoals}) لا يدعم شوط أول غزير بـ +1.5 هدف`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'SH_OVER_1_5') {
      if (score && score.totalGoals < 3 && combinedXg < 2.60) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض شوط ثانٍ: إجمالي أهداف المباراة المتوقع (${score.totalGoals}) لا يدعم +1.5 في الشوط الثاني`,
          forebetSummaryAr,
        };
      }
    }

    // 6. TOTAL GOALS PARITY MARKETS
    if (market === 'EVEN_TOTAL_GOALS') {
      if (score && score.totalGoals % 2 !== 0) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض زوجي الأهداف: توقع Forebet (${score.expHome}-${score.expAway}) مجموعه فردي (${score.totalGoals})`,
          forebetSummaryAr,
        };
      }
    }

    if (market === 'ODD_TOTAL_GOALS') {
      if (score && score.totalGoals % 2 === 0) {
        return {
          isCompatible: false,
          conflictReasonAr: `تعارض فردي الأهداف: توقع Forebet (${score.expHome}-${score.expAway}) مجموعه زوجي (${score.totalGoals})`,
          forebetSummaryAr,
        };
      }
    }

    return {
      isCompatible: true,
      forebetSummaryAr,
    };
  }

  /**
   * Fast boolean check for a market
   */
  static isMarketCompatible(market: string, match: Match): boolean {
    return this.checkMarketCompatibility(market, match).isCompatible;
  }

  /**
   * Checks if ALL predictions in a list are compatible with Forebet, or at least one if required.
   */
  static isMatchCompatibleWithMarkets(
    match: Match,
    markets: string[],
    requireAll = false
  ): boolean {
    if (!markets || markets.length === 0) return true;
    if (requireAll) {
      return markets.every((m) => this.isMarketCompatible(m, match));
    }
    return markets.some((m) => this.isMarketCompatible(m, match));
  }

  /**
   * Filter predictions to keep only those that 100% harmoniously agree with Forebet
   */
  static filterCompatiblePredictions<T extends { market: string }>(
    predictions: T[],
    match: Match
  ): T[] {
    return predictions.filter((p) => this.isMarketCompatible(p.market, match));
  }

  /**
   * Filter an array of market string keys to keep only those compatible with Forebet
   */
  static filterCompatibleMarkets(markets: string[], match: Match): string[] {
    return markets.filter((m) => this.isMarketCompatible(m, match));
  }

  /**
   * Generates a descriptive bilingual tactical stance summary of Forebet's forecast
   */
  static getForebetTacticalOrientation(match: Match): {
    stanceAr: string;
    stanceEn: string;
    scoreStr: string;
    predOutcome: string;
    confidence: number;
  } {
    const score = this.parseExpectedScore(match.expected_score);
    const pred = match.pred || 'X';
    const scoreStr = score ? `${score.expHome}-${score.expAway}` : (match.expected_score || 'N/A');
    const p1 = match.p1 || 0;
    const px = match.px || 0;
    const p2 = match.p2 || 0;
    const maxProb = Math.max(p1, px, p2) || 45;

    let stanceAr = 'رؤية متوازنة مع ترجيح التعادل التكتيكي';
    let stanceEn = 'Balanced equilibrium with tactical draw lean';

    if (pred === '1') {
      stanceAr = `أفضلية صريحة لفوز المضيف (${match.home}) بنتيجة متوقعة ${scoreStr}`;
      stanceEn = `Clear home advantage for (${match.home}) with projected score ${scoreStr}`;
    } else if (pred === '2') {
      stanceAr = `أفضلية صريحة لفوز الضيف (${match.away}) بنتيجة متوقعة ${scoreStr}`;
      stanceEn = `Clear away advantage for (${match.away}) with projected score ${scoreStr}`;
    }

    if (score && score.totalGoals >= 3) {
      stanceAr += ' • توقع غزارة تهديفية (+2.5)';
      stanceEn += ' • High goal expectancy (+2.5)';
    } else if (score && score.totalGoals <= 1) {
      stanceAr += ' • توقع مباراة مغلقة دفاعياً';
      stanceEn += ' • Defensive low-scoring match';
    }

    return {
      stanceAr,
      stanceEn,
      scoreStr,
      predOutcome: pred,
      confidence: maxProb,
    };
  }
}
