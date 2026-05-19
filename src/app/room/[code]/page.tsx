'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { FullGameData } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLOR_OPTIONS } from '@/types/player';
import Lobby from '@/components/game/Lobby';
import Board from '@/components/board/Board';
import PlayerPanel from '@/components/game/PlayerPanel';
import ActionPanel from '@/components/game/ActionPanel';
import { THEME } from '@/lib/game/theme';

function getSession(): { id: string; name: string } {
  if (typeof window === 'undefined') return { id: '', name: '' };
  return {
    id: localStorage.getItem('petropolia_session') ?? '',
    name: localStorage.getItem('petropolia_name') ?? '',
  };
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
    const json = await res.json();
    setData(json);
  }, [code, router]);

  useEffect(() => {
    const { id } = getSession();
    if (!id) { router.push('/'); return; }
    setSessionId(id);
    fetchData().finally(() => setLoading(false));
  }, [fetchData, router]);

  // Supabase Realtime
  useEffect(() => {
    if (!data?.room?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${data.room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states', filter: `room_id=eq.${data.room.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${data.room.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_ownership', filter: `room_id=eq.${data.room.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${data.room.id}` }, () => fetchData())
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
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-emerald-700 font-bold text-xl animate-pulse">{THEME.boardName}</div>
      </div>
    );
  }

  if (!data) return null;

  const { room, players, gameState, properties } = data;
  const isHost = room.host_session === sessionId;
  const myPlayer: Player | undefined = players.find((p) => p.session_id === sessionId);
  const currentPlayer = gameState ? players[gameState.current_player_index] : null;
  const isMyTurn = !!myPlayer && !!currentPlayer && myPlayer.session_id === currentPlayer.session_id;

  if (room.status === 'lobby') {
    return (
      <Lobby
        roomCode={room.code}
        players={players}
        isHost={isHost}
        mySessionId={sessionId}
        onStart={handleStart}
      />
    );
  }

  if (!gameState || !myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-slate-500">Игра не найдена или вы не в этой комнате.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Доска */}
      <div className="flex-1 p-2 sm:p-4 flex items-start justify-center">
        <Board players={players} properties={properties} />
      </div>

      {/* Панель управления */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 p-3 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto">
        <div className="text-center py-2">
          <h1 className="text-xl font-black text-emerald-800">{THEME.boardName}</h1>
          <p className="text-xs text-slate-400 font-mono">{room.code}</p>
        </div>

        {actionError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center">
            {actionError}
          </div>
        )}

        {gameState && myPlayer && (
          <ActionPanel
            gameState={gameState}
            myPlayer={myPlayer}
            isMyTurn={isMyTurn}
            properties={properties}
            allPlayers={players}
            onAction={handleAction}
          />
        )}

        <div className="border-t border-slate-100 pt-3">
          <PlayerPanel
            players={players}
            properties={properties}
            currentPlayerIndex={gameState.current_player_index}
            mySessionId={sessionId}
          />
        </div>
      </div>
    </div>
  );
}
