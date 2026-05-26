"use server";

import { redirect } from "next/navigation";

import { clearSession, createSession, verifyCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    redirect("/login?error=invalid");
  }

  await createSession(username);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
