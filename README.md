# Autobrand - Proba practica

Dashboard Next.js + shadcn pentru proba practica Autobrand.

- se autentifica in `web-scraping.dev`
- extrage toate produsele din categoria consumables, cu paginare
- salveaza produsele in SQL cu unicitate dupa denumire
- imbogateste preturile cu cursul BNR si valoarea in RON
- ofera editare, stergere, filtrare si sortare
- incarca PDF-ul eFactura primit, accepta si XML e-Factura ca extra de productie si poate fie sa returneze CSV direct, fie sa salveze importul in baza de date
- afiseaza importurile salvate intr-un tabel shadcn si permite descarcarea CSV-ului din baza de date
- include o ruta cron pregatita pentru productie pe Vercel Hobby; cerinta orara originala este pastrata mai jos, comentata, din cauza limitei Vercel pentru cron jobs
- protejeaza aplicatia cu autentificare simpla, pe baza de cookie semnat
- foloseste romana ca limba implicita, cu toggle romana/engleza salvat in cookie

## Harta proiectului

Daca vrei sa intelegi rapid unde este fiecare lucru, incepe de aici:

- `src/app/page.tsx`: punctul de intrare al dashboard-ului, incarcarea datelor si compunerea paginii.
- `src/components/dashboard/*`: header, statistici, panou pentru facturi si tabelul de produse sunt separate in componente mici.
- `src/lib/dashboard.ts`: helper-ele comune pentru dashboard, tipuri, sortare, formatare data/numar si query string-uri.
- `src/lib/scraper.ts`: login, paginare, parsarea produselor, persistenta produselor unice si imbogatirea cu curs BNR.
- `src/lib/invoice-pdf.ts`: parsare PDF, parsare XML optionala, extragere metadata si generare CSV.
- `src/app/actions.ts`: server actions pentru scrape, editare/stergere si importul facturii.
- `src/app/api/*`: export CSV direct, export CSV din date salvate si ruta de cron.
- `prisma/schema.prisma`: modelul SQL pentru produse, rule de scrape, importuri de facturi si randuri factura.
- `scripts/verify-invoice-parser.ts`: verificare a parserului pe PDF-ul primit si pe un XML de test.

Ordinea recomandata de citire:

1. `README.md`
1. `src/app/page.tsx`
1. `src/components/dashboard/DashboardPage.tsx`
1. `src/lib/dashboard.ts`
1. `src/lib/scraper.ts`
1. `src/lib/invoice-pdf.ts`

## Tehnologii

- Next.js App Router, TypeScript, Tailwind CSS
- componente shadcn UI
- Prisma + Postgres pentru baza de date locala si de productie
- Cheerio + `fetch` pentru scraper
- feed XML BNR pentru cursul valutar
- `pdf-parse` pentru text din PDF
- `fast-xml-parser` pentru cursuri BNR si parsare optionala XML e-Factura

Targetul de scraping afiseaza pretul cu simbol dolar, dar nu expune un cod ISO pentru moneda, asa ca `SCRAPE_PRICE_CURRENCY` are valoarea implicita `USD`. Schimba valoarea in `.env` daca vrei alta moneda sursa.

## Setup local

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Deschide `http://localhost:3000`.

Credentiale locale implicite:

- username: `admin`
- parola: `autobrand`

## Comenzi utile

```bash
npm run dev          # aplicatia locala
npm run build        # verificare build productie
npm run lint         # lint
npm run typecheck    # verificare TypeScript
npm run db:push      # sincronizeaza schema Prisma cu SQLite
npm run verify:invoice # verifica parsarea PDF-ului primit si CSV-ul asteptat
```

## Lista cerinte

- Web scraping + login: implementat in `src/lib/scraper.ts`.
- Tabela SQL si unicitate dupa denumire: `prisma/schema.prisma`, `Product.name @unique`.
- Cron din ora in ora: `src/app/api/cron/scrape/route.ts`, configurat prin `vercel.json`.
- UI pentru produse: `src/app/page.tsx`.
- Editare/stergere articol: `src/components/product-actions.tsx` si `src/app/actions.ts`.
- Download PDF -> CSV direct: `src/app/api/invoice/csv/route.ts` si primul buton din `src/app/page.tsx`.
- Import PDF salvat in baza de date: `src/lib/invoice-pdf.ts`, `scripts/verify-invoice-parser.ts` si al doilea buton din `src/app/page.tsx`.
- Download CSV pentru importurile salvate: `InvoiceImport` / `InvoiceItem` in `prisma/schema.prisma` si `src/app/api/invoice/imports/[id]/csv/route.ts`.
- Revizie si recomandare RO e-Factura: `docs/assignment-review.md`.
- Bonus curs valutar si pret RON: `src/lib/exchange-rate.ts`.
- Bonus filtrare si sortare: controalele din dashboard.
- Bonus autentificare: sesiune semnata in cookie HTTP-only, in `src/lib/auth.ts`.

## Vercel

`vercel.json` apeleaza `/api/cron/scrape` zilnic, la 10:00 UTC. Ruta verifica in plus fereastra 12:00-18:00, ora Europe/Bucharest, ca sa evite surprizele de timezone.

<!-- Cerinta originala din proba: cron din ora in ora intre 12:00 si 18:00, ora Europe/Bucharest. Pe Vercel Hobby aceasta setare este comentata in documentatie si inlocuita cu o rulare zilnica, pentru ca planul limita cron jobs la o executie pe zi. -->

Variabilele de mediu necesare in Vercel:

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

Aplicatia foloseste Postgres si pe local, si pe Vercel. In productie, conecteaza `DATABASE_URL` la Neon sau Vercel Postgres si, daca ai nevoie de migrari separate, foloseste si `DIRECT_URL` pentru conexiunea nepoolata.

Fluxul de deploy:

1. Creezi sau conectezi baza de date Postgres gazduita.
1. Pastrezi `provider = "postgresql"` in `prisma/schema.prisma`.
1. Rulezi `npm run db:push` peste baza de date aleasa.
1. Impingi repository-ul pe GitHub.
1. Importi repo-ul in Vercel.
1. Adaugi variabilele de mediu de mai sus in proiectul Vercel, inclusiv `DIRECT_URL` daca folosesti migrari separate.
1. Faci deploy si verifici aplicatia in `/login` si `/`.
1. Rulezi butonul de scrape manual o data, apoi verifici ruta de cron in log-urile Vercel in fereastra 12:00-18:00, ora Europe/Bucharest.

## Recomandare RO e-Factura

Cerintele cer parsarea PDF-ului si asta este implementat. Pentru o integrare reala RO e-Factura, sursa principala de adevar ar trebui sa fie XML-ul descarcat din ANAF/SPV; PDF-ul ar trebui tratat ca format de vizualizare/export. Proiectul include parsare XML optionala ca extra si explica decizia in `docs/assignment-review.md`.

## Checklist Vercel

Inainte de deploy, verifica:

1. `DATABASE_URL` pointeaza spre o baza de date Postgres reala, gazduita.
1. `DIRECT_URL` exista daca ai nevoie de conexiune nepoolata pentru migrari.
1. `APP_USERNAME`, `APP_PASSWORD` si `AUTH_SECRET` sunt configurate.
1. `SCRAPE_USERNAME`, `SCRAPE_PASSWORD` si `SCRAPE_PRICE_CURRENCY` sunt configurate.
1. `CRON_SECRET` este setat, ca ruta de cron sa nu ramana deschisa in productie.
1. Baza de date a fost initializata cu `npm run db:push` pe provider-ul ales.
1. `npm run build` trece local inainte de primul deploy.

Cron-ul de productie ruleaza zilnic din `vercel.json`, iar ruta limiteaza executia la 12:00-18:00, ora Europe/Bucharest. Daca treci pe Vercel Pro, poti readuce cron-ul orar cerut initial.

## Surse in cod

Daca vrei sa urmaresti comportamentul in implementare, acestea sunt fisierele principale:

- fluxul de scraping: `src/lib/scraper.ts`
- curs valutar: `src/lib/exchange-rate.ts`
- layout dashboard: `src/components/dashboard/DashboardPage.tsx`
- helper-e dashboard: `src/lib/dashboard.ts`
- parsare factura si export CSV: `src/lib/invoice-pdf.ts`
- ruta de download CSV direct: `src/app/api/invoice/csv/route.ts`
- ruta de download CSV pentru importuri salvate: `src/app/api/invoice/imports/[id]/csv/route.ts`
- ruta de cron: `src/app/api/cron/scrape/route.ts`
- schema bazei de date: `prisma/schema.prisma`
- notite si recomandari: `docs/assignment-review.md`

## Verificat local

- `npm run typecheck`
- `npm run lint`
- `npm run verify:invoice`
- `npm run build`
- Cron scrape a returnat 16 randuri scrapate si 6 produse unice.
- PDF-ul `AD AUTO TOTAL...PDF` a returnat:

```csv
cod_produs,denumire_produs,pret_unitar,moneda,cantitate
172812F,COMUTATOR PORNIRE FEBI,251.96,RON,-1
```
