import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/login/actions";
import { LocaleToggle } from "@/components/locale-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const params = await searchParams;
  const nextPath = params.error ? "/login?error=invalid" : "/login";

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-4">
      <Card className="w-full max-w-sm rounded-lg">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white">
              <LockKeyhole className="size-4" />
            </div>
            <Badge variant="outline">{dictionary.login.badge}</Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{dictionary.login.title}</CardTitle>
              <CardDescription>{dictionary.login.description}</CardDescription>
            </div>
            <LocaleToggle label={dictionary.common.switchTo} locale={locale} nextPath={nextPath} />
          </div>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <Alert className="mb-4" variant="destructive">
              <AlertTitle>{dictionary.login.errorTitle}</AlertTitle>
              <AlertDescription>{dictionary.login.errorDescription}</AlertDescription>
            </Alert>
          ) : null}

          <form action={loginAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{dictionary.login.username}</Label>
              <Input id="username" name="username" required autoComplete="username" defaultValue="admin" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{dictionary.login.password}</Label>
              <Input id="password" name="password" required type="password" autoComplete="current-password" />
            </div>
            <Button className="w-full" type="submit">
              <LockKeyhole />
              {dictionary.login.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
