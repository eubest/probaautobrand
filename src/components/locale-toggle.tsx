import { Languages } from "lucide-react";

import { changeLocaleAction } from "@/app/locale-actions";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

type LocaleToggleProps = {
  label: string;
  locale: Locale;
  nextPath: string;
};

export function LocaleToggle({ label, locale, nextPath }: LocaleToggleProps) {
  return (
    <form action={changeLocaleAction}>
      <input name="locale" type="hidden" value={locale === "ro" ? "en" : "ro"} />
      <input name="next" type="hidden" value={nextPath} />
      <Button type="submit" variant="outline">
        <Languages />
        {label}
      </Button>
    </form>
  );
}
