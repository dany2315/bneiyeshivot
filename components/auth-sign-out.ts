"use client";

import { authClient } from "@/lib/auth-client";

export async function signOutRequest() {
  const result = await authClient.signOut();

  if (result.error) {
    throw new Error(
      result.error.message ?? "Impossible de se déconnecter pour le moment."
    );
  }

  return result.data;
}
