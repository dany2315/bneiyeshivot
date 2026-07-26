import { Text } from "@react-email/components";
import { BaseEmail } from "./transactional-email";

type OtpEmailProps = {
  otp: string;
};

export function OtpEmail({ otp }: OtpEmailProps) {
  const formattedOtp = otp.trim().split("").join(" ");

  return (
    <BaseEmail
      preview={`Votre code de connexion Bnei Yeshivot : ${otp}`}
      title="Code de connexion"
    >
      <Text style={paragraph}>
        Voici votre code temporaire pour accéder à votre Espace Bahour.
      </Text>

      <table
        role="presentation"
        style={codeTable}
        width="100%"
        cellPadding="0"
        cellSpacing="0"
      >
        <tbody>
          <tr>
            <td align="center" style={codeCell}>
              <span style={code}>{formattedOtp}</span>
            </td>
          </tr>
        </tbody>
      </table>

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

const codeTable = {
  margin: "16px 0 18px",
  borderCollapse: "separate" as const,
};

const codeCell = {
  borderRadius: "16px",
  backgroundColor: "#fff4e8",
  padding: "18px 20px",
  textAlign: "center" as const,
};

const code = {
  margin: "0",
  color: "#062644",
  WebkitTextFillColor: "#062644",
  fontFamily: "Courier New, Courier, monospace",
  fontSize: "34px",
  fontWeight: "800",
  lineHeight: "40px",
  whiteSpace: "nowrap" as const,
};
