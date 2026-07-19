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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const actionItemClassName =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]";

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
        <Link
          className={actionItemClassName}
          href={`/admin/dons?q=${encodeURIComponent(donorEmail)}`}
        >
          <Eye className="size-4" />
          Voir les dons du donateur
        </Link>
        {stripeReceiptUrl ? (
          <a
            className={actionItemClassName}
            href={stripeReceiptUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
            Voir le recu Stripe
          </a>
        ) : null}
        <form action={sendPaymentReceipt}>
          <input name="donationId" type="hidden" value={donationId} />
          <button className={actionItemClassName} type="submit">
            <Mail className="size-4" />
            Envoyer le recu
          </button>
        </form>
        {hasCerfa ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Cerfa</DropdownMenuLabel>
            <form action={sendCerfaReceipt}>
              <input name="donationId" type="hidden" value={donationId} />
              <button className={actionItemClassName} type="submit">
                <Send className="size-4" />
                Envoyer le Cerfa
              </button>
            </form>
            {cerfaUrl ? (
              <>
                <a
                  className={actionItemClassName}
                  href={cerfaUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Eye className="size-4" />
                  Voir le Cerfa
                </a>
                <a className={actionItemClassName} download href={cerfaUrl}>
                  <Download className="size-4" />
                  Telecharger le Cerfa
                </a>
              </>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
