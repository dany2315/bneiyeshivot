import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type OtpEmailProps = {
  otp: string;
};

export function OtpEmail({ otp }: OtpEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre code de connexion Bnei Yeshivot : {otp}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandSection}>
            <Text style={brand}>Bnei Yeshivot</Text>
            <Text style={subBrand}>France - Israël</Text>
          </Section>

          <Heading style={heading}>Code de connexion</Heading>
          <Text style={paragraph}>
            Voici votre code temporaire pour accéder à votre Espace Bahour.
          </Text>

          <Section style={codeBox}>
            <Text style={code}>{otp}</Text>
          </Section>

          <Text style={paragraph}>
            Ce code expire dans quelques minutes. Si vous n’êtes pas à
            l’origine de cette demande, vous pouvez ignorer cet email.
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            Bnei Yeshivot - Accompagnement des jeunes francophones en Israël.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OtpEmail;

const body = {
  margin: "0",
  backgroundColor: "#f5f8fb",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const container = {
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 20px",
};

const brandSection = {
  borderRadius: "18px 18px 0 0",
  backgroundColor: "#062644",
  padding: "26px 28px",
};

const brand = {
  margin: "0",
  color: "#ffffff",
  fontSize: "26px",
  fontWeight: "700",
};

const subBrand = {
  margin: "6px 0 0",
  color: "#ffb35c",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1.2px",
  textTransform: "uppercase" as const,
};

const heading = {
  margin: "0",
  backgroundColor: "#ffffff",
  color: "#062644",
  padding: "30px 28px 8px",
  fontSize: "24px",
  fontWeight: "700",
};

const paragraph = {
  margin: "0",
  backgroundColor: "#ffffff",
  color: "#43556a",
  padding: "12px 28px",
  fontSize: "16px",
  lineHeight: "26px",
};

const codeBox = {
  backgroundColor: "#ffffff",
  padding: "16px 28px",
};

const code = {
  margin: "0",
  borderRadius: "16px",
  backgroundColor: "#fff4e8",
  color: "#062644",
  padding: "18px 20px",
  textAlign: "center" as const,
  fontSize: "34px",
  fontWeight: "800",
  letterSpacing: "8px",
};

const divider = {
  margin: "0",
  borderColor: "#dfe7f0",
};

const footer = {
  margin: "0",
  borderRadius: "0 0 18px 18px",
  backgroundColor: "#ffffff",
  color: "#738092",
  padding: "18px 28px 28px",
  fontSize: "13px",
  lineHeight: "20px",
};
