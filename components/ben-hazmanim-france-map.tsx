"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import CountUp from "react-countup";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cities = [
  { name: "Le Raincy", region: "Seine-Saint-Denis", x: 51.81, y: 29.21 },
  { name: "Epinay", region: "Seine-Saint-Denis", x: 50.53, y: 28.73 },
  { name: "Paris 19eme", region: "Paris", x: 50.95, y: 29.36 },
  { name: "Sarcelles", region: "Val-d'Oise", x: 50.93, y: 28.36 },
  { name: "Neuilly", region: "Hauts-de-Seine", x: 50.26, y: 29.34 },
  { name: "Bonneuil", region: "Val-de-Marne", x: 51.59, y: 30.29 },
  { name: "Clichy", region: "Hauts-de-Seine", x: 50.47, y: 29.17 },
  { name: "Marseille", region: "Bouches-du-Rhone", x: 69.28, y: 75.32 },
  { name: "Aix-les-Bains", region: "Savoie", x: 72.63, y: 56.2 },
  { name: "Strasbourg", region: "Alsace", x: 83.91, y: 32.03 },
];

const years = 10;
const totalParticipants = 300;
const daysPerYear = 30;
const hoursPerDay = 3;
const averageParticipantsPerYear = totalParticipants / years;
const yearlyHours = averageParticipantsPerYear * daysPerYear * hoursPerDay;
const decadeHours = totalParticipants * daysPerYear * hoursPerDay;

export function BenHazmanimFranceMap() {
  const [activeCity, setActiveCity] = useState(cities[0]);
  const selectedIndex = useMemo(
    () => cities.findIndex((city) => city.name === activeCity.name),
    [activeCity],
  );

  return (
    <section className="section ben-map-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">France</span>
            <h2>Un reseau vivant de programmes Ben Hazmanim</h2>
          </div>
          <p>
            Des points d&apos;etude installes dans les villes ou Bnei Yeshivot a
            organise des programmes, avec un impact qui se mesure en heures de
            Torah.
          </p>
        </div>

        <div className="ben-map-layout">
          <Card className="ben-map-card">
            <CardContent>
              <div className="ben-map-shell" aria-label="Carte des programmes en France">
                <Image
                  alt=""
                  className="ben-france-map-img"
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 58vw"
                  src="/maps/france-metropole.svg"
                  unoptimized
                />

                {cities.map((city, index) => (
                  <button
                    className={cn(
                      "ben-map-point",
                      city.name === activeCity.name && "ben-map-point-active",
                    )}
                    key={city.name}
                    onClick={() => setActiveCity(city)}
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
                <p className="ben-map-source">
                  Carte issue de france-geojson, donnees ouvertes IGN/INSEE.
                </p>
              </div>

              <div className="ben-city-rail">
                {cities.map((city) => (
                  <button
                    className={cn(
                      "ben-city-pill",
                      city.name === activeCity.name && "ben-city-pill-active",
                    )}
                    key={city.name}
                    onClick={() => setActiveCity(city)}
                    type="button"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="ben-map-insight">
            <Card className="ben-map-active-card">
              <CardContent>
                <span className="icon-box">
                  <MapPin className="size-5" />
                </span>
                <small>Point selectionne</small>
                <strong>{activeCity.name}</strong>
                <p>
                  Programme organise dans la zone {activeCity.region}. Ce point
                  fait partie des {cities.length} implantations actives du reseau.
                </p>
                <p className="ben-map-formula">
                  Calcul en heures-personnes : 30 participants x 30 jours x 3
                  heures = 2 700 heures etudiees cette annee.
                </p>
                <div className="ben-map-progress" style={{ "--active-index": selectedIndex + 1 } as CSSProperties}>
                  <span />
                </div>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </div>
    </section>
  );
}
