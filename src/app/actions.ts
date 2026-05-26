"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { assertSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseInvoiceDocument } from "@/lib/invoice-pdf";
import { scrapeAndPersistProducts } from "@/lib/scraper";

const productSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(160),
  imageUrl: z.string().trim().url(),
  price: z.coerce.number().nonnegative(),
  priceCurrency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().min(5).max(2000),
  exchangeRate: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().positive().optional()
  ),
});

function redirectWithNotice(
  type: "updated" | "deleted" | "invalid" | "failed" | "scraped" | "invoice-imported" | "invoice-failed",
  extraParams?: Record<string, string | number>
): never {
  const params = new URLSearchParams({ notice: type });

  for (const [key, value] of Object.entries(extraParams ?? {})) {
    params.set(key, String(value));
  }

  redirect(`/?${params.toString()}`);
}

export async function runScrapeAction() {
  await assertSession();
  const result = await scrapeAndPersistProducts("manual");
  revalidatePath("/");

  if (!result.ok) {
    redirectWithNotice("failed");
  }

  redirectWithNotice("scraped");
}

export async function updateProductAction(formData: FormData) {
  await assertSession();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithNotice("invalid");
  }

  const { id, exchangeRate, price, priceCurrency, ...product } = parsed.data;
  const effectiveRate = priceCurrency === "RON" ? 1 : exchangeRate;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...product,
        price,
        priceCurrency,
        exchangeRate: effectiveRate,
        exchangeRateAt: effectiveRate ? new Date() : null,
        priceRon: effectiveRate ? price * effectiveRate : null,
      },
    });
  } catch {
    redirectWithNotice("invalid");
  }

  revalidatePath("/");
  redirectWithNotice("updated");
}

export async function deleteProductAction(formData: FormData) {
  await assertSession();
  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));

  if (!id.success) {
    redirectWithNotice("invalid");
  }

  await prisma.product.delete({
    where: { id: id.data },
  });

  revalidatePath("/");
  redirectWithNotice("deleted");
}

export async function importInvoiceAction(formData: FormData) {
  await assertSession();
  const file = formData.get("invoice");

  if (!(file instanceof File)) {
    redirectWithNotice("invoice-failed");
  }

  let invoiceImportId: number | undefined;

  try {
    const parsedInvoice = await parseInvoiceDocument(Buffer.from(await file.arrayBuffer()), file.name);
    const invoiceImport = await prisma.invoiceImport.create({
      data: {
        fileName: file.name || "invoice.pdf",
        invoiceNumber: parsedInvoice.invoiceNumber,
        issuedAt: parsedInvoice.issuedAt,
        rowsCount: parsedInvoice.rows.length,
        items: {
          create: parsedInvoice.rows.map((row) => ({
            currency: row.currency,
            lineNumber: row.lineNumber,
            productCode: row.productCode,
            productName: row.productName,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    invoiceImportId = invoiceImport.id;
  } catch {
    redirectWithNotice("invoice-failed");
  }

  if (!invoiceImportId) {
    redirectWithNotice("invoice-failed");
  }

  revalidatePath("/");
  redirectWithNotice("invoice-imported", { invoiceId: invoiceImportId });
}
