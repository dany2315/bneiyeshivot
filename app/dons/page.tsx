import { PageShell } from "../components";
import { DonationCheckoutForm } from "./_components/donation-checkout-form";
import { DonationFaq } from "./_components/donation-faq";
import { DonationHero } from "./_components/donation-hero";
import { DonationImpactGrid } from "./_components/donation-impact-grid";

export const metadata = {
  title: "Faire un don",
};

export default function DonationsPage() {
  return (
    <PageShell>
      <main>
        <DonationHero />
        <section className="section">
          <div className="container max-w-5xl">
            <DonationCheckoutForm />
          </div>
        </section>
        <DonationImpactGrid />
        <DonationFaq />
      </main>
    </PageShell>
  );
}
