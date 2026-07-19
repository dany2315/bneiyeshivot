import { PageShell } from "../components";
import { DonationCheckoutForm } from "./_components/donation-checkout-form";
import { DonationFaq } from "./_components/donation-faq";
import { DonationHero } from "./_components/donation-hero";
import { DonationImpactGrid } from "./_components/donation-impact-grid";

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
        <DonationHero />
        <section className="section">
          <div className="container max-w-5xl">
            <DonationCheckoutForm
              nedarimPlusEnabled={nedarimPlusEnabled}
              stripePublishableKey={stripePublishableKey}
            />
          </div>
        </section>
        <DonationImpactGrid />
        <DonationFaq />
      </main>
    </PageShell>
  );
}
