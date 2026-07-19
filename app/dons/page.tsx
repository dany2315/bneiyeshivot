import { PageShell } from "../components";
import { DonationCheckoutForm } from "./_components/donation-checkout-form";
import { DonationHero } from "./_components/donation-hero";

export const metadata = {
  title: "Faire un don",
};

export default function DonationsPage() {
  const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    "";
  const nedarimPlusEnabled =
    process.env.NEDARIM_PLUS_ENABLED === "true" &&
    Boolean(process.env.NEDARIM_PLUS_MOSAD_ID) &&
    Boolean(process.env.NEDARIM_PLUS_API_VALID);

  return (
    <PageShell>
      <main>
        <DonationHero>
          <div className="lg:sticky lg:top-24">
            <DonationCheckoutForm
              nedarimPlusEnabled={nedarimPlusEnabled}
              stripePublishableKey={stripePublishableKey}
            />
          </div>
        </DonationHero>
      </main>
    </PageShell>
  );
}
