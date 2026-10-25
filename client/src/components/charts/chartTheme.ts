import type { CSSProperties } from 'react';

export const CHART_COLORS = {
   won: '#10b981',
   lost: '#f43f5e',
   bar: '#38bdf8',
   grid: '#1e293b',
   axis: '#94a3b8',
   text: '#e2e8f0',
} as const;

export const TOOLTIP_STYLE: CSSProperties = {
   backgroundColor: '#0f172a',
   border: '1px solid #334155',
   borderRadius: 8,
   color: CHART_COLORS.text,
};