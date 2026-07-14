"use client";

import { useEffect, useState } from "react";

export type ClientSessionUser = {
  id?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
};

type ClientSession = {
  user?: ClientSessionUser | null;
} | null;

export function getUserInitials(user?: ClientSessionUser | null) {
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "BY";
}

export function getUserDisplayName(user?: ClientSessionUser | null) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ");
}

export function isAdminUser(user?: ClientSessionUser | null) {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export function useAuthSession() {
  const [user, setUser] = useState<ClientSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const response = await fetch("/api/auth/get-session", {
        cache: "no-store",
      });

      if (!mounted) {
        return;
      }

      if (!response.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const session = (await response.json().catch(() => null)) as ClientSession;
      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
