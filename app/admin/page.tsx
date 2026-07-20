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
          <h1>Tableau de bord admin</h1>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Tableau de bord en cours de développement</CardTitle>
          <CardDescription>
            Les KPI, résumés de données et actions rapides seront construits
            après les pages de gestion dédiées.
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
            <Link href="/admin/evenements">Gestion événements</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/boutique">Gestion boutique</Link>
          </Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
