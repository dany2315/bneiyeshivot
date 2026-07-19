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

type DonationAdminNotificationEmailProps = {
  adminLink: string;
  amount: string;
  donorEmail: string;
  donorName: string;
  donorPhone?: string | null;
  failureReason?: string | null;
  frequency: string;
  heading?: string;
  paymentLabel?: string | null;
  paymentStatusLabel?: string | null;
  receiptNumber?: string | null;
  stripePaymentIntentId?: string | null;
  stripeReceiptUrl?: string | null;
};

export function DonationAdminNotificationEmail({
  adminLink,
  amount,
  donorEmail,
  donorName,
  donorPhone,
  failureReason,
  frequency,
  heading = "Nouveau don confirme",
  paymentLabel,
  paymentStatusLabel,
  receiptNumber,
  stripePaymentIntentId,
  stripeReceiptUrl,
}: DonationAdminNotificationEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>
        {heading} - {amount} - {donorName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>Notification admin</Text>
            <Heading style={headingStyle}>{heading}</Heading>
            <Text style={headerText}>
              Un paiement vient d&apos;etre synchronise sur la page dons.
            </Text>
          </Section>

          <Section style={content}>
            <Section style={amountBox}>
              <Text style={amountLabel}>Montant</Text>
              <Text style={amountValue}>{amount}</Text>
              <Text style={frequencyText}>{frequency}</Text>
              {paymentLabel ? (
                <Text style={frequencyText}>Paiement {paymentLabel}</Text>
              ) : null}
              {paymentStatusLabel ? (
                <Text style={frequencyText}>Statut: {paymentStatusLabel}</Text>
              ) : null}
            </Section>

            <Section style={infoBox}>
              <Text style={boxTitle}>Donateur</Text>
              <Text style={line}>
                <strong>Nom :</strong> {donorName}
              </Text>
              <Text style={line}>
                <strong>Email :</strong> {donorEmail}
              </Text>
              {donorPhone ? (
                <Text style={line}>
                  <strong>Telephone :</strong> {donorPhone}
                </Text>
              ) : null}
            </Section>

            <Section style={infoBox}>
              <Text style={boxTitle}>Paiement et recu</Text>
              <Text style={line}>
                <strong>Recu Cerfa :</strong> {receiptNumber || "A generer"}
              </Text>
              <Text style={line}>
                <strong>Stripe payment intent :</strong>{" "}
                {stripePaymentIntentId || "-"}
              </Text>
              {failureReason ? (
                <Text style={line}>
                  <strong>Raison echec :</strong> {failureReason}
                </Text>
              ) : null}
            </Section>

            <Section style={actions}>
              <Button href={adminLink} style={primaryButton}>
                Ouvrir le don dans l&apos;admin
              </Button>
              {stripeReceiptUrl ? (
                <Button href={stripeReceiptUrl} style={secondaryButton}>
                  Voir le recu Stripe
                </Button>
              ) : null}
            </Section>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            Email automatique envoye par Resend depuis la plateforme Bnei
            Yeshivot.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DonationAdminNotificationEmail;

const body = {
  margin: "0",
  backgroundColor: "#f4f7fb",
  color: "#061e39",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container = {
  width: "100%",
  maxWidth: "680px",
  margin: "0 auto",
  padding: "28px 14px",
};

const header = {
  borderRadius: "22px 22px 0 0",
  backgroundColor: "#062846",
  padding: "28px 30px",
};

const eyebrow = {
  margin: "0 0 8px",
  color: "#ffb35c",
  fontSize: "13px",
  fontWeight: "800",
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "28px",
  lineHeight: "32px",
  fontWeight: "800",
};

const headerText = {
  margin: "12px 0 0",
  color: "#d8e8f8",
  fontSize: "15px",
  lineHeight: "23px",
};

const content = {
  backgroundColor: "#ffffff",
  borderRight: "1px solid #dfe7f0",
  borderLeft: "1px solid #dfe7f0",
  padding: "28px 30px",
};

const amountBox = {
  margin: "0 0 18px",
  border: "1px solid #ffe0c5",
  borderRadius: "18px",
  backgroundColor: "#fff7ef",
  padding: "20px",
};

const amountLabel = {
  margin: "0",
  color: "#8b4b13",
  fontSize: "13px",
  fontWeight: "800",
  textTransform: "uppercase" as const,
};

const amountValue = {
  margin: "6px 0 0",
  color: "#062846",
  fontSize: "34px",
  lineHeight: "38px",
  fontWeight: "900",
};

const frequencyText = {
  margin: "8px 0 0",
  color: "#637186",
  fontSize: "14px",
};

const infoBox = {
  margin: "14px 0 0",
  border: "1px solid #dfe7f0",
  borderRadius: "16px",
  padding: "18px",
};

const boxTitle = {
  margin: "0 0 12px",
  color: "#062846",
  fontSize: "16px",
  fontWeight: "800",
};

const line = {
  margin: "0 0 8px",
  color: "#061e39",
  fontSize: "14px",
  lineHeight: "22px",
};

const actions = {
  margin: "24px 0 0",
};

const primaryButton = {
  display: "inline-block",
  marginRight: "10px",
  borderRadius: "999px",
  backgroundColor: "#062846",
  color: "#ffffff",
  padding: "13px 20px",
  fontWeight: "800",
  textDecoration: "none",
};

const secondaryButton = {
  display: "inline-block",
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
  borderRadius: "0 0 22px 22px",
  backgroundColor: "#fbfcfe",
  color: "#637186",
  padding: "16px 30px",
  fontSize: "12px",
  lineHeight: "18px",
};
