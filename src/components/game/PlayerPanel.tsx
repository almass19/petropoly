'use client';

import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import type { PropertyOwnership } from '@/types/game';
import { BOARD } from '@/lib/game/board-data';
import { THEME } from '@/lib/game/theme';
import { motion } from 'framer-motion';

interface Props {
  players: Player[];
  properties: PropertyOwnership[];
  currentPlayerIndex: number;
  mySessionId: string;
}

export default function PlayerPanel({ players, properties, currentPlayerIndex, mySessionId }: Props) {
  return (
    <div className="space-y-2">
      {players.map((player, i) => {
        const isActive = i === currentPlayerIndex;
        const isMe = player.session_id === mySessionId;
        const myProps = properties.filter((p) => p.owner_session_id === player.session_id);

        return (
          <motion.div
            key={player.session_id}
            className={`
              rounded-xl p-3 border transition-all
              ${isActive ? 'border-emerald-400 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white'}
              ${player.is_bankrupt ? 'opacity-40' : ''}
            `}
            animate={{ scale: isActive ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full shrink-0 shadow"
                style={{ backgroundColor: PLAYER_COLORS[player.color] }}
              />
              <span className="font-semibold text-sm text-slate-800 truncate">
                {player.name}
                {isMe && <span className="text-emerald-600 ml-1 text-xs">(ты)</span>}
              </span>
              {isActive && <span className="ml-auto text-xs text-emerald-600 font-medium">ход</span>}
              {player.is_in_jail && <span className="ml-auto text-xs">👮 тюрьма</span>}
              {player.is_bankrupt && <span className="ml-auto text-xs text-red-500">💀 банкрот</span>}
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-emerald-700 font-mono font-bold text-sm">
                {player.cash.toLocaleString()}{THEME.currency}
              </span>
              <span className="text-slate-400 text-xs">
                {myProps.length} объект{myProps.length === 1 ? '' : myProps.length < 5 ? 'а' : 'ов'}
              </span>
            </div>

            {/* Мини-список объектов */}
            {myProps.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {myProps.slice(0, 6).map((p) => {
                  const sq = BOARD[p.square_index];
                  return (
                    <span
                      key={p.square_index}
                      className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-[6rem]"
                      title={sq?.name}
                    >
                      {sq?.name}
                    </span>
                  );
                })}
                {myProps.length > 6 && (
                  <span className="text-[0.55rem] text-slate-400">+{myProps.length - 6}</span>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
