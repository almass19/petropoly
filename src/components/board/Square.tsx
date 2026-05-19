'use client';

import type { Square as SquareType } from '@/types/board';
import type { PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import { THEME } from '@/lib/game/theme';
import { useState } from 'react';
import PropertyCard from './PropertyCard';

const COLOR_MAP: Record<string, string> = {
  brown: '#92400e',
  cyan: '#06b6d4',
  pink: '#ec4899',
  orange: '#f97316',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#1d4ed8',
};

const SQUARE_BG: Record<string, string> = {
  go: 'bg-emerald-50',
  jail: 'bg-amber-50',
  free_parking: 'bg-sky-50',
  go_to_jail: 'bg-red-50',
  chance: 'bg-orange-50',
  community_chest: 'bg-purple-50',
  tax: 'bg-rose-50',
  property: 'bg-white',
  railroad: 'bg-slate-50',
  utility: 'bg-teal-50',
};

interface Props {
  square: SquareType;
  ownership?: PropertyOwnership;
  players: Player[];
  isCorner?: boolean;
  rotation?: number;
}

export default function Square({ square, ownership, players, isCorner, rotation = 0 }: Props) {
  const [showCard, setShowCard] = useState(false);
  const playersHere = players.filter((p) => p.position === square.index && !p.is_bankrupt);
  const bg = SQUARE_BG[square.type] ?? 'bg-white';
  const canClick = square.type === 'property' || square.type === 'railroad' || square.type === 'utility';

  return (
    <>
      <div
        className={`
          relative flex flex-col items-center justify-between border border-slate-200
          ${bg} ${canClick ? 'cursor-pointer hover:brightness-95 transition-all' : ''}
          ${isCorner ? 'p-1' : 'p-0.5'}
          overflow-hidden select-none text-center
        `}
        style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        onClick={() => canClick && setShowCard(true)}
      >
        {/* Цветная полоска для недвижимости */}
        {square.type === 'property' && (
          <div
            className="w-full h-2 shrink-0 rounded-sm"
            style={{ backgroundColor: COLOR_MAP[square.color] }}
          />
        )}

        {/* Название */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-0.5">
          <span className="text-[0.45rem] sm:text-[0.55rem] font-medium leading-tight text-slate-700 break-words hyphens-auto">
            {square.name}
          </span>

          {/* Цена */}
          {(square.type === 'property' || square.type === 'railroad' || square.type === 'utility') && (
            <span className="text-[0.4rem] text-slate-400 font-mono">
              {(square as { price: number }).price.toLocaleString()}₸
            </span>
          )}

          {/* Налог */}
          {square.type === 'tax' && (
            <span className="text-[0.4rem] text-red-500 font-mono">-{square.amount}₸</span>
          )}

          {/* Символы специальных клеток */}
          {square.type === 'go' && <span className="text-sm">💰</span>}
          {square.type === 'jail' && <span className="text-sm">👮</span>}
          {square.type === 'free_parking' && <span className="text-sm">☕</span>}
          {square.type === 'go_to_jail' && <span className="text-sm">🚨</span>}
          {square.type === 'chance' && <span className="text-sm">🎲</span>}
          {square.type === 'community_chest' && <span className="text-sm">🤝</span>}
          {square.type === 'railroad' && <span className="text-sm">🚗</span>}
          {square.type === 'utility' && <span className="text-sm">🏠</span>}
        </div>

        {/* Владелец */}
        {ownership?.owner_session_id && (
          <div className="w-full flex justify-center pb-0.5">
            <div
              className="w-2 h-2 rounded-full border border-white shadow-sm"
              style={{
                backgroundColor: PLAYER_COLORS[
                  players.find((p) => p.session_id === ownership.owner_session_id)?.color ?? 'blue'
                ],
              }}
            />
          </div>
        )}

        {/* Дома */}
        {ownership?.houses && ownership.houses > 0 && (
          <div className="absolute top-0.5 right-0.5 text-[0.5rem] leading-none">
            {ownership.houses >= 5 ? '🏨' : '🏠'.repeat(ownership.houses)}
          </div>
        )}

        {/* Токены игроков */}
        {playersHere.length > 0 && (
          <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5 flex-wrap">
            {playersHere.map((p) => (
              <div
                key={p.session_id}
                className="w-2.5 h-2.5 rounded-full border border-white shadow"
                style={{ backgroundColor: PLAYER_COLORS[p.color] }}
                title={p.name}
              />
            ))}
          </div>
        )}
      </div>

      {showCard && canClick && (
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
