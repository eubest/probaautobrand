import { NextResponse } from "next/server";

import { assertSession, UnauthorizedError } from "@/lib/auth";
import { invoiceRowsToCsv, parseInvoiceDocument } from "@/lib/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await assertSession();
    const formData = await request.formData();
    const file = formData.get("invoice");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF invoice." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const invoice = await parseInvoiceDocument(buffer, file.name);
    const csv = invoiceRowsToCsv(invoice.rows);

    return new Response(csv, {
      headers: {
        "content-disposition": `attachment; filename="${file.name.replace(/\.(pdf|xml)$/i, "") || "invoice"}-items.csv"`,
        "content-type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse invoice." },
      { status: 422 }
    );
  }
}
