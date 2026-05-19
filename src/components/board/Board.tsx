'use client';

import { useState } from 'react';
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
  isMyTurn?: boolean;
  onAction?: (action: object) => Promise<void>;
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

export default function Board({ players, properties, gameState, myPlayer, isMyTurn, onAction }: Props) {
  const [loading, setLoading] = useState(false);

  const dice = gameState?.last_dice;
  const phase = gameState?.turn_phase;
  const pendingCard = (gameState as { pending_card?: { text: string } } | undefined)?.pending_card;

  const currentSquare = myPlayer ? BOARD[myPlayer.position] : null;
  const squareOwnership = myPlayer ? properties.find(p => p.square_index === myPlayer.position) : null;
  const isOwnable = currentSquare?.type === 'property' || currentSquare?.type === 'railroad' || currentSquare?.type === 'utility';
  const canBuy = phase === 'action_required' && isOwnable && !squareOwnership?.owner_session_id;
  const canEndTurn = isMyTurn && (
    phase === 'turn_ended' ||
    phase === 'handling_square' ||
    (phase === 'action_required' && !canBuy && !pendingCard)
  );
  const canRoll = isMyTurn && phase === 'awaiting_roll' && !myPlayer?.is_in_jail;
  const isInJail = isMyTurn && phase === 'awaiting_roll' && myPlayer?.is_in_jail;

  async function act(action: object) {
    if (!onAction) return;
    setLoading(true);
    try { await onAction(action); } finally { setLoading(false); }
  }

  return (
    <div
      className="relative mx-auto"
      style={{ height: '100%', aspectRatio: '1 / 1', maxHeight: '100%', maxWidth: '100%' }}
    >
      <div
        className="absolute inset-0 -z-10 rounded-2xl"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)' }}
      />

      <div
        className="w-full h-full rounded-xl overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(9, 1fr) 2fr',
          gridTemplateRows: '2fr repeat(9, 1fr) 2fr',
          border: '4px solid #8b5e3c',
          backgroundColor: '#faf6f0',
        }}
      >
        {BOARD.map((square) => {
          const { row, col } = getGridPos(square.index);
          const side = getSide(square.index);
          const ownership = properties.find((p) => p.square_index === square.index);
          return (
            <div key={square.index} style={{ gridRow: row, gridColumn: col }}>
              <Square square={square} ownership={ownership} players={players} side={side} />
            </div>
          );
        })}

        {/* Board center */}
        <div
          style={{ gridRow: '2 / 11', gridColumn: '2 / 11', background: '#f0ead8' }}
          className="flex flex-col items-center justify-between py-3 px-2 select-none overflow-hidden"
        >
          {/* Title */}
          <div className="text-center shrink-0">
            <div
              className="font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(0.9rem, 3.5vw, 2.8rem)', color: '#3d1f0a' }}
            >
              {THEME.boardName}
            </div>
            <div
              className="font-semibold tracking-[0.15em] uppercase mt-0.5"
              style={{ fontSize: 'clamp(0.3rem, 1vw, 0.7rem)', color: '#7c5c3a' }}
            >
              Монополия
            </div>
          </div>

          {/* Dice area */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {gameState ? (
              <>
                <Dice
                  die1={dice?.die1 ?? null}
                  die2={dice?.die2 ?? null}
                  rolling={loading && phase === 'awaiting_roll'}
                />
                {dice && (
                  <div
                    className="font-black tabular-nums"
                    style={{ fontSize: 'clamp(0.7rem, 2.5vw, 1.6rem)', color: '#3d1f0a' }}
                  >
                    {dice.die1 + dice.die2}
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2 opacity-20">
                <div className="bg-white rounded-xl border-2 border-amber-900/30" style={{ width: 'clamp(28px,6vw,48px)', height: 'clamp(28px,6vw,48px)' }} />
                <div className="bg-white rounded-xl border-2 border-amber-900/30" style={{ width: 'clamp(28px,6vw,48px)', height: 'clamp(28px,6vw,48px)' }} />
              </div>
            )}
          </div>

          {/* Action zone */}
          <div className="w-full flex flex-col gap-1.5 items-center shrink-0" style={{ maxWidth: 'clamp(80px, 20vw, 180px)' }}>
            {myPlayer && isMyTurn ? (
              <>
                {/* Roll */}
                {canRoll && (
                  <button
                    onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })}
                    disabled={loading}
                    className="w-full font-black text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      fontSize: 'clamp(0.55rem, 1.8vw, 1rem)',
                      padding: 'clamp(4px, 1.2vw, 10px) clamp(8px, 2vw, 16px)',
                      backgroundColor: '#16a34a',
                      boxShadow: '0 3px 10px rgba(22,163,74,0.45)',
                    }}
                  >
                    {loading ? '...' : 'Бросить'}
                  </button>
                )}

                {/* In jail options */}
                {isInJail && (
                  <>
                    <button
                      onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })}
                      disabled={loading}
                      className="w-full font-bold text-white rounded-xl transition-all disabled:opacity-50"
                      style={{
                        fontSize: 'clamp(0.45rem, 1.4vw, 0.8rem)',
                        padding: 'clamp(3px, 1vw, 8px)',
                        backgroundColor: '#16a34a',
                      }}
                    >
                      {loading ? '...' : 'Дубль (из тюрьмы)'}
                    </button>
                    <button
                      onClick={() => act({ type: 'PAY_BAIL', sessionId: myPlayer.session_id })}
                      disabled={loading || myPlayer.cash < THEME.bailPrice}
                      className="w-full font-bold text-white rounded-xl transition-all disabled:opacity-40"
                      style={{
                        fontSize: 'clamp(0.4rem, 1.3vw, 0.75rem)',
                        padding: 'clamp(3px, 0.9vw, 7px)',
                        backgroundColor: '#b45309',
                      }}
                    >
                      Залог {THEME.bailPrice.toLocaleString()}₸
                    </button>
                  </>
                )}

                {/* Buy property */}
                {canBuy && (
                  <>
                    <div
                      className="text-center font-semibold leading-tight"
                      style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.65rem)', color: '#3d1f0a' }}
                    >
                      {currentSquare?.name}
                    </div>
                    <button
                      onClick={() => act({ type: 'BUY_PROPERTY', sessionId: myPlayer.session_id, squareIndex: myPlayer.position })}
                      disabled={loading || myPlayer.cash < ((BOARD[myPlayer.position] as { price?: number }).price ?? 0)}
                      className="w-full font-black text-white rounded-xl transition-all disabled:opacity-40"
                      style={{
                        fontSize: 'clamp(0.5rem, 1.6vw, 0.9rem)',
                        padding: 'clamp(4px, 1.1vw, 9px)',
                        backgroundColor: '#1d4ed8',
                        boxShadow: '0 3px 10px rgba(29,78,216,0.4)',
                      }}
                    >
                      {((BOARD[myPlayer.position] as { price?: number }).price ?? 0).toLocaleString()}₸
                    </button>
                    <button
                      onClick={() => act({ type: 'DECLINE_PURCHASE', sessionId: myPlayer.session_id })}
                      disabled={loading}
                      className="w-full font-medium rounded-xl transition-all"
                      style={{
                        fontSize: 'clamp(0.4rem, 1.2vw, 0.7rem)',
                        padding: 'clamp(2px, 0.8vw, 6px)',
                        backgroundColor: '#d1c9b8',
                        color: '#4b3d2e',
                      }}
                    >
                      Пропустить
                    </button>
                  </>
                )}

                {/* Pending card */}
                {pendingCard && (
                  <>
                    <div
                      className="text-center font-medium leading-tight px-1"
                      style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.65rem)', color: '#78350f' }}
                    >
                      {pendingCard.text}
                    </div>
                    <button
                      onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
                      disabled={loading}
                      className="w-full font-bold text-white rounded-xl transition-all disabled:opacity-50"
                      style={{
                        fontSize: 'clamp(0.45rem, 1.3vw, 0.75rem)',
                        padding: 'clamp(3px, 0.9vw, 7px)',
                        backgroundColor: '#b45309',
                      }}
                    >
                      Принять
                    </button>
                  </>
                )}

                {/* End turn */}
                {canEndTurn && !canBuy && !pendingCard && (
                  <button
                    onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
                    disabled={loading}
                    className="w-full font-bold text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      fontSize: 'clamp(0.55rem, 1.8vw, 1rem)',
                      padding: 'clamp(4px, 1.2vw, 10px)',
                      backgroundColor: '#475569',
                    }}
                  >
                    {loading ? '...' : 'Следующий ход'}
                  </button>
                )}
              </>
            ) : gameState ? (
              <div
                className="text-center font-medium"
                style={{ fontSize: 'clamp(0.35rem, 1.1vw, 0.65rem)', color: '#9e8c6d' }}
              >
                Ход другого игрока
              </div>
            ) : null}
          </div>

          {/* Player balances */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center shrink-0">
            {players.filter(p => !p.is_bankrupt).map(p => (
              <div key={p.session_id} className="flex items-center gap-0.5">
                <div
                  className="rounded-full shrink-0"
                  style={{
                    width: 'clamp(4px, 1vw, 8px)',
                    height: 'clamp(4px, 1vw, 8px)',
                    backgroundColor: PLAYER_COLORS[p.color],
                  }}
                />
                <span style={{ fontSize: 'clamp(0.3rem, 0.9vw, 0.6rem)', color: '#3d1f0a', fontWeight: 700 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 'clamp(0.28rem, 0.85vw, 0.55rem)', color: '#7c5c3a', fontFamily: 'monospace' }}>
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
