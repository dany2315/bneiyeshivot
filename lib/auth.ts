import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { render } from "@react-email/render";
import { OtpEmail } from "@/emails/otp-email";
import { prisma } from "@/lib/prisma";

const defaultTrustedOrigins = [
  "http://localhost:3000",
  "https://bneiyeshivot.com",
  "https://www.bneiyeshivot.com",
  "https://bneiyeshivot.vercel.app",
  "https://*.vercel.app",
];

function getTrustedOrigins() {
  const envOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [];

  return [...defaultTrustedOrigins, ...envOrigins]
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function sendOtpEmail(email: string, otp: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ??
    "Bnei Yeshivot <noreply@updates.bneiyeshivot.com>";

  if (!resendApiKey) {
    console.info(`[auth] OTP pour ${email}: ${otp}`);
    return;
  }

  const html = await render(OtpEmail({ otp }));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Votre code de connexion Bnei Yeshivot",
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${body}`);
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp);
      },
    }),
    nextCookies(),
  ],
});
