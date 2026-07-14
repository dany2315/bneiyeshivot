import Link from "next/link";
import { AdminShell } from "@/components/admin-sidebar";
import { requireAdminUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office Bnei Yeshivot</span>
          <h1>Dashboard admin</h1>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dashboard en cours de developpement</CardTitle>
          <CardDescription>
            Les KPI, resumes de donnees et actions rapides seront construits
            apres les pages de gestion dediees.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/admin/visa">Gestion visa</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/koupat-holim">Gestion koupat holim</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/evenements">Gestion evenements</Link>
          </Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
