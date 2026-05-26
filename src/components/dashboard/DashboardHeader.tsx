import { Badge } from "@/components/ui/badge";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DashboardNoticeCopy } from "@/lib/dashboard";
import { DashboardHeaderActions } from "./DashboardHeaderActions";
import { DashboardNotice } from "./DashboardNotice";

type DashboardHeaderProps = {
  username: string;
  locale: Locale;
  dictionary: Dictionary;
  currentPath: string;
  notice?: DashboardNoticeCopy;
};

export function DashboardHeader({ username, locale, dictionary, currentPath, notice }: DashboardHeaderProps) {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-rose-700 text-white">{dictionary.common.appBadge}</Badge>
              <Badge variant="outline">
                {dictionary.common.signedInAs} {username}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-[#1f2a24] sm:text-3xl">
                {dictionary.dashboard.title}
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {dictionary.dashboard.subtitle}
              </p>
            </div>
          </div>

          <DashboardHeaderActions locale={locale} dictionary={dictionary} currentPath={currentPath} />
        </div>

        <DashboardNotice notice={notice} />
      </div>
    </section>
  );
}
