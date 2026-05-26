import * as cheerio from "cheerio";

import { prisma } from "@/lib/db";
import { getExchangeRateToRon } from "@/lib/exchange-rate";

const SCRAPE_BASE_URL = "https://www.web-scraping.dev";
const CONSUMABLES_URL = `${SCRAPE_BASE_URL}/products?category=consumables`;

type ScrapeTrigger = "manual" | "cron";

type ScrapedProduct = {
  name: string;
  imageUrl: string;
  price: number;
  priceCurrency: string;
  description: string;
  sourceUrl: string | null;
};

export type ScrapeResult = {
  ok: boolean;
  runId: number;
  productsFound: number;
  productsChanged: number;
  message: string;
};

function absoluteUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  return new URL(value, SCRAPE_BASE_URL).toString();
}

function splitSetCookieHeader(header: string) {
  return header.split(/,(?=\s*[\w-]+=)/g);
}

function getCookieHeader(response: Response) {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = headers.getSetCookie?.() ?? [];
  const fallback = response.headers.get("set-cookie");
  const rawCookies = setCookies.length > 0 ? setCookies : fallback ? splitSetCookieHeader(fallback) : [];

  return rawCookies.map((cookie) => cookie.split(";")[0]).join("; ");
}

async function loginToScrapingSite() {
  const username = process.env.SCRAPE_USERNAME ?? "user123";
  const password = process.env.SCRAPE_PASSWORD ?? "password";
  const response = await fetch(`${SCRAPE_BASE_URL}/api/login`, {
    method: "POST",
    redirect: "manual",
    body: new URLSearchParams({ username, password }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "Autobrand practical assignment scraper",
    },
  });

  if (response.status !== 302 && !response.ok) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  const cookieHeader = getCookieHeader(response);

  if (!cookieHeader) {
    throw new Error("Login succeeded but did not return an auth cookie");
  }

  return cookieHeader;
}

async function fetchProductPage(page: number, cookieHeader: string) {
  const url = page === 1 ? CONSUMABLES_URL : `${CONSUMABLES_URL}&page=${page}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
      "user-agent": "Autobrand practical assignment scraper",
    },
  });

  if (!response.ok) {
    throw new Error(`Product page ${page} failed with status ${response.status}`);
  }

  return response.text();
}

function parsePageCount($: cheerio.CheerioAPI) {
  const meta = $(".paging-meta").text();
  const metaMatch = meta.match(/in\s+(\d+)\s+pages/i);

  if (metaMatch) {
    return Number(metaMatch[1]);
  }

  const pageNumbers = $(".paging a")
    .map((_, element) => Number($(element).text().trim()))
    .get()
    .filter(Number.isFinite);

  return Math.max(1, ...pageNumbers);
}

function parseProducts(html: string, priceCurrency: string) {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $(".product").each((_, element) => {
    const product = $(element);
    const name = product.find("h3 a").text().trim();
    const imageUrl = absoluteUrl(product.find("img").attr("src"));
    const sourceUrl = product.find("h3 a").attr("href");
    const description = product.find(".short-description").text().replace(/\s+/g, " ").trim();
    const priceText = product.find(".price").text().replace(/[^\d.-]/g, "");
    const price = Number(priceText);

    if (!name || !imageUrl || !description || !Number.isFinite(price)) {
      return;
    }

    products.push({
      name,
      imageUrl,
      price,
      priceCurrency,
      description,
      sourceUrl: sourceUrl ? absoluteUrl(sourceUrl) : null,
    });
  });

  return {
    pageCount: parsePageCount($),
    products,
  };
}

export async function scrapeConsumableProducts() {
  const cookieHeader = await loginToScrapingSite();
  const priceCurrency = (process.env.SCRAPE_PRICE_CURRENCY ?? "USD").trim().toUpperCase();
  const firstPage = parseProducts(await fetchProductPage(1, cookieHeader), priceCurrency);
  const allProducts = [...firstPage.products];

  for (let page = 2; page <= firstPage.pageCount; page += 1) {
    const parsedPage = parseProducts(await fetchProductPage(page, cookieHeader), priceCurrency);
    allProducts.push(...parsedPage.products);
  }

  return allProducts;
}

export function isWithinBucharestScrapeWindow(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Europe/Bucharest",
    }).format(date)
  );

  return hour >= 12 && hour <= 18;
}

export async function scrapeAndPersistProducts(trigger: ScrapeTrigger): Promise<ScrapeResult> {
  const run = await prisma.scrapeRun.create({
    data: {
      status: "running",
      trigger,
    },
  });

  try {
    const scrapedProducts = await scrapeConsumableProducts();
    const uniqueProducts = Array.from(
      new Map(scrapedProducts.map((product) => [product.name, product])).values()
    );
    const currency = uniqueProducts[0]?.priceCurrency ?? "USD";
    const exchangeRate = await getExchangeRateToRon(currency);
    let productsChanged = 0;

    for (const product of uniqueProducts) {
      await prisma.product.upsert({
        where: {
          name: product.name,
        },
        create: {
          ...product,
          exchangeRate: exchangeRate?.rateToRon,
          exchangeRateAt: exchangeRate?.date,
          priceRon: exchangeRate ? product.price * exchangeRate.rateToRon : null,
          scrapedAt: new Date(),
        },
        update: {
          imageUrl: product.imageUrl,
          price: product.price,
          priceCurrency: product.priceCurrency,
          description: product.description,
          sourceUrl: product.sourceUrl,
          exchangeRate: exchangeRate?.rateToRon,
          exchangeRateAt: exchangeRate?.date,
          priceRon: exchangeRate ? product.price * exchangeRate.rateToRon : null,
          scrapedAt: new Date(),
        },
      });
      productsChanged += 1;
    }

    const message = exchangeRate
      ? `Saved ${productsChanged} unique products from ${scrapedProducts.length} scraped rows. ${currency}/RON rate: ${exchangeRate.rateToRon.toFixed(4)}.`
      : `Saved ${productsChanged} unique products from ${scrapedProducts.length} scraped rows. Exchange rate for ${currency} was unavailable.`;

    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        message,
        productsChanged,
        productsFound: scrapedProducts.length,
        status: "success",
      },
    });

    return {
      ok: true,
      runId: run.id,
      productsChanged,
      productsFound: scrapedProducts.length,
      message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scraper error";

    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        message,
        status: "failed",
      },
    });

    return {
      ok: false,
      runId: run.id,
      productsChanged: 0,
      productsFound: 0,
      message,
    };
  }
}
