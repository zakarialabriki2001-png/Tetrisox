// Neutral placeholder for the Butterfly Governor engine.
// The original source file was missing from the exported project. This stand-in
// never vetoes a match and passes predictions through unchanged, so the rest of
// the app behaves as if the governor were disabled. Replace with the real file.
import { Match } from '../types';

export type CouncilDecision = 'CERTIFIED_ELITE' | 'APPROVED_SHIELDED' | 'VETOED';

export interface CouncilVote {
  agent: string;
  approve: boolean;
  reason: string;
}

export interface MatchCouncilVerdict {
  decision: CouncilDecision;
  approvalCount: number;
  votes: CouncilVote[];
  summary: string;
}

export interface EvolvedCouncilPrediction {
  market: string;
  avg_odds: number;
  calculatedWinRate: number;
  isCouncilTransformed: boolean;
}

const NEUTRAL_VERDICT: MatchCouncilVerdict = {
  decision: 'APPROVED_SHIELDED',
  approvalCount: 0,
  votes: [],
  summary: 'Council engine unavailable — predictions shown unchanged.',
};

export class ButterflyGovernorEngine {
  static evaluateMatchCouncil(_match: Match, _history: Match[] = []): MatchCouncilVerdict {
    return NEUTRAL_VERDICT;
  }

  static getSovereignCouncilPredictions(
    match: Match,
    predictions: EvolvedCouncilPrediction[],
    allMatches: Match[] = []
  ): { verdict: MatchCouncilVerdict; suitability: number; evolvedPredictions: EvolvedCouncilPrediction[] } {
    return {
      verdict: ButterflyGovernorEngine.evaluateMatchCouncil(match, allMatches),
      suitability: 0,
      evolvedPredictions: predictions,
    };
  }
}
