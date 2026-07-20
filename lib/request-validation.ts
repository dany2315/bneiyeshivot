import { z } from "zod";

const baseRequestSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis"),
  lastName: z.string().trim().min(2, "Nom requis"),
  email: z
    .string()
    .email("Email invalide")
    .transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(6, "Téléphone requis"),
  parentPhone: z.string().trim().min(6, "Téléphone des parents requis"),
  birthDate: z.string().trim().min(1, "Date de naissance requise"),
  nationality: z.string().trim().min(2, "Nationalité requise"),
  passportNumber: z.string().trim().min(4, "Numéro de passeport requis"),
  school: z.string().trim().min(2, "Yeshiva ou programme requis"),
  message: z.string().trim().optional().default(""),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Conditions générales obligatoires",
  }),
});

export const visaRequestSchema = baseRequestSchema.extend({
  kind: z.literal("visa"),
  personStatus: z.enum(["bahour-yeshiva", "massa"]),
});

export const koupatHolimRequestSchema = baseRequestSchema.extend({
  kind: z.literal("koupat"),
});

export const serviceRequestSchema = z.discriminatedUnion("kind", [
  visaRequestSchema,
  koupatHolimRequestSchema,
]);

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export function normalizeRequestInput(input: unknown) {
  if (typeof input !== "object" || input === null) {
    return serviceRequestSchema.parse(input);
  }

  const record = input as Record<string, unknown>;

  return serviceRequestSchema.parse({
    ...record,
    acceptTerms:
      record.acceptTerms === true ||
      record.acceptTerms === "true" ||
      record.acceptTerms === "on",
  });
}
