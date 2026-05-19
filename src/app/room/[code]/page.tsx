'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { FullGameData } from '@/types/game';
import type { Player } from '@/types/player';
import { PLAYER_COLORS } from '@/types/player';
import type { PropertyOwnership } from '@/types/game';
import type { PropertySquare } from '@/types/board';
import Lobby from '@/components/game/Lobby';
import Board from '@/components/board/Board';
import ActionPanel from '@/components/game/ActionPanel';
import { THEME } from '@/lib/game/theme';
import { BOARD } from '@/lib/game/board-data';

function getSession(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('petropolia_session') ?? '';
}

const PROP_COLORS: Record<string, string> = {
  brown: '#8B4513', cyan: '#00BFFF', pink: '#FF1493', orange: '#FF8C00',
  red: '#DC143C', yellow: '#FFD700', green: '#228B22', blue: '#00008B',
};

function propDotColor(squareIndex: number): string | null {
  const sq = BOARD[squareIndex];
  if (!sq) return null;
  if (sq.type === 'property') return PROP_COLORS[(sq as PropertySquare).color] ?? null;
  if (sq.type === 'railroad') return '#334155';
  if (sq.type === 'utility') return '#7c3aed';
  return null;
}

function PlayerCard({ player, isActive, isMe, properties }: {
  player: Player; isActive: boolean; isMe: boolean; properties: PropertyOwnership[];
}) {
  const owned = properties.filter(p => p.owner_session_id === player.session_id);
  return (
    <div style={{
      borderRadius: 14,
      padding: '10px 12px',
      backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
      border: isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)',
      opacity: player.is_bankrupt ? 0.3 : 1,
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          backgroundColor: PLAYER_COLORS[player.color],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 900, color: 'white',
          boxShadow: `0 0 10px ${PLAYER_COLORS[player.color]}60`,
        }}>
          {player.name[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </span>
            {isMe && <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>ты</span>}
            {player.is_in_jail && <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>тюрьма</span>}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: player.cash < 2000 ? '#f87171' : '#34d399', fontFamily: 'monospace' }}>
            {player.cash.toLocaleString()}₸
          </div>
        </div>
        {isActive && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399', flexShrink: 0 }} />
        )}
      </div>

      {owned.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 44 }}>
          {owned.map(po => {
            const color = propDotColor(po.square_index);
            if (!color) return null;
            return (
              <div key={po.square_index} title={BOARD[po.square_index]?.name}
                style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: color }} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FullGameData | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states',       filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players',            filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_ownership', filter: `room_id=eq.${data.room.id}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms',              filter: `id=eq.${data.room.id}` }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [data?.room?.id, fetchData]);

  async function handleStart() {
    await fetch(`/api/game/${code}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    await fetchData();
  }

  async function handleAction(action: object) {
    setActionError('');
    const res = await fetch(`/api/game/${code}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'row', backgroundColor: '#0a0f1e' }}>

      {/* Board — square, fills viewport height */}
      <div style={{ height: '100%', aspectRatio: '1 / 1', flexShrink: 0, padding: 10 }}>
        <Board
          players={players}
          properties={properties}
          gameState={gameState}
          myPlayer={myPlayer}
          loading={boardLoading}
        />
      </div>

      {/* Right sidebar */}
      <div style={{
        flex: 1, height: '100%', minWidth: 0,
        display: 'flex', flexDirection: 'column',
        backgroundColor: '#111827',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{THEME.boardName}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.15em', marginTop: 2 }}>{room.code}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>ходит</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{currentPlayer?.name ?? '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Error */}
          {actionError && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
              color: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              textAlign: 'center',
            }}>
              {actionError}
            </div>
          )}

          {/* Actions */}
          <ActionPanel
            gameState={gameState}
            myPlayer={myPlayer}
            isMyTurn={isMyTurn}
            properties={properties}
            allPlayers={players}
            onAction={handleAction}
            onLoadingChange={setBoardLoading}
          />

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

          {/* Player cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              Игроки {players.length}/6
            </div>
            {players.map((player, i) => (
              <PlayerCard
                key={player.session_id}
                player={player}
                isActive={i === gameState.current_player_index}
                isMe={player.session_id === sessionId}
                properties={properties}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
