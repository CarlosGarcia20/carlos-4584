export interface Snail {
   id: string;
   name: string;
}

export interface Race {
   number: number;
   winnerId: string;
}

export interface Bet {
   raceNumber: number;
   snailId: string;
}