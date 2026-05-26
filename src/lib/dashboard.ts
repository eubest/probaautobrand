import type { InvoiceImport, InvoiceItem, Prisma, Product } from "@prisma/client";
import type { Dictionary, Locale } from "@/lib/i18n";

export const sortFields = ["name", "price", "priceRon", "scrapedAt"] as const;
export type SortField = (typeof sortFields)[number];
export type SortDirection = "asc" | "desc";

export type DashboardQueryParams = {
  invoiceId?: string;
  notice?: string;
  order?: string;
  q?: string;
  sort?: string;
};

export type DashboardNoticeCopy = {
  title: string;
  description: string;
  destructive?: boolean;
};

export type DashboardProductSummary = Pick<
  Product,
  "id" | "imageUrl" | "name" | "description" | "price" | "priceCurrency" | "priceRon" | "exchangeRate" | "scrapedAt" | "sourceUrl"
>;

export type DashboardInvoiceSummary = {
  id: number;
  invoiceNumber: string | null;
  fileName: string;
  _count: {
    items: number;
  };
};

export type DashboardSelectedInvoice = InvoiceImport & {
  items: InvoiceItem[];
};

export function getSortField(value: string | undefined): SortField {
  return sortFields.includes(value as SortField) ? (value as SortField) : "scrapedAt";
}

export function getSortDirection(value: string | undefined): SortDirection {
  return value === "asc" ? "asc" : "desc";
}

export function getNoticeCopy(notice: string | undefined, notices: Dictionary["dashboard"]["notices"]): DashboardNoticeCopy | undefined {
  if (!notice || !(notice in notices)) {
    return undefined;
  }

  return {
    ...notices[notice as keyof typeof notices],
    destructive: notice === "failed" || notice === "invalid" || notice === "invoice-failed",
  };
}

export function getOrderBy(sort: SortField, direction: SortDirection): Prisma.ProductOrderByWithRelationInput {
  if (sort === "name") {
    return { name: direction };
  }

  if (sort === "price") {
    return { price: direction };
  }

  if (sort === "priceRon") {
    return { priceRon: direction };
  }

  return { scrapedAt: direction };
}

export function getSortHref(
  field: SortField,
  sort: SortField,
  direction: SortDirection,
  query: string,
  invoiceId: number
) {
  const nextDirection = sort === field && direction === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  params.set("sort", field);
  params.set("order", nextDirection);

  if (invoiceId > 0) {
    params.set("invoiceId", String(invoiceId));
  }

  return `/?${params.toString()}`;
}

export function formatMoney(value: number | null, currency: string, unavailable: string, locale: Locale) {
  if (value === null || !Number.isFinite(value)) {
    return unavailable;
  }

  return `${new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

export function formatDate(value: Date | null | undefined, unavailable: string, locale: Locale) {
  if (!value) {
    return unavailable;
  }

  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRunStatus(status: string | undefined, dictionary: Dictionary) {
  if (!status) {
    return dictionary.dashboard.stats.noScrapeYet;
  }

  return dictionary.dashboard.runStatus[status as keyof Dictionary["dashboard"]["runStatus"]] ?? status;
}

export function formatRunMessage(message: string | null | undefined, dictionary: Dictionary, locale: Locale) {
  if (!message) {
    return dictionary.dashboard.stats.noRunMessage;
  }

  if (locale !== "ro") {
    return message;
  }

  const savedWithRate = message.match(
    /^Saved (\d+) unique products from (\d+) scraped rows\. ([A-Z]{3})\/RON rate: ([\d.]+)\.$/
  );

  if (savedWithRate) {
    return `Salvate ${savedWithRate[1]} produse unice din ${savedWithRate[2]} randuri scrapate. Curs ${savedWithRate[3]}/RON: ${savedWithRate[4]}.`;
  }

  const savedWithoutRate = message.match(
    /^Saved (\d+) unique products from (\d+) scraped rows\. Exchange rate for ([A-Z]{3}) was unavailable\.$/
  );

  if (savedWithoutRate) {
    return `Salvate ${savedWithoutRate[1]} produse unice din ${savedWithoutRate[2]} randuri scrapate. Cursul pentru ${savedWithoutRate[3]} nu a fost disponibil.`;
  }

  return message;
}

export function getCurrentPath(params: DashboardQueryParams) {
  const nextParams = new URLSearchParams();

  for (const key of ["q", "sort", "order", "invoiceId"] as const) {
    if (params[key]) {
      nextParams.set(key, params[key]!);
    }
  }

  const query = nextParams.toString();

  return query ? `/?${query}` : "/";
}
