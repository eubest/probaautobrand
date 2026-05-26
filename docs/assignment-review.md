# Revizie cerinte Autobrand

Verificat la 2026-05-25.

## Matrice cerinte

| Cerinta | Status | Implementare | Atentie / imbunatatire |
| --- | --- | --- | --- |
| Autentificare pe `web-scraping.dev/login` | Acoperit | `src/lib/scraper.ts` foloseste acelasi flux HTTP pentru login si pagini de produse. | Pentru productie, as adauga test de contract pe HTML ca sa prindem schimbari de markup. |
| Accesare `products?category=consumables` si extragere poza, denumire, pret, descriere | Acoperit | `scrapeConsumableProducts()` parcurge paginarea si extrage campurile cerute. Dry-run curent: 16 randuri, 6 denumiri unice. | Pretul de pe site foloseste simbol `$`, nu cod ISO; aplicatia documenteaza `SCRAPE_PRICE_CURRENCY=USD`. |
| Cron din ora in ora intre 12:00 si 18:00 | Partial in Hobby, complet pe Pro | In repo cerinta este implementata in ruta, dar `vercel.json` foloseste acum o rulare zilnica pentru a respecta limita Vercel Hobby. | In Vercel trebuie setat `CRON_SECRET`; daca treci pe Pro, poti reveni la hourly. |
| Baza de date si unicitate dupa denumire | Acoperit | Prisma `Product.name @unique`, `upsert` dupa `name`. | Proiectul ruleaza acum pe Postgres, asa ca pentru Vercel ai nevoie doar de o baza gazduita si de `DATABASE_URL`. |
| Interfata web pentru afisare | Acoperit | Dashboard Next.js + shadcn table in `src/app/page.tsx`. | Ar ajuta un screenshot in README pentru evaluator. |
| Editare articol | Acoperit | `ProductActions` + `updateProductAction`. | Validarea e buna; se poate adauga audit trail daca vrem bonus mai business. |
| Stergere articol | Acoperit | `deleteProductAction` cu confirmare browser. | Pentru UX, un toast optimistic ar fi mai placut, dar nu este cerut. |
| Incarcare PDF factura | Acoperit | Inputul accepta PDF; ruta directa si importul DB folosesc acelasi parser. | Parserul PDF este legat de layout-ul facturii primite; pentru scalare recomand XML. |
| Extragere cod produs, denumire, pret unitar, moneda, cantitate | Acoperit | `src/lib/invoice-pdf.ts`, verificat pe PDF-ul furnizat. | Am adaugat si suport XML e-Factura pentru aceleasi campuri. |
| Generare si returnare CSV | Acoperit | Primul buton trimite la `/api/invoice/csv` si returneaza fisierul. | Al doilea buton salveaza in DB si permite download ulterior. |
| Bonus curs valutar + pret RON | Acoperit | `src/lib/exchange-rate.ts` citeste feed-ul XML BNR si salveaza cursul + RON. | Daca moneda sursa nu e EUR/RON, trebuie doar ajustat `.env`. |
| Bonus filtrare/sortare | Acoperit | Cautare + sortare dupa nume, pret, pret RON, data scrape. | Se poate adauga filtrare pe moneda/status pentru demo. |
| Bonus autentificare simpla | Acoperit | Cookie semnat HTTP-only in `src/lib/auth.ts`. | Pentru productie: secret puternic, HTTPS, eventual provider real. |

## Recomandare RO e-Factura

Recomandarea buna pentru prezentare este: PDF-ul este potrivit pentru cerinta probei si pentru vizualizare, dar intr-un sistem real as procesa XML-ul RO e-Factura ca sursa principala de date.

Motive:

- Ghidul ANAF descrie factura electronica drept fisier XML bazat pe EN 16931 si regulile nationale RO-CIUS.
- ANAF/MF expune servicii web pentru fluxul e-Factura: upload XML, stare mesaj, lista mesaje si descarcare.
- ANAF pune la dispozitie si utilitare separate pentru validare XML si transformare XML in PDF, ceea ce intareste ideea ca PDF-ul este format derivat, nu sursa structurata.

Ce am adaugat in aplicatie:

- acelasi input accepta acum PDF sau XML;
- CSV-ul direct functioneaza pentru ambele formate;
- importul in baza de date functioneaza pentru ambele formate;
- scriptul `npm run verify:invoice` valideaza PDF-ul furnizat si un XML UBL minimal cu aceleasi valori.

Urmatorul pas realist, daca proiectul ar continua:

1. conectare OAuth/SPV la API ANAF;
2. descarcare XML semnat sau raspuns ZIP din e-Factura;
3. validare XML inainte de parsare;
4. parsare XML ca sursa canonica;
5. generare PDF/CSV doar ca exporturi.

## Surse utile

- ANAF - pagina e-Factura: https://static.anaf.ro/static/10/Anaf/Informatii_R/e_factura.htm
- ANAF - ghid RO e-Factura: https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf
- ANAF - servicii web e-Factura: https://static.anaf.ro/static/10/Anaf/Informatii_R/Servicii_web/url_eFactura.html
- ANAF - inregistrare OAuth pentru dezvoltatori: https://www.anaf.ro/InregOauth/
- ANAF - validare XML factura: https://www.anaf.ro/uploadxmi/
- ANAF - transformare XML e-Factura in PDF: https://www.anaf.ro/uploadxml/
