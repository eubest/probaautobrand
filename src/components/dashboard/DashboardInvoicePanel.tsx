import { Download, FileText, Save } from "lucide-react";
import Link from "next/link";

import { importInvoiceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatNumber, type DashboardInvoiceSummary } from "@/lib/dashboard";
import type { Dictionary, Locale } from "@/lib/i18n";

type DashboardInvoicePanelProps = {
  selectedInvoiceId: number;
  invoiceImports: DashboardInvoiceSummary[];
  dictionary: Dictionary;
  locale: Locale;
};

export function DashboardInvoicePanel({ selectedInvoiceId, invoiceImports, dictionary, locale }: DashboardInvoicePanelProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{dictionary.dashboard.invoice.title}</CardTitle>
        <CardDescription>{dictionary.dashboard.invoice.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form action="/api/invoice/csv" className="grid gap-3" encType="multipart/form-data" method="post">
          <div className="grid gap-2">
            <Label htmlFor="invoice">{dictionary.dashboard.invoice.pdfFile}</Label>
            <Input id="invoice" name="invoice" required accept=".pdf,.xml,application/pdf,application/xml,text/xml" type="file" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="submit" variant="outline">
              <Download />
              {dictionary.dashboard.invoice.generate}
            </Button>
            <Button formAction={importInvoiceAction} type="submit">
              <Save />
              {dictionary.dashboard.invoice.importAndSave}
            </Button>
          </div>
        </form>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="text-sm font-medium">{dictionary.dashboard.invoice.historyTitle}</div>

          {invoiceImports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dictionary.dashboard.invoice.noImports}</p>
          ) : (
            <div className="grid gap-2">
              {invoiceImports.map((invoiceImport) => (
                <Link
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted",
                    selectedInvoiceId === invoiceImport.id ? "border-rose-700 bg-rose-50" : "border-border"
                  )}
                  href={`/?invoiceId=${invoiceImport.id}`}
                  key={invoiceImport.id}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {invoiceImport.invoiceNumber ?? invoiceImport.fileName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatNumber(invoiceImport._count.items, locale)} {invoiceImport._count.items === 1 ? dictionary.dashboard.invoice.rowSingular : dictionary.dashboard.invoice.rowsPlural}
                    </span>
                  </span>
                  <FileText className="size-4 shrink-0 text-rose-700" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
