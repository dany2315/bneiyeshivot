"use client";

import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";

// Extrait la valeur numerique et le suffixe (+, %, ...) depuis n'importe quel
// libelle, en ignorant les espaces utilises comme separateurs de milliers.
// Evite les NaN (donc les compteurs a 0) quand les chiffres changent.
function parseStat(value: string): { end: number; suffix: string } {
  const end = Number(value.replace(/[^\d]/g, "")) || 0;
  const suffix = value.replace(/[\d\s]/g, "");
  return { end, suffix };
}

export function ImpactCounter({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const stat = parseStat(value);

  return (
    <Card className="stat impact-stat">
      <CardContent className="p-6">
        <strong>
          <CountUp
            end={stat.end}
            duration={1.7}
            enableScrollSpy
            scrollSpyOnce
            separator=" "
            suffix={stat.suffix}
          />
        </strong>
        <span>{label}</span>
      </CardContent>
    </Card>
  );
}
