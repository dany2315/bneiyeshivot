import {
  BookOpenText,
  CalendarDays,
  FileCheck2,
  HeartHandshake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";

const impactCards = [
  {
    icon: FileCheck2,
    title: "Demarches",
    value: "Visa, koupat holim, ETA-IL",
    progress: 82,
  },
  {
    icon: BookOpenText,
    title: "Torah",
    value: "Mivhanim, limoud, recompenses",
    progress: 74,
  },
  {
    icon: CalendarDays,
    title: "Evenements",
    value: "Chabbat, rencontres, soutien social",
    progress: 68,
  },
  {
    icon: HeartHandshake,
    title: "Urgences",
    value: "Accompagnement humain et terrain",
    progress: 88,
  },
];

export function DonationImpactGrid() {
  return (
    <section className="section border-y border-[var(--border)] bg-white" id="impact">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="info" className="mb-4 px-3 py-2">
              Impact
            </Badge>
            <h2 className="font-serif text-4xl leading-none font-bold text-[var(--primary-strong)] md:text-5xl">
              Ce que votre don finance.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[var(--muted)]">
            Le don peut etre affecte a une action precise, tout en laissant
            l'equipe garder la souplesse necessaire pour les besoins urgents.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {impactCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                className="border-[var(--border)] bg-white shadow-[0_18px_54px_rgba(6,40,70,0.06)]"
                key={item.title}
              >
                <CardHeader>
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.value}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={item.progress}>
                    <ProgressLabel>Priorite terrain</ProgressLabel>
                    <span className="ml-auto text-sm text-[var(--muted)] tabular-nums">
                      {item.progress}%
                    </span>
                  </Progress>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
