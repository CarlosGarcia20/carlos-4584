import { Button } from '../components/Button';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { RechargeCard } from '../components/RechargeCard';
import { useAuth } from '../hooks/UseAuth';
import { formatCurrency } from '../utils/formatCurrency';

export function DashboardPage() {
   const { user, logout } = useAuth();

   if (!user) return null;

   return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
         <header className="border-b border-slate-800">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
               <div className="flex items-center gap-2">
                  <span className="font-semibold">Carreras de caracoles</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="max-w-36 truncate text-sm text-slate-300 sm:max-w-xs">
                     {user.fullName}
                  </span>
                  <Button variant="secondary" onClick={logout}>
                     Cerrar sesión
                  </Button>
               </div>
            </div>
         </header>

         <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
            <section
               aria-labelledby="balance-title"
               className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
               <h2 id="balance-title" className="text-sm font-medium text-slate-400">
                  Saldo actual
               </h2>
               <p aria-live='polite' className="mt-1 text-4xl font-bold text-white">
                  {formatCurrency(user.balance)}
               </p>
            </section>

            <DashboardCharts />
            <RechargeCard />
         </main>
      </div>
   );
}