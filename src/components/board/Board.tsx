'use client';

import { useState } from 'react';
import { BOARD } from '@/lib/game/board-data';
import type { GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import type { PropertySquare } from '@/types/board';
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

const PROP_COLORS: Record<string, string> = {
  brown: '#8B4513', cyan: '#00BFFF', pink: '#FF1493', orange: '#FF8C00',
  red: '#DC143C', yellow: '#FFD700', green: '#228B22', blue: '#00008B',
};

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

function propDotColor(squareIndex: number): string | null {
  const sq = BOARD[squareIndex];
  if (!sq) return null;
  if (sq.type === 'property') return PROP_COLORS[(sq as PropertySquare).color] ?? null;
  if (sq.type === 'railroad') return '#334155';
  if (sq.type === 'utility') return '#7c3aed';
  return null;
}

const S = {
  btn: (bg: string, disabled = false): React.CSSProperties => ({
    width: '100%',
    padding: 'clamp(4px,1.2vw,11px) clamp(6px,1.5vw,14px)',
    fontSize: 'clamp(0.5rem,1.7vw,0.95rem)',
    fontWeight: 800,
    color: 'white',
    backgroundColor: bg,
    border: 'none',
    borderRadius: 'clamp(5px,1.1vw,10px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'opacity 0.15s',
    lineHeight: 1.2,
  }),
  btnSoft: (disabled = false): React.CSSProperties => ({
    width: '100%',
    padding: 'clamp(3px,0.9vw,8px)',
    fontSize: 'clamp(0.4rem,1.2vw,0.72rem)',
    fontWeight: 600,
    color: '#4b3d2e',
    backgroundColor: '#d5cbbf',
    border: 'none',
    borderRadius: 'clamp(4px,1vw,9px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }),
} as const;

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
    phase === 'turn_ended' || phase === 'handling_square' ||
    (phase === 'action_required' && !canBuy && !pendingCard)
  );
  const canRoll = isMyTurn && phase === 'awaiting_roll' && !myPlayer?.is_in_jail;
  const isInJail = isMyTurn && phase === 'awaiting_roll' && myPlayer?.is_in_jail;
  const currentPlayer = gameState ? players[gameState.current_player_index] : null;
  const buyPrice = (BOARD[myPlayer?.position ?? 0] as { price?: number }).price ?? 0;

  async function act(action: object) {
    if (!onAction) return;
    setLoading(true);
    try { await onAction(action); } finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'relative', width: 'min(100vw,100vh)', height: 'min(100vw,100vh)', flexShrink: 0 }}>
      <div
        className="absolute inset-0 -z-10 rounded-2xl"
        style={{ boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 8px 20px rgba(0,0,0,0.3)' }}
      />
      <div
        style={{
          width: '100%', height: '100%',
          display: 'grid',
          gridTemplateColumns: '2fr repeat(9,1fr) 2fr',
          gridTemplateRows: '2fr repeat(9,1fr) 2fr',
          border: '4px solid #8b5e3c',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#faf6f0',
        }}
      >
        {/* Board squares */}
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

        {/* ===== CENTER ===== */}
        <div
          style={{
            gridRow: '2/11', gridColumn: '2/11',
            display: 'flex',
            backgroundColor: '#ede8d8',
            overflow: 'hidden',
          }}
        >
          {/* LEFT: Players */}
          <div
            style={{
              width: '42%',
              borderRight: '1px solid rgba(0,0,0,0.1)',
              padding: 'clamp(4px,1.2vw,14px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(3px,0.7vw,7px)',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: 'clamp(0.28rem,0.75vw,0.55rem)', fontWeight: 800, color: '#9e8468', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
              Игроки
            </div>

            {players.map((player) => {
              const isActive = player.session_id === currentPlayer?.session_id;
              const isMe = player.session_id === myPlayer?.session_id;
              const ownedProps = properties.filter(po => po.owner_session_id === player.session_id);
              return (
                <div
                  key={player.session_id}
                  style={{
                    backgroundColor: isActive ? 'rgba(22,163,74,0.1)' : 'rgba(255,255,255,0.55)',
                    border: isActive ? '1px solid rgba(22,163,74,0.35)' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: 'clamp(4px,1vw,9px)',
                    padding: 'clamp(3px,0.8vw,8px)',
                    opacity: player.is_bankrupt ? 0.35 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(2px,0.4vw,4px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px,0.7vw,7px)' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 'clamp(14px,3.5vw,30px)', height: 'clamp(14px,3.5vw,30px)',
                      borderRadius: '50%', backgroundColor: PLAYER_COLORS[player.color],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'clamp(0.32rem,0.9vw,0.7rem)', fontWeight: 900, color: 'white', flexShrink: 0,
                    }}>
                      {player.name[0]?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(0.3rem,0.85vw,0.62rem)', fontWeight: 700, color: '#2d1a08', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.name}{isMe ? ' (ты)' : ''}
                        {player.is_in_jail ? ' ✘' : ''}
                      </div>
                      <div style={{ fontSize: 'clamp(0.28rem,0.8vw,0.58rem)', fontFamily: 'monospace', fontWeight: 700, color: player.cash < 2000 ? '#dc2626' : '#16a34a' }}>
                        {player.cash.toLocaleString()}₸
                      </div>
                    </div>

                    {isActive && (
                      <div style={{ width: 'clamp(5px,1.1vw,9px)', height: 'clamp(5px,1.1vw,9px)', borderRadius: '50%', backgroundColor: '#16a34a', boxShadow: '0 0 6px #16a34a', flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Property color dots */}
                  {ownedProps.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1px,0.3vw,3px)', paddingLeft: 'clamp(17px,4.2vw,37px)' }}>
                      {ownedProps.map(po => {
                        const color = propDotColor(po.square_index);
                        if (!color) return null;
                        return (
                          <div key={po.square_index} title={BOARD[po.square_index]?.name} style={{
                            width: 'clamp(5px,1.2vw,10px)', height: 'clamp(5px,1.2vw,10px)',
                            borderRadius: 2, backgroundColor: color,
                          }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Controls */}
          <div style={{
            width: '58%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            padding: 'clamp(6px,1.8vw,20px) clamp(4px,1.2vw,14px)',
            gap: 'clamp(3px,0.8vw,8px)',
          }}>
            {/* Title */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 'clamp(1rem,4vw,3.2rem)', fontWeight: 900, color: '#3d1f0a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {THEME.boardName}
              </div>
              <div style={{ fontSize: 'clamp(0.26rem,0.75vw,0.55rem)', fontWeight: 600, color: '#9e8468', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 2 }}>
                Монополия
              </div>
            </div>

            {/* Dice */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(2px,0.5vw,5px)', flexShrink: 0 }}>
              <Dice die1={dice?.die1 ?? null} die2={dice?.die2 ?? null} rolling={loading && phase === 'awaiting_roll'} />
              {dice && (
                <div style={{ fontSize: 'clamp(0.75rem,2.8vw,2rem)', fontWeight: 900, color: '#3d1f0a', fontFamily: 'monospace' }}>
                  {dice.die1 + dice.die2}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ width: '100%', maxWidth: 'clamp(90px,24vw,210px)', display: 'flex', flexDirection: 'column', gap: 'clamp(2px,0.6vw,6px)', flexShrink: 0 }}>
              {myPlayer && isMyTurn ? (
                <>
                  {canRoll && (
                    <button onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })} disabled={loading} style={{ ...S.btn('#16a34a', loading), boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,0.5)' }}>
                      {loading ? '…' : 'Бросить кубики'}
                    </button>
                  )}

                  {isInJail && <>
                    <button onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })} disabled={loading} style={S.btn('#16a34a', loading)}>
                      {loading ? '…' : 'Дубль (из тюрьмы)'}
                    </button>
                    <button onClick={() => act({ type: 'PAY_BAIL', sessionId: myPlayer.session_id })} disabled={loading || myPlayer.cash < THEME.bailPrice} style={S.btn('#b45309', loading || myPlayer.cash < THEME.bailPrice)}>
                      Залог {THEME.bailPrice.toLocaleString()}₸
                    </button>
                  </>}

                  {canBuy && <>
                    <div style={{ textAlign: 'center', fontSize: 'clamp(0.32rem,1vw,0.65rem)', fontWeight: 600, color: '#3d1f0a', lineHeight: 1.3 }}>
                      {currentSquare?.name}
                    </div>
                    <button onClick={() => act({ type: 'BUY_PROPERTY', sessionId: myPlayer.session_id, squareIndex: myPlayer.position })} disabled={loading || myPlayer.cash < buyPrice} style={{ ...S.btn('#1d4ed8', loading || myPlayer.cash < buyPrice), boxShadow: loading ? 'none' : '0 4px 14px rgba(29,78,216,0.45)' }}>
                      Купить {buyPrice.toLocaleString()}₸
                    </button>
                    <button onClick={() => act({ type: 'DECLINE_PURCHASE', sessionId: myPlayer.session_id })} disabled={loading} style={S.btnSoft(loading)}>
                      Пропустить
                    </button>
                  </>}

                  {pendingCard && <>
                    <div style={{ textAlign: 'center', fontSize: 'clamp(0.3rem,0.95vw,0.65rem)', color: '#78350f', lineHeight: 1.35, padding: '0 2px' }}>
                      {pendingCard.text}
                    </div>
                    <button onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })} disabled={loading} style={S.btn('#b45309', loading)}>
                      Принять
                    </button>
                  </>}

                  {canEndTurn && !canBuy && !pendingCard && (
                    <button onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })} disabled={loading} style={S.btn('#475569', loading)}>
                      {loading ? '…' : 'Следующий ход'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 'clamp(0.3rem,0.9vw,0.65rem)', color: '#9e8c6d', fontWeight: 500, lineHeight: 1.4 }}>
                  {currentPlayer ? `Ход ${currentPlayer.name}…` : ''}
                </div>
              )}
            </div>

            {/* Current position label */}
            {currentSquare && phase && phase !== 'awaiting_roll' && (
              <div style={{ textAlign: 'center', fontSize: 'clamp(0.27rem,0.8vw,0.58rem)', color: '#9e7c5a', fontWeight: 500, flexShrink: 0 }}>
                {currentSquare.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
