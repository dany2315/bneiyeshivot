import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createTalmoudoRegistration } from "@/lib/talmoudo-beyado";
import { getCurrentUser } from "@/lib/session";
import { sendEmail, talmoudoRegistrationAdminEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    const registration = await createTalmoudoRegistration(body, {
      actorId: user?.id,
      source: "bahour",
    });
    await sendAdminRegistrationEmail(registration.id, request.url);

    return NextResponse.json(
      {
        ok: true,
        registrationId: registration.id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Certains champs sont incomplets.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de creer l'inscription pour le moment.";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

async function sendAdminRegistrationEmail(registrationId: string, requestUrl: string) {
  const registration = await prisma.mivhanRegistration.findUnique({
    where: { id: registrationId },
    include: { session: true },
  });

  if (!registration) return;

  const fullName = [registration.firstName, registration.lastName]
    .filter(Boolean)
    .join(" ");
  const baseUrl = new URL(requestUrl).origin;
  const email = await talmoudoRegistrationAdminEmail({
    adminLink: `${baseUrl}/admin/talmoudo-beyado`,
    dapim: registration.dapim ?? "-",
    email: registration.email ?? "-",
    fullName,
    massehet: registration.massehet ?? "-",
    phone: registration.phone ?? "-",
    sessionTitle: registration.session.title,
    yeshiva: registration.yeshiva ?? "-",
  });

  await sendEmail({
    to: "contact@bneiyeshivot.com",
    ...email,
  });
}
