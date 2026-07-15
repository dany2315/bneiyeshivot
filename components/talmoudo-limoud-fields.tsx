"use client";

import { useMemo, useState } from "react";
import { DapimRangeFields } from "@/components/dapim-range-fields";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { masechtotBavli } from "@/lib/shas";

export function TalmoudoLimoudFields({
  defaultDapim,
  defaultMasechet = "",
}: {
  defaultDapim?: string | null;
  defaultMasechet?: string | null;
}) {
  const [selectedMasechet, setSelectedMasechet] = useState(
    defaultMasechet ?? "",
  );
  const lastDaf = useMemo(
    () =>
      masechtotBavli.find((masechet) => masechet.name === selectedMasechet)
        ?.lastDaf ?? 200,
    [selectedMasechet],
  );

  return (
    <>
      <Field>
        <FieldLabel htmlFor="talmoudo-masechet">Massehet</FieldLabel>
        <NativeSelect
          className="w-full"
          dir="rtl"
          id="talmoudo-masechet"
          name="massehet"
          required
          value={selectedMasechet}
          onChange={(event) => setSelectedMasechet(event.currentTarget.value)}
        >
          <NativeSelectOption value="">בחר מסכת</NativeSelectOption>
          {masechtotBavli.map((masechet) => (
            <NativeSelectOption key={masechet.name} value={masechet.name}>
              {masechet.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <DapimRangeFields
        defaultValue={defaultDapim}
        key={`${selectedMasechet || "default"}-${defaultDapim ?? ""}`}
        lastDaf={lastDaf}
      />
    </>
  );
}
