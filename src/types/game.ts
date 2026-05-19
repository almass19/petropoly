import type { Player } from './player';

export type TurnPhase =
  | 'awaiting_roll'
  | 'dice_rolled'
  | 'player_moved'
  | 'handling_square'
  | 'action_required'
  | 'turn_ended';

export type RoomStatus = 'lobby' | 'in_progress' | 'finished';

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  host_session: string;
  created_at: string;
}

export interface GameState {
  room_id: string;
  current_player_index: number;
  turn_phase: TurnPhase;
  last_dice: { die1: number; die2: number } | null;
  version: number;
  updated_at: string;
}

export interface PropertyOwnership {
  room_id: string;
  square_index: number;
  owner_session_id: string | null;
  houses: number;
  is_mortgaged: boolean;
}

export interface GameCard {
  id: string;
  text: string;
  action: CardAction;
}

export type CardAction =
  | { type: 'go_to_jail' }
  | { type: 'move_to'; position: number; collect_salary: boolean }
  | { type: 'pay_bank'; amount: number }
  | { type: 'collect_bank'; amount: number }
  | { type: 'pay_each_player'; amount: number }
  | { type: 'collect_each_player'; amount: number }
  | { type: 'pay_percent'; percent: number }
  | { type: 'get_out_of_jail' };

export interface FullGameData {
  room: Room;
  players: Player[];
  gameState: GameState | null;
  properties: PropertyOwnership[];
}

export type GameAction =
  | { type: 'ROLL_DICE'; sessionId: string }
  | { type: 'BUY_PROPERTY'; sessionId: string; squareIndex: number }
  | { type: 'DECLINE_PURCHASE'; sessionId: string }
  | { type: 'END_TURN'; sessionId: string }
  | { type: 'PAY_BAIL'; sessionId: string }
  | { type: 'BUILD_HOUSE'; sessionId: string; squareIndex: number }
  | { type: 'MORTGAGE'; sessionId: string; squareIndex: number }
  | { type: 'CARD_RESOLVED'; sessionId: string; cardId: string };
