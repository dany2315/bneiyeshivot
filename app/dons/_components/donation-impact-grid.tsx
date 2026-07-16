import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      "Étude hebdomadaire Houmach et Rachi sur la Paracha de la semaine : 150 participants français.",
  },
  {
    icon: UsersRound,
    title: "Yechivot Ben Hazmanim",
    description:
      "150 Ba'hourim, élèves, étudiants, Avrekhim à Paris et Banlieue : Tefila, étude, chiour.",
  },
  {
    icon: CalendarDays,
    title: "Beth Hamidrach Lel Chichi",
    description:
      "Étude le jeudi soir, à Jérusalem pour plusieurs dizaines de Avrekhim, Ba'hourim, étudiants.",
  },
  {
    icon: HeartHandshake,
    title: "Soirées Hizouk",
    description:
      "Grandes soirées tout au long de l'année réunissant des dizaines de Ba'hourim Français en France et en Israël.",
  },
];

export function DonationImpactGrid() {
  return (
    <section className="section border-y border-[var(--border)] bg-white" id="impact">
      <div className="container">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(320px,1fr)] lg:items-end">
          <div>
            <Badge variant="info" className="mb-4 px-3 py-2">
              GRÂCE À VOUS
            </Badge>
            <h2 className="font-serif text-4xl leading-none font-bold text-[var(--primary-strong)] md:text-5xl">
              Aidez-nous à faire perdurer ce magnifique projet !
            </h2>
          </div>
          <div className="grid gap-4">
            <p className="text-base leading-7 text-[var(--muted)]">
              Votre participation permet de faire vivre les collelim, les
              programmes d'étude, les Yechivot Ben Hazmanim, le Beth Hamidrach
              et les soirées de hizouk.
            </p>
            <Button asChild size="lg" className="w-fit">
              <a href="#don-form">Je participe</a>
            </Button>
          </div>
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
