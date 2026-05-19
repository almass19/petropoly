export interface Player {
  id: string;
  room_id: string;
  session_id: string;
  name: string;
  color: PlayerColor;
  position: number;
  cash: number;
  is_in_jail: boolean;
  jail_turns: number;
  is_bankrupt: boolean;
  turn_order: number;
  created_at: string;
}

export type PlayerColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange';

export const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};

export const PLAYER_COLOR_OPTIONS: PlayerColor[] = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange',
];
