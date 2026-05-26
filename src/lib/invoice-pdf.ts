import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { XMLParser } from "fast-xml-parser";

export type InvoiceCsvRow = {
  lineNumber?: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  currency: string;
  quantity: number;
};

export type InvoiceParseResult = {
  invoiceNumber: string | null;
  issuedAt: Date | null;
  rows: InvoiceCsvRow[];
};

type XmlRecord = Record<string, unknown>;

function normalizeText(text: string) {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n+/g, "\n").trim();
}

function toNumber(value: string) {
  return Number(value.replace(",", "."));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanProductName(value: string) {
  return value.replace(/\s+/g, " ").replace(/[:;,.-]+$/g, "").trim();
}

export function parseInvoiceText(text: string): InvoiceCsvRow[] {
  const normalized = normalizeText(text).replace(/\s+/g, " ");
  const rows: InvoiceCsvRow[] = [];
  const identifierPattern =
    /Identificator vanzator articol pentru linia\s+(\d+)\s*:?\s*([A-Z0-9-]+?)(?=[A-Z][a-z]|\s|$)/g;

  for (const match of normalized.matchAll(identifierPattern)) {
    const lineNumber = match[1];
    const productCode = match[2].trim();
    const matchIndex = match.index ?? 0;
    const windowBeforeIdentifier = normalized.slice(Math.max(0, matchIndex - 700), matchIndex).trim();
    const codeIndexes = Array.from(
      windowBeforeIdentifier.matchAll(new RegExp(escapeRegExp(productCode), "g")),
      (codeMatch) => codeMatch.index ?? -1
    ).filter((index) => index >= 0);

    for (const codeIndex of codeIndexes) {
      const prefix = windowBeforeIdentifier.slice(0, codeIndex);
      const suffix = windowBeforeIdentifier.slice(codeIndex + productCode.length).trim();
      const numericMatch = prefix.match(
        /([+-]?\d+(?:[.,]\d+)?)\s+([A-Z]{3})\s+([+-]?\d+(?:[.,]\d+)?)\s+([+-]?\d+(?:[.,]\d+)?)\s+[A-Z0-9]+\s+\d+(?:[.,]\d+)?\s+[+-]?\d+(?:[.,]\d+)?\s*$/i
      );
      const nameMatch =
        suffix.match(new RegExp(`(.+?)\\s*${escapeRegExp(lineNumber)}\\s+${escapeRegExp(productCode)}\\s*$`, "i")) ??
        suffix.match(new RegExp(`(.+?)\\s*${escapeRegExp(lineNumber)}\\s*$`, "i"));

      if (!numericMatch || !nameMatch) {
        continue;
      }

      rows.push({
        lineNumber: Number(lineNumber),
        productCode,
        productName: cleanProductName(nameMatch[1]),
        unitPrice: toNumber(numericMatch[1]),
        currency: numericMatch[2].toUpperCase(),
        quantity: toNumber(numericMatch[4]),
      });
      break;
    }
  }

  return rows;
}

export function parseInvoiceMetadata(text: string) {
  const normalized = normalizeText(text).replace(/\s+/g, " ");
  const invoiceNumber = normalized.match(/RO eFactura\s+(\d+)/i)?.[1] ?? null;
  const issuedAtText = normalized.match(/Data emitere\s+(\d{4}-\d{2}-\d{2})/i)?.[1] ?? null;
  const issuedAt = issuedAtText ? new Date(`${issuedAtText}T00:00:00.000Z`) : null;

  return {
    invoiceNumber,
    issuedAt: issuedAt && Number.isFinite(issuedAt.getTime()) ? issuedAt : null,
  };
}

function csvValue(value: string | number) {
  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function asArray(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is XmlRecord {
  return typeof value === "object" && value !== null;
}

function nodeText(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (isRecord(value)) {
    const text = value["#text"];

    if (typeof text === "string" || typeof text === "number") {
      return String(text).trim();
    }
  }

  return null;
}

function child(record: unknown, key: string) {
  return isRecord(record) ? record[key] : undefined;
}

function firstText(record: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = record;

    for (const part of path) {
      current = child(current, part);
    }

    const text = nodeText(current);

    if (text) {
      return text;
    }
  }

  return null;
}

function attribute(value: unknown, name: string) {
  if (!isRecord(value)) {
    return null;
  }

  const rawValue = value[`@_${name}`] ?? value[`@${name}`] ?? value[name];

  return typeof rawValue === "string" || typeof rawValue === "number" ? String(rawValue) : null;
}

function parseXmlDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function parseInvoiceXmlLine(line: unknown, documentCurrency: string | null): InvoiceCsvRow | null {
  const productCode = firstText(line, [
    ["Item", "SellersItemIdentification", "ID"],
    ["Item", "StandardItemIdentification", "ID"],
    ["Item", "BuyersItemIdentification", "ID"],
    ["Item", "ID"],
  ]);
  const productName = firstText(line, [
    ["Item", "Name"],
    ["Item", "Description"],
  ]);
  const priceNode = child(child(line, "Price"), "PriceAmount");
  const unitPrice = Number(nodeText(priceNode)?.replace(",", "."));
  const currency = attribute(priceNode, "currencyID") ?? documentCurrency;
  const quantity = Number(
    firstText(line, [
      ["InvoicedQuantity"],
      ["CreditedQuantity"],
      ["Quantity"],
    ])?.replace(",", ".")
  );

  if (!productCode || !productName || !currency || !Number.isFinite(unitPrice) || !Number.isFinite(quantity)) {
    return null;
  }

  const lineNumber = Number(firstText(line, [["ID"]]));

  return {
    currency: currency.toUpperCase(),
    lineNumber: Number.isFinite(lineNumber) ? lineNumber : undefined,
    productCode,
    productName: cleanProductName(productName),
    quantity,
    unitPrice,
  };
}

export function parseInvoiceXmlDocument(xml: string): InvoiceParseResult {
  const parser = new XMLParser({
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    parseAttributeValue: true,
    parseTagValue: true,
    removeNSPrefix: true,
    textNodeName: "#text",
    trimValues: true,
  });
  const parsed = parser.parse(xml) as XmlRecord;
  const root = child(parsed, "Invoice") ?? child(parsed, "CreditNote");
  const documentCurrency = firstText(root, [["DocumentCurrencyCode"]])?.toUpperCase() ?? null;
  const lines = [
    ...asArray(child(root, "InvoiceLine")),
    ...asArray(child(root, "CreditNoteLine")),
  ];
  const rows = lines
    .map((line) => parseInvoiceXmlLine(line, documentCurrency))
    .filter((row): row is InvoiceCsvRow => Boolean(row));

  if (rows.length === 0) {
    throw new Error("No invoice product rows could be extracted from this XML.");
  }

  return {
    invoiceNumber: firstText(root, [["ID"]]),
    issuedAt: parseXmlDate(firstText(root, [["IssueDate"]])),
    rows,
  };
}

export async function parseInvoicePdf(buffer: Buffer) {
  const document = await parseInvoicePdfDocument(buffer);

  return document.rows;
}

export async function parseInvoiceDocument(buffer: Buffer, fileName: string): Promise<InvoiceParseResult> {
  if (/\.xml$/i.test(fileName)) {
    return parseInvoiceXmlDocument(buffer.toString("utf8"));
  }

  return parseInvoicePdfDocument(buffer);
}

export async function parseInvoicePdfDocument(buffer: Buffer): Promise<InvoiceParseResult> {
  const parsed = await pdfParse(buffer);
  const rows = parseInvoiceText(parsed.text);

  if (rows.length === 0) {
    throw new Error("No invoice product rows could be extracted from this PDF.");
  }

  return {
    ...parseInvoiceMetadata(parsed.text),
    rows,
  };
}

export function invoiceRowsToCsv(rows: InvoiceCsvRow[]) {
  const header = ["cod_produs", "denumire_produs", "pret_unitar", "moneda", "cantitate"];
  const body = rows.map((row) =>
    [row.productCode, row.productName, row.unitPrice.toFixed(2), row.currency, row.quantity].map(csvValue).join(",")
  );

  return [header.join(","), ...body].join("\r\n");
}
