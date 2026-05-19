'use client';

import { BOARD } from '@/lib/game/board-data';
import type { GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import Square from './Square';
import Dice from '../game/Dice';
import { THEME } from '@/lib/game/theme';

interface Props {
  players: Player[];
  properties: PropertyOwnership[];
  gameState?: GameState;
  myPlayer?: Player;
  loading?: boolean;
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

export default function Board({ players, properties, gameState, myPlayer, loading }: Props) {
  const dice = gameState?.last_dice;
  const phase = gameState?.turn_phase;
  const isRolling = !!loading && phase === 'awaiting_roll';
  const currentPlayer = gameState ? players[gameState.current_player_index] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          width: '100%', height: '100%',
          display: 'grid',
          gridTemplateColumns: '2fr repeat(9,1fr) 2fr',
          gridTemplateRows: '2fr repeat(9,1fr) 2fr',
          border: '3px solid #8b5e3c',
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: '#faf6f0',
        }}
      >
        {BOARD.map((square) => {
          const { row, col } = getGridPos(square.index);
          const ownership = properties.find((p) => p.square_index === square.index);
          return (
            <div key={square.index} style={{ gridRow: row, gridColumn: col }}>
              <Square square={square} ownership={ownership} players={players} side={getSide(square.index)} />
            </div>
          );
        })}

        {/* Center */}
        <div
          style={{
            gridRow: '2/11', gridColumn: '2/11',
            background: '#ede8d8',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: 'clamp(6px,1.5vw,18px)',
            gap: 'clamp(4px,1vw,10px)',
            overflow: 'hidden',
          }}
        >
          {/* Title */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 'clamp(1rem,4vw,3.4rem)', fontWeight: 900, color: '#3d1f0a', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {THEME.boardName}
            </div>
            <div style={{ fontSize: 'clamp(0.28rem,0.8vw,0.6rem)', fontWeight: 600, color: '#9e8468', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 2 }}>
              Монополия
            </div>
          </div>

          {/* Dice */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(3px,0.7vw,7px)', flexShrink: 0 }}>
            <Dice die1={dice?.die1 ?? null} die2={dice?.die2 ?? null} rolling={isRolling} />
            {dice && (
              <div style={{ fontSize: 'clamp(0.8rem,3vw,2.2rem)', fontWeight: 900, color: '#3d1f0a', fontFamily: 'monospace' }}>
                {dice.die1 + dice.die2}
              </div>
            )}
          </div>

          {/* Turn indicator */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {currentPlayer && (
              <div style={{ fontSize: 'clamp(0.3rem,0.85vw,0.62rem)', color: '#7c5c3a', fontWeight: 600 }}>
                Ход: {currentPlayer.name}
              </div>
            )}
          </div>

          {/* Player balances */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2px,0.5vw,5px)', justifyContent: 'center', flexShrink: 0 }}>
            {players.filter(p => !p.is_bankrupt).map(p => (
              <div key={p.session_id} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1px,0.3vw,3px)' }}>
                <div style={{ width: 'clamp(4px,1vw,8px)', height: 'clamp(4px,1vw,8px)', borderRadius: '50%', backgroundColor: PLAYER_COLORS[p.color], flexShrink: 0 }} />
                <span style={{ fontSize: 'clamp(0.28rem,0.8vw,0.58rem)', fontWeight: 700, color: '#3d1f0a' }}>{p.name}</span>
                <span style={{ fontSize: 'clamp(0.25rem,0.72vw,0.52rem)', fontFamily: 'monospace', color: '#7c5c3a' }}>{p.cash.toLocaleString()}₸</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
