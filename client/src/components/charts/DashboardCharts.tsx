import { BETS, RACES, SNAILS } from '../../data/raceDay';
import { countVictories, summarizeBets } from '../../utils/raceStats';
import { BetsDonutChart } from './BetsDonutChart';
import { ChartCard } from './ChartCard';
import { VictoriesBarChart } from './VictoriesBarChart';

export function DashboardCharts() {
   const bets = summarizeBets(RACES, BETS);
   const victories = countVictories(SNAILS, RACES);

   return (
      <div className="grid gap-6 md:grid-cols-2">
         <ChartCard title="Apuestas" description="Apuestas ganadas y perdidas">
            <BetsDonutChart won={bets.won} lost={bets.lost} winRate={bets.winRate} />
         </ChartCard>
         <ChartCard
            title="Victorias por caracol"
            description={`Resultados de ${RACES.length} carreras del día`}
         >
            <VictoriesBarChart data={victories} totalRaces={RACES.length} />
         </ChartCard>
      </div>
   );
}