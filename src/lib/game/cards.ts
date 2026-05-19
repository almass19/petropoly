import type { GameCard } from '@/types/game';
import { CHANCE_CARDS, COMMUNITY_CARDS } from './theme';

export function shuffleDeck(cards: GameCard[]): GameCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCard(deck: GameCard[], index: number): { card: GameCard; nextIndex: number } {
  const card = deck[index % deck.length];
  return { card, nextIndex: (index + 1) % deck.length };
}

export { CHANCE_CARDS, COMMUNITY_CARDS };
