'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { BOARD } from '@/lib/game/board-data';
import { THEME } from '@/lib/game/theme';
import Dice from './Dice';

interface Props {
  gameState: GameState;
  myPlayer: Player;
  isMyTurn: boolean;
  properties: PropertyOwnership[];
  allPlayers: Player[];
  onAction: (action: object) => Promise<void>;
}

export default function ActionPanel({ gameState, myPlayer, isMyTurn, properties, allPlayers, onAction }: Props) {
  const [loading, setLoading] = useState(false);

  const dice = gameState.last_dice;
  const phase = gameState.turn_phase;
  const currentSquare = BOARD[myPlayer.position];
  const squareOwnership = properties.find((p) => p.square_index === myPlayer.position);
  const canBuy = phase === 'action_required'
    && (currentSquare?.type === 'property' || currentSquare?.type === 'railroad' || currentSquare?.type === 'utility')
    && !squareOwnership?.owner_session_id;
  const pendingCard = (gameState as { pending_card?: { id: string; text: string } }).pending_card;

  async function act(action: object) {
    setLoading(true);
    try { await onAction(action); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      {/* Кубики */}
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <Dice die1={dice?.die1 ?? null} die2={dice?.die2 ?? null} rolling={loading && phase === 'awaiting_roll'} />
      </div>

      {/* Моё положение */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-600">
        <span className="font-medium text-slate-800">{currentSquare?.name}</span>
        {myPlayer.is_in_jail && (
          <span className="ml-2 text-amber-600 text-xs">👮 В тюрьме ({myPlayer.jail_turns}/3 хода)</span>
        )}
      </div>

      {/* Карточка события */}
      <AnimatePresence>
        {pendingCard && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800"
          >
            <div className="font-semibold text-xs uppercase tracking-wide text-orange-500 mb-1">
              {currentSquare?.type === 'chance' ? THEME.chanceName : THEME.communityChestName}
            </div>
            {pendingCard.text}
            {isMyTurn && (
              <button
                onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
                className="mt-2 w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
                disabled={loading}
              >
                Принять
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Действия текущего игрока */}
      {isMyTurn && (
        <div className="space-y-2">
          {phase === 'awaiting_roll' && (
            <button
              onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-base shadow-md"
            >
              🎲 Бросить кубики
            </button>
          )}

          {phase === 'awaiting_roll' && myPlayer.is_in_jail && (
            <button
              onClick={() => act({ type: 'PAY_BAIL', sessionId: myPlayer.session_id })}
              disabled={loading || myPlayer.cash < THEME.bailPrice}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all disabled:opacity-40 text-sm"
            >
              💸 Заплатить залог ({THEME.bailPrice.toLocaleString()}₸)
            </button>
          )}

          {canBuy && (
            <div className="space-y-1.5">
              <button
                onClick={() => act({ type: 'BUY_PROPERTY', sessionId: myPlayer.session_id, squareIndex: myPlayer.position })}
                disabled={loading || myPlayer.cash < ((BOARD[myPlayer.position] as { price?: number }).price ?? 0)}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-40 text-sm"
              >
                🏠 Купить «{currentSquare?.name}» за {((BOARD[myPlayer.position] as { price?: number }).price ?? 0).toLocaleString()}₸
              </button>
              <button
                onClick={() => act({ type: 'DECLINE_PURCHASE', sessionId: myPlayer.session_id })}
                disabled={loading}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all text-sm"
              >
                Не покупать
              </button>
            </div>
          )}

          {(phase === 'turn_ended' || (phase === 'action_required' && !canBuy && !pendingCard)) && (
            <button
              onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
              disabled={loading}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition-all text-sm"
            >
              ➡️ Следующий игрок
            </button>
          )}
        </div>
      )}

      {!isMyTurn && (
        <div className="p-3 bg-slate-50 rounded-xl text-center text-sm text-slate-400">
          Ждём хода другого игрока…
        </div>
      )}
    </div>
  );
}
