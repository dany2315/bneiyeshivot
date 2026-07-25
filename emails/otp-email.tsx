import { Section, Text } from "@react-email/components";
import { BaseEmail } from "./transactional-email";

type OtpEmailProps = {
  otp: string;
};

export function OtpEmail({ otp }: OtpEmailProps) {
  return (
    <BaseEmail
      preview={`Votre code de connexion Bnei Yeshivot : ${otp}`}
      title="Code de connexion"
    >
      <Text style={paragraph}>
        Voici votre code temporaire pour accéder à votre Espace Bahour.
      </Text>

      <Section style={codeBox}>
        <Text style={code}>{otp}</Text>
      </Section>

      <Text style={paragraph}>
        Ce code expire dans quelques minutes. Si vous n’êtes pas à l’origine de
        cette demande, vous pouvez ignorer cet email.
      </Text>
    </BaseEmail>
  );
}

export default OtpEmail;

const paragraph = {
  margin: "0 0 14px",
  color: "#43556a",
  fontSize: "16px",
  lineHeight: "26px",
};

const codeBox = {
  margin: "16px 0 18px",
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
