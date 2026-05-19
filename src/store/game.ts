'use client';

import { create } from 'zustand';
import type { FullGameData, GameState, PropertyOwnership } from '@/types/game';
import type { Player } from '@/types/player';

interface GameStore {
  sessionId: string | null;
  roomCode: string | null;
  data: FullGameData | null;
  pendingCard: { id: string; text: string } | null;
  actionMessage: string | null;

  setSessionId: (id: string) => void;
  setRoomCode: (code: string) => void;
  setData: (data: FullGameData) => void;
  updateGameState: (gs: GameState) => void;
  updatePlayer: (player: Player) => void;
  updateOwnership: (o: PropertyOwnership) => void;
  setPendingCard: (card: { id: string; text: string } | null) => void;
  setActionMessage: (msg: string | null) => void;

  currentPlayer: () => Player | null;
  myPlayer: () => Player | null;
  isMyTurn: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  sessionId: null,
  roomCode: null,
  data: null,
  pendingCard: null,
  actionMessage: null,

  setSessionId: (id) => set({ sessionId: id }),
  setRoomCode: (code) => set({ roomCode: code }),
  setData: (data) => set({ data }),

  updateGameState: (gs) =>
    set((s) => s.data ? { data: { ...s.data, gameState: gs } } : s),

  updatePlayer: (player) =>
    set((s) => {
      if (!s.data) return s;
      const players = s.data.players.map((p) =>
        p.session_id === player.session_id ? player : p,
      );
      return { data: { ...s.data, players } };
    }),

  updateOwnership: (o) =>
    set((s) => {
      if (!s.data) return s;
      const existing = s.data.properties.find(
        (p) => p.square_index === o.square_index,
      );
      const properties = existing
        ? s.data.properties.map((p) => (p.square_index === o.square_index ? o : p))
        : [...s.data.properties, o];
      return { data: { ...s.data, properties } };
    }),

  setPendingCard: (card) => set({ pendingCard: card }),
  setActionMessage: (msg) => set({ actionMessage: msg }),

  currentPlayer: () => {
    const { data } = get();
    if (!data?.gameState) return null;
    return data.players[data.gameState.current_player_index] ?? null;
  },

  myPlayer: () => {
    const { data, sessionId } = get();
    return data?.players.find((p) => p.session_id === sessionId) ?? null;
  },

  isMyTurn: () => {
    const { currentPlayer, myPlayer } = get();
    const cp = currentPlayer();
    const mp = myPlayer();
    return !!cp && !!mp && cp.session_id === mp.session_id;
  },
}));
