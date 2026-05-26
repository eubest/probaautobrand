import { closeSync, existsSync, mkdirSync, openSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function readDatabaseUrlFromEnvFile() {
  if (!existsSync(".env")) {
    return undefined;
  }

  const env = readFileSync(".env", "utf8");
  const line = env
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith("DATABASE_URL="));

  if (!line) {
    return undefined;
  }

  return line
    .slice("DATABASE_URL=".length)
    .trim()
    .replace(/^["']|["']$/g, "");
}

const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();

if (databaseUrl?.startsWith("file:")) {
  const relativePath = databaseUrl.slice("file:".length);
  const dbPath = resolve("prisma", relativePath);

  mkdirSync(dirname(dbPath), { recursive: true });

  if (!existsSync(dbPath)) {
    closeSync(openSync(dbPath, "w"));
  }
}
