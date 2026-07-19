"use client";

import Link from "next/link";
import {
  Download,
  ExternalLink,
  Eye,
  Mail,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { sendCerfaReceipt, sendPaymentReceipt } from "../actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DonationActionsDropdown({
  cerfaUrl,
  donationId,
  donorEmail,
  hasCerfa,
  stripeReceiptUrl,
}: {
  cerfaUrl: string | null;
  donationId: string;
  donorEmail: string;
  hasCerfa: boolean;
  stripeReceiptUrl: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="secondary" />}>
        <MoreHorizontal className="size-4" />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Don</DropdownMenuLabel>
        <DropdownMenuItem
          render={
            <Link href={`/admin/dons?q=${encodeURIComponent(donorEmail)}`} />
          }
        >
          <Eye className="size-4" />
          Voir les dons du donateur
        </DropdownMenuItem>
        {stripeReceiptUrl ? (
          <DropdownMenuItem
            render={
              <a href={stripeReceiptUrl} rel="noreferrer" target="_blank" />
            }
          >
            <ExternalLink className="size-4" />
            Voir le recu Stripe
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem render={<form action={sendPaymentReceipt} />}>
          <input name="donationId" type="hidden" value={donationId} />
          <button className="flex w-full items-center gap-2" type="submit">
            <Mail className="size-4" />
            Envoyer le recu
          </button>
        </DropdownMenuItem>
        {hasCerfa ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Cerfa</DropdownMenuLabel>
            <DropdownMenuItem render={<form action={sendCerfaReceipt} />}>
              <input name="donationId" type="hidden" value={donationId} />
              <button className="flex w-full items-center gap-2" type="submit">
                <Send className="size-4" />
                Envoyer le Cerfa
              </button>
            </DropdownMenuItem>
            {cerfaUrl ? (
              <>
                <DropdownMenuItem
                  render={<a href={cerfaUrl} rel="noreferrer" target="_blank" />}
                >
                  <Eye className="size-4" />
                  Voir le Cerfa
                </DropdownMenuItem>
                <DropdownMenuItem render={<a download href={cerfaUrl} />}>
                  <Download className="size-4" />
                  Telecharger le Cerfa
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
