import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  /** Заглушка изменения, напр. «+12.4% к прошлому месяцу» */
  delta?: string;
}

export function StatCard({ title, value, icon: Icon, delta }: StatCardProps) {
  return (
    <div
      className={`rounded-[12px] border border-slate-100/80 bg-white p-5 shadow-exhibitor transition-shadow duration-200 hover:shadow-exhibitorHover`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className="mt-1 text-[32px] font-bold tabular-nums leading-tight text-expoBlue">{value}</p>
          {delta ? (
            <p className="mt-2 text-sm font-medium text-emerald-600">{delta}</p>
          ) : (
            <p className="mt-2 text-sm font-medium text-slate-400">—</p>
          )}
        </div>
        <div className="rounded-[10px] bg-expoBlue/8 p-2.5 text-expoBlue">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
