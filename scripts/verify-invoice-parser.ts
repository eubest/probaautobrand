import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { invoiceRowsToCsv, parseInvoicePdfDocument, parseInvoiceXmlDocument } from "../src/lib/invoice-pdf";

const defaultPdfPath = resolve(
  process.env.USERPROFILE ?? process.cwd(),
  "Downloads",
  "AD AUTO TOTAL SRL_20241747776_2024_03_01.PDF"
);
const pdfPath = process.argv[2] ? resolve(process.argv[2]) : defaultPdfPath;
const xmlFixture = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>20241747776</cbc:ID>
  <cbc:IssueDate>2024-03-01</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="H87">-1</cbc:InvoicedQuantity>
    <cac:Item>
      <cbc:Name>COMUTATOR PORNIRE FEBI</cbc:Name>
      <cac:SellersItemIdentification>
        <cbc:ID>172812F</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="RON">251.96</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

async function main() {
  const invoice = await parseInvoicePdfDocument(await readFile(pdfPath));
  const csv = invoiceRowsToCsv(invoice.rows);
  const xmlInvoice = parseInvoiceXmlDocument(xmlFixture);

  console.log(
    JSON.stringify(
      {
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt?.toISOString().slice(0, 10) ?? null,
        rows: invoice.rows,
      },
      null,
      2
    )
  );
  console.log(csv);

  if (
    invoice.invoiceNumber !== "20241747776" ||
    invoice.issuedAt?.toISOString().slice(0, 10) !== "2024-03-01" ||
    invoice.rows.length !== 1 ||
    invoice.rows[0]?.productCode !== "172812F" ||
    invoice.rows[0]?.productName !== "COMUTATOR PORNIRE FEBI" ||
    invoice.rows[0]?.unitPrice !== 251.96 ||
    invoice.rows[0]?.currency !== "RON" ||
    invoice.rows[0]?.quantity !== -1
  ) {
    throw new Error("Invoice parser verification failed.");
  }

  if (invoiceRowsToCsv(xmlInvoice.rows) !== csv) {
    throw new Error("Invoice XML parser verification failed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
