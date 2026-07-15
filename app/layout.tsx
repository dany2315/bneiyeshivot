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

export const metadata: Metadata = {
  title: {
    default: "Bnei Yeshivot",
    template: "%s | Bnei Yeshivot",
  },
  description:
    "Bnei Yeshivot accompagne les jeunes francophones en Israël : demandes, dons, événements et Espace Bahour.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
