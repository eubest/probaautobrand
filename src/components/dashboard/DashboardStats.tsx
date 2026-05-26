import { ArrowDownAZ, ArrowUpAZ, Database } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardStatCard } from "./DashboardStatCard";
import type { Dictionary } from "@/lib/i18n";
import type { SortDirection } from "@/lib/dashboard";

type DashboardStatsProps = {
  totalCount: number;
  filteredCount: number;
  latestRate: number | null;
  latestCurrency: string;
  direction: SortDirection;
  lastRunStatus: string;
  lastRunMessage: string;
  dictionary: Dictionary;
};

type StatCard = {
  title: string;
  description: string;
  content: ReactNode;
};

export function DashboardStats({
  totalCount,
  filteredCount,
  latestRate,
  latestCurrency,
  direction,
  lastRunStatus,
  lastRunMessage,
  dictionary,
}: DashboardStatsProps) {
  const stats: StatCard[] = [
    {
      title: dictionary.dashboard.stats.products,
      description: dictionary.dashboard.stats.productsDescription,
      content: (
        <div className="flex items-end justify-between">
          <div className="text-3xl font-semibold">{totalCount}</div>
          <Database className="size-5 text-rose-700" />
        </div>
      ),
    },
    {
      title: dictionary.dashboard.stats.filtered,
      description: dictionary.dashboard.stats.filteredDescription,
      content: (
        <div className="flex items-end justify-between">
          <div className="text-3xl font-semibold">{filteredCount}</div>
          {direction === "asc" ? (
            <ArrowUpAZ className="size-5 text-cyan-700" />
          ) : (
            <ArrowDownAZ className="size-5 text-cyan-700" />
          )}
        </div>
      ),
    },
    {
      title: dictionary.dashboard.stats.exchangeRate,
      description: `${latestCurrency}/RON ${dictionary.dashboard.stats.exchangeRateDescription}`,
      content: <div className="text-3xl font-semibold">{latestRate ? latestRate.toFixed(4) : dictionary.common.notAvailable}</div>,
    },
    {
      title: dictionary.dashboard.stats.lastRun,
      description: lastRunStatus,
      content: (
        <div className="space-y-1">
          <div className="text-sm font-medium">{lastRunStatus}</div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{lastRunMessage}</p>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:px-8">
      {stats.map((stat) => (
        <DashboardStatCard key={stat.title} title={stat.title} description={stat.description}>
          {stat.content}
        </DashboardStatCard>
      ))}
    </section>
  );
}
