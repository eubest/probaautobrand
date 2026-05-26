import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  formatRunMessage,
  formatRunStatus,
  getCurrentPath,
  getNoticeCopy,
  getOrderBy,
  getSortDirection,
  getSortField,
  type DashboardQueryParams,
} from "@/lib/dashboard";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

type HomePageProps = {
  searchParams: Promise<DashboardQueryParams>;
};

function buildProductWhere(query: string) {
  return query
    ? {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { priceCurrency: { contains: query.toUpperCase() } },
        ],
      }
    : {};
}

function loadInvoiceImportQuery(invoiceId: number) {
  return invoiceId > 0
    ? prisma.invoiceImport.findUnique({
        where: { id: invoiceId },
        include: { items: { orderBy: [{ lineNumber: "asc" }, { id: "asc" }] } },
      })
    : prisma.invoiceImport.findFirst({
        include: { items: { orderBy: [{ lineNumber: "asc" }, { id: "asc" }] } },
        orderBy: { createdAt: "desc" },
      });
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomePageProps) {
  const session = await requireSession();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const sort = getSortField(params.sort);
  const direction = getSortDirection(params.order);
  const selectedInvoiceId = Number(params.invoiceId) || 0;
  const notice = getNoticeCopy(params.notice, dictionary.dashboard.notices);
  const currentPath = getCurrentPath(params);
  const where = buildProductWhere(query);

  const [products, filteredCount, totalCount, lastRun, invoiceImports, selectedInvoice] = await Promise.all([
    prisma.product.findMany({
      orderBy: getOrderBy(sort, direction),
      take: 100,
      where,
    }),
    prisma.product.count({ where }),
    prisma.product.count(),
    prisma.scrapeRun.findFirst({ orderBy: { startedAt: "desc" } }),
    prisma.invoiceImport.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    loadInvoiceImportQuery(selectedInvoiceId),
  ]);

  const latestRate = products.find((product) => product.exchangeRate)?.exchangeRate ?? null;
  const latestCurrency = products.find((product) => product.exchangeRate)?.priceCurrency ?? "EUR";
  const lastRunStatus = formatRunStatus(lastRun?.status, dictionary);
  const lastRunMessage = formatRunMessage(lastRun?.message, dictionary, locale);

  return (
    <DashboardPage
      username={session.username}
      locale={locale}
      dictionary={dictionary}
      currentPath={currentPath}
      notice={notice}
      products={products}
      query={query}
      sort={sort}
      direction={direction}
      selectedInvoiceId={selectedInvoiceId}
      filteredCount={filteredCount}
      totalCount={totalCount}
      latestRate={latestRate}
      latestCurrency={latestCurrency}
      lastRunStatus={lastRunStatus}
      lastRunMessage={lastRunMessage}
      invoiceImports={invoiceImports}
      selectedInvoice={selectedInvoice}
    />
  );
}
