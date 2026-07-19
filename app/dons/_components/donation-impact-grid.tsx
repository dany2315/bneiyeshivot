import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const impactCards = [
  {
    icon: GraduationCap,
    title: "Collelim",
    description:
      "Collel Erev ZIHRON ELIYAHOU : 12 avrekhim. Collel CHICHI CHABBAT Ohel Yaacov : 10 avrekhim.",
  },
  {
    icon: BookOpenText,
    title: "Programme Leachlim",
    description:
      "Etude hebdomadaire Houmach et Rachi sur la Paracha de la semaine : 150 participants francais.",
  },
  {
    icon: UsersRound,
    title: "Yechivot Ben Hazmanim",
    description:
      "150 Ba'hourim, eleves, etudiants, Avrekhim a Paris et Banlieue : Tefila, etude, chiour.",
  },
  {
    icon: CalendarDays,
    title: "Beth Hamidrach Lel Chichi",
    description:
      "Etude le jeudi soir, a Jerusalem pour plusieurs dizaines de Avrekhim, Ba'hourim, etudiants.",
  },
  {
    icon: HeartHandshake,
    title: "Soirees Hizouk",
    description:
      "Grandes soirees tout au long de l'annee reunissant des dizaines de Ba'hourim Francais en France et en Israel.",
  },
];

export function DonationImpactGrid() {
  return (
    <section className="section border-y border-[var(--border)] bg-white" id="impact">
      <div className="container">
        <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(320px,1fr)] lg:items-end">
          <div>
            <Badge variant="info" className="mb-4 px-3 py-2">
              Impact
            </Badge>
            <h2 className="font-serif text-4xl leading-none font-bold text-[var(--primary-strong)] md:text-5xl">
              Concretement, votre don soutient.
            </h2>
          </div>
          <p className="text-base leading-7 text-[var(--muted)]">
            Des cadres de Torah, des temps d'etude et des rassemblements qui
            continuent toute l'annee grace aux donateurs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-6">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
