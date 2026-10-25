import type { Bet, Race, Snail } from '../types/racing';

export const SNAILS: readonly Snail[] = [
   { id: 'turbo', name: 'Turbo' },
   { id: 'rayo', name: 'Rayo' },
   { id: 'jackson', name: 'Jackson' },
   { id: 'meteoro', name: 'Meteoro' },
   { id: 'hudson', name: 'Hudson' },
   { id: 'francesco', name: 'Francesco' },
];

export const RACES: readonly Race[] = [
   { number: 1, winnerId: 'francesco' },
   { number: 2, winnerId: 'rayo' },
   { number: 3, winnerId: 'turbo' },
   { number: 4, winnerId: 'meteoro' },
   { number: 5, winnerId: 'rayo' },
   { number: 6, winnerId: 'hudson' },
];

export const BETS: readonly Bet[] = [
   { raceNumber: 1, snailId: 'turbo' },
   { raceNumber: 2, snailId: 'turbo' },
   { raceNumber: 3, snailId: 'rayo' },
   { raceNumber: 4, snailId: 'meteoro' },
   { raceNumber: 5, snailId: 'jackson' },
   { raceNumber: 6, snailId: 'hudson' },
];