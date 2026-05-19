'use client';

import { useState } from 'react';
import type { Square as SquareType, PropertySquare } from '@/types/board';
import type { PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import PropertyCard from './PropertyCard';

type Side = 'bottom' | 'left' | 'top' | 'right' | 'corner';

const COLOR_HEX: Record<string, string> = {
  brown:  '#8B4513',
  cyan:   '#00BFFF',
  pink:   '#FF1493',
  orange: '#FF8C00',
  red:    '#DC143C',
  yellow: '#FFD700',
  green:  '#228B22',
  blue:   '#00008B',
};

// Special square backgrounds
const SPECIAL_BG: Record<string, string> = {
  go:               '#d1fae5',
  jail:             '#fef3c7',
  free_parking:     '#dbeafe',
  go_to_jail:       '#fee2e2',
  chance:           '#ffedd5',
  community_chest:  '#f3e8ff',
  tax:              '#fee2e2',
};

// Special square labels (no emojis)
const SPECIAL_LABEL: Record<string, { line1: string; line2?: string; color: string }> = {
  go:              { line1: 'ПОЛУЧКА',            color: '#166534' },
  jail:            { line1: 'У НАЧАЛЬНИКА',       color: '#92400e' },
  free_parking:    { line1: 'ПЕРЕКУР',             color: '#1e40af' },
  go_to_jail:      { line1: 'К НАЧАЛЬНИКУ',        color: '#991b1b' },
  chance:          { line1: '?',                   color: '#c2410c' },
  community_chest: { line1: '!',                   color: '#7e22ce' },
  tax:             { line1: '',                    color: '#991b1b' },
};

interface Props {
  square: SquareType;
  ownership?: PropertyOwnership;
  players: Player[];
  side: Side;
}

export default function Square({ square, ownership, players, side }: Props) {
  const [showCard, setShowCard] = useState(false);
  const playersHere = players.filter(p => p.position === square.index && !p.is_bankrupt);
  const isOwnable = square.type === 'property' || square.type === 'railroad' || square.type === 'utility';
  const isCorner = side === 'corner';
  const colorBar = square.type === 'property' ? COLOR_HEX[(square as PropertySquare).color] : null;

  const bg = colorBar ? '#fff' : (SPECIAL_BG[square.type] ?? '#fff');
  const special = SPECIAL_LABEL[square.type];

  // Strip position by side
  const stripStyle: React.CSSProperties | null = colorBar ? {
    position: 'absolute',
    background: colorBar,
    ...(side === 'bottom'                ? { top: 0, left: 0, right: 0, height: 8 }  :
        side === 'top'                   ? { bottom: 0, left: 0, right: 0, height: 8 } :
        side === 'left'                  ? { top: 0, bottom: 0, right: 0, width: 8 }  :
        side === 'right'                 ? { top: 0, bottom: 0, left: 0, width: 8 }   :
                                           { top: 0, left: 0, right: 0, height: 8 }),
  } : null;

  // Railroad color bar (dark)
  const railStrip: React.CSSProperties | null = square.type === 'railroad' ? {
    position: 'absolute',
    background: '#1e293b',
    ...(side === 'bottom' || isCorner ? { top: 0, left: 0, right: 0, height: 6 } :
        side === 'top'                ? { bottom: 0, left: 0, right: 0, height: 6 } :
        side === 'left'               ? { top: 0, bottom: 0, right: 0, width: 6 } :
                                        { top: 0, bottom: 0, left: 0, width: 6 }),
  } : null;

  const price = isOwnable ? (square as { price: number }).price : 0;
  const ownerPlayer = ownership?.owner_session_id
    ? players.find(p => p.session_id === ownership.owner_session_id)
    : null;

  return (
    <>
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          background: bg,
          border: '1px solid #d1c9b8',
          cursor: isOwnable ? 'pointer' : 'default',
        }}
        onClick={() => isOwnable && setShowCard(true)}
      >
        {stripStyle && <div style={stripStyle} />}
        {railStrip && <div style={railStrip} />}

        {/* Corner squares */}
        {isCorner && special && (
          <div className="flex flex-col items-center justify-center h-full w-full p-1 gap-0.5">
            {square.type === 'go' && (
              <>
                <div style={{ fontSize: 'clamp(0.45rem, 1.5vw, 0.9rem)', fontWeight: 900, color: '#166534', textAlign: 'center', lineHeight: 1.1 }}>
                  ПОЛУЧКА
                </div>
                <div style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#166534' }}>↩</div>
              </>
            )}
            {square.type === 'jail' && (
              <>
                <div style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.7rem)', fontWeight: 800, color: '#92400e', textAlign: 'center', lineHeight: 1.1 }}>
                  У НАЧА-ЛЬНИКА
                </div>
                {/* Решётка */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 3px) ', gap: '2px', padding: '2px' }}>
                  {Array.from({length: 4}).map((_, i) => (
                    <div key={i} style={{ width: 2, height: 'clamp(8px, 2vw, 16px)', background: '#92400e', borderRadius: 1 }} />
                  ))}
                </div>
              </>
            )}
            {square.type === 'free_parking' && (
              <>
                <div style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.7rem)', fontWeight: 800, color: '#1e40af', textAlign: 'center', lineHeight: 1.1 }}>
                  ПЕРЕКУР
                </div>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 1.4rem)', color: '#1e40af', fontWeight: 900 }}>P</div>
              </>
            )}
            {square.type === 'go_to_jail' && (
              <>
                <div style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.65rem)', fontWeight: 800, color: '#991b1b', textAlign: 'center', lineHeight: 1.1 }}>
                  К НАЧА-ЛЬНИКУ!
                </div>
                <div style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.6rem)', color: '#991b1b', fontWeight: 900 }}>→</div>
              </>
            )}
          </div>
        )}

        {/* Non-corner squares */}
        {!isCorner && (
          <div
            className="flex flex-col items-center justify-center w-full h-full"
            style={{
              padding: colorBar
                ? (side === 'bottom' ? '10px 2px 2px' :
                   side === 'top'    ? '2px 2px 10px' :
                   side === 'left'   ? '2px 10px 2px 2px' :
                                       '2px 2px 2px 10px')
                : '2px',
              gap: 1,
            }}
          >
            {/* Chance / Community */}
            {(square.type === 'chance' || square.type === 'community_chest') && (
              <div
                className="font-black text-center"
                style={{
                  fontSize: 'clamp(0.8rem, 2.5vw, 1.6rem)',
                  color: square.type === 'chance' ? '#c2410c' : '#7e22ce',
                  lineHeight: 1,
                }}
              >
                {square.type === 'chance' ? '?' : '!'}
              </div>
            )}

            {/* Name */}
            <div
              className="text-center font-bold text-slate-800 leading-tight"
              style={{
                fontSize: 'clamp(0.3rem, 0.8vw, 0.55rem)',
                wordBreak: 'break-word',
                hyphens: 'auto',
                maxWidth: '100%',
              }}
            >
              {square.name}
            </div>

            {/* Price */}
            {price > 0 && (
              <div
                className="font-mono font-semibold text-slate-500 text-center"
                style={{ fontSize: 'clamp(0.25rem, 0.65vw, 0.45rem)' }}
              >
                {price.toLocaleString()}₸
              </div>
            )}

            {/* Tax amount */}
            {square.type === 'tax' && (
              <div
                className="font-mono font-black text-red-600 text-center"
                style={{ fontSize: 'clamp(0.3rem, 0.8vw, 0.5rem)' }}
              >
                −{(square as { amount: number }).amount.toLocaleString()}₸
              </div>
            )}

            {/* Railroad icon: simple lines */}
            {square.type === 'railroad' && (
              <div className="flex gap-0.5">
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: 'clamp(1px,0.3vw,2px)', height: 'clamp(4px,1vw,8px)', background: '#1e293b', borderRadius: 1 }} />
                ))}
              </div>
            )}

            {/* Owner dot */}
            {ownerPlayer && (
              <div
                className="rounded-full"
                style={{
                  width: 'clamp(4px, 1vw, 7px)',
                  height: 'clamp(4px, 1vw, 7px)',
                  background: PLAYER_COLORS[ownerPlayer.color],
                  boxShadow: `0 0 4px ${PLAYER_COLORS[ownerPlayer.color]}`,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        )}

        {/* Player tokens */}
        {playersHere.length > 0 && (
          <div
            className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5 flex-wrap pointer-events-none"
          >
            {playersHere.map(p => (
              <div
                key={p.session_id}
                title={p.name}
                className="rounded-full border-2 border-white shadow-md"
                style={{
                  width: 'clamp(7px, 1.8vw, 14px)',
                  height: 'clamp(7px, 1.8vw, 14px)',
                  background: PLAYER_COLORS[p.color],
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Houses */}
        {ownership?.houses && ownership.houses > 0 && (
          <div className="absolute top-0.5 left-0.5 flex gap-0.5">
            {Array.from({ length: Math.min(ownership.houses, 5) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 'clamp(3px, 0.8vw, 6px)',
                  height: 'clamp(4px, 1vw, 8px)',
                  background: ownership.houses >= 5 ? '#dc2626' : '#16a34a',
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showCard && isOwnable && (
        <PropertyCard square={square} ownership={ownership} players={players} onClose={() => setShowCard(false)} />
      )}
    </>
  );
}
