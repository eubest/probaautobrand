"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale, localeCookieName } from "@/lib/i18n";

export async function changeLocaleAction(formData: FormData) {
  const requestedLocale = String(formData.get("locale") ?? "");
  const nextPath = String(formData.get("next") ?? "/");
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(nextPath.startsWith("/") ? nextPath : "/");
}
