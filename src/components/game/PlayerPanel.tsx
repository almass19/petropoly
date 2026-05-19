'use client';

import { motion } from 'framer-motion';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import type { PropertyOwnership } from '@/types/game';
import { BOARD } from '@/lib/game/board-data';
import { THEME } from '@/lib/game/theme';

interface Props {
  players: Player[];
  properties: PropertyOwnership[];
  currentPlayerIndex: number;
  mySessionId: string;
}

export default function PlayerPanel({ players, properties, currentPlayerIndex, mySessionId }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-widest text-white/30 px-1 mb-3">Игроки</div>
      {players.map((player, i) => {
        const isActive = i === currentPlayerIndex;
        const isMe = player.session_id === mySessionId;
        const myProps = properties.filter(p => p.owner_session_id === player.session_id);

        return (
          <motion.div
            key={player.session_id}
            className={`rounded-2xl p-3 border transition-all ${
              isActive
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-white/8 bg-white/5'
            } ${player.is_bankrupt ? 'opacity-30' : ''}`}
            animate={{ scale: isActive ? 1.01 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center gap-2.5">
              {/* Токен */}
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-2 border-black/20 shadow-lg font-black text-white text-xs"
                style={{ backgroundColor: PLAYER_COLORS[player.color] }}
              >
                {player.name[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm truncate">{player.name}</span>
                  {isMe && <span className="text-emerald-400 text-xs">(ты)</span>}
                  {player.is_in_jail && <span className="text-xs">👮</span>}
                  {player.is_bankrupt && <span className="text-xs text-red-400">💀</span>}
                </div>
                <div className="text-emerald-400 font-mono font-bold text-base">
                  {player.cash.toLocaleString()}{THEME.currency}
                </div>
              </div>

              {isActive && (
                <div className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
              )}
            </div>

            {myProps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {myProps.slice(0, 5).map(p => {
                  const sq = BOARD[p.square_index];
                  return (
                    <span
                      key={p.square_index}
                      className="text-[0.6rem] px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 truncate max-w-[5rem]"
                    >
                      {sq?.name}
                    </span>
                  );
                })}
                {myProps.length > 5 && (
                  <span className="text-[0.6rem] text-white/30">+{myProps.length - 5}</span>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
