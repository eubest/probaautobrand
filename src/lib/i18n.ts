import { cookies } from "next/headers";

export const locales = ["ro", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ro";
export const localeCookieName = "autobrand_locale";

const dictionaries = {
  ro: {
    common: {
      appBadge: "Proba Autobrand",
      notAvailable: "n/a",
      reset: "Reseteaza",
      signedInAs: "Autentificat ca",
      switchTo: "English",
    },
    login: {
      badge: "Demo Autobrand",
      title: "Autentificare",
      description: "Acces protejat pentru consola de scraping.",
      errorTitle: "Autentificare esuata",
      errorDescription: "Verifica utilizatorul si parola din fisierul de environment.",
      username: "Utilizator",
      password: "Parola",
      submit: "Intra in aplicatie",
    },
    dashboard: {
      title: "Consola de produse",
      subtitle:
        "Scrape pentru consumabile, preturi imbogatite cu curs BNR, editare produse si export CSV din factura.",
      runScrape: "Ruleaza scrape",
      signOut: "Iesire",
      stats: {
        products: "Produse",
        productsDescription: "Denumiri unice in SQL",
        filtered: "Filtrate",
        filteredDescription: "Randuri in vizualizarea curenta",
        exchangeRate: "Curs valutar",
        exchangeRateDescription: "prin BNR",
        lastRun: "Ultima rulare",
        noScrapeYet: "Fara rulare",
        noRunMessage: "Ruleaza scraperul pentru a popula datele.",
      },
      controls: {
        title: "Controale catalog",
        description: "Filtreaza, sorteaza si reimprospateaza catalogul salvat.",
        search: "Cautare",
        searchPlaceholder: "Denumire, descriere, moneda",
        sort: "Sortare",
        sortLastScraped: "Ultimul scrape",
        sortName: "Denumire",
        sortPrice: "Pret",
        sortPriceRon: "Pret RON",
        order: "Ordine",
        descending: "Descrescator",
        ascending: "Crescator",
        apply: "Aplica",
      },
      invoice: {
        title: "Factura CSV",
        description: "Incarca PDF-ul cerut sau XML-ul e-Factura, apoi genereaza CSV direct ori salveaza randurile.",
        pdfFile: "Fisier PDF sau XML",
        generate: "Genereaza CSV",
        importAndSave: "Importa si salveaza",
        download: "Descarca CSV",
        historyTitle: "Importuri",
        noImports: "Nu exista importuri salvate.",
        rowSingular: "rand CSV",
        rowsPlural: "randuri CSV",
        previewTitle: "Randuri CSV extrase",
        previewDescription: "Datele sunt citite din baza de date, nu dintr-un fisier temporar.",
        invoiceNumber: "Factura",
        importedAt: "Importat",
        issuedAt: "Emisa la",
        line: "Linia",
        productCode: "Cod produs",
        productName: "Denumire produs",
        unitPrice: "Pret unitar",
        currency: "Moneda",
        quantity: "Cantitate",
        sourceFile: "Fisier sursa",
      },
      table: {
        title: "Produse salvate",
        description: "Randurile sunt salvate dupa denumire unica, conform cerintei.",
        image: "Imagine",
        product: "Produs",
        sourcePrice: "Pret sursa",
        ronPrice: "Pret RON",
        scraped: "Scrapat",
        actions: "Actiuni",
        empty: "Nu exista produse in aceasta vizualizare.",
        noRate: "fara curs",
        rate: "curs",
      },
      notices: {
        deleted: {
          title: "Produs sters",
          description: "Produsul a fost eliminat din baza de date.",
        },
        failed: {
          title: "Scrape esuat",
          description: "Rularea a fost salvata in istoric. Verifica mesajul ultimei rulari.",
        },
        invalid: {
          title: "Nu s-a putut salva",
          description: "Unul sau mai multe campuri trimise sunt invalide.",
        },
        scraped: {
          title: "Scrape finalizat",
          description: "Produsele au fost actualizate din web-scraping.dev si salvate dupa denumire unica.",
        },
        "invoice-imported": {
          title: "Factura importata",
          description: "Randurile extrase au fost salvate si pot fi descarcate din baza de date.",
        },
        "invoice-failed": {
          title: "Import factura esuat",
          description: "PDF-ul nu a putut fi interpretat. Verifica fisierul si incearca din nou.",
        },
        updated: {
          title: "Produs actualizat",
          description: "Randul editat a fost salvat cu succes.",
        },
      },
      runStatus: {
        failed: "esuat",
        running: "in curs",
        success: "succes",
      },
    },
    productActions: {
      openSource: "Deschide sursa",
      edit: "Editeaza",
      editTitle: "Editeaza produsul",
      editDescription: "Modificarile sunt salvate in baza de date SQL locala.",
      name: "Denumire",
      imageUrl: "URL imagine",
      price: "Pret",
      currency: "Moneda",
      ronRate: "Curs RON",
      description: "Descriere",
      cancel: "Anuleaza",
      save: "Salveaza",
      delete: "Sterge",
      deleteConfirm: "Stergi",
    },
  },
  en: {
    common: {
      appBadge: "Autobrand Practical",
      notAvailable: "n/a",
      reset: "Reset",
      signedInAs: "Signed in as",
      switchTo: "Romana",
    },
    login: {
      badge: "Autobrand Demo",
      title: "Sign In",
      description: "Protected access for the scraping dashboard.",
      errorTitle: "Login Failed",
      errorDescription: "Check the username and password from your environment file.",
      username: "Username",
      password: "Password",
      submit: "Sign in",
    },
    dashboard: {
      title: "Product Intelligence Console",
      subtitle:
        "Scrape consumables, enrich prices with BNR exchange rates, edit saved rows, and extract invoice items to CSV.",
      runScrape: "Run Scrape",
      signOut: "Sign out",
      stats: {
        products: "Products",
        productsDescription: "Unique names in SQL",
        filtered: "Filtered",
        filteredDescription: "Rows matching view",
        exchangeRate: "Exchange Rate",
        exchangeRateDescription: "via BNR",
        lastRun: "Last Run",
        noScrapeYet: "No scrape yet",
        noRunMessage: "Run the scraper to populate data.",
      },
      controls: {
        title: "Catalog Controls",
        description: "Filter, sort, and refresh the stored consumables catalog.",
        search: "Search",
        searchPlaceholder: "Name, description, currency",
        sort: "Sort",
        sortLastScraped: "Last scraped",
        sortName: "Name",
        sortPrice: "Price",
        sortPriceRon: "RON price",
        order: "Order",
        descending: "Descending",
        ascending: "Ascending",
        apply: "Apply",
      },
      invoice: {
        title: "Invoice CSV",
        description: "Upload the required PDF or the e-Factura XML, then generate CSV directly or save the rows.",
        pdfFile: "PDF or XML file",
        generate: "Generate CSV",
        importAndSave: "Import and save",
        download: "Download CSV",
        historyTitle: "Imports",
        noImports: "No saved imports yet.",
        rowSingular: "CSV row",
        rowsPlural: "CSV rows",
        previewTitle: "Extracted CSV Rows",
        previewDescription: "These rows are loaded from the database, not a temporary file.",
        invoiceNumber: "Invoice",
        importedAt: "Imported",
        issuedAt: "Issued",
        line: "Line",
        productCode: "Product code",
        productName: "Product name",
        unitPrice: "Unit price",
        currency: "Currency",
        quantity: "Quantity",
        sourceFile: "Source file",
      },
      table: {
        title: "Stored Products",
        description: "Database rows are upserted by product name to satisfy the uniqueness rule.",
        image: "Image",
        product: "Product",
        sourcePrice: "Source Price",
        ronPrice: "RON Price",
        scraped: "Scraped",
        actions: "Actions",
        empty: "No products in this view.",
        noRate: "no rate",
        rate: "rate",
      },
      notices: {
        deleted: {
          title: "Product deleted",
          description: "The product was removed from the database.",
        },
        failed: {
          title: "Scrape failed",
          description: "The scrape run was logged. Check the latest run message for details.",
        },
        invalid: {
          title: "Could not save",
          description: "One or more submitted fields were invalid.",
        },
        scraped: {
          title: "Scrape complete",
          description: "Products were refreshed from web-scraping.dev and saved by unique name.",
        },
        "invoice-imported": {
          title: "Invoice imported",
          description: "Extracted rows were saved and can be downloaded from the database.",
        },
        "invoice-failed": {
          title: "Invoice import failed",
          description: "The PDF could not be parsed. Check the file and try again.",
        },
        updated: {
          title: "Product updated",
          description: "The edited row was saved successfully.",
        },
      },
      runStatus: {
        failed: "failed",
        running: "running",
        success: "success",
      },
    },
    productActions: {
      openSource: "Open source",
      edit: "Edit",
      editTitle: "Edit Product",
      editDescription: "Changes are saved to the local SQL database.",
      name: "Name",
      imageUrl: "Image URL",
      price: "Price",
      currency: "Currency",
      ronRate: "RON Rate",
      description: "Description",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      deleteConfirm: "Delete",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export async function getLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get(localeCookieName)?.value;

  return isLocale(locale) ? locale : defaultLocale;
}
