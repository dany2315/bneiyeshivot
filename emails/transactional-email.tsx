import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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

function BaseEmail({
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
            <Text style={brand}>Bnei Yeshivot</Text>
            <Heading style={heading}>{title}</Heading>
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
          <Text style={footer}>L&apos;equipe Bnei Yeshivot</Text>
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
      title="Nouvelle demande recue"
    >
      <InfoLine label="Type" value={props.typeLabel} />
      <InfoLine label="Nom" value={props.fullName} />
      <InfoLine label="Email" value={props.email} />
      {props.phone ? <InfoLine label="Telephone" value={props.phone} /> : null}
    </BaseEmail>
  );
}

export function RequestConfirmationEmail(props: {
  firstName?: string;
  typeLabel: string;
}) {
  const greeting = props.firstName ? `Bonjour ${props.firstName},` : "Bonjour,";

  return (
    <BaseEmail
      preview="Votre demande a bien ete recue"
      title="Demande bien recue"
    >
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Nous avons bien recu votre demande de <strong>{props.typeLabel}</strong>.
        Notre equipe va l&apos;etudier avec attention.
      </Text>
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
      actionLabel="Voir les reservations"
      preview={`Nouvelle reservation boutique - ${props.customerName}`}
      title="Nouvelle reservation boutique"
    >
      <InfoLine label="Client" value={props.customerName} />
      <InfoLine label="Email" value={props.customerEmail} />
      {props.customerPhone ? (
        <InfoLine label="Telephone" value={props.customerPhone} />
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
      preview="Votre reservation boutique a bien ete recue"
      title="Reservation bien recue"
    >
      <Text style={paragraph}>Bonjour {props.customerName},</Text>
      <Text style={paragraph}>
        Nous avons bien recu votre reservation boutique. Aucun paiement n&apos;a
        ete effectue en ligne. Notre equipe va verifier la disponibilite et vous
        recontactera pour confirmer les details.
      </Text>
      <InfoLine label="Total indicatif" value={props.total} />
      <ItemsList items={props.items} />
    </BaseEmail>
  );
}

export function DonationThankYouEmail(props: {
  donorName?: string | null;
  amount: string;
  frequency: string;
  receiptNumber?: string | null;
  stripeReceiptUrl?: string | null;
}) {
  const greeting = props.donorName ? `Bonjour ${props.donorName},` : "Bonjour,";

  return (
    <BaseEmail preview="Merci pour votre don" title="Merci pour votre don">
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Nous avons bien recu votre don de <strong>{props.amount}</strong> (
        {props.frequency}). Votre soutien nous aide a accompagner les jeunes
        francophones en Israel de facon concrete.
      </Text>
      {props.receiptNumber ? (
        <Text style={paragraph}>
          Votre recu fiscal Cerfa <strong>{props.receiptNumber}</strong> est
          joint a cet email.
        </Text>
      ) : null}
      {props.stripeReceiptUrl ? (
        <Button href={props.stripeReceiptUrl} style={secondaryButton}>
          Voir le recu Stripe
        </Button>
      ) : null}
      <Text style={paragraph}>Avec toute notre reconnaissance,</Text>
    </BaseEmail>
  );
}

export function TalmoudoResultEmail(props: {
  firstName?: string;
  sessionTitle: string;
  grade: number;
  rewardAmount?: string;
  rewardPaid: boolean;
}) {
  const greeting = props.firstName ? `Bonjour ${props.firstName},` : "Bonjour,";
  const rewardLine = props.rewardAmount
    ? props.rewardPaid
      ? `Une recompense de ${props.rewardAmount} a ete indiquee comme remise.`
      : `Une recompense de ${props.rewardAmount} est prevue.`
    : "Aucune recompense n'a ete indiquee pour ce mivhan.";

  return (
    <BaseEmail
      preview={`Resultat Talmoudo Beyado - ${props.sessionTitle}`}
      title="Resultat Talmoudo Beyado"
    >
      <Text style={paragraph}>{greeting}</Text>
      <Text style={paragraph}>
        Votre resultat pour <strong>{props.sessionTitle}</strong> a ete mis a
        jour.
      </Text>
      <InfoLine label="Note" value={`${props.grade} / 100`} />
      <Text style={paragraph}>{rewardLine}</Text>
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
      actionLabel="Voir l'inscription"
      preview={`Nouvelle inscription Talmoudo - ${props.fullName}`}
      title="Nouvelle inscription Talmoudo"
    >
      <InfoLine label="Session" value={props.sessionTitle} />
      <InfoLine label="Nom" value={props.fullName} />
      <InfoLine label="Email" value={props.email} />
      <InfoLine label="Telephone" value={props.phone} />
      <InfoLine label="Yeshiva" value={props.yeshiva} />
      <InfoLine label="Massehet" value={props.massehet} />
      <InfoLine label="Dapim" value={props.dapim} />
    </BaseEmail>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
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

const header = {
  borderRadius: "18px 18px 0 0",
  backgroundColor: "#062846",
  padding: "26px 28px",
};

const brand = {
  margin: "0 0 8px",
  color: "#ffb35c",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const heading = {
  margin: "0",
  color: "#ffffff",
  fontSize: "26px",
  lineHeight: "32px",
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
  color: "#738092",
  padding: "18px 28px 28px",
  fontSize: "13px",
  lineHeight: "20px",
};
