"use client";

import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";

const statNumbers: Record<string, { end: number; suffix: string }> = {
  "1 200+": { end: 1200, suffix: "+" },
  "300+": { end: 300, suffix: "+" },
  "40+": { end: 40, suffix: "+" },
  "100%": { end: 100, suffix: "%" },
};

export function ImpactCounter({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const stat = statNumbers[value] ?? { end: Number(value), suffix: "" };

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
