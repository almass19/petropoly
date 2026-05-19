import type { PropertySquare, RailroadSquare, UtilitySquare } from '@/types/board';
import type { PropertyOwnership } from '@/types/game';
import { COLOR_GROUPS, RAILROADS, UTILITIES } from './board-data';

export function calcPropertyRent(
  square: PropertySquare,
  ownership: PropertyOwnership,
  allOwnerships: PropertyOwnership[],
): number {
  if (ownership.is_mortgaged || !ownership.owner_session_id) return 0;

  const { houses } = ownership;
  const groupIndices = COLOR_GROUPS[square.color] ?? [];
  const ownerHasMonopoly = groupIndices.every((idx) => {
    const o = allOwnerships.find((p) => p.square_index === idx);
    return o?.owner_session_id === ownership.owner_session_id && !o.is_mortgaged;
  });

  if (houses === 0) return ownerHasMonopoly ? square.rent[0] * 2 : square.rent[0];
  return square.rent[Math.min(houses, 5)];
}

export function calcRailroadRent(
  ownership: PropertyOwnership,
  allOwnerships: PropertyOwnership[],
): number {
  if (ownership.is_mortgaged || !ownership.owner_session_id) return 0;
  const owned = RAILROADS.filter((idx) => {
    const o = allOwnerships.find((p) => p.square_index === idx);
    return o?.owner_session_id === ownership.owner_session_id && !o.is_mortgaged;
  }).length;
  return 250 * Math.pow(2, owned - 1);
}

export function calcUtilityRent(
  ownership: PropertyOwnership,
  allOwnerships: PropertyOwnership[],
  diceTotal: number,
): number {
  if (ownership.is_mortgaged || !ownership.owner_session_id) return 0;
  const owned = UTILITIES.filter((idx) => {
    const o = allOwnerships.find((p) => p.square_index === idx);
    return o?.owner_session_id === ownership.owner_session_id && !o.is_mortgaged;
  }).length;
  return diceTotal * (owned === 2 ? 10 : 4);
}

export function rollDice(): { die1: number; die2: number } {
  return {
    die1: Math.floor(Math.random() * 6) + 1,
    die2: Math.floor(Math.random() * 6) + 1,
  };
}

export function isDoubles(die1: number, die2: number): boolean {
  return die1 === die2;
}
