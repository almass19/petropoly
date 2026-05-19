'use client';

import { useState } from 'react';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import { THEME } from '@/lib/game/theme';
import { motion } from 'framer-motion';

interface Props {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  mySessionId: string;
  onStart: () => void;
}

export default function Lobby({ roomCode, players, isHost, mySessionId, onStart }: Props) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';

  function copyLink() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-emerald-800">{THEME.boardName}</h1>
          <p className="text-slate-500 mt-1 text-sm">Комната ожидания</p>
        </div>

        {/* Код комнаты */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center space-y-3">
          <p className="text-sm text-slate-500 font-medium">Код комнаты</p>
          <div className="text-5xl font-black tracking-widest text-emerald-700 font-mono">{roomCode}</div>
          <button
            onClick={copyLink}
            className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium rounded-xl text-sm transition-colors"
          >
            {copied ? '✅ Скопировано!' : '🔗 Скопировать ссылку'}
          </button>
        </div>

        {/* Игроки */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
          <p className="text-sm font-semibold text-slate-600 mb-3">
            Игроки ({players.length}/6)
          </p>
          {players.map((p, i) => (
            <motion.div
              key={p.session_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50"
            >
              <div
                className="w-5 h-5 rounded-full shadow"
                style={{ backgroundColor: PLAYER_COLORS[p.color] }}
              />
              <span className="font-medium text-slate-800 text-sm">{p.name}</span>
              {p.session_id === mySessionId && (
                <span className="ml-auto text-xs text-emerald-600 font-medium">ты</span>
              )}
              {p.turn_order === 0 && (
                <span className="ml-auto text-xs text-amber-500">👑 хост</span>
              )}
            </motion.div>
          ))}

          {players.length < 2 && (
            <p className="text-xs text-slate-400 text-center pt-1">
              Минимум 2 игрока для старта
            </p>
          )}
        </div>

        {/* Кнопка старта */}
        {isHost && (
          <button
            onClick={onStart}
            disabled={players.length < 1}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 text-white font-bold text-lg rounded-2xl transition-all shadow-lg"
          >
            🎮 Начать игру
          </button>
        )}

        {!isHost && (
          <div className="text-center text-sm text-slate-400">
            Ожидаем хоста…
          </div>
        )}
      </div>
    </div>
  );
}
