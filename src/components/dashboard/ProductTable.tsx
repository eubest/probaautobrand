import { ArrowDownAZ, ArrowUpAZ, FileSpreadsheet, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductActions } from "@/components/product-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatMoney,
  getSortHref,
  type DashboardProductSummary,
  type SortDirection,
  type SortField,
} from "@/lib/dashboard";
import type { Dictionary, Locale } from "@/lib/i18n";

type ProductTableProps = {
  products: DashboardProductSummary[];
  query: string;
  sort: SortField;
  direction: SortDirection;
  selectedInvoiceId: number;
  dictionary: Dictionary;
  locale: Locale;
};

type ColumnDefinition = {
  key: string;
  label: string;
  field?: SortField;
  className?: string;
  alignRight?: boolean;
};

export function ProductTable({
  products,
  query,
  sort,
  direction,
  selectedInvoiceId,
  dictionary,
  locale,
}: ProductTableProps) {
  const columns: ColumnDefinition[] = [
    { key: "image", label: dictionary.dashboard.table.image, className: "w-[72px]" },
    { key: "name", label: dictionary.dashboard.table.product, field: "name" },
    { key: "price", label: dictionary.dashboard.table.sourcePrice, field: "price" },
    { key: "priceRon", label: dictionary.dashboard.table.ronPrice, field: "priceRon" },
    { key: "scrapedAt", label: dictionary.dashboard.table.scraped, field: "scrapedAt" },
    { key: "actions", label: dictionary.dashboard.table.actions, alignRight: true },
  ];

  const renderHeader = (column: ColumnDefinition) => {
    if (!column.field) {
      return column.label;
    }

    const isActive = sort === column.field;

    return (
      <Link
        href={getSortHref(column.field, sort, direction, query, selectedInvoiceId)}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-foreground transition hover:text-rose-700",
          isActive ? "text-rose-900" : ""
        )}
      >
        {column.label}
        {isActive ? direction === "asc" ? <ArrowUpAZ className="size-4" /> : <ArrowDownAZ className="size-4" /> : null}
      </Link>
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <Card className="rounded-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>{dictionary.dashboard.table.title}</CardTitle>
              <CardDescription>{dictionary.dashboard.table.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <form className="rounded-lg border bg-muted/20 p-3" method="get">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_160px_140px_auto_auto]">
              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="q">
                  {dictionary.dashboard.controls.search}
                </Label>
                <Input id="q" name="q" placeholder={dictionary.dashboard.controls.searchPlaceholder} defaultValue={query} />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="sort">
                  {dictionary.dashboard.controls.sort}
                </Label>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                >
                  <option value="scrapedAt">{dictionary.dashboard.controls.sortLastScraped}</option>
                  <option value="name">{dictionary.dashboard.controls.sortName}</option>
                  <option value="price">{dictionary.dashboard.controls.sortPrice}</option>
                  <option value="priceRon">{dictionary.dashboard.controls.sortPriceRon}</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="order">
                  {dictionary.dashboard.controls.order}
                </Label>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  id="order"
                  name="order"
                  defaultValue={direction}
                >
                  <option value="desc">{dictionary.dashboard.controls.descending}</option>
                  <option value="asc">{dictionary.dashboard.controls.ascending}</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full" type="submit">
                  <Search />
                  {dictionary.dashboard.controls.apply}
                </Button>
              </div>

              <div className="flex items-end">
                <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} href="/">
                  {dictionary.common.reset}
                </Link>
              </div>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-50 hover:bg-rose-50">
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.alignRight ? "text-right" : column.className}>
                      {renderHeader(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-10 text-center text-muted-foreground" colSpan={6}>
                      <FileSpreadsheet className="mx-auto mb-3 size-8 text-rose-700" />
                      {dictionary.dashboard.table.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          alt=""
                          className="size-12 rounded-md border object-cover"
                          height={48}
                          sizes="48px"
                          src={product.imageUrl}
                          width={48}
                        />
                      </TableCell>

                      <TableCell className="max-w-[520px] whitespace-normal">
                        <div className="font-medium text-[#1f2a24]">{product.name}</div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">
                          {formatMoney(product.price, product.priceCurrency, dictionary.common.notAvailable, locale)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{product.priceCurrency}</div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">
                          {formatMoney(product.priceRon, "RON", dictionary.common.notAvailable, locale)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {product.exchangeRate
                            ? `${dictionary.dashboard.table.rate} ${product.exchangeRate.toFixed(4)}`
                            : dictionary.dashboard.table.noRate}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">{formatDate(product.scrapedAt, dictionary.common.notAvailable, locale)}</div>
                      </TableCell>

                      <TableCell>
                        <ProductActions copy={dictionary.productActions} product={product} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
