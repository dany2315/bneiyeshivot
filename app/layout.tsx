import type { Metadata } from "next";
import { Fraunces, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://bneiyeshivot.com";

const siteName = "Bnei Yeshivot";
const siteDescription =
  "Bnei Yeshivot accompagne les jeunes francophones en Israel : demarches, programmes Torah, evenements, dons et Espace Bahour.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bnei Yeshivot | France - Israel",
    template: "%s | Bnei Yeshivot",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Bnei Yeshivot",
    "yeshiva",
    "Israel",
    "francophone",
    "bahourim",
    "avrekhim",
    "Torah",
    "visa etudiant",
    "koupat holim",
    "dons",
    "Kesher Nitsri",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: "Bnei Yeshivot | France - Israel",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bnei Yeshivot | France - Israel",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className={`${manrope.variable} ${fraunces.variable}`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
