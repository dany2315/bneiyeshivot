import { PageShell } from "../components";
import { DonationCheckoutForm } from "./_components/donation-checkout-form";
import { DonationFaq } from "./_components/donation-faq";
import { DonationHero } from "./_components/donation-hero";
import { DonationImpactGrid } from "./_components/donation-impact-grid";
import { DonationTrustRail } from "./_components/donation-trust-rail";

export const metadata = {
  title: "Faire un don",
};

export default function DonationsPage() {
  return (
    <PageShell>
      <main>
        <DonationHero />
        <section className="section">
          <div className="container grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <DonationCheckoutForm />
            <DonationTrustRail />
          </div>
        </section>
        <DonationImpactGrid />
        <DonationFaq />
      </main>
    </PageShell>
  );
}
