"use client";

import { useMemo, useState, type CSSProperties } from "react";
import CountUp from "react-countup";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cities = [
  { name: "Le Raincy", region: "Seine-Saint-Denis", x: 54, y: 31 },
  { name: "Epinay", region: "Seine-Saint-Denis", x: 50, y: 30 },
  { name: "Paris 19eme", region: "Paris", x: 52, y: 33 },
  { name: "Sarcelles", region: "Val-d'Oise", x: 49, y: 28 },
  { name: "Neuilly", region: "Hauts-de-Seine", x: 49, y: 34 },
  { name: "Bonneuil", region: "Val-de-Marne", x: 55, y: 36 },
  { name: "Clichy", region: "Hauts-de-Seine", x: 48, y: 32 },
  { name: "Marseille", region: "Bouches-du-Rhone", x: 65, y: 82 },
  { name: "Aix-les-Bains", region: "Savoie", x: 72, y: 65 },
  { name: "Strasbourg", region: "Alsace", x: 82, y: 34 },
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
                <svg
                  className="ben-france-svg"
                  viewBox="0 0 520 560"
                  role="img"
                  aria-label="Carte de France"
                >
                  <path
                    d="M256 34C230 37 212 50 196 68C166 61 139 77 126 101C96 108 73 133 62 166C45 182 42 210 55 235C38 269 50 307 78 327C76 354 91 381 116 393C124 426 153 446 186 442C205 468 244 477 274 462C305 480 344 468 361 437C392 431 414 403 414 371C445 352 454 313 435 284C453 252 445 211 416 191C412 159 388 135 357 129C345 96 313 77 281 83C277 57 273 41 256 34Z"
                    className="ben-france-shape"
                  />
                  <path
                    d="M126 101C158 128 187 145 222 151C258 158 292 147 357 129M62 166C117 196 173 214 236 206C304 198 355 204 416 191M78 327C139 295 192 292 244 314C300 337 358 332 435 284M116 393C171 374 225 372 274 398C309 417 342 423 361 437"
                    className="ben-france-lines"
                  />
                  <path
                    d="M399 438C418 450 423 474 411 497C395 489 387 468 399 438Z"
                    className="ben-france-corsica"
                  />
                  <text className="ben-france-label" x="78" y="72">
                    France
                  </text>
                </svg>

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
