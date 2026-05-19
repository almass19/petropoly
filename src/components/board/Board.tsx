'use client';

import { BOARD } from '@/lib/game/board-data';
import type { PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import Square from './Square';
import { THEME } from '@/lib/game/theme';

interface Props {
  players: Player[];
  properties: PropertyOwnership[];
}

type Side = 'bottom' | 'left' | 'top' | 'right' | 'corner';

function getSide(index: number): Side {
  if ([0, 10, 20, 30].includes(index)) return 'corner';
  if (index >= 1 && index <= 9) return 'bottom';
  if (index >= 11 && index <= 19) return 'left';
  if (index >= 21 && index <= 29) return 'top';
  return 'right';
}

function getGridPos(index: number): { row: number; col: number } {
  if (index === 0) return { row: 11, col: 11 };
  if (index >= 1 && index <= 9) return { row: 11, col: 11 - index };
  if (index === 10) return { row: 11, col: 1 };
  if (index >= 11 && index <= 19) return { row: 11 - (index - 10), col: 1 };
  if (index === 20) return { row: 1, col: 1 };
  if (index >= 21 && index <= 29) return { row: 1, col: index - 19 };
  if (index === 30) return { row: 1, col: 11 };
  return { row: index - 29, col: 11 };
}

export default function Board({ players, properties }: Props) {
  return (
    <div className="w-full aspect-square max-w-[680px] mx-auto relative">
      {/* Внешняя тень и рамка */}
      <div className="absolute inset-0 rounded-2xl shadow-2xl bg-amber-900/20 blur-xl scale-95 -z-10" />

      <div
        className="w-full h-full rounded-xl overflow-hidden border-4 border-amber-900"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(9, 1fr) 2fr',
          gridTemplateRows: '2fr repeat(9, 1fr) 2fr',
          backgroundColor: '#2d5a27',
        }}
      >
        {BOARD.map((square) => {
          const { row, col } = getGridPos(square.index);
          const side = getSide(square.index);
          const ownership = properties.find((p) => p.square_index === square.index);

          return (
            <div
              key={square.index}
              style={{ gridRow: row, gridColumn: col }}
            >
              <Square
                square={square}
                ownership={ownership}
                players={players}
                side={side}
              />
            </div>
          );
        })}

        {/* Центр */}
        <div
          style={{ gridRow: '2 / 11', gridColumn: '2 / 11' }}
          className="flex flex-col items-center justify-center gap-3 p-4 select-none"
        >
          {/* Логотип */}
          <div className="text-center">
            <div
              className="font-black text-green-900 leading-none tracking-tight"
              style={{ fontSize: 'clamp(1.4rem, 5vw, 3.5rem)' }}
            >
              {THEME.boardName}
            </div>
            <div className="text-green-800 font-semibold text-[clamp(0.5rem,1.2vw,0.85rem)] tracking-[0.2em] uppercase mt-1">
              Монополия
            </div>
          </div>

          {/* Монетка-декор */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-4 border-yellow-700 flex items-center justify-center shadow-lg">
            <span className="text-yellow-900 font-black" style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>₸</span>
          </div>

          {/* Игроки */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
            {players.filter(p => !p.is_bankrupt).map(p => (
              <div key={p.session_id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(p.color) }} />
                <span className="text-green-900 font-bold" style={{ fontSize: 'clamp(0.45rem, 1.2vw, 0.75rem)' }}>
                  {p.name}
                </span>
                <span className="text-green-700 font-mono" style={{ fontSize: 'clamp(0.4rem, 1vw, 0.65rem)' }}>
                  {p.cash.toLocaleString()}₸
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
  };
  return map[color] ?? '#6b7280';
}
