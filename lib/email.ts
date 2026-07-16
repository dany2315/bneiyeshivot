import { render } from "@react-email/render";
import { DonationAdminNotificationEmail } from "@/emails/donation-admin-notification-email";
import {
  DonationThankYouEmail,
  NewRequestAdminEmail,
  RequestConfirmationEmail,
  StoreReservationAdminEmail,
  StoreReservationConfirmationEmail,
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

export async function donationThankYouEmail(params: {
  donorName?: string | null;
  amount: string;
  frequency: string;
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
  frequency: string;
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
      frequency: params.frequency,
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
