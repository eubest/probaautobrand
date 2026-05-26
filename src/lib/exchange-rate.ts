import { XMLParser } from "fast-xml-parser";

const BNR_RATES_URL = "https://www.bnr.ro/nbrfxrates.xml";

type BnrRateNode = {
  "#text": number | string;
  "@_currency": string;
  "@_multiplier"?: number | string;
};

type BnrPayload = {
  DataSet?: {
    Body?: {
      Cube?: {
        "@_date"?: string;
        Rate?: BnrRateNode | BnrRateNode[];
      };
    };
  };
};

export type ExchangeRate = {
  currency: string;
  date: Date;
  rateToRon: number;
  source: "BNR";
};

export async function getExchangeRateToRon(currency: string): Promise<ExchangeRate | null> {
  const normalizedCurrency = currency.trim().toUpperCase();

  if (normalizedCurrency === "RON") {
    return {
      currency: "RON",
      date: new Date(),
      rateToRon: 1,
      source: "BNR",
    };
  }

  const response = await fetch(BNR_RATES_URL, {
    cache: "no-store",
    headers: {
      accept: "application/xml,text/xml",
    },
  });

  if (!response.ok) {
    return null;
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const payload = parser.parse(await response.text()) as BnrPayload;
  const cube = payload.DataSet?.Body?.Cube;
  const rates = Array.isArray(cube?.Rate) ? cube.Rate : cube?.Rate ? [cube.Rate] : [];
  const match = rates.find((rate) => rate["@_currency"] === normalizedCurrency);

  if (!match) {
    return null;
  }

  const rawRate = Number(match["#text"]);
  const multiplier = Number(match["@_multiplier"] ?? 1);
  const publishedAt = cube?.["@_date"] ? new Date(`${cube["@_date"]}T00:00:00.000Z`) : new Date();

  if (!Number.isFinite(rawRate) || !Number.isFinite(multiplier) || multiplier <= 0) {
    return null;
  }

  return {
    currency: normalizedCurrency,
    date: publishedAt,
    rateToRon: rawRate / multiplier,
    source: "BNR",
  };
}
