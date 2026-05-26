import { NextResponse } from "next/server";

import { assertSession, UnauthorizedError } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { invoiceRowsToCsv } from "@/lib/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CsvRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: CsvRouteContext) {
  try {
    await assertSession();
    const params = await context.params;
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid invoice import id." }, { status: 400 });
    }

    const invoiceImport = await prisma.invoiceImport.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ lineNumber: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!invoiceImport) {
      return NextResponse.json({ error: "Invoice import not found." }, { status: 404 });
    }

    const csv = invoiceRowsToCsv(
      invoiceImport.items.map((item) => ({
        currency: item.currency,
        lineNumber: item.lineNumber ?? undefined,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    const fileBaseName = invoiceImport.fileName.replace(/\.(pdf|xml)$/i, "") || `invoice-${invoiceImport.id}`;

    return new Response(csv, {
      headers: {
        "content-disposition": `attachment; filename="${fileBaseName}-stored-items.csv"`,
        "content-type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Could not export invoice CSV." }, { status: 500 });
  }
}
