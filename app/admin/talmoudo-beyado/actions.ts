"use server";

import { revalidatePath } from "next/cache";
import { MivhanRegistrationStatus } from "@prisma/client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createTalmoudoRegistration } from "@/lib/talmoudo-beyado";
import { sendEmail, talmoudoResultEmail } from "@/lib/email";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readMoneyCents(value: string) {
  if (!value) return null;
  const normalized = value.replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Montant invalide.");
  }

  return Math.round(amount * 100);
}

function formatReward(amountCents: number | null, currency: string) {
  if (amountCents === null) return undefined;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

export async function createMivhanSession(formData: FormData) {
  const admin = await requireAdminUser();
  const title = readString(formData, "title");
  const date = readString(formData, "date");
  const location = readString(formData, "location");
  const registrationCloseDaysBefore = Number(
    readString(formData, "registrationCloseDaysBefore") || "2",
  );

  if (!title || !date) {
    throw new Error("Titre et date obligatoires.");
  }

  if (
    !Number.isInteger(registrationCloseDaysBefore) ||
    registrationCloseDaysBefore < 0 ||
    registrationCloseDaysBefore > 30
  ) {
    throw new Error("Delai de fermeture invalide.");
  }

  const session = await prisma.mivhanSession.create({
    data: {
      title,
      date: new Date(date),
      location: location || null,
      registrationCloseDaysBefore,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "talmoudo.session.created",
      entity: "MivhanSession",
      entityId: session.id,
    },
  });

  revalidatePath("/admin/talmoudo-beyado");
  revalidatePath("/client");
  revalidatePath("/programme/talmoudo-beyado");
}

export async function updateMivhanSessionSettings(formData: FormData) {
  const admin = await requireAdminUser();
  const sessionId = readString(formData, "sessionId");
  const title = readString(formData, "title");
  const date = readString(formData, "date");
  const location = readString(formData, "location");
  const registrationCloseDaysBefore = Number(
    readString(formData, "registrationCloseDaysBefore") || "2",
  );
  const registrationsClosed = formData.get("registrationsClosed") === "on";

  if (!sessionId || !title || !date) {
    throw new Error("Mivhan, titre et date obligatoires.");
  }

  await prisma.mivhanSession.update({
    where: { id: sessionId },
    data: {
      title,
      date: new Date(date),
      location: location || null,
      registrationCloseDaysBefore,
      registrationsClosed,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "talmoudo.session.updated",
      entity: "MivhanSession",
      entityId: sessionId,
      metadata: { registrationsClosed },
    },
  });

  revalidatePath("/admin/talmoudo-beyado");
  revalidatePath("/client");
  revalidatePath("/programme/talmoudo-beyado");
}

export async function createAdminTalmoudoRegistration(formData: FormData) {
  const admin = await requireAdminUser();

  await createTalmoudoRegistration(
    {
      sessionId: readString(formData, "sessionId"),
      firstName: readString(formData, "firstName"),
      lastName: readString(formData, "lastName"),
      email: readString(formData, "email"),
      phone: readString(formData, "phone"),
      parentPhone: readString(formData, "parentPhone"),
      yeshiva: readString(formData, "yeshiva"),
      massehet: readString(formData, "massehet"),
      dafStart: readString(formData, "dafStart"),
      dafEnd: readString(formData, "dafEnd"),
    },
    {
      actorId: admin.id,
      allowClosed: true,
      source: "admin",
    },
  );

  revalidatePath("/admin/talmoudo-beyado");
  revalidatePath("/client");
}

export async function updateMivhanRegistrationResult(formData: FormData) {
  const admin = await requireAdminUser();
  const registrationId = readString(formData, "registrationId");
  const grade = Number(readString(formData, "grade").replace(",", "."));
  const rewardAmountCents = readMoneyCents(readString(formData, "rewardAmount"));
  const rewardCurrency = readString(formData, "rewardCurrency") || "ILS";
  const rewardPaid = formData.get("rewardPaid") === "on";
  const note = readString(formData, "note");

  if (!registrationId || !Number.isFinite(grade) || grade < 0 || grade > 100) {
    throw new Error("Inscription ou note invalide.");
  }

  const registration = await prisma.mivhanRegistration.update({
    where: { id: registrationId },
    data: {
      grade,
      note: note || null,
      rewardAmountCents,
      rewardCurrency,
      rewardPaid,
      status: MivhanRegistrationStatus.GRADED,
      resultPublishedAt: new Date(),
    },
    include: { session: true },
  });

  if (!registration.email) {
    throw new Error("Email du Bahour introuvable.");
  }

  const emailResult = await sendEmail({
    to: registration.email,
    ...talmoudoResultEmail({
      firstName: registration.firstName ?? undefined,
      sessionTitle: registration.session.title,
      grade,
      rewardAmount: formatReward(rewardAmountCents, rewardCurrency),
      rewardPaid,
    }),
  });

  if (emailResult.ok) {
    await prisma.mivhanRegistration.update({
      where: { id: registrationId },
      data: { resultEmailSentAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "talmoudo.registration.result_updated",
      entity: "MivhanRegistration",
      entityId: registrationId,
      metadata: {
        grade,
        rewardAmountCents,
        rewardCurrency,
        rewardPaid,
        emailSent: emailResult.ok,
      },
    },
  });

  revalidatePath("/admin/talmoudo-beyado");
  revalidatePath("/client");
}
