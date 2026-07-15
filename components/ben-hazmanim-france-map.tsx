"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import CountUp from "react-countup";
import { CalendarDays, Clock3, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RegionMap = {
  name: string;
  subtitle: string;
  map: string;
  cities: Array<{
    name: string;
    area: string;
    x: number;
    y: number;
  }>;
};

const regions: RegionMap[] = [
  {
    name: "Ile-de-France",
    subtitle: "Paris et region parisienne",
    map: "/maps/regions/ile-de-france.svg",
    cities: [
      { name: "Le Raincy", area: "Seine-Saint-Denis", x: 50.83, y: 32.46 },
      { name: "Epinay", area: "Seine-Saint-Denis", x: 42.48, y: 27.95 },
      { name: "Paris 19eme", area: "Paris", x: 45.22, y: 33.77 },
      { name: "Sarcelles", area: "Val-d'Oise", x: 45.07, y: 24.56 },
      { name: "Neuilly", area: "Hauts-de-Seine", x: 40.68, y: 33.63 },
      { name: "Bonneuil", area: "Val-de-Marne", x: 49.42, y: 42.43 },
      { name: "Clichy", area: "Hauts-de-Seine", x: 42.08, y: 32.03 },
    ],
  },
  {
    name: "Provence-Alpes-Cote d'Azur",
    subtitle: "Marseille",
    map: "/maps/regions/paca.svg",
    cities: [{ name: "Marseille", area: "Bouches-du-Rhone", x: 36.33, y: 81.61 }],
  },
  {
    name: "Grand Est",
    subtitle: "Strasbourg",
    map: "/maps/regions/grand-est.svg",
    cities: [{ name: "Strasbourg", area: "Alsace", x: 81.57, y: 57.66 }],
  },
  {
    name: "Auvergne-Rhone-Alpes",
    subtitle: "Aix-les-Bains",
    map: "/maps/regions/auvergne-rhone-alpes.svg",
    cities: [{ name: "Aix-les-Bains", area: "Savoie", x: 72.78, y: 42.96 }],
  },
];

const allCities = regions.flatMap((region) =>
  region.cities.map((city) => ({ ...city, region: region.name })),
);
const years = 10;
const totalParticipants = 300;
const daysPerYear = 30;
const hoursPerDay = 3;
const averageParticipantsPerYear = totalParticipants / years;
const yearlyHours = averageParticipantsPerYear * daysPerYear * hoursPerDay;
const decadeHours = totalParticipants * daysPerYear * hoursPerDay;

export function BenHazmanimFranceMap() {
  const [activeCity, setActiveCity] = useState(allCities[0]);

  return (
    <section className="section ben-map-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">France</span>
            <h2>Les regions ou les programmes ont pris vie</h2>
          </div>
          <p>
            Chaque region affiche ses propres points de programme, pour voir
            clairement ou les Ben Hazmanim ont ete organises.
          </p>
        </div>

        <div className="ben-region-layout">
          <div className="ben-region-main">
            <div className="ben-region-grid">
              {regions.map((region) => (
                <Card
                  className={cn(
                    "ben-region-card",
                    region.name === activeCity.region && "ben-region-card-active",
                  )}
                  key={region.name}
                >
                  <CardContent>
                    <div className="ben-region-card-header">
                      <strong>{region.name}</strong>
                      <span>{region.subtitle}</span>
                    </div>

                    <div className="ben-region-map" aria-label={`Carte ${region.name}`}>
                      <Image
                        alt=""
                        className="ben-region-map-img"
                        fill
                        priority={region.name === "Ile-de-France"}
                        sizes="(max-width: 980px) 100vw, 32vw"
                        src={region.map}
                        unoptimized
                      />

                      {region.cities.map((city, index) => (
                        <button
                          className={cn(
                            "ben-map-point",
                            city.name === activeCity.name && "ben-map-point-active",
                          )}
                          key={city.name}
                          onClick={() => setActiveCity({ ...city, region: region.name })}
                          style={{
                            "--point-x": `${city.x}%`,
                            "--point-y": `${city.y}%`,
                            "--point-delay": `${index * 90}ms`,
                          } as CSSProperties}
                          type="button"
                          aria-label={`Voir ${city.name}`}
                        >
                          <span />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="ben-map-stats">
              <Card className="ben-map-stat ben-map-stat-main">
                <CardContent>
                  <Clock3 className="size-5" />
                  <strong>
                    <CountUp
                      end={yearlyHours}
                      duration={1.8}
                      enableScrollSpy
                      scrollSpyOnce
                      separator=" "
                    />
                  </strong>
                  <span>heures etudiees cette annee</span>
                </CardContent>
              </Card>

              <Card className="ben-map-stat">
                <CardContent>
                  <Users className="size-5" />
                  <strong>
                    <CountUp
                      end={totalParticipants}
                      duration={1.5}
                      enableScrollSpy
                      scrollSpyOnce
                      separator=" "
                      suffix="+"
                    />
                  </strong>
                  <span>participants en 10 ans</span>
                </CardContent>
              </Card>

              <Card className="ben-map-stat">
                <CardContent>
                  <CalendarDays className="size-5" />
                  <strong>
                    <CountUp
                      end={decadeHours}
                      duration={2}
                      enableScrollSpy
                      scrollSpyOnce
                      separator=" "
                    />
                  </strong>
                  <span>heures de Torah cumulees</span>
                </CardContent>
              </Card>
            </div>

            <p className="ben-map-source">
              Cartes regionales: france-geojson, donnees ouvertes IGN/INSEE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
