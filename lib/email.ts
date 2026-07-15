const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
};

export async function sendEmail({ to, subject, html, attachments }: SendEmailInput) {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn("[email] RESEND_API_KEY ou EMAIL_FROM manquant : email non envoye.");
    return { ok: false as const };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, attachments }),
    });

    if (!response.ok) {
      console.error("[email] envoi echoue", await response.text().catch(() => ""));
      return { ok: false as const };
    }

    return { ok: true as const };
  } catch (error) {
    console.error("[email] erreur reseau", error);
    return { ok: false as const };
  }
}

export function newRequestAdminEmail(params: {
  typeLabel: string;
  fullName: string;
  email: string;
  phone?: string;
  link: string;
}) {
  return {
    subject: `Nouvelle demande - ${params.typeLabel} - ${params.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6;">
        <h2 style="color:#061e39;">Nouvelle demande recue</h2>
        <p><strong>Type :</strong> ${params.typeLabel}</p>
        <p><strong>Nom :</strong> ${params.fullName}</p>
        <p><strong>Email :</strong> ${params.email}</p>
        ${params.phone ? `<p><strong>Telephone :</strong> ${params.phone}</p>` : ""}
        <p style="margin-top:20px;">
          <a href="${params.link}"
             style="display:inline-block;background:#061e39;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
            Voir la demande
          </a>
        </p>
      </div>
    `,
  };
}

export function requestConfirmationEmail(params: {
  firstName?: string;
  typeLabel: string;
}) {
  const greeting = params.firstName ? `Bonjour ${params.firstName},` : "Bonjour,";
  return {
    subject: "Bnei Yeshivot - Votre demande a bien ete recue",
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6;">
        <h2 style="color:#061e39;">Demande bien recue</h2>
        <p>${greeting}</p>
        <p>
          Nous avons bien recu votre demande de <strong>${params.typeLabel}</strong>.
          Notre equipe va l'etudier avec attention.
        </p>
        <p><strong>Nous reviendrons vers vous pour la suite.</strong></p>
        <p style="margin-top:24px;">L'equipe Bnei Yeshivot</p>
      </div>
    `,
  };
}

export function storeReservationAdminEmail(params: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: string;
  items: string[];
  link: string;
}) {
  return {
    subject: `Nouvelle reservation boutique - ${params.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6;">
        <h2 style="color:#061e39;">Nouvelle reservation boutique</h2>
        <p><strong>Client :</strong> ${params.customerName}</p>
        <p><strong>Email :</strong> ${params.customerEmail}</p>
        ${params.customerPhone ? `<p><strong>Telephone :</strong> ${params.customerPhone}</p>` : ""}
        <p><strong>Total indicatif :</strong> ${params.total}</p>
        <ul>
          ${params.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <p style="margin-top:20px;">
          <a href="${params.link}"
             style="display:inline-block;background:#061e39;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
            Voir les reservations
          </a>
        </p>
      </div>
    `,
  };
}

export function storeReservationConfirmationEmail(params: {
  customerName: string;
  total: string;
  items: string[];
}) {
  return {
    subject: "Bnei Yeshivot - Votre reservation boutique a bien ete recue",
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6;">
        <h2 style="color:#061e39;">Reservation bien recue</h2>
        <p>Bonjour ${params.customerName},</p>
        <p>
          Nous avons bien recu votre reservation boutique. Aucun paiement n'a ete
          effectue en ligne. Notre equipe va verifier la disponibilite et vous
          recontactera pour confirmer les details.
        </p>
        <p><strong>Total indicatif :</strong> ${params.total}</p>
        <ul>
          ${params.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <p style="margin-top:24px;">L'equipe Bnei Yeshivot</p>
      </div>
    `,
  };
}

export function donationThankYouEmail(params: {
  donorName?: string | null;
  amount: string;
  frequency: string;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const greeting = params.donorName ? `Bonjour ${params.donorName},` : "Bonjour,";
  const stripeReceiptLine = params.stripeReceiptUrl
    ? `<p><a href="${params.stripeReceiptUrl}" style="color:#062846;font-weight:700;">Voir le recu Stripe</a></p>`
    : "";
  const cerfaLine = params.receiptNumber
    ? `<p>Votre recu fiscal Cerfa <strong>${params.receiptNumber}</strong> est joint a cet email.</p>`
    : "";

  return {
    subject: "Bnei Yeshivot - Merci pour votre don",
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6; background:#f5f8fb; padding:24px;">
        <div style="max-width:620px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #dfe7f0;">
          <div style="background:#062846;color:#fff;padding:26px 28px;">
            <h1 style="margin:0;font-size:26px;">Merci pour votre don</h1>
            <p style="margin:8px 0 0;color:#ffb35c;font-weight:700;">Bnei Yeshivot France - Israel</p>
          </div>
          <div style="padding:26px 28px;">
            <p>${greeting}</p>
            <p>
              Nous avons bien recu votre don de <strong>${params.amount}</strong>
              (${params.frequency}). Votre soutien nous aide a accompagner les jeunes
              francophones en Israel de facon concrete.
            </p>
            ${cerfaLine}
            ${stripeReceiptLine}
            <p style="margin-top:24px;">Avec toute notre reconnaissance,</p>
            <p><strong>L'equipe Bnei Yeshivot</strong></p>
          </div>
        </div>
      </div>
    `,
  };
}

export function talmoudoResultEmail(params: {
  firstName?: string;
  sessionTitle: string;
  grade: number;
  rewardAmount?: string;
  rewardPaid: boolean;
}) {
  const greeting = params.firstName ? `Bonjour ${params.firstName},` : "Bonjour,";
  const rewardLine = params.rewardAmount
    ? params.rewardPaid
      ? `Une recompense de <strong>${params.rewardAmount}</strong> a ete indiquee comme remise.`
      : `Une recompense de <strong>${params.rewardAmount}</strong> est prevue.`
    : "Aucune recompense n'a ete indiquee pour ce mivhan.";

  return {
    subject: `Bnei Yeshivot - Resultat Talmoudo Beyado - ${params.sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #061e39; line-height: 1.6;">
        <h2 style="color:#061e39;">Resultat Talmoudo Beyado</h2>
        <p>${greeting}</p>
        <p>
          Votre resultat pour <strong>${params.sessionTitle}</strong> a ete mis a jour.
        </p>
        <p><strong>Note :</strong> ${params.grade} / 100</p>
        <p>${rewardLine}</p>
        <p style="margin-top:24px;">L'equipe Bnei Yeshivot</p>
      </div>
    `,
  };
}
