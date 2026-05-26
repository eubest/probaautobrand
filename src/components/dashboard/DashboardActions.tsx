import type { Dictionary, Locale } from "@/lib/i18n";
import type { DashboardInvoiceSummary } from "@/lib/dashboard";
import { DashboardInvoicePanel } from "./DashboardInvoicePanel";

type DashboardActionsProps = {
  selectedInvoiceId: number;
  dictionary: Dictionary;
  invoiceImports: DashboardInvoiceSummary[];
  locale: Locale;
};

export function DashboardActions({ selectedInvoiceId, dictionary, invoiceImports, locale }: DashboardActionsProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
      <DashboardInvoicePanel selectedInvoiceId={selectedInvoiceId} invoiceImports={invoiceImports} dictionary={dictionary} locale={locale} />
    </section>
  );
}
