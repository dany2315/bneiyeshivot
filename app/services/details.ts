export type ServiceDetail = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionHref: string;
  external?: boolean;
  sections: Array<{
    title: string;
    body?: string[];
    bullets?: string[];
  }>;
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "assurance-maladie",
    eyebrow: "Assurance maladie",
    title: "Notre accompagnement assurance maladie",
    intro:
      "Bnei Yeshivot accompagne gratuitement les étudiants francophones dans leurs démarches d'inscription auprès d'une caisse d'assurance maladie israélienne, afin de bénéficier d'une couverture santé des l'arrivée en Israël.",
    actionLabel: "Faire ma demande d'assurance maladie",
    actionHref: "/demandes/koupat-holim",
    sections: [
      {
        title: "Notre accompagnement",
        body: [
          "Nous travaillons actuellement principalement avec Meuhedet pour les étudiants majeurs et avec Maccabi pour certaines situations concernant les étudiants mineurs.",
          "Notre équipe vous guide dans les démarches administratives, répond a vos questions et assure un suivi personnalise de votre dossier, sans frais d'accompagnement.",
        ],
      },
      {
        title: "Qui peut bénéficier de ce service ?",
        body: [
          "Ce service est destiné aux étudiants francophones venant étudier en Israël.",
          "Pour les personnes de 18 ans et plus, nous proposons un accompagnement pour l'inscription a Meuhedet. La demande peut être effectuée avant l'arrivée en Israël.",
          "Pour les moins de 18 ans, nous pouvons accompagner certaines inscriptions a Maccabi. Les délais sont généralement plus longs.",
        ],
      },
      {
        title: "Documents a préparer",
        bullets: [
          "Formulaire d'inscription complete et signe.",
          "Ichour Limoudim, certificat d'études delivre par la yeshiva.",
          "Photocopie lisible du passeport, page d'identité.",
        ],
      },
      {
        title: "Cout et délais",
        body: [
          "La cotisation est actuellement de 135 NIS par mois, a régler directement auprès de la caisse d'assurance maladie. Lors de l'inscription, 6 mois de cotisation sont demandes à l'avance.",
          "En regle générale, le traitement d'un dossier prend entre 48 heures et une semaine. En début d'année, les délais peuvent être plus longs.",
        ],
      },
      {
        title: "Validation de votre assurance",
        body: [
          "Une fois votre inscription validée, vous recevez un email de confirmation. Vous pourrez ensuite recuperer votre carte d'assurance maladie dans nos locaux : Bnei Yeshivot, 17 Rehov HaPisga, Bayit Vagan, Jérusalem.",
        ],
      },
      {
        title: "Bon a savoir",
        body: [
          "L'accompagnement propose par Bnei Yeshivot est entièrement gratuit. Vous ne réglez aucun frais d'accompagnement a Bnei Yeshivot.",
        ],
      },
    ],
  },
  {
    slug: "visa-étudiant",
    eyebrow: "Visa étudiant",
    title: "Accompagnement pour une demande de visa étudiant",
    intro:
      "Bnei Yeshivot accompagne gratuitement les étudiants francophones dans leurs démarches de demande ou de renouvellement de visa étudiant en Israël.",
    actionLabel: "Faire ma demande de visa",
    actionHref: "/demandes/visa",
    sections: [
      {
        title: "Notre role",
        body: [
          "Nous vous aidons a préparer votre dossier, a comprendre les étapes de la procédure et a suivre votre demande.",
          "Aucun frais d'accompagnement n'est demande par Bnei Yeshivot.",
        ],
      },
      {
        title: "Qui peut bénéficier de cet accompagnement ?",
        body: [
          "Ce service concerne actuellement les Bahourim et jeunes étudiants inscrits dans une yeshiva en Israël.",
          "Pour le moment, il concerne uniquement les étudiants venant étudier en yeshiva et n'est pas ouvert aux personnes mariees.",
        ],
      },
      {
        title: "Conditions générales",
        bullets: [
          "Être age de 18 ans ou plus.",
          "Être présent sur le territoire israélien au moment de la demande.",
          "Être inscrit ou en cours d'inscription dans une yeshiva reconnue.",
          "Ne pas relever d'une autre procédure administrative liee à la nationalité israélienne.",
        ],
      },
      {
        title: "Documents nécessaires",
        bullets: [
          "Formulaire de demande de visa complete et signe.",
          "Ichour Limoudim, certificat de scolarite pour la demande de visa.",
          "Acte de naissance datant de moins de 3 mois.",
          "Photocopie lisible du passeport.",
        ],
      },
      {
        title: "Delais de traitement",
        body: [
          "Les délais varient selon les autorites compétentes et la situation de chaque dossier. A titre indicatif, il faut généralement compter environ un mois.",
          "Bnei Yeshivot accompagne la preparation et le suivi du dossier, mais ne peut garantir ni le delai ni la decision finale.",
        ],
      },
      {
        title: "Avant de déposer votre demande",
        body: [
          "Si vous prevoyez de quitter Israël prochainement, il peut être preferable d'attendre votre retour avant d'entamer la procédure.",
        ],
      },
    ],
  },
  {
    slug: "eta-il",
    eyebrow: "ETA-IL",
    title: "Autorisation électronique d'entree en Israël",
    intro:
      "L'ETA-IL est une autorisation de voyage électronique a obtenir avant le départ pour pouvoir embarquer vers Israël dans certaines situations.",
    actionLabel: "Faire ma demande ETA-IL",
    actionHref: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    external: true,
    sections: [
      {
        title: "Nouvelle procédure d'entree",
        body: [
          "Depuis le 1er janvier 2025, une procédure d'autorisation électronique d'entree en Israël est mise en place pour certains voyageurs.",
          "Elle concerne notamment les personnes qui ne disposent pas d'un numéro d'identité israélien ou d'un visa étudiant valide.",
        ],
      },
      {
        title: "Qui doit effectuer une demande ?",
        bullets: [
          "Les personnes venant en Israël avec un passeport etranger.",
          "Les personnes qui ne possedent pas encore de Mispar Zehout.",
          "Les étudiants qui n'ont pas encore obtenu leur visa étudiant avant l'arrivée.",
        ],
      },
      {
        title: "Pourquoi faire cette demande ?",
        body: [
          "L'ETA-IL est nécessaire pour voyager vers Israël. Elle ne remplace pas un visa étudiant et ne donne pas un statut d'étudiant en Israël.",
          "Elle permet uniquement d'obtenir une autorisation de voyage avant l'arrivée sur le territoire israélien.",
        ],
      },
      {
        title: "Cout et validite",
        body: [
          "La demande d'ETA-IL est soumise à des frais administratifs de 25 NIS.",
          "L'autorisation est valable pendant deux ans, ou jusqu'à l'expiration du passeport selon la première echeance.",
        ],
      },
      {
        title: "Delais de réponse",
        body: [
          "La majorité des demandes reçoivent une réponse rapidement. Dans certains cas, le traitement peut prendre jusqu'a 72 heures.",
        ],
      },
      {
        title: "Pour les mineurs",
        body: [
          "Les personnes agees de moins de 18 ans ne peuvent pas effectuer seules une demande d'ETA-IL. La demande doit être realisee par un adulte responsable.",
        ],
      },
    ],
  },
];

export function getServiceDetail(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
