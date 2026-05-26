import { NextResponse } from "next/server";

import { safeEqual } from "@/lib/auth";
import { isWithinBucharestScrapeWindow, scrapeAndPersistProducts } from "@/lib/scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const hasConfiguredSecret = secret && !secret.startsWith("replace-this") && !secret.startsWith("change-me");

  if (!hasConfiguredSecret && process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!hasConfiguredSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  return token ? safeEqual(token, secret) : false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWithinBucharestScrapeWindow()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: "Outside the configured 12:00-18:00 Europe/Bucharest scraping window.",
    });
  }

  const result = await scrapeAndPersistProducts("cron");

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
