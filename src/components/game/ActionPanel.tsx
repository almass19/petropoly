'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';
import { BOARD } from '@/lib/game/board-data';
import { THEME } from '@/lib/game/theme';
import type { PropertySquare } from '@/types/board';
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
  const squareOwnership = properties.find(p => p.square_index === myPlayer.position);
  const isOwnable = currentSquare?.type === 'property' || currentSquare?.type === 'railroad' || currentSquare?.type === 'utility';
  const canBuy = phase === 'action_required' && isOwnable && !squareOwnership?.owner_session_id;
  const pendingCard = (gameState as { pending_card?: { id: string; text: string } }).pending_card;
  const canEndTurn = phase === 'turn_ended' || phase === 'handling_square'
    || (phase === 'action_required' && !canBuy && !pendingCard);

  async function act(action: object) {
    setLoading(true);
    try { await onAction(action); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      {/* Кубики */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <Dice die1={dice?.die1 ?? null} die2={dice?.die2 ?? null} rolling={loading && phase === 'awaiting_roll'} />
          {dice && (
            <div className="text-right ml-auto">
              <div className="text-3xl font-black text-white">{dice.die1 + dice.die2}</div>
              <div className="text-xs text-white/40 uppercase tracking-wide">очков</div>
            </div>
          )}
        </div>
      </div>

      {/* Текущая клетка */}
      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="text-2xl">
          {currentSquare?.type === 'jail' || myPlayer.is_in_jail ? '👮' :
           currentSquare?.type === 'chance' ? '❓' :
           currentSquare?.type === 'community_chest' ? '🤝' :
           currentSquare?.type === 'go_to_jail' ? '🚨' :
           currentSquare?.type === 'go' ? '💰' :
           currentSquare?.type === 'free_parking' ? '☕' :
           currentSquare?.type === 'tax' ? '💸' :
           currentSquare?.type === 'railroad' ? '🚗' :
           currentSquare?.type === 'utility' ? '🏠' : '📍'}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{currentSquare?.name}</div>
          {myPlayer.is_in_jail && (
            <div className="text-amber-400 text-xs mt-0.5">В тюрьме · {myPlayer.jail_turns}/3 хода</div>
          )}
        </div>
      </div>

      {/* Карточка события */}
      <AnimatePresence>
        {pendingCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4"
          >
            <div className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              {currentSquare?.type === 'chance' ? '❓ ' + THEME.chanceName : '🤝 ' + THEME.communityChestName}
            </div>
            <p className="text-white text-sm font-medium leading-relaxed">{pendingCard.text}</p>
            {isMyTurn && (
              <button
                onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
                disabled={loading}
                className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Принять и закрыть
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Действия */}
      {isMyTurn ? (
        <div className="space-y-2">
          {phase === 'awaiting_roll' && !myPlayer.is_in_jail && (
            <button
              onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })}
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-lg rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
            >
              {loading ? '...' : '🎲 Бросить кубики'}
            </button>
          )}

          {phase === 'awaiting_roll' && myPlayer.is_in_jail && (
            <div className="space-y-2">
              <button
                onClick={() => act({ type: 'ROLL_DICE', sessionId: myPlayer.session_id })}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all disabled:opacity-50"
              >
                {loading ? '...' : '🎲 Бросить (нужен дубль)'}
              </button>
              <button
                onClick={() => act({ type: 'PAY_BAIL', sessionId: myPlayer.session_id })}
                disabled={loading || myPlayer.cash < THEME.bailPrice}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl transition-all disabled:opacity-40 text-sm"
              >
                💸 Заплатить залог ({THEME.bailPrice.toLocaleString()}₸)
              </button>
            </div>
          )}

          {canBuy && (
            <div className="space-y-2">
              <button
                onClick={() => act({ type: 'BUY_PROPERTY', sessionId: myPlayer.session_id, squareIndex: myPlayer.position })}
                disabled={loading || myPlayer.cash < ((BOARD[myPlayer.position] as { price?: number }).price ?? 0)}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white font-black text-base rounded-2xl transition-all disabled:opacity-40 shadow-lg shadow-blue-500/30"
              >
                🏠 Купить · {((BOARD[myPlayer.position] as { price?: number }).price ?? 0).toLocaleString()}₸
              </button>
              <div className="text-center text-xs text-white/40 font-medium">«{currentSquare?.name}»</div>
              <button
                onClick={() => act({ type: 'DECLINE_PURCHASE', sessionId: myPlayer.session_id })}
                disabled={loading}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-xl transition-all text-sm border border-white/10"
              >
                Пропустить
              </button>
            </div>
          )}

          {canEndTurn && !canBuy && !pendingCard && (
            <button
              onClick={() => act({ type: 'END_TURN', sessionId: myPlayer.session_id })}
              disabled={loading}
              className="w-full py-4 bg-slate-600 hover:bg-slate-500 active:scale-95 text-white font-bold text-base rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? '...' : '➡️ Следующий ход'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-white/40 text-sm">Ждём хода другого игрока…</div>
        </div>
      )}
    </div>
  );
}
