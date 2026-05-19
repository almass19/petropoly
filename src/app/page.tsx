'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEME } from '@/lib/game/theme';
import { PLAYER_COLOR_OPTIONS, PLAYER_COLORS } from '@/types/player';
import type { PlayerColor } from '@/types/player';

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('petropolia_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('petropolia_session', id);
  }
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, sessionId }),
    });
    const checkData = await check.json();
    if (checkData.error) { setError(checkData.error); setLoading(false); return; }

    const res = await fetch(`/api/game/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, playerName: name.trim(), color }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    router.push(`/room/${code}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-5xl font-black text-emerald-800 tracking-tight">{THEME.boardName}</h1>
          <p className="text-slate-500 text-sm">Онлайн-монополия для своих</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'create' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setTab('create')}
            >
              Создать игру
            </button>
            <button
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === 'join' ? 'text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setTab('join')}
            >
              Войти по коду
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Твоё имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введи имя…"
                maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Цвет токена
              </label>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: PLAYER_COLORS[c] }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {tab === 'join' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Код комнаты
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="АБВГД1"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-mono uppercase tracking-widest transition-all"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={tab === 'create' ? createGame : joinGame}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-base shadow"
            >
              {loading ? '…' : tab === 'create' ? '🎲 Создать игру' : '🚀 Войти в игру'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Без регистрации · До 6 игроков · Играй с телефона
        </p>
      </div>
    </main>
  );
}
