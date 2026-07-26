import type { Metadata } from "next";
import { Fraunces, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "https://bneiyeshivot.com",
);

const siteDescription =
  "Bnei Yeshivot accompagne les jeunes francophones en Israël : démarches, dons, événements et Espace Bahour.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Bnei Yeshivot",
  title: {
    default: "Bnei Yeshivot",
    template: "%s | Bnei Yeshivot",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Bnei Yeshivot",
    title: "Bnei Yeshivot",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Logo Bnei Yeshivot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bnei Yeshivot",
    description: siteDescription,
    images: ["/opengraph-image.png"],
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
