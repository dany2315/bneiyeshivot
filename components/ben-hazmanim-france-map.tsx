"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import CountUp from "react-countup";
import { CalendarDays, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RegionMap = {
  name: string;
  subtitle: string;
  map?: string;
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
      { name: "Épinay-sur-Seine", area: "Seine-Saint-Denis", x: 42.48, y: 27.95 },
      { name: "Paris 19", area: "Paris", x: 45.22, y: 33.77 },
      { name: "Sarcelles", area: "Val-d'Oise", x: 45.07, y: 24.56 },
      { name: "Centre Alef", area: "Paris", x: 43.9, y: 35.7 },
      { name: "Bonneuil-sur-Marne", area: "Val-de-Marne", x: 49.42, y: 42.43 },
      { name: "Clichy-sous-Bois", area: "Seine-Saint-Denis", x: 53.3, y: 32.1 },
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
  {
    name: "Israël",
    subtitle: "Jérusalem",
    cities: [{ name: "Jérusalem - Kiryat Yovel", area: "Israël", x: 52, y: 46 }],
  },
];

const allCities = regions.flatMap((region) =>
  region.cities.map((city) => ({ ...city, region: region.name })),
);
const participantsPerYear = 300;
const totalParticipants = 3000;
const daysPerYear = 30;
const hoursPerDay = 3;
const yearlyHours = participantsPerYear * daysPerYear * hoursPerDay;
const decadeHours = totalParticipants * daysPerYear * hoursPerDay;
const logoFiles = [
  "906f2a23-5a3d-41b6-a670-622727bc425b.jpeg",
  "87894877-bbf0-4bdd-bfb3-7c05410a6ae1.jpeg",
  "476dd32c-973f-41c4-9cdf-26b7855c96b3.jpeg",
  "d2465f0f-c5a5-4522-84c6-90c1728b1e8a.jpeg",
  "bb7765c2-14d1-44b3-adb9-2160b8eaf41a.jpeg",
  "dd034949-264f-4079-b26a-14716c37d0b2.jpeg",
  "IMG_1684.jpeg",
];

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
                      {region.map ? (
                        <Image
                          alt=""
                          className="ben-region-map-img"
                          fill
                          priority={region.name === "Ile-de-France"}
                          sizes="(max-width: 980px) 100vw, 32vw"
                          src={region.map}
                          unoptimized
                        />
                      ) : (
                        <div className="ben-region-map-fallback">
                          <strong>Israël</strong>
                          <span>Jérusalem</span>
                        </div>
                      )}

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

            <div className="ben-city-rail" aria-label="Lieux Ben Hazmanim">
              <div className="ben-city-track">
                {[...allCities, ...allCities].map((city, index) => (
                  <button
                    className={cn(
                      "ben-city-pill",
                      city.name === activeCity.name && "ben-city-pill-active",
                    )}
                    key={`${city.region}-${city.name}-${index}`}
                    onClick={() => setActiveCity(city)}
                    type="button"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="ben-map-stats">
              <Card className="ben-map-stat ben-map-stat-main">
                <CardContent>
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

            <div className="ben-logo-rail" aria-label="Logos Bnei Yeshivot">
              <div className="ben-logo-track">
                {[...logoFiles, ...logoFiles].map((file, index) => (
                  <div className="ben-logo-item" key={`${file}-${index}`}>
                    <Image
                      alt=""
                      fill
                      sizes="120px"
                      src={`/logobneiyeshivot/${file}`}
                    />
                  </div>
                ))}
              </div>
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
