"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Landmark, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PartnerGroup = {
  title: string;
  Icon: typeof Users;
  items: string[];
};

const yeshivaCities = [
  {
    city: "Bnei Brak",
    yeshivot: [
      {
        name: "Yeshivat Keter Chlomo",
        phone: "+33 6 25 61 49 85",
        email: "m.o@ateed.fr",
      },
      {
        name: "Yeshivat Torat Israël",
        phone: "+33 7 82 62 75 25",
        email: "ravyankel@gmail.com",
      },
      {
        name: "Yeshivat Orhot Yaacov",
        phone: "+33 7 69 08 41 00",
        email: "orchotyaakov@gmail.com",
      },
    ],
  },
  {
    city: "Jérusalem",
    yeshivot: [
      {
        name: "Yeshivat Mir, section francophone",
        phone: "+972 54 841 17 62",
        email: "olielsimha@gmail.com",
      },
      {
        name: "Yeshivat Kol Mevasser",
        phone: "+33 1 77 47 28 05",
        email: "a0183889827@gmail.com",
      },
      {
        name: "Yeshivat Beth Halevy",
        phone: "+972 54 480 87 94",
        email: "blochmeir@gmail.com",
      },
      {
        name: "Yeshivat Torat Haim",
        phone: "+33 6 59 69 41 60",
        email: "thohil52@gmail.com",
      },
      {
        name: "Yeshivat Nahalat David",
        phone: "+33 1 77 47 49 22",
        email: "yechivatnahalatdavid@gmail.com",
      },
    ],
  },
  {
    city: "Modiin Ilit",
    yeshivot: [
      {
        name: "Yeshivat Derekh Haim",
        phone: "+33 1 86 98 36 14",
        email: "yeshiva.derekh.haim@gmail.com",
      },
    ],
  },
];

const partnerGroups: PartnerGroup[] = [
  {
    title: "Yéchivot partenaires",
    Icon: Users,
    items: [],
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
      "Solutions de paiement",
      "Prestataires événementiels",
    ],
  },
];

export function AboutPartners() {
  const [selected, setSelected] = useState(partnerGroups[0].title);
  const activeGroup =
    partnerGroups.find((group) => group.title === selected) ?? partnerGroups[0];
  const isYeshivotGroup = activeGroup.title === "Yéchivot partenaires";

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
          <CardTitle>
            {isYeshivotGroup
              ? "Les Yéchivot francophones en Israël"
              : activeGroup.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isYeshivotGroup ? (
            <div className="about-yeshiva-partners">
              {yeshivaCities.map((cityGroup) => (
                <section className="about-yeshiva-city" key={cityGroup.city}>
                  <h3>{cityGroup.city}</h3>
                  <ul>
                    {cityGroup.yeshivot.map((yeshiva) => (
                      <li key={yeshiva.email}>
                        <strong>{yeshiva.name}</strong>
                        <span>{yeshiva.phone}</span>
                        <a href={`mailto:${yeshiva.email}`}>{yeshiva.email}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <p className="about-yeshiva-note">
                Cette liste n’est pas exhaustive. Si vous hésitez ou si vous
                avez besoin de conseils pour choisir une Yéchiva adaptée à
                votre niveau ou à votre personnalité, n’hésitez pas à nous
                contacter.
              </p>
            </div>
          ) : (
            <ul className="about-partner-list">
              {activeGroup.items.map((item) => (
                <li key={item}>
                  <CheckCircle2 className="size-4" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
