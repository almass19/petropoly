'use client';

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
}

const PHASE_LABEL: Record<string, string> = {
  awaiting_roll:    'Бросьте кубики',
  dice_rolled:      'Кубики брошены',
  player_moved:     'Перемещение…',
  handling_square:  'Обработка клетки…',
  action_required:  'Требуется действие',
  turn_ended:       'Ход завершён',
};

export default function ActionPanel({ gameState, myPlayer, isMyTurn, properties, allPlayers }: Props) {
  const phase = gameState.turn_phase;
  const currentSquare = BOARD[myPlayer.position];
  const squareOwnership = properties.find(p => p.square_index === myPlayer.position);
  const ownerPlayer = squareOwnership?.owner_session_id
    ? allPlayers.find(p => p.session_id === squareOwnership.owner_session_id)
    : null;
  const pendingCard = (gameState as { pending_card?: { text: string } }).pending_card;
  const isOwnable = currentSquare?.type === 'property' || currentSquare?.type === 'railroad' || currentSquare?.type === 'utility';
  const price = isOwnable ? (currentSquare as { price: number }).price : 0;

  const currentPlayer = allPlayers[gameState.current_player_index];

  return (
    <div className="space-y-2">
      {/* Turn status */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isMyTurn ? 'Ваш ход' : `Ход игрока`}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {isMyTurn ? myPlayer.name : currentPlayer?.name ?? '—'}
          </div>
        </div>
        <div
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: isMyTurn ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            color: isMyTurn ? '#34d399' : 'rgba(255,255,255,0.3)',
            border: isMyTurn ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {PHASE_LABEL[phase] ?? phase}
        </div>
      </div>

      {/* Current square */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Позиция
        </div>
        <div className="text-sm font-semibold text-white">{currentSquare?.name ?? '—'}</div>

        {myPlayer.is_in_jail && (
          <div className="text-xs mt-1 font-medium" style={{ color: '#fbbf24' }}>
            Под стражей · {myPlayer.jail_turns}/3 хода
          </div>
        )}

        {isOwnable && price > 0 && (
          <div className="text-xs mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {price.toLocaleString()}₸
          </div>
        )}

        {ownerPlayer && ownerPlayer.session_id !== myPlayer.session_id && (
          <div className="text-xs mt-1 font-medium" style={{ color: '#f87171' }}>
            Владелец: {ownerPlayer.name}
          </div>
        )}

        {ownerPlayer && ownerPlayer.session_id === myPlayer.session_id && (
          <div className="text-xs mt-1 font-medium" style={{ color: '#34d399' }}>
            Ваша собственность
          </div>
        )}
      </div>

      {/* Pending card info */}
      <AnimatePresence>
        {pendingCard && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#fbbf24' }}>
              {currentSquare?.type === 'chance' ? THEME.chanceName : THEME.communityChestName}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {pendingCard.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting message */}
      {!isMyTurn && (
        <div
          className="rounded-2xl px-4 py-3 text-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Ждём ход {currentPlayer?.name}…
          </div>
        </div>
      )}
    </div>
  );
}
