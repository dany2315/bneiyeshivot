import Link from "next/link";
import { EventRegistrationStatus } from "@prisma/client";
import {
  addEventPastMedia,
  updateEventRegistrationStatus,
} from "../actions";
import { StatusBadge } from "@/app/components";
import { AdminShell } from "@/components/admin-sidebar";
import { AdminFileInput } from "@/components/admin-file-input";
import { EventCreateDialog } from "@/components/event-create-dialog";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDateTime, parseEventContent } from "@/lib/event-content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";

export const metadata = {
  title: "Admin evenements",
};

const registrationLabels: Record<EventRegistrationStatus, string> = {
  SUBMITTED: "Demande recue",
  CONFIRMED: "Confirmee",
  WAITLISTED: "Liste d'attente",
  CANCELED: "Annulee",
};

function registrationTone(status: EventRegistrationStatus) {
  if (status === "CONFIRMED") return "green";
  if (status === "WAITLISTED" || status === "CANCELED") return "gold";
  return "blue";
}

export default async function AdminEventsPage() {
  await requireAdminUser();
  const now = new Date();
  const events = await prisma.event.findMany({
    include: {
      _count: { select: { registrations: true } },
      registrations: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { startsAt: "desc" },
  });

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>Evenements</h1>
        </div>
        <EventCreateDialog />
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Evenements en base</h2>
          <p>
            Consultez les inscriptions de chaque evenement. Les evenements
            passes peuvent recevoir des photos supplementaires.
          </p>
        </div>
        <div className="grid grid-3">
          {events.map((event) => {
            const isPast = event.startsAt < now;
            const content = parseEventContent(event.content);
            return (
              <Card key={event.id}>
                <CardHeader>
                  <StatusBadge tone={isPast ? "gold" : "blue"}>
                    {isPast ? "Passe" : "A venir"}
                  </StatusBadge>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    {formatDateTime(event.startsAt)} -{" "}
                    {event.location || "Lieu a confirmer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="text-base text-[var(--muted)]">
                    {event.description}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {event._count.registrations} inscription(s)
                    {content.videoUrls.length > 0 &&
                      ` - ${content.videoUrls.length} video(s)`}
                  </p>

                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="secondary">
                          <Users className="size-4" />
                          Voir les inscriptions ({event._count.registrations})
                        </Button>
                      }
                    />
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Inscriptions - {event.title}</DialogTitle>
                        <DialogDescription>
                          {event._count.registrations} inscription(s) pour cet
                          evenement.
                        </DialogDescription>
                      </DialogHeader>
                      {event.registrations.length > 0 ? (
                        <div className="table-wrap">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Bahour</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {event.registrations.map((registration) => (
                                <TableRow key={registration.id}>
                                  <TableCell>
                                    {registration.user
                                      ? [
                                          registration.user.firstName,
                                          registration.user.lastName,
                                        ]
                                          .filter(Boolean)
                                          .join(" ") ||
                                        registration.user.email
                                      : "Sans compte"}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge
                                      tone={registrationTone(
                                        registration.status,
                                      )}
                                    >
                                      {registrationLabels[registration.status]}
                                    </StatusBadge>
                                  </TableCell>
                                  <TableCell>
                                    <form
                                      action={updateEventRegistrationStatus}
                                      className="flex gap-2"
                                    >
                                      <input
                                        name="registrationId"
                                        type="hidden"
                                        value={registration.id}
                                      />
                                      <NativeSelect
                                        className="w-40"
                                        defaultValue={registration.status}
                                        name="status"
                                      >
                                        {Object.values(
                                          EventRegistrationStatus,
                                        ).map((status) => (
                                          <NativeSelectOption
                                            key={status}
                                            value={status}
                                          >
                                            {registrationLabels[status]}
                                          </NativeSelectOption>
                                        ))}
                                      </NativeSelect>
                                      <Button size="sm" type="submit">
                                        OK
                                      </Button>
                                    </form>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="py-6 text-center text-base text-[var(--muted)]">
                          Aucune inscription pour le moment.
                        </p>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button asChild variant="secondary">
                    <Link href={`/evenements/${event.slug}`}>Voir la page</Link>
                  </Button>

                  {isPast && (
                    <form action={addEventPastMedia} className="grid gap-2">
                      <input name="eventId" type="hidden" value={event.id} />
                      <Textarea
                        name="pastPhotos"
                        placeholder="Ou ajouter des URLs photos apres evenement"
                      />
                      <AdminFileInput
                        accept="image/*"
                        description="Photos ajoutees a la galerie publique."
                        multiple
                        name="pastPhotoFiles"
                        title="Choisir des photos"
                      />
                      <Button type="submit" variant="secondary">
                        Ajouter photos
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
