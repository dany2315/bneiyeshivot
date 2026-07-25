import { render } from "@react-email/render";
import { DonationAdminNotificationEmail } from "@/emails/donation-admin-notification-email";
import {
  DonationRecurringPaymentEmail,
  DonationThankYouEmail,
  NewRequestAdminEmail,
  RequestConfirmationEmail,
  ServiceRequestEmail,
  StoreReservationAdminEmail,
  StoreReservationConfirmationEmail,
  StoreReservationStatusEmail,
  TalmoudoRegistrationAdminEmail,
  TalmoudoResultEmail,
} from "@/emails/transactional-email";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

type SendEmailInput = {
  to: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(response: Response, attempt: number) {
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return Math.min(12000, 1500 * 2 ** attempt);
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|table|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function sendEmail({ to, bcc, subject, html, text, attachments }: SendEmailInput) {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn("[email] RESEND_API_KEY ou EMAIL_FROM manquant : email non envoye.");
    return { ok: false as const };
  }

  const plainText = text ?? htmlToPlainText(html);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;

    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: EMAIL_FROM, to, bcc, subject, html, text: plainText, attachments }),
      });
    } catch (error) {
      if (attempt < 2) {
        const delay = 1500 * 2 ** attempt;
        console.warn(`[email] erreur reseau, nouvel essai dans ${delay}ms.`, error);
        await sleep(delay);
        continue;
      }

      console.error("[email] erreur reseau", error);
      return { ok: false as const };
    }

    if (response.ok) {
      const dailyQuota = response.headers.get("x-resend-daily-quota");
      const monthlyQuota = response.headers.get("x-resend-monthly-quota");

      if (dailyQuota || monthlyQuota) {
        console.info("[email] quotas Resend", { dailyQuota, monthlyQuota });
      }

      return { ok: true as const };
    }

    if (response.status === 429 && attempt < 2) {
      const delay = retryDelayMs(response, attempt);
      console.warn(`[email] rate limit Resend, nouvel essai dans ${delay}ms.`);
      await sleep(delay);
      continue;
    }

    try {
      console.error("[email] envoi echoue", await response.text().catch(() => ""));
      return { ok: false as const };
    } catch (error) {
      console.error("[email] erreur lecture reponse", error);
      return { ok: false as const };
    }
  }

  return { ok: false as const };
}

export async function newRequestAdminEmail(params: {
  typeLabel: string;
  fullName: string;
  email: string;
  phone?: string;
  link: string;
}) {
  const html = await render(NewRequestAdminEmail(params));

  return {
    subject: `Nouvelle demande - ${params.typeLabel} - ${params.fullName}`,
    html,
  };
}

export async function requestConfirmationEmail(params: {
  firstName?: string;
  typeLabel: string;
}) {
  const html = await render(RequestConfirmationEmail(params));

  return {
    subject: "Bnei Yeshivot - Votre demande a bien été reçue",
    html,
  };
}

async function serviceRequestEmailHtml({
  actionHref,
  actionLabel,
  body,
  preview,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  body: string[];
  preview: string;
  title: string;
}) {
  return render(
    ServiceRequestEmail({
      actionHref,
      actionLabel,
      body,
      preview,
      title,
    }),
  );
}

export async function serviceRequestStatusEmail(params: {
  actionHref: string;
  firstName?: string | null;
  note?: string | null;
  requestedChanges?: string[];
  statusLabel: string;
  typeLabel: string;
}) {
  const greeting = params.firstName ? `Bonjour ${params.firstName},` : "Bonjour,";
  const title = "Mise à jour de votre demande";
  const isMissingDocuments = params.requestedChanges && params.requestedChanges.length > 0;
  const html = await serviceRequestEmailHtml({
    actionHref: params.actionHref,
    actionLabel: isMissingDocuments ? "Modifier dans mon espace" : "Voir ma demande",
    preview: `${title} - ${params.typeLabel}`,
    title,
    body: [
      greeting,
      `Le statut de votre demande ${params.typeLabel} est maintenant : <strong>${params.statusLabel}</strong>.`,
      ...(isMissingDocuments
        ? [`À modifier : <strong>${params.requestedChanges!.join(", ")}</strong>.`]
        : []),
      ...(params.note ? [params.note] : []),
    ],
  });

  return {
    subject: `Bnei Yeshivot - Mise à jour de votre demande ${params.typeLabel}`,
    html,
  };
}

export async function serviceRequestClientUpdatedAdminEmail(params: {
  adminHref: string;
  fullName: string;
  typeLabel: string;
}) {
  const title = "Demande mise à jour par l’utilisateur";
  const html = await serviceRequestEmailHtml({
    actionHref: params.adminHref,
    actionLabel: "Voir la demande",
    preview: `${title} - ${params.fullName}`,
    title,
    body: [
      `${params.fullName} a complété les informations demandées pour sa demande ${params.typeLabel}.`,
    ],
  });

  return {
    subject: `Demande mise à jour - ${params.typeLabel} - ${params.fullName}`,
    html,
  };
}

export async function storeReservationAdminEmail(params: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: string;
  items: string[];
  link: string;
}) {
  const html = await render(StoreReservationAdminEmail(params));

  return {
    subject: `Nouvelle réservation boutique - ${params.customerName}`,
    html,
  };
}

export async function storeReservationConfirmationEmail(params: {
  customerName: string;
  total: string;
  items: string[];
}) {
  const html = await render(StoreReservationConfirmationEmail(params));

  return {
    subject: "Bnei Yeshivot - Votre réservation boutique a bien été reçue",
    html,
  };
}

export async function storeReservationStatusEmail(params: {
  customerName: string;
  statusLabel: string;
  total: string;
  items: string[];
  pickupDate?: string | null;
  pickupLocation?: string | null;
  unavailableItems?: string | null;
  message?: string | null;
}) {
  const html = await render(StoreReservationStatusEmail(params));

  return {
    subject: `Bnei Yeshivot - Réservation boutique ${params.statusLabel}`,
    html,
  };
}

export async function donationThankYouEmail(params: {
  donorName?: string | null;
  amount: string;
  frequency: string;
  paymentLabel?: string | null;
  paymentStatusLabel?: string | null;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const html = await render(DonationThankYouEmail(params));

  return {
    subject: "Bnei Yeshivot - Merci pour votre don",
    html,
  };
}

export async function donationAdminNotificationEmail(params: {
  adminLink: string;
  amount: string;
  donorEmail: string;
  donorName?: string | null;
  donorPhone?: string | null;
  failureReason?: string | null;
  frequency: string;
  heading?: string;
  paymentLabel?: string | null;
  paymentStatusLabel?: string | null;
  receiptNumber?: string | null;
  stripePaymentIntentId?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const donorName = params.donorName || params.donorEmail;
  const heading =
    params.heading ||
    (params.failureReason || params.paymentStatusLabel === "Échec"
      ? "Don en échec"
      : "Nouveau don confirmé");
  const html = await render(
    DonationAdminNotificationEmail({
      adminLink: params.adminLink,
      amount: params.amount,
      donorEmail: params.donorEmail,
      donorName,
      donorPhone: params.donorPhone,
      failureReason: params.failureReason,
      frequency: params.frequency,
      heading,
      paymentLabel: params.paymentLabel,
      paymentStatusLabel: params.paymentStatusLabel,
      receiptNumber: params.receiptNumber,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeReceiptUrl: params.stripeReceiptUrl,
    }),
  );

  return {
    subject: `${heading} - ${params.amount} - ${donorName}`,
    html,
  };
}

export async function donationRecurringPaymentEmail(params: {
  amount: string;
  donorName?: string | null;
  failureReason?: string | null;
  frequency: string;
  paymentLabel: string;
  statusLabel: string;
  stripeReceiptUrl?: string | null;
}) {
  const html = await render(DonationRecurringPaymentEmail(params));

  return {
    subject: `Bnei Yeshivot - Paiement récurrent ${params.statusLabel.toLowerCase()} - ${params.paymentLabel}`,
    html,
  };
}

export async function talmoudoResultEmail(params: {
  firstName?: string;
  sessionTitle: string;
  grade: number;
  adminMessage?: string | null;
  rewardAmount?: string;
  rewardPaid: boolean;
}) {
  const html = await render(TalmoudoResultEmail(params));

  return {
    subject: `Bnei Yeshivot - Résultat Talmoudo Beyado - ${params.sessionTitle}`,
    html,
  };
}

export async function talmoudoRegistrationAdminEmail(params: {
  adminLink: string;
  dapim: string;
  email: string;
  fullName: string;
  massehet: string;
  phone: string;
  sessionTitle: string;
  yeshiva: string;
}) {
  const html = await render(TalmoudoRegistrationAdminEmail(params));

  return {
    subject: `Nouvelle inscription Talmoudo - ${params.fullName}`,
    html,
  };
}
