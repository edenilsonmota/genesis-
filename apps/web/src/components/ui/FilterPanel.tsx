import type { PropsWithChildren } from "react";
export const controlClass =
  "w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500";
export function FilterPanel({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      aria-label="Filtros"
      className={`mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {children}
    </section>
  );
}
