"use server";

import { createServiceRequest } from "@/lib/service-requests";
import {
  newRequestAdminEmail,
  requestConfirmationEmail,
  sendEmail,
} from "@/lib/email";

function formDataToObject(formData: FormData, kind: "visa" | "koupat") {
  return {
    kind,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate"),
    nationality: formData.get("nationality"),
    passportNumber: formData.get("passportNumber"),
    personStatus: formData.get("personStatus"),
    school: formData.get("school"),
    message: formData.get("message"),
    acceptTerms: formData.get("acceptTerms"),
  };
}

export async function createVisaRequest(formData: FormData) {
  const payload = formDataToObject(formData, "visa");
  const request = await createServiceRequest(payload);
  await sendRequestEmails({
    adminPath: "visa",
    payload,
    requestId: request.id,
    typeLabel: "visa etudiant",
  });

  return {
    ok: true,
    requestId: request.id,
  };
}

export async function createKoupatHolimRequest(formData: FormData) {
  const payload = formDataToObject(formData, "koupat");
  const request = await createServiceRequest(payload);
  await sendRequestEmails({
    adminPath: "koupat-holim",
    payload,
    requestId: request.id,
    typeLabel: "koupat holim",
  });

  return {
    ok: true,
    requestId: request.id,
  };
}

async function sendRequestEmails({
  adminPath,
  payload,
  requestId,
  typeLabel,
}: {
  adminPath: string;
  payload: ReturnType<typeof formDataToObject>;
  requestId: string;
  typeLabel: string;
}) {
  const email = String(payload.email ?? "").trim().toLowerCase();
  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();
  const phone = String(payload.phone ?? "").trim() || undefined;
  const fullName = `${firstName} ${lastName}`.trim() || email || "Sans nom";
  const baseUrl = process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com";

  if (email) {
    const confirmationEmail = await requestConfirmationEmail({
      firstName: firstName || undefined,
      typeLabel,
    });

    await sendEmail({
      to: email,
      ...confirmationEmail,
    });
  }

  const notificationEmail = await newRequestAdminEmail({
    typeLabel,
    fullName,
    email,
    phone,
    link: `${baseUrl}/admin/${adminPath}#request-${requestId}`,
  });

  await sendEmail({
    to: "contact@bneiyeshivot.com",
    ...notificationEmail,
  });
}
