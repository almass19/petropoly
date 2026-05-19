'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { BOARD } from '@/lib/game/board-data';
import { THEME } from '@/lib/game/theme';

interface Props {
  gameState: GameState;
  myPlayer: Player;
  isMyTurn: boolean;
  properties: PropertyOwnership[];
  allPlayers: Player[];
  onAction: (action: object) => Promise<void>;
  onLoadingChange?: (v: boolean) => void;
}

const C = {
  section: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 14px' } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 },
  btn: (bg: string, disabled = false): React.CSSProperties => ({
    width: '100%', padding: '12px 16px', fontSize: 15, fontWeight: 800,
    color: 'white', backgroundColor: bg, border: 'none', borderRadius: 12,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, lineHeight: 1.2,
  }),
  btnSm: (bg: string, disabled = false): React.CSSProperties => ({
    width: '100%', padding: '9px 14px', fontSize: 13, fontWeight: 700,
    color: 'white', backgroundColor: bg, border: 'none', borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
  }),
  btnGhost: (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '8px 14px', fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
  }),
};

const PHASE_LABEL: Record<string, string> = {
  awaiting_roll: 'Бросьте кубики',
  dice_rolled: 'Кубики брошены',
  player_moved: 'Перемещение…',
  handling_square: 'Обработка…',
  action_required: 'Требуется действие',
  turn_ended: 'Ход завершён',
};

export default function ActionPanel({ gameState, myPlayer, isMyTurn, properties, allPlayers, onAction, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(false);

  const phase = gameState.turn_phase;
  const pendingCard = (gameState as { pending_card?: { text: string } }).pending_card;
  const currentSquare = BOARD[myPlayer.position];
  const squareOwnership = properties.find(p => p.square_index === myPlayer.position);
  const ownerPlayer = squareOwnership?.owner_session_id
    ? allPlayers.find(p => p.session_id === squareOwnership.owner_session_id)
    : null;
  const isOwnable = currentSquare?.type === 'property' || currentSquare?.type === 'railroad' || currentSquare?.type === 'utility';
  const canBuy = phase === 'action_required' && isOwnable && !squareOwnership?.owner_session_id;
  const canEndTurn = phase === 'turn_ended' || phase === 'handling_square'
    || (phase === 'action_required' && !canBuy && !pendingCard);
  const buyPrice = (BOARD[myPlayer.position] as { price?: number }).price ?? 0;
  const currentPlayer = allPlayers[gameState.current_player_index];

  async function act(action: object) {
    setLoading(true);
    onLoadingChange?.(true);
    try { await onAction(action); } finally { setLoading(false); onLoadingChange?.(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Turn status */}
      <div style={C.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={C.label}>{isMyTurn ? 'Ваш ход' : 'Ход игрока'}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
              {isMyTurn ? myPlayer.name : (currentPlayer?.name ?? '—')}
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            backgroundColor: isMyTurn ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            color: isMyTurn ? '#34d399' : 'rgba(255,255,255,0.3)',
            border: isMyTurn ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.08)',
          }}>
            {PHASE_LABEL[phase] ?? phase}
          </div>
        </div>
      </div>

      {/* Current position */}
      <div style={C.section}>
        <div style={C.label}>Позиция</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{currentSquare?.name ?? '—'}</div>
        {myPlayer.is_in_jail && (
          <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 4, fontWeight: 600 }}>
            Под стражей · {myPlayer.jail_turns}/3 хода
          </div>
        )}
        {ownerPlayer && ownerPlayer.session_id !== myPlayer.session_id && (
          <div style={{ fontSize: 12, color: '#f87171', marginTop: 4, fontWeight: 600 }}>
            Владелец: {ownerPlayer.name}
          </div>
        )}
        {ownerPlayer && ownerPlayer.session_id === myPlayer.session_id && (
          <div style={{ fontSize: 12, color: '#34d399', marginTop: 4, fontWeight: 600 }}>
            Ваша собственность
          </div>
        )}
      </div>

      {/* Pending card */}
      <AnimatePresence>
        {pendingCard && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ ...C.section, backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <div style={{ ...C.label, color: '#fbbf24' }}>
              {currentSquare?.type === 'chance' ? THEME.chanceName : THEME.communityChestName}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
              {pendingCard.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {isMyTurn ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Roll */}
          {phase === 'awaiting_roll' && !myPlayer.is_in_jail && (
            <button onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })} disabled={loading}
              style={{ ...C.btn('#10b981', loading), boxShadow: loading ? 'none' : '0 4px 18px rgba(16,185,129,0.4)' }}>
              {loading ? '…' : 'Бросить кубики'}
            </button>
          )}

          {/* In jail */}
          {phase === 'awaiting_roll' && myPlayer.is_in_jail && (
            <>
              <button onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })} disabled={loading}
                style={C.btnSm('#10b981', loading)}>
                {loading ? '…' : 'Бросить (нужен дубль)'}
              </button>
              <button onClick={() => act({ type: 'PAY_BAIL', sessionId: myPlayer.session_id })}
                disabled={loading || myPlayer.cash < THEME.bailPrice}
                style={C.btnSm('#d97706', loading || myPlayer.cash < THEME.bailPrice)}>
                Залог {THEME.bailPrice.toLocaleString()}₸
              </button>
            </>
          )}

          {/* Buy property */}
          {canBuy && (
            <>
              <button onClick={() => act({ type: 'BUY_PROPERTY', sessionId: myPlayer.session_id, squareIndex: myPlayer.position })}
                disabled={loading || myPlayer.cash < buyPrice}
                style={{ ...C.btn('#2563eb', loading || myPlayer.cash < buyPrice), boxShadow: loading ? 'none' : '0 4px 18px rgba(37,99,235,0.4)' }}>
                Купить · {buyPrice.toLocaleString()}₸
              </button>
              <button onClick={() => act({ type: 'DECLINE_PURCHASE', sessionId: myPlayer.session_id })} disabled={loading}
                style={C.btnGhost(loading)}>
                Пропустить
              </button>
            </>
          )}

          {/* Accept card */}
          {pendingCard && (
            <button onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })} disabled={loading}
              style={C.btnSm('#d97706', loading)}>
              Принять и продолжить
            </button>
          )}

          {/* End turn */}
          {isMyTurn && canEndTurn && !canBuy && !pendingCard && (
            <button onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })} disabled={loading}
              style={C.btn('#475569', loading)}>
              {loading ? '…' : 'Следующий ход'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ ...C.section, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
            Ждём {currentPlayer?.name}…
          </span>
        </div>
      )}
    </div>
  );
}
