const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
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
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
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
