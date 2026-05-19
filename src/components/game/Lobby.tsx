'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import { THEME } from '@/lib/game/theme';

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="w-full max-w-md space-y-5">

        {/* Заголовок */}
        <div className="text-center space-y-1">
          <motion.h1
            className="text-5xl font-black text-white tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {THEME.boardName}
          </motion.h1>
          <p className="text-white/40 text-sm">Лобби · Ждём игроков</p>
        </div>

        {/* Код комнаты */}
        <motion.div
          className="rounded-3xl p-6 text-center space-y-4"
          style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Код комнаты</p>
          <div className="text-6xl font-black tracking-[0.2em] text-emerald-400 font-mono">
            {roomCode}
          </div>
          <button
            onClick={copyLink}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: copied ? '#059669' : 'rgba(255,255,255,0.08)',
              color: copied ? 'white' : 'rgba(255,255,255,0.6)',
            }}
          >
            {copied ? '✅ Ссылка скопирована!' : '🔗 Скопировать ссылку'}
          </button>
        </motion.div>

        {/* Список игроков */}
        <motion.div
          className="rounded-3xl p-5 space-y-3"
          style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Игроки {players.length}/6
          </p>

          {players.map((p, i) => (
            <motion.div
              key={p.session_id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg"
                style={{ backgroundColor: PLAYER_COLORS[p.color] }}
              >
                {p.name[0]?.toUpperCase()}
              </div>
              <span className="font-bold text-white text-sm flex-1">{p.name}</span>
              {p.session_id === mySessionId && (
                <span className="text-xs text-emerald-400 font-bold">ты</span>
              )}
              {p.turn_order === 0 && (
                <span className="text-xs text-amber-400">👑</span>
              )}
            </motion.div>
          ))}

          {players.length < 2 && (
            <p className="text-center text-xs text-white/20 py-1">
              Нужно минимум 2 игрока
            </p>
          )}
        </motion.div>

        {isHost ? (
          <motion.button
            onClick={onStart}
            disabled={players.length < 1}
            className="w-full py-5 font-black text-xl rounded-3xl transition-all disabled:opacity-30"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              boxShadow: '0 0 40px rgba(16,185,129,0.3)',
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🎮 Начать игру
          </motion.button>
        ) : (
          <div className="text-center text-white/30 text-sm py-2">
            Ожидаем хоста…
          </div>
        )}
      </div>
    </div>
  );
}
