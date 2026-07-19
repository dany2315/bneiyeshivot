import { render } from "@react-email/render";
import { DonationAdminNotificationEmail } from "@/emails/donation-admin-notification-email";
import {
  DonationRecurringPaymentEmail,
  DonationThankYouEmail,
  NewRequestAdminEmail,
  RequestConfirmationEmail,
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

export async function sendEmail({ to, bcc, subject, html, attachments }: SendEmailInput) {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn("[email] RESEND_API_KEY ou EMAIL_FROM manquant : email non envoye.");
    return { ok: false as const };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;

    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: EMAIL_FROM, to, bcc, subject, html, attachments }),
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
    subject: "Bnei Yeshivot - Votre demande a bien ete recue",
    html,
  };
}

function paragraph(text: string) {
  return `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#17324d">${text}</p>`;
}

function serviceRequestEmailHtml({
  actionHref,
  actionLabel,
  body,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  body: string[];
  title: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px">
      <div style="max-width:620px;margin:0 auto;background:white;border-radius:16px;padding:24px;border:1px solid #e6edf4">
        <p style="margin:0 0 8px;color:#f26300;font-weight:700">Bnei Yeshivot</p>
        <h1 style="margin:0 0 18px;color:#062846;font-size:24px">${title}</h1>
        ${body.map(paragraph).join("")}
        ${
          actionHref && actionLabel
            ? `<p style="margin:22px 0"><a href="${actionHref}" style="display:inline-block;background:#062846;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">${actionLabel}</a></p>`
            : ""
        }
        <p style="margin:24px 0 0;color:#6b7b8f;font-size:13px">L'equipe Bnei Yeshivot</p>
      </div>
    </div>
  `;
}

export function serviceRequestStatusEmail(params: {
  actionHref: string;
  firstName?: string | null;
  note?: string | null;
  statusLabel: string;
  typeLabel: string;
}) {
  const greeting = params.firstName ? `Bonjour ${params.firstName},` : "Bonjour,";

  return {
    subject: `Bnei Yeshivot - Mise a jour de votre demande ${params.typeLabel}`,
    html: serviceRequestEmailHtml({
      actionHref: params.actionHref,
      actionLabel: "Voir ma demande",
      title: "Mise a jour de votre demande",
      body: [
        greeting,
        `Votre demande ${params.typeLabel} est maintenant indiquee comme <strong>${params.statusLabel}</strong>.`,
        ...(params.note ? [params.note] : []),
      ],
    }),
  };
}

export function serviceRequestClientUpdatedAdminEmail(params: {
  adminHref: string;
  fullName: string;
  typeLabel: string;
}) {
  return {
    subject: `Demande mise a jour - ${params.typeLabel} - ${params.fullName}`,
    html: serviceRequestEmailHtml({
      actionHref: params.adminHref,
      actionLabel: "Voir la demande",
      title: "Demande mise a jour par l'utilisateur",
      body: [
        `${params.fullName} a complete les informations demandees pour sa demande ${params.typeLabel}.`,
      ],
    }),
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
    subject: `Nouvelle reservation boutique - ${params.customerName}`,
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
    subject: "Bnei Yeshivot - Votre reservation boutique a bien ete recue",
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
    subject: `Bnei Yeshivot - Reservation boutique ${params.statusLabel}`,
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
  const html = await render(
    DonationAdminNotificationEmail({
      adminLink: params.adminLink,
      amount: params.amount,
      donorEmail: params.donorEmail,
      donorName,
      donorPhone: params.donorPhone,
      failureReason: params.failureReason,
      frequency: params.frequency,
      heading: params.heading,
      paymentLabel: params.paymentLabel,
      paymentStatusLabel: params.paymentStatusLabel,
      receiptNumber: params.receiptNumber,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeReceiptUrl: params.stripeReceiptUrl,
    }),
  );

  return {
    subject: `Nouveau don confirme - ${params.amount} - ${donorName}`,
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
    subject: `Bnei Yeshivot - Paiement recurrent ${params.statusLabel.toLowerCase()} - ${params.paymentLabel}`,
    html,
  };
}

export async function talmoudoResultEmail(params: {
  firstName?: string;
  sessionTitle: string;
  grade: number;
  rewardAmount?: string;
  rewardPaid: boolean;
}) {
  const html = await render(TalmoudoResultEmail(params));

  return {
    subject: `Bnei Yeshivot - Resultat Talmoudo Beyado - ${params.sessionTitle}`,
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
