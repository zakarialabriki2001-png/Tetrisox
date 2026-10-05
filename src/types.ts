export interface Match {
  id: string;
  home: string;
  away: string;
  kickoff: string; // ISO string e.g. "2026-10-04T19:00:00Z"
  league_code: string;
  league_name: string;
  xg_home: number;
  xg_away: number;
  p1: number; // probability home wins (%)
  px: number; // probability draw (%)
  p2: number; // probability away wins (%)
  ft_home?: number | null;
  ft_away?: number | null;
  
  // Tactical Stats
  avg_shots_on_target_home?: number;
  avg_shots_on_target_away?: number;
  avg_corners_home?: number;
  avg_corners_away?: number;
  
  // Simulated Live Fields
  status?: 'UPCOMING' | 'LIVE' | 'FINISHED';
  minute?: number;
  live_home_goals?: number;
  live_away_goals?: number;
  live_corners_home?: number;
  live_corners_away?: number;
  live_sot_home?: number;
  live_sot_away?: number;
  
  __parsedTime?: number;
}

export interface OracleDatabase {
  matches: Record<string, Match>;
  global_stats: {
    total_picks: number;
    correct_picks: number;
    win_rate: number;
    daily_history: Record<string, { total: number; correct: number }>;
  };
}
