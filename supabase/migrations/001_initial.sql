-- ПетроПолия: начальная схема БД

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_progress', 'finished')),
  host_session TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  cash INT NOT NULL DEFAULT 15000,
  is_in_jail BOOLEAN NOT NULL DEFAULT FALSE,
  jail_turns INT NOT NULL DEFAULT 0,
  is_bankrupt BOOLEAN NOT NULL DEFAULT FALSE,
  turn_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, session_id)
);

CREATE TABLE IF NOT EXISTS game_states (
  room_id UUID PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
  current_player_index INT NOT NULL DEFAULT 0,
  turn_phase TEXT NOT NULL DEFAULT 'awaiting_roll',
  last_dice JSONB,
  pending_card JSONB,
  version INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_ownership (
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  square_index INT NOT NULL,
  owner_session_id TEXT,
  houses INT NOT NULL DEFAULT 0,
  is_mortgaged BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (room_id, square_index)
);

-- Разрешаем Realtime для всех таблиц
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE property_ownership;
