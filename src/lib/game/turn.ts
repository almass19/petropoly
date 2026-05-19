import { BOARD } from './board-data';
import { THEME } from './theme';

export function calcNewPosition(current: number, steps: number): number {
  return (current + steps) % 40;
}

export function didPassGo(from: number, steps: number): boolean {
  return from + steps >= 40;
}

export function getSquareAt(position: number) {
  return BOARD[position];
}

export function getJailPosition(): number {
  return 10;
}

export function nextPlayerIndex(current: number, total: number, players: { is_bankrupt: boolean }[]): number {
  let next = (current + 1) % total;
  let attempts = 0;
  while (players[next]?.is_bankrupt && attempts < total) {
    next = (next + 1) % total;
    attempts++;
  }
  return next;
}

export function isBankrupt(cash: number): boolean {
  return cash < 0;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
