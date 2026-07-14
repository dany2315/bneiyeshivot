import Link from "next/link";
import { EventRegistrationStatus } from "@prisma/client";
import {
  addEventPastMedia,
  createEvent,
  updateEventRegistrationStatus,
} from "../actions";
import { StatusBadge } from "@/app/components";
import { AdminShell } from "@/components/admin-sidebar";
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
import { Input } from "@/components/ui/input";
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
import { CalendarPlus } from "lucide-react";

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
  const [events, registrations] = await Promise.all([
    prisma.event.findMany({
      include: { _count: { select: { registrations: true } } },
      orderBy: { startsAt: "desc" },
    }),
    prisma.eventRegistration.findMany({
      include: { event: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <span className="eyebrow">Back-office</span>
          <h1>Evenements</h1>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button>
                <CalendarPlus />
                Creer un evenement
              </Button>
            }
          />
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Creer un evenement</DialogTitle>
              <DialogDescription>
                Ajoutez les informations publiques, les medias et le choix
                d&apos;inscription.
              </DialogDescription>
            </DialogHeader>
            <form action={createEvent} className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Input name="title" placeholder="Titre" required />
                <Input name="location" placeholder="Lieu" />
                <Input name="startsAt" required type="datetime-local" />
                <Input name="endsAt" type="datetime-local" />
                <Input name="capacity" placeholder="Capacite" type="number" />
                <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-base font-semibold text-[var(--primary)]">
                  <input name="requiresRegistration" type="checkbox" />
                  Demande une inscription
                </label>
              </div>
              <Textarea
                name="description"
                placeholder="Description courte"
                required
              />
              <Textarea name="body" placeholder="Texte complet de l'evenement" />
              <div className="grid gap-2">
                <label className="text-base font-semibold text-[var(--primary)]">
                  Image principale
                </label>
                <Input accept="image/*" name="imageFile" type="file" />
                <Input name="imageUrl" placeholder="Ou URL image principale" />
              </div>
              <Textarea
                name="videoUrls"
                placeholder="Liens videos, un lien par ligne"
              />
              <div className="grid gap-2">
                <label className="text-base font-semibold text-[var(--primary)]">
                  Galerie initiale
                </label>
                <Input accept="image/*" multiple name="galleryFiles" type="file" />
                <Textarea
                  name="gallery"
                  placeholder="Ou URLs photos, separees par ligne ou virgule"
                />
              </div>
              <Button className="w-fit" type="submit">
                Creer l&apos;evenement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Evenements en base</h2>
          <p>
            Les evenements passes peuvent recevoir des photos supplementaires.
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
                  </p>
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
                      <Input
                        accept="image/*"
                        multiple
                        name="pastPhotoFiles"
                        type="file"
                      />
                      <Button type="submit" variant="secondary">
                        Ajouter photos
                      </Button>
                    </form>
                  )}
                  {content.videoUrls.length > 0 && (
                    <span className="text-sm text-[var(--muted)]">
                      {content.videoUrls.length} video(s) renseignee(s)
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Inscriptions evenements</h2>
          <p>Validation rapide des demandes de participation.</p>
        </div>
        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahour</TableHead>
                <TableHead>Evenement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{registration.user?.email ?? "Sans email"}</TableCell>
                  <TableCell>{registration.event.title}</TableCell>
                  <TableCell>
                    <StatusBadge tone={registrationTone(registration.status)}>
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
                        className="w-44"
                        defaultValue={registration.status}
                        name="status"
                      >
                        {Object.values(EventRegistrationStatus).map((status) => (
                          <NativeSelectOption value={status} key={status}>
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
      </section>
    </AdminShell>
  );
}
