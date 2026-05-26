import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney, formatNumber, type DashboardSelectedInvoice } from "@/lib/dashboard";
import type { Dictionary, Locale } from "@/lib/i18n";

type InvoicePreviewProps = {
  selectedInvoice: DashboardSelectedInvoice | null;
  dictionary: Dictionary;
  locale: Locale;
};

type MetadataItem = {
  label: string;
  value: string;
};

export function InvoicePreview({ selectedInvoice, dictionary, locale }: InvoicePreviewProps) {
  if (!selectedInvoice) {
    return null;
  }

  const { id, invoiceNumber, fileName, issuedAt, createdAt, items } = selectedInvoice;

  const metadata: MetadataItem[] = [
    {
      label: dictionary.dashboard.invoice.invoiceNumber,
      value: invoiceNumber ?? dictionary.common.notAvailable,
    },
    {
      label: dictionary.dashboard.invoice.sourceFile,
      value: fileName,
    },
    {
      label: dictionary.dashboard.invoice.issuedAt,
      value: formatDate(issuedAt, dictionary.common.notAvailable, locale),
    },
    {
      label: dictionary.dashboard.invoice.importedAt,
      value: formatDate(createdAt, dictionary.common.notAvailable, locale),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
      <Card className="rounded-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{dictionary.dashboard.invoice.previewTitle}</CardTitle>
              <CardDescription>{dictionary.dashboard.invoice.previewDescription}</CardDescription>
            </div>
            <a className={cn(buttonVariants({ variant: "outline" }))} href={`/api/invoice/imports/${id}/csv`}>
              <Download />
              {dictionary.dashboard.invoice.download}
            </a>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-4">
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            {metadata.map((item) => (
              <div key={item.label}>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-50 hover:bg-rose-100">
                  <TableHead>{dictionary.dashboard.invoice.line}</TableHead>
                  <TableHead>{dictionary.dashboard.invoice.productCode}</TableHead>
                  <TableHead>{dictionary.dashboard.invoice.productName}</TableHead>
                  <TableHead>{dictionary.dashboard.invoice.unitPrice}</TableHead>
                  <TableHead>{dictionary.dashboard.invoice.currency}</TableHead>
                  <TableHead>{dictionary.dashboard.invoice.quantity}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.lineNumber ?? dictionary.common.notAvailable}</TableCell>
                    <TableCell className="font-medium">{item.productCode}</TableCell>
                    <TableCell className="whitespace-normal">{item.productName}</TableCell>
                    <TableCell>{formatMoney(item.unitPrice, item.currency, dictionary.common.notAvailable, locale)}</TableCell>
                    <TableCell>{item.currency}</TableCell>
                    <TableCell>{formatNumber(item.quantity, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
