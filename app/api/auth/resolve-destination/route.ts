import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { resolveAccountDestination } from "@/lib/donor-access";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ destination: "/connexion" }, { status: 401 });
  }

  return NextResponse.json({
    destination: await resolveAccountDestination(user),
  });
}
