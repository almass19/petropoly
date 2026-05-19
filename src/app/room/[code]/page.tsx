'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { FullGameData } from '@/types/game';
import type { Player } from '@/types/player';
import Lobby from '@/components/game/Lobby';
import Board from '@/components/board/Board';
import { THEME } from '@/lib/game/theme';

function getSession(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('petropolia_session') ?? '';
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FullGameData | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/game/${code}`);
    if (!res.ok) { router.push('/'); return; }
    setData(await res.json());
  }, [code, router]);

  useEffect(() => {
    const id = getSession();
    if (!id) { router.push('/'); return; }
    setSessionId(id);
    fetchData().finally(() => setLoading(false));
  }, [fetchData, router]);

  useEffect(() => {
    if (!data?.room?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${data.room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states',        filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players',             filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_ownership',  filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms',               filter: `id=eq.${data.room.id}` }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [data?.room?.id, fetchData]);

  async function handleStart() {
    await fetch(`/api/game/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    await fetchData();
  }

  async function handleAction(action: object) {
    setActionError('');
    const res = await fetch(`/api/game/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
    const json = await res.json();
    if (json.error) setActionError(json.error);
    await fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1e' }}>
        <div className="text-center space-y-3">
          <div className="text-4xl font-black text-white animate-pulse">{THEME.boardName}</div>
          <div className="text-white/40 text-sm">Загружаем...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { room, players, gameState, properties } = data;
  const isHost = room.host_session === sessionId;
  const myPlayer: Player | undefined = players.find(p => p.session_id === sessionId);
  const currentPlayer = gameState ? players[gameState.current_player_index] : null;
  const isMyTurn = !!myPlayer && !!currentPlayer && myPlayer.session_id === currentPlayer.session_id;

  if (room.status === 'lobby') {
    return <Lobby roomCode={room.code} players={players} isHost={isHost} mySessionId={sessionId} onStart={handleStart} />;
  }

  if (!gameState || !myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1e' }}>
        <div className="text-white/50">Игра не найдена или вы не в этой комнате.</div>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* Error toast */}
      {actionError && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-2xl"
          style={{ backgroundColor: '#dc2626', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {actionError}
        </div>
      )}

      <Board
        players={players}
        properties={properties}
        gameState={gameState}
        myPlayer={myPlayer}
        isMyTurn={isMyTurn}
        onAction={handleAction}
      />
    </div>
  );
}
