import React, { useMemo, useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import { Match, SignalSummary } from '../types';

interface VirtualizedMatchListProps {
  matches: Match[];
  signals: Record<string, SignalSummary>;
  liveMatches: any[];
}

const VirtualizedMatchList: React.FC<VirtualizedMatchListProps> = ({ matches, signals, liveMatches }) => {
  const ITEM_HEIGHT = 184; // Optimized row height for the 168px enlarged cards with elegant vertical padding
  const VIEWPORT_HEIGHT = 800;
  const [scrollTop, setScrollTop] = useState(0);
  const [cols, setCols] = useState(2);

  // Setup grid columns: exactly 2 columns on tablet/desktop, 1 column on mobile devices
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 768) {
        setCols(2);
      } else {
        setCols(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize live info map for O(1) lookup during virtualized scroll
  const liveInfoMap = useMemo(() => {
    const map = new Map<string, any>();
    liveMatches.forEach(item => {
      if (item.match?.match_id) {
        map.set(item.match.match_id, item);
      }
    });
    return map;
  }, [liveMatches]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Group matches into grid row chunks based on columns
  const chunkedRows = useMemo(() => {
    const chunks: Match[][] = [];
    for (let i = 0; i < matches.length; i += cols) {
      chunks.push(matches.slice(i, i + cols));
    }
    return chunks;
  }, [matches, cols]);

  const totalRows = chunkedRows.length;
  // Determine indexes of virtualized row items to render with a small dynamic buffer
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 1);
  const endIndex = Math.min(totalRows - 1, Math.floor((scrollTop + VIEWPORT_HEIGHT) / ITEM_HEIGHT) + 1);

  // Calculate row records that fall under our current viewport slice
  const visibleRows = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const rowMatches = chunkedRows[i];
      if (rowMatches) {
        items.push({ rowMatches, index: i });
      }
    }
    return items;
  }, [startIndex, endIndex, chunkedRows]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-sm">
        No matches active under current selection.
      </div>
    );
  }

  return (
    <div 
      onScroll={handleScroll}
      className="w-full h-[800px] overflow-y-auto rounded-2xl border border-slate-900 bg-slate-950/20 scrollbar-hide relative-scroll-viewport"
      style={{ scrollbarWidth: 'none', position: 'relative' }}
    >
      <div 
        style={{ 
          height: totalRows * ITEM_HEIGHT, 
          position: 'relative', 
          width: '100%' 
        }}
      >
        {visibleRows.map(({ rowMatches, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * ITEM_HEIGHT,
              left: 0,
              right: 0,
              height: ITEM_HEIGHT,
            }}
            className="px-1 py-[7px]"
          >
            <div 
              className="grid gap-2.5 w-full"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {rowMatches.map((item, colIdx) => (
                <MatchCard
                  key={item.match_id || `${index}-${colIdx}`}
                  match={item}
                  sigInfo={signals[item.signal_code]}
                  liveInfo={liveInfoMap.get(item.match_id)}
                  allMatches={matches}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedMatchList;
