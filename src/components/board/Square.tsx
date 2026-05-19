'use client';

import { useState } from 'react';
import type { Square as SquareType, PropertySquare } from '@/types/board';
import type { PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import PropertyCard from './PropertyCard';

type Side = 'bottom' | 'left' | 'top' | 'right' | 'corner';

const COLOR_HEX: Record<string, string> = {
  brown: '#92400e', cyan: '#0891b2', pink: '#db2777',
  orange: '#ea580c', red: '#dc2626', yellow: '#ca8a04',
  green: '#16a34a', blue: '#1d4ed8',
};

const SQUARE_EMOJI: Record<string, string> = {
  go: '💰', jail: '👮', free_parking: '☕',
  go_to_jail: '🚨', chance: '❓', community_chest: '🤝',
  railroad: '🚗', utility: '🏠', tax: '💸',
};

const SQUARE_BG: Record<string, string> = {
  go: '#ecfdf5', jail: '#fef9c3', free_parking: '#f0f9ff',
  go_to_jail: '#fff1f2', chance: '#fff7ed', community_chest: '#faf5ff',
  tax: '#fff1f2', property: '#fffbf0', railroad: '#f8fafc', utility: '#f0fdfa',
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
  const isHorizontal = side === 'left' || side === 'right';

  const bg = SQUARE_BG[square.type] ?? '#fffbf0';
  const colorBar = square.type === 'property' ? COLOR_HEX[(square as PropertySquare).color] : null;

  // Цветная полоса: позиция зависит от стороны
  const barStyle: React.CSSProperties = colorBar ? (() => {
    const base = { position: 'absolute' as const, backgroundColor: colorBar };
    if (side === 'bottom' || side === 'corner') return { ...base, top: 0, left: 0, right: 0, height: '6px' };
    if (side === 'top') return { ...base, bottom: 0, left: 0, right: 0, height: '6px' };
    if (side === 'left') return { ...base, top: 0, bottom: 0, right: 0, width: '6px' };
    return { ...base, top: 0, bottom: 0, left: 0, width: '6px' };
  })() : {};

  return (
    <>
      <div
        className="relative w-full h-full border border-amber-200/60 flex overflow-hidden select-none"
        style={{
          backgroundColor: bg,
          cursor: isOwnable ? 'pointer' : 'default',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: isCorner ? 'center' : (isHorizontal ? 'flex-start' : 'flex-start'),
        }}
        onClick={() => isOwnable && setShowCard(true)}
      >
        {colorBar && <div style={barStyle} />}

        {/* Контент */}
        <div
          className="flex flex-col items-center justify-center w-full h-full gap-0.5 overflow-hidden"
          style={{
            padding: isCorner ? '4px' : '2px',
            paddingTop: (side === 'bottom' && colorBar) ? '10px' : undefined,
            paddingBottom: (side === 'top' && colorBar) ? '10px' : undefined,
            paddingRight: (side === 'left' && colorBar) ? '10px' : undefined,
            paddingLeft: (side === 'right' && colorBar) ? '10px' : undefined,
          }}
        >
          {/* Иконка */}
          {!colorBar && (
            <span style={{ fontSize: isCorner ? 'clamp(1rem, 2.5vw, 1.8rem)' : 'clamp(0.5rem, 1.4vw, 0.9rem)' }}>
              {SQUARE_EMOJI[square.type] ?? ''}
            </span>
          )}

          {/* Название */}
          <div
            className="font-bold text-center text-slate-800 leading-tight"
            style={{
              fontSize: isCorner
                ? 'clamp(0.5rem, 1.2vw, 0.8rem)'
                : 'clamp(0.35rem, 0.9vw, 0.6rem)',
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {square.name}
          </div>

          {/* Цена */}
          {isOwnable && (
            <div
              className="font-mono font-semibold text-slate-500"
              style={{ fontSize: 'clamp(0.3rem, 0.75vw, 0.5rem)' }}
            >
              {(square as { price: number }).price.toLocaleString()}₸
            </div>
          )}

          {/* Налог */}
          {square.type === 'tax' && (
            <div className="font-mono font-bold text-red-600" style={{ fontSize: 'clamp(0.3rem, 0.75vw, 0.5rem)' }}>
              -{(square as { amount: number }).amount.toLocaleString()}₸
            </div>
          )}

          {/* Владелец (точка) */}
          {ownership?.owner_session_id && (
            <div
              className="rounded-full border border-white shadow-sm shrink-0"
              style={{
                width: 'clamp(4px, 1vw, 8px)',
                height: 'clamp(4px, 1vw, 8px)',
                backgroundColor: PLAYER_COLORS[
                  players.find(p => p.session_id === ownership.owner_session_id)?.color ?? 'blue'
                ],
              }}
            />
          )}
        </div>

        {/* Токены игроков */}
        {playersHere.length > 0 && (
          <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5 flex-wrap pointer-events-none">
            {playersHere.map(p => (
              <div
                key={p.session_id}
                className="rounded-full border border-white shadow-md"
                style={{
                  width: 'clamp(6px, 1.6vw, 12px)',
                  height: 'clamp(6px, 1.6vw, 12px)',
                  backgroundColor: PLAYER_COLORS[p.color],
                }}
                title={p.name}
              />
            ))}
          </div>
        )}

        {/* Дома/отель */}
        {ownership?.houses && ownership.houses > 0 && (
          <div className="absolute top-0.5 right-0.5 text-[0.45rem] leading-none">
            {ownership.houses >= 5 ? '🏨' : '🏠'.repeat(Math.min(ownership.houses, 4))}
          </div>
        )}
      </div>

      {showCard && isOwnable && (
        <PropertyCard
          square={square}
          ownership={ownership}
          players={players}
          onClose={() => setShowCard(false)}
        />
      )}
    </>
  );
}
