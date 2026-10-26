import { describe, expect, it } from 'vitest';
import { countVictories, summarizeBets } from '../utils/raceStats';
import { BETS, RACES, SNAILS } from './raceDay';

describe('datos simulados del día de carreras', () => {
  const snailIds = new Set(SNAILS.map((snail) => snail.id));

  it('hay 6 caracoles distintos y 6 carreras numeradas del 1 al 6', () => {
    expect(SNAILS).toHaveLength(6);
    expect(snailIds.size).toBe(6);
    expect(RACES.map((race) => race.number)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('cada ganador es un caracol que existe', () => {
    for (const race of RACES) {
      expect(snailIds.has(race.winnerId)).toBe(true);
    }
  });

  it('las victorias suman una por carrera', () => {
    const total = countVictories(SNAILS, RACES).reduce((sum, item) => sum + item.victories, 0);
    expect(total).toBe(RACES.length);
  });

  it('las apuestas apuntan a carreras y caracoles que existen', () => {
    const raceNumbers = new Set(RACES.map((race) => race.number));
    for (const bet of BETS) {
      expect(raceNumbers.has(bet.raceNumber)).toBe(true);
      expect(snailIds.has(bet.snailId)).toBe(true);
    }
  });

  it('ganadas más perdidas es igual al total de apuestas', () => {
    const summary = summarizeBets(RACES, BETS);
    expect(summary.won + summary.lost).toBe(BETS.length);
  });
});
