import {
   Bar,
   BarChart,
   CartesianGrid,
   LabelList,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts';
import type { VictoryCount } from '../../utils/raceStats';
import { CHART_COLORS, TOOLTIP_STYLE } from './chartTheme';

interface VictoriesBarChartProps {
   data: VictoryCount[];
   totalRaces: number;
}

export function VictoriesBarChart({ data, totalRaces }: VictoriesBarChartProps) {
   const label = `Victorias por caracol en ${totalRaces} carreras: ${data
      .map((item) => `${item.name} ${item.victories}`)
      .join(', ')}`;

   return (
      <figure role="img" aria-label={label} className="m-0">
         <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                     dataKey="name"
                     interval={0}
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                  />
                  <YAxis
                     allowDecimals={false}
                     domain={[0, 'dataMax + 1']}
                     axisLine={false}
                     tickLine={false}
                     tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
                  />
                  <Tooltip
                     cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                     contentStyle={TOOLTIP_STYLE}
                     itemStyle={{ color: CHART_COLORS.text }}
                  />
                  <Bar
                     dataKey="victories"
                     name="Victorias"
                     fill={CHART_COLORS.bar}
                     radius={[6, 6, 0, 0]}
                  >
                     <LabelList dataKey="victories" position="top" fill={CHART_COLORS.text} fontSize={12} />
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </figure>
   );
}