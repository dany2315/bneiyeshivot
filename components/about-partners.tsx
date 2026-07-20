"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Landmark, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const partnerGroups = [
  {
    title: "Yeshivot partenaires",
    Icon: Users,
    items: [
      "Yeshivat Torat Israël",
      "Yeshivat Netivot Hatorah",
      "Yeshivat Ohr Yerushalayim",
      "Yeshivat Heichal David",
    ],
  },
  {
    title: "Associations",
    Icon: Sparkles,
    items: [
      "Association d’entraide francophone",
      "Centre communautaire Jérusalem",
      "Réseau familles en Israël",
      "Collectif jeunes olim",
    ],
  },
  {
    title: "Institutions",
    Icon: Landmark,
    items: [
      "Institutions éducatives francophones",
      "Maisons d’étude partenaires",
      "Centres de formation Torah",
      "Programmes jeunesse",
    ],
  },
  {
    title: "Organismes administratifs",
    Icon: Building2,
    items: [
      "Services visa étudiant",
      "Caisses d’assurance maladie",
      "Guichets administratifs locaux",
      "Services d’accueil des étudiants",
    ],
  },
  {
    title: "Entreprises partenaires",
    Icon: CheckCircle2,
    items: [
      "Fournisseurs literie",
      "Services logistiques",
      "Solutions paiement",
      "Prestataires événementiels",
    ],
  },
];

export function AboutPartners() {
  const [selected, setSelected] = useState(partnerGroups[0].title);
  const activeGroup =
    partnerGroups.find((group) => group.title === selected) ?? partnerGroups[0];

  return (
    <div className="about-partner-selector">
      <div className="about-partner-cards">
        {partnerGroups.map(({ title, Icon }) => {
          const active = title === selected;

          return (
            <button
              className={cn("partner-logo", active && "partner-logo-active")}
              key={title}
              onClick={() => setSelected(title)}
              type="button"
            >
              <span className="partner-fill" />
              <Icon className="size-4" />
              <span>{title}</span>
            </button>
          );
        })}
      </div>

      <Card className="about-partner-list-card">
        <CardHeader>
          <CardTitle>{activeGroup.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="about-partner-list">
            {activeGroup.items.map((item) => (
              <li key={item}>
                <CheckCircle2 className="size-4" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
