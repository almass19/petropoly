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

// Маппинг 40 клеток на CSS Grid 12×12
// Углы — 2×2, стороны — 1×2 (повёрнуто)
// Строки/столбцы: 1-12
// Позиции по часовой стрелке начиная с GO (правый нижний угол)
function getGridPos(index: number): { row: string; col: string; rotate: number } {
  // Нижний ряд: 0 (GO) → правый нижний, 1-9 идут влево, 10 → левый нижний
  if (index === 0) return { row: '11 / 13', col: '11 / 13', rotate: 0 };   // GO
  if (index >= 1 && index <= 9) return { row: '11 / 13', col: `${11 - index} / ${12 - index}`, rotate: 0 };
  if (index === 10) return { row: '11 / 13', col: '1 / 3', rotate: 0 };    // Jail

  // Левая сторона: 11-19 снизу вверх
  if (index >= 11 && index <= 19) return { row: `${11 - (index - 10)} / ${12 - (index - 10)}`, col: '1 / 3', rotate: 90 };

  if (index === 20) return { row: '1 / 3', col: '1 / 3', rotate: 0 };      // Free Parking

  // Верхний ряд: 21-29 слева направо
  if (index >= 21 && index <= 29) return { row: '1 / 3', col: `${index - 18} / ${index - 17}`, rotate: 180 };

  if (index === 30) return { row: '1 / 3', col: '11 / 13', rotate: 0 };    // Go to Jail

  // Правая сторона: 31-39 сверху вниз
  if (index >= 31 && index <= 39) return { row: `${index - 29} / ${index - 28}`, col: '11 / 13', rotate: 270 };

  return { row: '1', col: '1', rotate: 0 };
}

export default function Board({ players, properties }: Props) {
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      {/* Внешняя рамка */}
      <div
        className="w-full h-full grid border-2 border-slate-800 rounded-sm bg-emerald-100"
        style={{
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(12, 1fr)',
        }}
      >
        {/* Клетки доски */}
        {BOARD.map((square) => {
          const { row, col, rotate } = getGridPos(square.index);
          const ownership = properties.find((p) => p.square_index === square.index);
          const isCorner = [0, 10, 20, 30].includes(square.index);

          return (
            <div
              key={square.index}
              style={{ gridRow: row, gridColumn: col }}
              className="min-w-0 min-h-0"
            >
              <Square
                square={square}
                ownership={ownership}
                players={players}
                isCorner={isCorner}
                rotation={rotate}
              />
            </div>
          );
        })}

        {/* Центр доски */}
        <div
          style={{ gridRow: '3 / 11', gridColumn: '3 / 11' }}
          className="flex flex-col items-center justify-center gap-2 p-4"
        >
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-black tracking-tight text-emerald-800 leading-none">
              {THEME.boardName}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Монополия
            </div>
          </div>

          {/* Мини-легенда игроков */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-2">
            {players.filter((p) => !p.is_bankrupt).map((p) => (
              <div key={p.session_id} className="flex items-center gap-1 text-[0.6rem] text-slate-600">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getPlayerColorHex(p.color) }}
                />
                <span className="font-medium truncate max-w-[4rem]">{p.name}</span>
                <span className="font-mono text-emerald-700">{p.cash.toLocaleString()}₸</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPlayerColorHex(color: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e',
    yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
  };
  return map[color] ?? '#6b7280';
}
