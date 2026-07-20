"use client";

import { useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const phonePrefixes = ["+33", "+972", "+32", "+41", "+1", "+44"];

function splitPhoneValue(value?: string | null) {
  const normalized = String(value ?? "").trim();
  const prefix = phonePrefixes.find((item) => normalized.startsWith(item));

  if (!prefix) {
    return { prefix: "+33", number: normalized.replace(/^\+\d+\s*/, "") };
  }

  return {
    prefix,
    number: normalized.slice(prefix.length).trim(),
  };
}

export function PhoneInputGroup({
  autoComplete = "tel",
  defaultValue,
  disabled,
  id,
  name,
  onValueChange,
  placeholder = "6 12 34 56 78",
  required,
}: {
  autoComplete?: string;
  defaultValue?: string | null;
  disabled?: boolean;
  id: string;
  name: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const initial = useMemo(() => splitPhoneValue(defaultValue), [defaultValue]);
  const [prefix, setPrefix] = useState(initial.prefix);
  const [number, setNumber] = useState(initial.number);
  const fullPhone = number.trim() ? `${prefix} ${number}`.trim() : "";

  function updatePhone(nextPrefix: string, nextNumber: string) {
    onValueChange?.(nextNumber.trim() ? `${nextPrefix} ${nextNumber}`.trim() : "");
  }

  return (
    <>
      <input name={name} type="hidden" value={fullPhone} />
      <InputGroup className="h-11 rounded-lg border-input bg-transparent">
        <InputGroupAddon align="inline-start" className="pl-3 pr-1">
          <select
            aria-label="Indicatif téléphone"
            className="h-9 rounded-md border-0 bg-transparent px-0 text-sm font-bold text-[var(--primary)] outline-none"
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              setPrefix(event.target.value);
              updatePhone(event.target.value, number);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            value={prefix}
          >
            {phonePrefixes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </InputGroupAddon>
        <InputGroupInput
          autoComplete={autoComplete}
          disabled={disabled}
          id={id}
          inputMode="tel"
          onChange={(event) => {
            setNumber(event.target.value);
            updatePhone(prefix, event.target.value);
          }}
          placeholder={placeholder}
          required={required}
          type="tel"
          value={number}
        />
      </InputGroup>
    </>
  );
}
