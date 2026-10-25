import { useId, type ReactNode } from 'react';

interface ChartCardProps {
   title: string;
   description: string;
   children: ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
   const titleId = useId();

   return (
      <section
         aria-labelledby={titleId}
         className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      >
         <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
         </h2>
         <p className="mt-1 text-sm text-slate-400">{description}</p>
         <div className="mt-4">{children}</div>
      </section>
   );
}