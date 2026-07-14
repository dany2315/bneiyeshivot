import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createServiceRequest } from "@/lib/service-requests";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serviceRequest = await createServiceRequest(body);

    return NextResponse.json(
      {
        ok: true,
        requestId: serviceRequest.id,
        status: serviceRequest.status,
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

    console.error("[requests] create failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Impossible de creer la demande pour le moment.",
      },
      { status: 500 },
    );
  }
}
