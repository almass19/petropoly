export type SquareType =
  | 'go'
  | 'property'
  | 'railroad'
  | 'utility'
  | 'tax'
  | 'chance'
  | 'community_chest'
  | 'jail'
  | 'free_parking'
  | 'go_to_jail';

export type PropertyColor =
  | 'brown'
  | 'cyan'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue';

export interface BaseSquare {
  index: number;
  name: string;
  type: SquareType;
}

export interface GoSquare extends BaseSquare {
  type: 'go';
  salary: number;
}

export interface PropertySquare extends BaseSquare {
  type: 'property';
  color: PropertyColor;
  price: number;
  mortgageValue: number;
  houseCost: number;
  rent: [number, number, number, number, number, number]; // 0h,1h,2h,3h,4h,hotel
}

export interface RailroadSquare extends BaseSquare {
  type: 'railroad';
  price: number;
  mortgageValue: number;
}

export interface UtilitySquare extends BaseSquare {
  type: 'utility';
  price: number;
  mortgageValue: number;
}

export interface TaxSquare extends BaseSquare {
  type: 'tax';
  amount: number;
}

export interface ChanceSquare extends BaseSquare {
  type: 'chance';
}

export interface CommunityChestSquare extends BaseSquare {
  type: 'community_chest';
}

export interface JailSquare extends BaseSquare {
  type: 'jail';
}

export interface FreeParkingSquare extends BaseSquare {
  type: 'free_parking';
}

export interface GoToJailSquare extends BaseSquare {
  type: 'go_to_jail';
}

export type Square =
  | GoSquare
  | PropertySquare
  | RailroadSquare
  | UtilitySquare
  | TaxSquare
  | ChanceSquare
  | CommunityChestSquare
  | JailSquare
  | FreeParkingSquare
  | GoToJailSquare;

export type OwnableSquare = PropertySquare | RailroadSquare | UtilitySquare;
