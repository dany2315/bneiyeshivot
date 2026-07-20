import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faq = [
  {
    question: "Le paiement est-il sécurisé ?",
    answer:
      "Oui. Le formulaire crée un don en attente puis redirige vers une page de paiement sécurisée. La confirmation met ensuite le don à jour automatiquement.",
  },
  {
    question: "Puis-je faire un don mensuel ?",
    answer:
      "Oui. Le choix don mensuel active un paiement récurrent mensuel pour la durée choisie.",
  },
  {
    question: "Comment le reçu Cerfa est-il géré ?",
    answer:
      "La demande Cerfa et les données fiscales sont rattachées au don. L’admin peut ensuite créer, corriger et suivre le reçu depuis le back-office.",
  },
  {
    question: "Que se passe-t-il si le paiement échoue ?",
    answer:
      "Le don reste suivi en base et les confirmations de paiement mettent son statut à jour. L’admin peut voir les paiements en attente, échoués, réussis ou remboursés.",
  },
  {
    question: "Les dons en espèces ou chèque sont-ils possibles ?",
    answer:
      "Oui, depuis l’interface admin. Un don manuel peut être créé pour les espèces, chèques, virements ou autres moyens hors ligne.",
  },
];

export function DonationFaq() {
  return (
    <section className="section">
      <div className="container grid gap-8 lg:grid-cols-[360px_1fr]">
        <div>
          <Badge variant="warning" className="mb-4 px-3 py-2">
            Questions
          </Badge>
          <h2 className="font-serif text-4xl leading-none font-bold text-[var(--primary-strong)]">
            Avant de donner.
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Les points importants du flux don : paiement, reçu, don mensuel,
            remboursement et dons hors ligne.
          </p>
        </div>
        <Accordion className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_18px_54px_rgba(6,40,70,0.06)]">
          {faq.map((item) => (
            <AccordionItem key={item.question}>
              <AccordionTrigger className="text-base font-bold text-[var(--primary)]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-7 text-[var(--muted)]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
