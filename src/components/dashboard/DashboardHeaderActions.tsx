import { LogOut, RefreshCw } from "lucide-react";
import { LocaleToggle } from "@/components/locale-toggle";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";
import { runScrapeAction } from "@/app/actions";
import type { Dictionary, Locale } from "@/lib/i18n";

type DashboardHeaderActionsProps = {
  locale: Locale;
  dictionary: Dictionary;
  currentPath: string;
};

export function DashboardHeaderActions({ locale, dictionary, currentPath }: DashboardHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LocaleToggle label={dictionary.common.switchTo} locale={locale} nextPath={currentPath} />
      <form action={runScrapeAction}>
        <Button type="submit">
          <RefreshCw />
          {dictionary.dashboard.runScrape}
        </Button>
      </form>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          <LogOut />
          {dictionary.dashboard.signOut}
        </Button>
      </form>
    </div>
  );
}
