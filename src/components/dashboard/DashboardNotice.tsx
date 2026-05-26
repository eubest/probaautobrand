import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DashboardNoticeCopy } from "@/lib/dashboard";

type DashboardNoticeProps = {
  notice?: DashboardNoticeCopy;
};

export function DashboardNotice({ notice }: DashboardNoticeProps) {
  if (!notice) {
    return null;
  }

  return (
    <Alert variant={notice.destructive ? "destructive" : "default"}>
      <AlertTitle>{notice.title}</AlertTitle>
      <AlertDescription>{notice.description}</AlertDescription>
    </Alert>
  );
}
