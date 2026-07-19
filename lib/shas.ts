export type MasechetOption = {
  name: string;
  lastDaf: number;
};

export const masechtotBavli: MasechetOption[] = [
  { name: "ברכות", lastDaf: 64 },
  { name: "שבת", lastDaf: 157 },
  { name: "עירובין", lastDaf: 105 },
  { name: "פסחים", lastDaf: 121 },
  { name: "שקלים", lastDaf: 22 },
  { name: "יומא", lastDaf: 88 },
  { name: "סוכה", lastDaf: 56 },
  { name: "ביצה", lastDaf: 40 },
  { name: "ראש השנה", lastDaf: 35 },
  { name: "תענית", lastDaf: 31 },
  { name: "מגילה", lastDaf: 32 },
  { name: "מועד קטן", lastDaf: 29 },
  { name: "חגיגה", lastDaf: 27 },
  { name: "יבמות", lastDaf: 122 },
  { name: "כתובות", lastDaf: 112 },
  { name: "נדרים", lastDaf: 91 },
  { name: "נזיר", lastDaf: 66 },
  { name: "סוטה", lastDaf: 49 },
  { name: "גיטין", lastDaf: 90 },
  { name: "קידושין", lastDaf: 82 },
  { name: "בבא קמא", lastDaf: 119 },
  { name: "בבא מציעא", lastDaf: 119 },
  { name: "בבא בתרא", lastDaf: 176 },
  { name: "סנהדרין", lastDaf: 113 },
  { name: "מכות", lastDaf: 24 },
  { name: "שבועות", lastDaf: 49 },
  { name: "עבודה זרה", lastDaf: 76 },
  { name: "הוריות", lastDaf: 14 },
  { name: "זבחים", lastDaf: 120 },
  { name: "מנחות", lastDaf: 110 },
  { name: "חולין", lastDaf: 142 },
  { name: "בכורות", lastDaf: 61 },
  { name: "ערכין", lastDaf: 34 },
  { name: "תמורה", lastDaf: 34 },
  { name: "כריתות", lastDaf: 28 },
  { name: "מעילה", lastDaf: 22 },
  { name: "קינים", lastDaf: 4 },
  { name: "תמיד", lastDaf: 8 },
  { name: "מידות", lastDaf: 3 },
  { name: "נדה", lastDaf: 73 },
];

const hebrewOnes = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const hebrewTens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const hebrewHundreds = ["", "ק", "ר"];

export function numberToHebrew(value: number) {
  if (value === 15) return "טו";
  if (value === 16) return "טז";

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;

  return `${hebrewHundreds[hundreds] ?? ""}${hebrewTens[tens] ?? ""}${hebrewOnes[ones] ?? ""}`;
}

export function dafLabel(daf: number, side: "a" | "b") {
  return `דף ${numberToHebrew(daf)} ע״${side === "a" ? "א" : "ב"}`;
}

export function dafValueToLabel(value: string) {
  const match = value.match(/^(\d+)([ab])$/);

  if (!match) return value;

  return dafLabel(Number(match[1]), match[2] as "a" | "b");
}

export function dapimRangesToHebrew(value?: string | null) {
  if (!value) return "";

  return value
    .split(";")
    .map((range) => range.trim())
    .filter(Boolean)
    .map((range) => {
      const [from, to] = range.split("-").map((item) => item.trim());

      if (!from || !to) return range;

      return `${dafValueToLabel(from)} עד ${dafValueToLabel(to)}`;
    })
    .join("; ");
}
