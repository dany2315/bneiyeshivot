"use client";

export async function signOutRequest() {
  return fetch("/api/auth/sign-out", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
}
