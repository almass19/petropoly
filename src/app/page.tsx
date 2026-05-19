'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@/lib/game/theme';
import { PLAYER_COLOR_OPTIONS, PLAYER_COLORS } from '@/types/player';
import type { PlayerColor } from '@/types/player';

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('petropolia_session');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('petropolia_session', id); }
  return id;
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState<PlayerColor>('blue');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    const saved = localStorage.getItem('petropolia_name');
    if (saved) setName(saved);
    const savedColor = localStorage.getItem('petropolia_color') as PlayerColor | null;
    if (savedColor) setColor(savedColor);
  }, []);

  async function createGame() {
    if (!name.trim()) { setError('Введи своё имя'); return; }
    setLoading(true); setError('');
    const sessionId = getOrCreateSession();
    localStorage.setItem('petropolia_name', name.trim());
    localStorage.setItem('petropolia_color', color);
    const res = await fetch('/api/rooms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerName: name.trim(), color }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    router.push(`/room/${data.code}`);
  }

  async function joinGame() {
    if (!name.trim()) { setError('Введи своё имя'); return; }
    if (!joinCode.trim()) { setError('Введи код комнаты'); return; }
    setLoading(true); setError('');
    const sessionId = getOrCreateSession();
    localStorage.setItem('petropolia_name', name.trim());
    localStorage.setItem('petropolia_color', color);
    const code = joinCode.trim().toUpperCase();
    const check = await fetch('/api/rooms', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, sessionId }),
    });
    const checkData = await check.json();
    if (checkData.error) { setError(checkData.error); setLoading(false); return; }
    const res = await fetch(`/api/game/${code}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerName: name.trim(), color }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    router.push(`/room/${code}`);
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: '#0a0f1e' }}>

      {/* Левая часть — брендинг */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-yellow-500/8 blur-3xl" />
        </div>

        <div className="relative text-center space-y-6 max-w-md">
          {/* Монетка */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-2xl shadow-yellow-500/30 border-4 border-yellow-700">
            <span className="text-4xl font-black text-yellow-900">₸</span>
          </div>

          <div>
            <h1 className="text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              {THEME.boardName}
            </h1>
            <p className="text-white/40 mt-3 text-lg">Монополия для своих</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-sm text-white/30">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">До 6 игроков</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Реальное время</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Без регистрации</span>
          </div>
        </div>
      </div>

      {/* Правая часть — форма */}
      <div className="w-full lg:w-[440px] shrink-0 flex items-center justify-center p-6 lg:p-10"
        style={{ backgroundColor: '#111827', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-full max-w-sm space-y-5">

          {/* Вкладки */}
          <div className="flex rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            {(['create', 'join'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: tab === t ? '#10b981' : 'transparent',
                  color: tab === t ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {t === 'create' ? 'Создать игру' : 'Войти по коду'}
              </button>
            ))}
          </div>

          {/* Имя */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">
              Твоё имя
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? createGame() : joinGame())}
              placeholder="Введи имя…"
              maxLength={20}
              className="w-full px-4 py-3.5 rounded-2xl text-white placeholder-white/20 text-sm font-medium outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.6)'; }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
            />
          </div>

          {/* Цвет */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">
              Цвет токена
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {PLAYER_COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="transition-all"
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    backgroundColor: PLAYER_COLORS[c],
                    border: color === c ? '3px solid white' : '3px solid transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 16px ${PLAYER_COLORS[c]}80` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Код */}
          {tab === 'join' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">
                Код комнаты
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinGame()}
                placeholder="ABCD12"
                maxLength={6}
                className="w-full px-4 py-3.5 rounded-2xl text-emerald-400 placeholder-white/20 text-sm font-mono font-bold tracking-[0.3em] uppercase outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.6)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
              />
            </div>
          )}

          {error && (
            <div className="px-4 py-2.5 rounded-xl text-red-400 text-sm text-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={tab === 'create' ? createGame : joinGame}
            disabled={loading}
            className="w-full py-4 font-black text-lg rounded-2xl transition-all disabled:opacity-40"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              boxShadow: loading ? 'none' : '0 0 30px rgba(16,185,129,0.4)',
            }}
          >
            {loading ? '…' : tab === 'create' ? '🎲 Создать игру' : '🚀 Войти в игру'}
          </button>
        </div>
      </div>
    </main>
  );
}
