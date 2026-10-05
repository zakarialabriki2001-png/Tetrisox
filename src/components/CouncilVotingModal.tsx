// Neutral placeholder for the council voting modal.
// The original source file was missing from the exported project. Replace with the real file.
import React from 'react';
import { X } from 'lucide-react';
import { MatchCouncilVerdict } from '../lib/butterflyGovernorEngine';

interface CouncilVotingModalProps {
  verdict: MatchCouncilVerdict;
  isOpen: boolean;
  onClose: () => void;
}

export const CouncilVotingModal: React.FC<CouncilVotingModalProps> = ({ verdict, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black">Council Voting</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-slate-300">{verdict.summary}</p>
        {verdict.votes.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs">
            {verdict.votes.map((v) => (
              <li key={v.agent} className={v.approve ? 'text-emerald-400' : 'text-rose-400'}>
                {v.agent}: {v.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
