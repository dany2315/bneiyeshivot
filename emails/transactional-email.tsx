import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type BaseEmailProps = {
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  preview: string;
  title: string;
};

export function BaseEmail({
  actionHref,
  actionLabel,
  children,
  preview,
  title,
}: BaseEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <table
              role="presentation"
              style={headerTable}
              width="100%"
              cellPadding="0"
              cellSpacing="0"
            >
              <tbody>
                <tr>
                  <td style={logoCell} width="64">
                    <Img
                      alt="Bnei Yeshivot"
                      src={emailLogoSrc}
                      style={logo}
                      width="52"
                    />
                  </td>
                  <td style={titleCell}>
                    <Heading style={heading}>{title}</Heading>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Section style={content}>{children}</Section>
          {actionHref && actionLabel ? (
            <Section style={actionSection}>
              <Button href={actionHref} style={button}>
                {actionLabel}
              </Button>
            </Section>
          ) : null}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerTitle}>Bnei Yeshivot</Text>
            <Text style={footerLine}>
              Téléphone Israël :{" "}
              <Link href="tel:+972534727103" style={footerLink}>
                +972 53 472 7103
              </Link>
            </Text>
            <Text style={footerLine}>
              Adresse : 17 Rehov HaPisga, Beit Vagan, Jérusalem
            </Text>
            <Text style={footerLine}>
              Email :{" "}
              <Link href="mailto:contact@bneiyeshivot.com" style={footerLink}>
                contact@bneiyeshivot.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function NewRequestAdminEmail(props: {
  typeLabel: string;
  fullName: string;
  email: string;
  phone?: string;
  link: string;
}) {
  return (
    <BaseEmail
      actionHref={props.link}
      actionLabel="Voir la demande"
      preview={`Nouvelle demande - ${props.typeLabel} - ${props.fullName}`}
      title="Nouvelle demande reçue"
    >
      <InfoLine label="Type" value={props.typeLabel} />
      <InfoLine label="Nom" value={props.fullName} />
      <InfoLine label="Email" value={props.email} />
      {props.phone ? <InfoLine label="Téléphone" value={props.phone} /> : null}
    </BaseEmail>
  );
}

export function RequestConfirmationEmail(props: {
  bahourContext?: {
    email?: string | null;
    fullName?: string | null;
    phone?: string | null;
    school?: string | null;
  };
  firstName?: string;
  typeLabel: string;
}) {
  const greeting = props.firstName ? `Bonjour ${props.firstName},` : "Bonjour,";

  return (
    <BaseEmail
      preview="Votre demande a bien été reçue"
      title="Demande bien reçue"
    >
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Nous avons bien reçu votre demande de <strong>{props.typeLabel}</strong>.
        Le statut de votre demande est déposé.
      </Text>
      {props.bahourContext ? (
        <Section style={list}>
          {props.bahourContext.fullName ? (
            <InfoLine
              label="Bahour concerné"
              value={props.bahourContext.fullName}
            />
          ) : null}
          {props.bahourContext.email ? (
            <InfoLine label="Email du Bahour" value={props.bahourContext.email} />
          ) : null}
          {props.bahourContext.phone ? (
            <InfoLine
              label="Téléphone du Bahour"
              value={props.bahourContext.phone}
            />
          ) : null}
          {props.bahourContext.school ? (
            <InfoLine label="Yeshiva" value={props.bahourContext.school} />
          ) : null}
        </Section>
      ) : null}
      <Text style={paragraphStrong}>Nous reviendrons vers vous pour la suite.</Text>
    </BaseEmail>
  );
}

export function StoreReservationAdminEmail(props: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: string;
  items: string[];
  link: string;
}) {
  return (
    <BaseEmail
      actionHref={props.link}
      actionLabel="Voir les réservations"
      preview={`Nouvelle réservation boutique - ${props.customerName}`}
      title="Nouvelle réservation boutique"
    >
      <InfoLine label="Client" value={props.customerName} />
      <InfoLine label="Email" value={props.customerEmail} />
      {props.customerPhone ? (
        <InfoLine label="Téléphone" value={props.customerPhone} />
      ) : null}
      <InfoLine label="Total indicatif" value={props.total} />
      <ItemsList items={props.items} />
    </BaseEmail>
  );
}

export function StoreReservationConfirmationEmail(props: {
  customerName: string;
  total: string;
  items: string[];
}) {
  return (
    <BaseEmail
      preview="Votre réservation boutique a bien été reçue"
      title="Réservation bien reçue"
    >
      <Text style={paragraph}>Bonjour {props.customerName},</Text>
      <Text style={paragraph}>
        Nous avons bien reçu votre réservation boutique. Aucun paiement n’a
        été effectué en ligne. Notre équipe va vérifier la disponibilité et vous
        recontactera pour confirmer les détails.
      </Text>
      <InfoLine label="Total indicatif" value={props.total} />
      <ItemsList items={props.items} />
    </BaseEmail>
  );
}

export function StoreReservationStatusEmail(props: {
  customerName: string;
  statusLabel: string;
  total: string;
  items: string[];
  pickupDate?: string | null;
  pickupLocation?: string | null;
  unavailableItems?: string | null;
  message?: string | null;
}) {
  return (
    <BaseEmail
      preview={`Mise à jour de votre réservation boutique - ${props.statusLabel}`}
      title="Mise à jour de votre réservation"
    >
      <Text style={paragraph}>Bonjour {props.customerName},</Text>
      <Text style={paragraph}>
        Votre réservation boutique est maintenant indiquée comme{" "}
        <strong>{props.statusLabel}</strong>.
      </Text>
      {props.pickupDate ? (
        <InfoLine label="Date de récupération" value={props.pickupDate} />
      ) : null}
      {props.pickupLocation ? (
        <InfoLine label="Lieu de récupération" value={props.pickupLocation} />
      ) : null}
      {props.unavailableItems ? (
        <Text style={paragraph}>
          Produits non disponibles ou à ajuster :{" "}
          <strong>{props.unavailableItems}</strong>
        </Text>
      ) : null}
      {props.message ? <Text style={paragraph}>{props.message}</Text> : null}
      <InfoLine label="Total indicatif" value={props.total} />
      <ItemsList items={props.items} />
    </BaseEmail>
  );
}

export function DonationThankYouEmail(props: {
  donorName?: string | null;
  amount: string;
  frequency: string;
  paymentLabel?: string | null;
  paymentStatusLabel?: string | null;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const greeting = props.donorName ? `Bonjour ${props.donorName},` : "Bonjour,";

  return (
    <BaseEmail preview="Merci pour votre don" title="Merci pour votre don">
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Nous avons bien reçu votre don de <strong>{props.amount}</strong> (
        {props.frequency}). Votre soutien nous aide à accompagner les jeunes
        francophones en Israël de façon concrète.
      </Text>
      {props.paymentLabel ? (
        <InfoLine label="Paiement" value={props.paymentLabel} />
      ) : null}
      {props.paymentStatusLabel ? (
        <InfoLine label="Statut" value={props.paymentStatusLabel} />
      ) : null}
      {props.receiptNumber ? (
        <Text style={paragraph}>
          Votre reçu fiscal Cerfa <strong>{props.receiptNumber}</strong> est
          joint à cet email.
        </Text>
      ) : null}
      {props.stripeReceiptUrl ? (
        <Button href={props.stripeReceiptUrl} style={secondaryButton}>
          Voir le reçu Stripe
        </Button>
      ) : null}
      <Text style={paragraph}>Avec toute notre reconnaissance,</Text>
    </BaseEmail>
  );
}

export function DonationRecurringPaymentEmail(props: {
  amount: string;
  donorName?: string | null;
  failureReason?: string | null;
  frequency: string;
  paymentLabel: string;
  statusLabel: string;
  stripeReceiptUrl?: string | null;
}) {
  const greeting = props.donorName ? `Bonjour ${props.donorName},` : "Bonjour,";
  const isFailed = props.statusLabel.toLowerCase().includes("échec");

  return (
    <BaseEmail
      preview={`Paiement récurrent ${props.statusLabel.toLowerCase()} - ${props.paymentLabel}`}
      title={isFailed ? "Paiement récurrent à vérifier" : "Paiement récurrent confirmé"}
    >
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Votre paiement mensuel de <strong>{props.amount}</strong> a été mis à
        jour pour votre don récurrent Bnei Yeshivot.
      </Text>
      <InfoLine label="Paiement" value={props.paymentLabel} />
      <InfoLine label="Fréquence" value={props.frequency} />
      <InfoLine label="Statut" value={props.statusLabel} />
      {props.failureReason ? (
        <InfoLine label="Raison" value={props.failureReason} />
      ) : null}
      {props.stripeReceiptUrl ? (
        <Button href={props.stripeReceiptUrl} style={secondaryButton}>
          Voir le reçu Stripe
        </Button>
      ) : null}
      <Text style={paragraph}>Merci pour votre soutien régulier.</Text>
    </BaseEmail>
  );
}

export function TalmoudoResultEmail(props: {
  firstName?: string;
  sessionTitle: string;
  grade: number;
  adminMessage?: string | null;
  rewardAmount?: string;
  rewardPaid: boolean;
}) {
  const greeting = props.firstName ? `Bonjour ${props.firstName},` : "Bonjour,";
  const rewardLine = props.rewardAmount
    ? props.rewardPaid
      ? `Une récompense de ${props.rewardAmount} a été indiquée comme remise.`
      : `Une récompense de ${props.rewardAmount} est prévue.`
    : "Aucune récompense n’a été indiquée pour ce mivhan.";

  return (
    <BaseEmail
      preview={`Résultat Talmoudo Beyado - ${props.sessionTitle}`}
      title="Résultat Talmoudo Beyado"
    >
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Votre résultat pour <strong>{props.sessionTitle}</strong> a été mis à
        jour.
      </Text>
      <InfoLine label="Note" value={`${props.grade} / 100`} />
      <Text style={paragraph}>{rewardLine}</Text>
      {props.adminMessage ? (
        <>
          <InfoLine label="Message de l’admin" value={props.adminMessage} />
        </>
      ) : null}
    </BaseEmail>
  );
}

export function TalmoudoRegistrationAdminEmail(props: {
  adminLink: string;
  dapim: string;
  email: string;
  fullName: string;
  massehet: string;
  phone: string;
  sessionTitle: string;
  yeshiva: string;
}) {
  return (
    <BaseEmail
      actionHref={props.adminLink}
      actionLabel="Voir l’inscription"
      preview={`Nouvelle inscription Talmoudo - ${props.fullName}`}
      title="Nouvelle inscription Talmoudo"
    >
      <InfoLine label="Session" value={props.sessionTitle} />
      <InfoLine label="Nom" value={props.fullName} />
      <InfoLine label="Email" value={props.email} />
      <InfoLine label="Téléphone" value={props.phone} />
      <InfoLine label="Yeshiva" value={props.yeshiva} />
      <InfoLine label="Massehet" value={props.massehet} />
      <InfoLine label="Dapim" value={props.dapim} />
    </BaseEmail>
  );
}

export function ServiceRequestEmail(props: {
  actionHref?: string;
  actionLabel?: string;
  body: string[];
  preview: string;
  title: string;
}) {
  return (
    <BaseEmail
      actionHref={props.actionHref}
      actionLabel={props.actionLabel}
      preview={props.preview}
      title={props.title}
    >
      {props.body.map((text) => (
        <Text
          dangerouslySetInnerHTML={{ __html: text }}
          key={text}
          style={paragraph}
        />
      ))}
    </BaseEmail>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={line}>
      <strong>{label} :</strong> {value}
    </Text>
  );
}

function ItemsList({ items }: { items: string[] }) {
  return (
    <Section style={list}>
      {items.map((item) => (
        <Text key={item} style={listItem}>
          - {item}
        </Text>
      ))}
    </Section>
  );
}

const body = {
  margin: "0",
  backgroundColor: "#f5f8fb",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container = {
  width: "100%",
  maxWidth: "620px",
  margin: "0 auto",
  padding: "28px 14px",
};

const emailAssetBaseUrl =
  process.env.EMAIL_ASSET_BASE_URL?.replace(/\/$/, "") ||
  getPublicAssetBaseUrl() ||
  "https://bneiyeshivot.vercel.app";

const emailLogoSrc = `${emailAssetBaseUrl}/logo-bnei.png`;

function getPublicAssetBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!appUrl || appUrl.includes("localhost")) {
    return "";
  }

  return appUrl;
}

const header = {
  borderRadius: "18px 18px 0 0",
  backgroundColor: "#062846",
  padding: "24px 28px",
};

const headerTable = {
  borderCollapse: "collapse" as const,
};

const logoCell = {
  padding: "0 12px 0 0",
  verticalAlign: "middle" as const,
};

const logo = {
  display: "block",
  margin: "0",
  maxWidth: "52px",
  height: "auto",
};

const titleCell = {
  verticalAlign: "middle" as const,
};

const heading = {
  margin: "0",
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "30px",
  fontWeight: "800",
};

const content = {
  backgroundColor: "#ffffff",
  borderRight: "1px solid #dfe7f0",
  borderLeft: "1px solid #dfe7f0",
  padding: "26px 28px",
};

const paragraph = {
  margin: "0 0 14px",
  color: "#43556a",
  fontSize: "15px",
  lineHeight: "24px",
};

const paragraphStrong = {
  ...paragraph,
  color: "#062846",
  fontWeight: "800",
};

const line = {
  margin: "0 0 9px",
  color: "#061e39",
  fontSize: "14px",
  lineHeight: "22px",
};

const list = {
  margin: "12px 0 0",
  borderRadius: "14px",
  backgroundColor: "#f8fafc",
  padding: "12px 14px",
};

const listItem = {
  margin: "0 0 6px",
  color: "#43556a",
  fontSize: "14px",
  lineHeight: "21px",
};

const actionSection = {
  backgroundColor: "#ffffff",
  borderRight: "1px solid #dfe7f0",
  borderLeft: "1px solid #dfe7f0",
  padding: "0 28px 26px",
};

const button = {
  borderRadius: "999px",
  backgroundColor: "#062846",
  color: "#ffffff",
  padding: "12px 18px",
  fontWeight: "800",
  textDecoration: "none",
};

const secondaryButton = {
  border: "1px solid #d8e1ec",
  borderRadius: "999px",
  backgroundColor: "#ffffff",
  color: "#062846",
  padding: "12px 18px",
  fontWeight: "800",
  textDecoration: "none",
};

const divider = {
  margin: "0",
  borderColor: "#dfe7f0",
};

const footer = {
  margin: "0",
  borderRight: "1px solid #dfe7f0",
  borderBottom: "1px solid #dfe7f0",
  borderLeft: "1px solid #dfe7f0",
  borderRadius: "0 0 18px 18px",
  backgroundColor: "#ffffff",
  padding: "18px 28px 28px",
};

const footerTitle = {
  margin: "0 0 8px",
  color: "#062846",
  fontSize: "14px",
  fontWeight: "800",
  lineHeight: "20px",
};

const footerLine = {
  margin: "0 0 4px",
  color: "#738092",
  fontSize: "13px",
  lineHeight: "20px",
};

const footerLink = {
  color: "#062846",
  textDecoration: "none",
};
