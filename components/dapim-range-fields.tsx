"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { dafLabel } from "@/lib/shas";

type DafRange = {
  from: string;
  to: string;
};

function buildDafOptions(lastDaf: number) {
  return Array.from({ length: Math.max(0, lastDaf - 1) }, (_, index) => index + 2)
    .flatMap((daf) => [
      { value: `${daf}a`, label: dafLabel(daf, "a") },
      { value: `${daf}b`, label: dafLabel(daf, "b") },
    ]);
}

function dafValueToIndex(value: string) {
  const match = value.match(/^(\d+)([ab])$/);

  if (!match) return -1;

  return Number(match[1]) * 2 + (match[2] === "b" ? 1 : 0);
}

function rangeAmudim(range: DafRange) {
  const fromIndex = dafValueToIndex(range.from);
  const toIndex = dafValueToIndex(range.to);

  if (fromIndex < 0 || toIndex < 0 || toIndex < fromIndex) {
    return 0;
  }

  return toIndex - fromIndex + 1;
}

function formatDapimCount(amudim: number) {
  const dapim = amudim / 2;

  return Number.isInteger(dapim) ? String(dapim) : dapim.toFixed(1);
}

function serializeRanges(ranges: DafRange[]) {
  return ranges
    .filter((range) => range.from && range.to)
    .map((range) => `${range.from}-${range.to}`)
    .join("; ");
}

function parseInitialRanges(value?: string | null): DafRange[] {
  const ranges = (value ?? "")
    .split(";")
    .map((range) => range.trim())
    .filter(Boolean)
    .map((range) => {
      const [from, to] = range.split("-").map((item) => item.trim());
      return { from: from ?? "", to: to ?? "" };
    })
    .filter((range) => range.from && range.to);

  return ranges.length > 0 ? ranges : [{ from: "", to: "" }];
}

export function DapimRangeFields({
  defaultValue,
  lastDaf = 200,
  name = "dapim",
}: {
  defaultValue?: string | null;
  lastDaf?: number;
  name?: string;
}) {
  const [ranges, setRanges] = useState<DafRange[]>(() =>
    parseInitialRanges(defaultValue),
  );
  const dafOptions = useMemo(() => buildDafOptions(lastDaf), [lastDaf]);
  const serializedRanges = useMemo(() => serializeRanges(ranges), [ranges]);
  const selectedAmudim = useMemo(
    () => ranges.reduce((total, range) => total + rangeAmudim(range), 0),
    [ranges],
  );
  const remainingAmudim = 16 - selectedAmudim;
  const isExact = remainingAmudim === 0;
  const isOver = remainingAmudim < 0;

  function updateRange(index: number, key: keyof DafRange, value: string) {
    setRanges((current) =>
      current.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, [key]: value } : range,
      ),
    );
  }

  function addRange() {
    setRanges((current) =>
      current.length >= 2 ? current : [...current, { from: "", to: "" }],
    );
  }

  function removeRange(index: number) {
    setRanges((current) =>
      current.length === 1
        ? current
        : current.filter((_, rangeIndex) => rangeIndex !== index),
    );
  }

  return (
    <Field className="md:col-span-2">
      <input name={name} type="hidden" value={serializedRanges} />
      <FieldLabel>Plages de dapim choisies</FieldLabel>
      <div className="grid gap-3">
        {ranges.map((range, index) => (
          <div
            className="grid gap-3 rounded-xl border border-[var(--border)] bg-white p-3 md:grid-cols-[1fr_1fr_auto]"
            key={index}
          >
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={`dapim-from-${index}`}>Du daf</FieldLabel>
                <Button
                  aria-label="Retirer cette plage"
                  className="md:hidden"
                  disabled={ranges.length === 1}
                  onClick={() => removeRange(index)}
                  size="icon-sm"
                  type="button"
                  variant="secondary"
                >
                  <Trash2 />
                </Button>
              </div>
              <NativeSelect
                className="w-full"
                dir="rtl"
                id={`dapim-from-${index}`}
                required
                value={range.from}
                onChange={(event) =>
                  updateRange(index, "from", event.currentTarget.value)
                }
              >
                <NativeSelectOption value="">Selectionner</NativeSelectOption>
                {dafOptions.map((daf) => (
                  <NativeSelectOption
                    disabled={
                      Boolean(range.to) &&
                      dafValueToIndex(daf.value) > dafValueToIndex(range.to)
                    }
                    key={`from-${index}-${daf.value}`}
                    value={daf.value}
                  >
                    {daf.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor={`dapim-to-${index}`}>Au daf</FieldLabel>
              <NativeSelect
                className="w-full"
                dir="rtl"
                id={`dapim-to-${index}`}
                required
                value={range.to}
                onChange={(event) =>
                  updateRange(index, "to", event.currentTarget.value)
                }
              >
                <NativeSelectOption value="">Selectionner</NativeSelectOption>
                {dafOptions.map((daf) => (
                  <NativeSelectOption
                    disabled={
                      Boolean(range.from) &&
                      dafValueToIndex(daf.value) < dafValueToIndex(range.from)
                    }
                    key={`to-${index}-${daf.value}`}
                    value={daf.value}
                  >
                    {daf.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Button
              aria-label="Retirer cette plage"
              className="hidden self-end md:inline-flex"
              disabled={ranges.length === 1}
              onClick={() => removeRange(index)}
              size="icon"
              type="button"
              variant="secondary"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <FieldDescription>
        {isExact
          ? "Vous avez selectionne exactement 8 dapim."
          : isOver
            ? `Vous avez depasse de ${formatDapimCount(Math.abs(remainingAmudim))} dapim.`
            : `Vous avez selectionne ${formatDapimCount(selectedAmudim)} dapim. Il reste ${formatDapimCount(remainingAmudim)} dapim pour arriver a 8.`}
        {" "}Les options impossibles restent visibles mais non cliquables.
      </FieldDescription>
      <Button
        className="w-fit"
        disabled={ranges.length >= 2}
        onClick={addRange}
        type="button"
        variant="secondary"
      >
        <Plus />
        Ajouter une plage de dapim
      </Button>
    </Field>
  );
}
