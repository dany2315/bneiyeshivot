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
