import type { ReactNode } from "react";

interface AuthLayoutProps {
   title: string,
   children: ReactNode,
   footer: ReactNode
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
   return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10">
         <div className="w-full max-w-md">
            <div className="mb-6 text-center">
               <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
               {children}
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">{footer}</p>
         </div>
      </main>
   )

}