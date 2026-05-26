# Autobrand Practical Assignment

Next.js + shadcn dashboard for the Autobrand practical test:

- logs in to `web-scraping.dev`
- scrapes all consumables products across pagination
- stores products in SQL with a unique product-name constraint
- enriches scraped prices with the BNR exchange rate and RON value
- exposes edit/delete/filter/sort controls
- uploads the supplied eFactura PDF, also accepts e-Factura XML as a production-minded extra, and can either return CSV immediately or store imports in SQL
- previews stored invoice rows in a shadcn table and downloads saved CSV data back from the database
- includes a cron-ready endpoint for hourly scraping between 12:00 and 18:00 Europe/Bucharest
- protects the app with simple signed-cookie authentication
- uses Romanian as the default interface language, with a Romanian/English toggle saved in a cookie

## Project Map

Start here if you want to understand the code quickly:

- `src/app/page.tsx`: server-side dashboard entrypoint, data loading, and composition.
- `src/components/dashboard/*`: the dashboard is split into header, stats, invoice panel, and product table pieces.
- `src/lib/dashboard.ts`: shared dashboard helpers, types, sort logic, date/number formatting, and query-string helpers.
- `src/lib/scraper.ts`: login, pagination, product parsing, unique-product persistence, and BNR enrichment.
- `src/lib/invoice-pdf.ts`: PDF parsing, optional XML parsing, metadata extraction, and CSV generation.
- `src/app/actions.ts`: server actions for scrape, edit/delete, and invoice import.
- `src/app/api/*`: direct invoice CSV download, stored invoice download, and cron scraping.
- `prisma/schema.prisma`: the SQL data model for products, scrape runs, invoice imports, and invoice rows.
- `scripts/verify-invoice-parser.ts`: parser verification against the supplied PDF and a sample XML invoice.

Recommended reading order:

1. `README.md`
2. `src/app/page.tsx`
3. `src/components/dashboard/DashboardPage.tsx`
4. `src/lib/dashboard.ts`
5. `src/lib/scraper.ts`
6. `src/lib/invoice-pdf.ts`

## Tech Stack

- Next.js App Router, TypeScript, Tailwind CSS
- shadcn UI components
- Prisma + SQLite for a self-contained local SQL database
- Cheerio + `fetch` for the scraper
- BNR XML feed for exchange rates
- `pdf-parse` for PDF text extraction
- `fast-xml-parser` for BNR rates and optional e-Factura XML parsing

The scraper target uses a dollar price display but does not expose an ISO currency code, so `SCRAPE_PRICE_CURRENCY` defaults to `USD`. Change it in `.env` if you want a different source currency.

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

Default local app credentials:

- username: `admin`
- password: `autobrand`

## Useful Commands

```bash
npm run dev          # local app
npm run build        # production build check
npm run lint         # lint
npm run typecheck    # TypeScript check
npm run db:push      # sync Prisma schema to SQLite
npm run verify:invoice # parse the supplied invoice PDF and assert the expected CSV row
```

## Assignment Checklist

- Web scraping + login: implemented in `src/lib/scraper.ts`.
- SQL table and unique product names: `prisma/schema.prisma`, `Product.name @unique`.
- Hourly cron route: `src/app/api/cron/scrape/route.ts`, configured by `vercel.json`.
- Product UI: `src/app/page.tsx`.
- Edit/delete article: `src/components/product-actions.tsx` and `src/app/actions.ts`.
- Direct PDF to CSV download: `src/app/api/invoice/csv/route.ts` and the first invoice button in `src/app/page.tsx`.
- Persisted PDF import: `src/lib/invoice-pdf.ts`, `scripts/verify-invoice-parser.ts`, and the second invoice button in `src/app/page.tsx`.
- Stored invoice CSV download: `InvoiceImport` / `InvoiceItem` in `prisma/schema.prisma` and `src/app/api/invoice/imports/[id]/csv/route.ts`.
- Review and RO e-Factura recommendation: `docs/assignment-review.md`.
- Bonus exchange rate and RON price: `src/lib/exchange-rate.ts`.
- Bonus filtering/sorting: dashboard query controls.
- Bonus auth: signed HTTP-only cookie session in `src/lib/auth.ts`.

## Vercel Notes

`vercel.json` calls `/api/cron/scrape` every hour. The route itself skips work outside 12:00-18:00 Europe/Bucharest, which avoids timezone surprises.

For a deployed demo, set these environment variables in Vercel:

```bash
DATABASE_URL
APP_USERNAME
APP_PASSWORD
AUTH_SECRET
CRON_SECRET
SCRAPE_USERNAME
SCRAPE_PASSWORD
SCRAPE_PRICE_CURRENCY
```

SQLite is intentionally used for easy local review. For a persistent Vercel deployment, use a hosted SQL database such as Neon/Vercel Postgres and switch the Prisma datasource provider to `postgresql` before deploying.

Deployment flow:

1. Create a hosted Postgres database.
1. Update `prisma/schema.prisma` to use `provider = "postgresql"` for the deployed branch.
1. Run `npm run db:push` or your preferred Prisma migration flow against that hosted database.
1. Push the repository to GitHub.
1. Import the repo into Vercel.
1. Add the environment variables above in the Vercel project settings.
1. Deploy and verify the app at `/login` and `/`.
1. Trigger the manual scrape button once, then verify the cron endpoint in Vercel logs later in the 12:00-18:00 Europe/Bucharest window.

## RO e-Factura Recommendation

The assignment asks for PDF parsing, which is implemented. For a production RO e-Factura integration, the recommended source of truth is the XML document retrieved through the ANAF/SPV API; PDF should be treated as a visual/export format. This project includes optional XML parsing as an extra and documents the reasoning in `docs/assignment-review.md`.

## Vercel Checklist

Before deploying, make sure these are set:

1. `DATABASE_URL` points to a real hosted SQL database.
1. `APP_USERNAME`, `APP_PASSWORD`, and `AUTH_SECRET` are configured.
1. `SCRAPE_USERNAME`, `SCRAPE_PASSWORD`, and `SCRAPE_PRICE_CURRENCY` are configured.
1. `CRON_SECRET` is configured so the cron route is not open in production.
1. The database has been initialized with `npm run db:push` against the chosen provider.
1. `npm run build` passes locally before the first deploy.

The deployed cron runs hourly through `vercel.json`, while the route itself limits execution to 12:00-18:00 Europe/Bucharest.

## Sources In Code

If you want to trace any behavior back to the implementation, these are the main source files:

- Scraping flow: `src/lib/scraper.ts`
- Exchange rates: `src/lib/exchange-rate.ts`
- Dashboard layout: `src/components/dashboard/DashboardPage.tsx`
- Dashboard helpers: `src/lib/dashboard.ts`
- Invoice parsing and CSV export: `src/lib/invoice-pdf.ts`
- Invoice direct download route: `src/app/api/invoice/csv/route.ts`
- Stored invoice download route: `src/app/api/invoice/imports/[id]/csv/route.ts`
- Cron route: `src/app/api/cron/scrape/route.ts`
- Database schema: `prisma/schema.prisma`
- Review notes and recommendations: `docs/assignment-review.md`

## Verified Locally

- `npm run typecheck`
- `npm run lint`
- `npm run verify:invoice`
- `npm run build`
- Cron scrape returned 16 scraped rows saved as 6 unique product names.
- The provided `AD AUTO TOTAL...PDF` returned:

```csv
cod_produs,denumire_produs,pret_unitar,moneda,cantitate
172812F,COMUTATOR PORNIRE FEBI,251.96,RON,-1
```
