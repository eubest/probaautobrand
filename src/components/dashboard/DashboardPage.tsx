import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { InvoicePreview } from "@/components/dashboard/InvoicePreview";
import { ProductTable } from "@/components/dashboard/ProductTable";
import type { Dictionary, Locale } from "@/lib/i18n";
import type {
  DashboardInvoiceSummary,
  DashboardNoticeCopy,
  DashboardProductSummary,
  DashboardSelectedInvoice,
  SortDirection,
  SortField,
} from "@/lib/dashboard";

type DashboardPageProps = {
  username: string;
  locale: Locale;
  dictionary: Dictionary;
  currentPath: string;
  notice?: DashboardNoticeCopy;
  products: DashboardProductSummary[];
  query: string;
  sort: SortField;
  direction: SortDirection;
  selectedInvoiceId: number;
  filteredCount: number;
  totalCount: number;
  latestRate: number | null;
  latestCurrency: string;
  lastRunStatus: string;
  lastRunMessage: string;
  invoiceImports: DashboardInvoiceSummary[];
  selectedInvoice: DashboardSelectedInvoice | null;
};

export function DashboardPage({
  username,
  locale,
  dictionary,
  currentPath,
  notice,
  products,
  query,
  sort,
  direction,
  selectedInvoiceId,
  filteredCount,
  totalCount,
  latestRate,
  latestCurrency,
  lastRunStatus,
  lastRunMessage,
  invoiceImports,
  selectedInvoice,
}: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-foreground">
      <DashboardHeader username={username} locale={locale} dictionary={dictionary} currentPath={currentPath} notice={notice} />

      <DashboardStats
        totalCount={totalCount}
        filteredCount={filteredCount}
        latestRate={latestRate}
        latestCurrency={latestCurrency}
        direction={direction}
        lastRunStatus={lastRunStatus}
        lastRunMessage={lastRunMessage}
        dictionary={dictionary}
      />

      <DashboardActions
        selectedInvoiceId={selectedInvoiceId}
        dictionary={dictionary}
        invoiceImports={invoiceImports}
        locale={locale}
      />

      {selectedInvoice ? <InvoicePreview selectedInvoice={selectedInvoice} dictionary={dictionary} locale={locale} /> : null}

      <ProductTable
        products={products}
        query={query}
        sort={sort}
        direction={direction}
        selectedInvoiceId={selectedInvoiceId}
        dictionary={dictionary}
        locale={locale}
      />
    </main>
  );
}
