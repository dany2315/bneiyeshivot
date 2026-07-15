import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createTalmoudoRegistration } from "@/lib/talmoudo-beyado";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    const registration = await createTalmoudoRegistration(body, {
      actorId: user?.id,
      source: "bahour",
    });

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
