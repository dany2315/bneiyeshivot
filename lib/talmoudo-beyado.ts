import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const talmoudoRegistrationSchema = z.object({
  sessionId: z.string().trim().min(1, "Mivhan requis"),
  firstName: z.string().trim().min(2, "Prenom requis"),
  lastName: z.string().trim().min(2, "Nom requis"),
  email: z
    .string()
    .trim()
    .email("Email invalide")
    .transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(6, "Telephone requis"),
  parentPhone: z.string().trim().optional().default(""),
  yeshiva: z.string().trim().min(2, "Yeshiva requise"),
  massehet: z.string().trim().min(2, "Massehet requise"),
  dapim: z
    .string()
    .trim()
    .min(1, "Les plages de dapim sont requises"),
  dafStart: z.string().trim().optional().default(""),
  dafEnd: z.string().trim().optional().default(""),
});

export type TalmoudoRegistrationInput = z.infer<
  typeof talmoudoRegistrationSchema
>;

export function getMivhanRegistrationCloseDate(session: {
  date: Date;
  registrationCloseDaysBefore: number;
}) {
  const closeDate = new Date(session.date);
  closeDate.setDate(closeDate.getDate() - session.registrationCloseDaysBefore);
  return closeDate;
}

export function isMivhanRegistrationOpen(session: {
  date: Date;
  registrationCloseDaysBefore: number;
  registrationsClosed: boolean;
}) {
  return (
    !session.registrationsClosed &&
    new Date() < getMivhanRegistrationCloseDate(session)
  );
}

export function readTalmoudoRegistrationInput(input: unknown) {
  return talmoudoRegistrationSchema.parse(input);
}

export async function createTalmoudoRegistration(
  rawInput: unknown,
  options: {
    actorId?: string;
    allowClosed?: boolean;
    source: "bahour" | "admin";
  },
) {
  const input = readTalmoudoRegistrationInput(rawInput);

  return prisma.$transaction(async (tx) => {
    const session = await tx.mivhanSession.findUnique({
      where: { id: input.sessionId },
    });

    if (!session) {
      throw new Error("Mivhan introuvable.");
    }

    if (!options.allowClosed && !isMivhanRegistrationOpen(session)) {
      throw new Error("Les inscriptions sont fermees pour ce mivhan.");
    }

    const fullName = `${input.firstName} ${input.lastName}`.trim();
    const user = await tx.user.upsert({
      where: { email: input.email },
      create: {
        email: input.email,
        name: fullName,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        parentPhone: input.parentPhone || null,
        yeshiva: input.yeshiva,
      },
      update: {
        name: fullName,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        parentPhone: input.parentPhone || undefined,
        yeshiva: input.yeshiva,
      },
    });

    const registration = await tx.mivhanRegistration.upsert({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: user.id,
        },
      },
      create: {
        sessionId: session.id,
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        yeshiva: input.yeshiva,
        massehet: input.massehet,
        dapim: input.dapim,
        dafStart: input.dafStart,
        dafEnd: input.dafEnd,
      },
      update: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        yeshiva: input.yeshiva,
        massehet: input.massehet,
        dapim: input.dapim,
        dafStart: input.dafStart,
        dafEnd: input.dafEnd,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: options.actorId ?? user.id,
        action: "talmoudo.registration.upserted",
        entity: "MivhanRegistration",
        entityId: registration.id,
        metadata: {
          sessionId: session.id,
          source: options.source,
        } satisfies Prisma.JsonObject,
      },
    });

    return registration;
  });
}
