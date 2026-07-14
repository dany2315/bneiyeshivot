"use server";

import { createServiceRequest } from "@/lib/service-requests";

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
  const request = await createServiceRequest(formDataToObject(formData, "visa"));

  return {
    ok: true,
    requestId: request.id,
  };
}

export async function createKoupatHolimRequest(formData: FormData) {
  const request = await createServiceRequest(
    formDataToObject(formData, "koupat"),
  );

  return {
    ok: true,
    requestId: request.id,
  };
}
