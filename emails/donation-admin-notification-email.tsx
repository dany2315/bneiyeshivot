import { Button, Section, Text } from "@react-email/components";
import { BaseEmail, InfoLine } from "./transactional-email";

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
  heading = "Nouveau don confirmé",
  paymentLabel,
  paymentStatusLabel,
  receiptNumber,
  stripePaymentIntentId,
  stripeReceiptUrl,
}: DonationAdminNotificationEmailProps) {
  return (
    <BaseEmail
      actionHref={adminLink}
      actionLabel="Ouvrir le don dans l’admin"
      preview={`${heading} - ${amount} - ${donorName}`}
      title={heading}
    >
      <Text style={paragraph}>
        Un paiement vient d’être synchronisé sur la page dons.
      </Text>

      <Section style={amountBox}>
        <Text style={amountLabel}>Montant</Text>
        <Text style={amountValue}>{amount}</Text>
        <Text style={frequencyText}>{frequency}</Text>
        {paymentLabel ? (
          <Text style={frequencyText}>Paiement {paymentLabel}</Text>
        ) : null}
        {paymentStatusLabel ? (
          <Text style={frequencyText}>Statut : {paymentStatusLabel}</Text>
        ) : null}
      </Section>

      <Section style={infoBox}>
        <Text style={boxTitle}>Donateur</Text>
        <InfoLine label="Nom" value={donorName} />
        <InfoLine label="Email" value={donorEmail} />
        {donorPhone ? <InfoLine label="Téléphone" value={donorPhone} /> : null}
      </Section>

      <Section style={infoBox}>
        <Text style={boxTitle}>Paiement et reçu</Text>
        <InfoLine label="Reçu Cerfa" value={receiptNumber || "À générer"} />
        <InfoLine
          label="Stripe payment intent"
          value={stripePaymentIntentId || "-"}
        />
        {failureReason ? (
          <InfoLine label="Raison échec" value={failureReason} />
        ) : null}
      </Section>

      {stripeReceiptUrl ? (
        <Button href={stripeReceiptUrl} style={secondaryButton}>
          Voir le reçu Stripe
        </Button>
      ) : null}
    </BaseEmail>
  );
}

export default DonationAdminNotificationEmail;

const paragraph = {
  margin: "0 0 14px",
  color: "#43556a",
  fontSize: "15px",
  lineHeight: "24px",
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

const secondaryButton = {
  display: "inline-block",
  marginTop: "18px",
  border: "1px solid #d8e1ec",
  borderRadius: "999px",
  backgroundColor: "#ffffff",
  color: "#062846",
  padding: "12px 18px",
  fontWeight: "800",
  textDecoration: "none",
};
