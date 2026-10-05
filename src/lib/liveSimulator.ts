export class OfflineLiveSimulator {
  /**
   * Generates deterministic, minute-by-minute scores for active mock simulation matches
   * based on the math seed and current elapsed milliseconds.
   */
  static getLiveState(
    kickoffOrXgHome: string | number,
    xgAwayOrHome: number,
    idOrAway?: string | number,
    maybeId?: string
  ): {
    status: 'UPCOMING' | 'LIVE_1ST' | 'HT' | 'LIVE_2ND' | 'FINISHED';
    elapsedMinutes: number;
    goalsH: number;
    goalsA: number;
    timeLabel: string;
  } {
    let kickoffStr = '';
    let xgHome = 1.25;
    let xgAway = 1.05;
    let matchId = 'sim_game';

    if (typeof kickoffOrXgHome === 'string') {
      kickoffStr = kickoffOrXgHome;
      xgHome = xgAwayOrHome;
      xgAway = typeof idOrAway === 'number' ? idOrAway : 1.0;
      matchId = maybeId || 'sim_game';
    } else {
      xgHome = kickoffOrXgHome;
      xgAway = xgAwayOrHome;
      matchId = String(idOrAway || 'sim_game');
    }

    const now = new Date();
    let isForcedSim = matchId.startsWith('forced_sim_');

    let totalOffsetMinutes = 0;

    if (isForcedSim) {
      // Decode simulated elapsed offset from timestamp keys
      try {
        const parts = matchId.split('_');
        const ts = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(ts)) {
          totalOffsetMinutes = Math.floor((now.getTime() - ts) / 60000) + 25; // start at 25 minutes ago
        }
      } catch (e) {
        totalOffsetMinutes = 45;
      }
    } else if (kickoffStr) {
      try {
        const kickoffTime = this.parseKickoffDate(kickoffStr);
        if (kickoffTime.getTime() === 0) {
          totalOffsetMinutes = -10;
        } else {
          totalOffsetMinutes = Math.floor((now.getTime() - kickoffTime.getTime()) / 60000);
        }
      } catch (err) {
        totalOffsetMinutes = -10; // upcoming fallback
      }
    } else {
      totalOffsetMinutes = 15; // default live status for demo matches
    }

    if (isNaN(totalOffsetMinutes) || totalOffsetMinutes < 0) {
      return { status: 'UPCOMING', elapsedMinutes: 0, goalsH: 0, goalsA: 0, timeLabel: 'Upcoming' };
    }

    if (totalOffsetMinutes > 105) {
      // Deterministic final score simulator
      const finalH = this.poissonRandom(xgHome, matchId + '_h_final');
      const finalA = this.poissonRandom(xgAway, matchId + '_a_final');
      return { status: 'FINISHED', elapsedMinutes: 90, goalsH: finalH, goalsA: finalA, timeLabel: 'Full Time' };
    }

    let status: 'LIVE_1ST' | 'HT' | 'LIVE_2ND' = 'LIVE_1ST';
    let elapsedMinutes = totalOffsetMinutes;
    let timeLabel = '0\'';

    if (totalOffsetMinutes <= 45) {
      status = 'LIVE_1ST';
      elapsedMinutes = totalOffsetMinutes;
      timeLabel = `${elapsedMinutes}'`;
    } else if (totalOffsetMinutes <= 60) {
      status = 'HT';
      elapsedMinutes = 45;
      timeLabel = 'Half Time';
    } else {
      status = 'LIVE_2ND';
      elapsedMinutes = Math.min(90, totalOffsetMinutes - 15);
      timeLabel = `${elapsedMinutes}'`;
    }

    // Seeded progressive goals based on current elapsed fraction of 90 minutes
    const fraction = elapsedMinutes / 90;
    const goalsH = this.poissonRandom(xgHome * fraction, matchId + '_h_live');
    const goalsA = this.poissonRandom(xgAway * fraction, matchId + '_a_live');

    return {
      status,
      elapsedMinutes,
      goalsH,
      goalsA,
      timeLabel,
    };
  }

  /**
   * Extremely robust helper to parse various kickoff date-time strings reliably
   */
  private static parseKickoffDate(dateStr: string): Date {
    try {
      if (!dateStr || typeof dateStr !== 'string') return new Date(0);
      const parts = dateStr.trim().split(/\s+/);
      const datePart = parts[0];
      const timePart = parts[1] || '00:00';
      
      const dateParts = datePart.split(/[\/\-\.]/);
      if (dateParts.length < 3) {
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? new Date(0) : parsed;
      }
      
      const timeParts = timePart.split(':');
      const hour = parseInt(timeParts[0] || '0', 10);
      const minute = parseInt(timeParts[1] || '0', 10);
      
      let day = 1;
      let month = 0; // 0-indexed for Jan
      let year = 1970;
      
      if (dateParts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10) - 1;
        day = parseInt(dateParts[2], 10);
      } else {
        // DD/MM/YYYY or MM/DD/YYYY
        const part0 = parseInt(dateParts[0], 10);
        const part1 = parseInt(dateParts[1], 10);
        const part2 = parseInt(dateParts[2], 10);
        
        if (part2 > 1000) {
          year = part2;
          day = part0;
          month = part1 - 1;
        } else {
          year = part0;
          month = part1 - 1;
          day = part2;
        }
      }
      return new Date(year, month, day, hour, minute);
    } catch (e) {
      return new Date(0);
    }
  }

  /**
   * Deterministic simple Poisson generator based on math seed string
   */
  private static poissonRandom(lambda: number, seedStr: string): number {
    let hash = 0;
    for (let c = 0; c < seedStr.length; c++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(c);
      hash |= 0;
    }
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    let randomAdd = Math.abs(Math.sin(hash)) * 10000;
    
    do {
      k++;
      const randValue = (randomAdd * k) % 1;
      p *= randValue;
    } while (p > L && k < 12);

    return Math.max(0, k - 1);
  }
}
export default OfflineLiveSimulator;
