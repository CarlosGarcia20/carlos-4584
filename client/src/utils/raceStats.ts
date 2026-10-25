import type { Bet, Race, Snail } from '../types/racing';

export interface VictoryCount {
   snailId: string;
   name: string;
   victories: number;
}

export interface BetSummary {
   won: number;
   lost: number;
   total: number;
   winRate: number;
}

export function countVictories(
   snails: readonly Snail[],
   races: readonly Race[],
): VictoryCount[] {
   return snails.map((snail) => ({
      snailId: snail.id,
      name: snail.name,
      victories: races.filter((race) => race.winnerId === snail.id).length,
   }));
}

export function summarizeBets(races: readonly Race[], bets: readonly Bet[]): BetSummary {
   const winnerByRace = new Map(races.map((race) => [race.number, race.winnerId]));
   const won = bets.filter((bet) => winnerByRace.get(bet.raceNumber) === bet.snailId).length;
   const total = bets.length;

   return {
      won,
      lost: total - won,
      total,
      winRate: total === 0 ? 0 : Math.round((won / total) * 100),
   };
}