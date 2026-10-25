import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartTheme';

interface BetsDonutChartProps {
   won: number;
   lost: number;
   winRate: number;
}

export function BetsDonutChart({ won, lost, winRate }: BetsDonutChartProps) {
   const data = [
      { name: 'Ganadas', value: won, fill: CHART_COLORS.won },
      { name: 'Perdidas', value: lost, fill: CHART_COLORS.lost },
   ];
   
   const label = `Apuestas ganadas y perdidas: ${won} ganadas, ${lost} perdidas (${winRate}% de acierto)`;

   return (
      <figure role="img" aria-label={label} className="m-0">
         <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={data}
                     dataKey="value"
                     nameKey="name"
                     innerRadius="62%"
                     outerRadius="90%"
                     paddingAngle={3}
                     stroke="none"
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: CHART_COLORS.text }} />
               </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
               <span className="text-3xl font-bold text-white">{`${winRate}%`}</span>
               <span className="text-xs text-slate-400">de acierto</span>
            </div>
         </div>

         <ul className="mt-2 flex justify-center gap-6 text-sm">
            {data.map((entry) => (
               <li key={entry.name} className="flex items-center gap-2 text-slate-300">
                  <span
                     aria-hidden="true"
                     className="h-3 w-3 rounded-full"
                     style={{ backgroundColor: entry.fill }}
                  />
                  {entry.name}: <strong className="text-white">{entry.value}</strong>
               </li>
            ))}
         </ul>
      </figure>
   );
}