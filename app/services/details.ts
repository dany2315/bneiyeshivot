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
      "Bnei Yeshivot accompagne gratuitement les étudiants francophones dans leurs démarches d’inscription auprès d’une caisse d’assurance maladie israélienne, afin de bénéficier d’une couverture santé dès l’arrivée en Israël.",
    actionLabel: "Faire ma demande d’assurance maladie",
    actionHref: "/demandes/koupat-holim",
    sections: [
      {
        title: "Notre accompagnement",
        body: [
          "Nous travaillons actuellement principalement avec Meuhedet pour les étudiants majeurs et avec Maccabi pour certaines situations concernant les étudiants mineurs.",
          "Notre équipe vous guide dans les démarches administratives, répond à vos questions et assure un suivi personnalisé de votre dossier, sans frais d’accompagnement.",
        ],
      },
      {
        title: "Qui peut bénéficier de ce service ?",
        body: [
          "Ce service est destiné aux étudiants francophones venant étudier en Israël.",
          "Pour les personnes de 18 ans et plus, nous proposons un accompagnement pour l’inscription à Meuhedet. La demande peut être effectuée avant l’arrivée en Israël.",
          "Pour les moins de 18 ans, nous pouvons accompagner certaines inscriptions à Maccabi. Les délais sont généralement plus longs.",
        ],
      },
      {
        title: "Documents à préparer",
        bullets: [
          "Formulaire d’inscription complété et signé.",
          "Ichour Limoudim, certificat d’études délivré par la yeshiva.",
          "Photocopie lisible du passeport, page d’identité.",
        ],
      },
      {
        title: "Coût et délais",
        body: [
          "La cotisation est actuellement de 135 NIS par mois, à régler directement auprès de la caisse d’assurance maladie. Lors de l’inscription, 6 mois de cotisation sont demandés à l’avance.",
          "En règle générale, le traitement d’un dossier prend entre 48 heures et une semaine. En début d’année, les délais peuvent être plus longs.",
        ],
      },
      {
        title: "Validation de votre assurance",
        body: [
          "Une fois votre inscription validée, vous recevez un email de confirmation. Vous pourrez ensuite récupérer votre carte d’assurance maladie dans nos locaux : Bnei Yeshivot, 17 Rehov HaPisga, Bayit Vagan, Jérusalem.",
        ],
      },
      {
        title: "Bon à savoir",
        body: [
          "L’accompagnement proposé par Bnei Yeshivot est entièrement gratuit. Vous ne réglez aucun frais d’accompagnement à Bnei Yeshivot.",
        ],
      },
    ],
  },
  {
    slug: "visa-etudiant",
    eyebrow: "Visa étudiant",
    title: "Accompagnement pour une demande de visa étudiant",
    intro:
      "Bnei Yeshivot accompagne gratuitement les étudiants francophones dans leurs démarches de demande ou de renouvellement de visa étudiant en Israël.",
    actionLabel: "Faire ma demande de visa",
    actionHref: "/demandes/visa",
    sections: [
      {
        title: "Notre rôle",
        body: [
          "Nous vous aidons à préparer votre dossier, à comprendre les étapes de la procédure et à suivre votre demande.",
          "Aucun frais d’accompagnement n’est demandé par Bnei Yeshivot.",
        ],
      },
      {
        title: "Qui peut bénéficier de cet accompagnement ?",
        body: [
          "Ce service concerne actuellement les Bahourim et jeunes étudiants inscrits dans une yeshiva en Israël.",
          "Pour le moment, il concerne uniquement les étudiants venant étudier en yeshiva et n’est pas ouvert aux personnes mariées.",
        ],
      },
      {
        title: "Conditions générales",
        bullets: [
          "Être âgé de 18 ans ou plus.",
          "Être présent sur le territoire israélien au moment de la demande.",
          "Être inscrit ou en cours d’inscription dans une yeshiva reconnue.",
          "Ne pas relever d’une autre procédure administrative liée à la nationalité israélienne.",
        ],
      },
      {
        title: "Documents nécessaires",
        bullets: [
          "Formulaire de demande de visa complété et signé.",
          "Ichour Limoudim, certificat de scolarité pour la demande de visa.",
          "Acte de naissance datant de moins de 3 mois.",
          "Photocopie lisible du passeport.",
        ],
      },
      {
        title: "Délais de traitement",
        body: [
          "Les délais varient selon les autorités compétentes et la situation de chaque dossier. À titre indicatif, il faut généralement compter environ un mois.",
          "Bnei Yeshivot accompagne la préparation et le suivi du dossier, mais ne peut garantir ni le délai ni la décision finale.",
        ],
      },
      {
        title: "Avant de déposer votre demande",
        body: [
          "Si vous prévoyez de quitter Israël prochainement, il peut être préférable d’attendre votre retour avant d’entamer la procédure.",
        ],
      },
    ],
  },
  {
    slug: "eta-il",
    eyebrow: "ETA-IL",
    title: "Autorisation électronique d’entrée en Israël",
    intro:
      "L’ETA-IL est une autorisation de voyage électronique à obtenir avant le départ pour pouvoir embarquer vers Israël dans certaines situations.",
    actionLabel: "Faire ma demande ETA-IL",
    actionHref: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    external: true,
    sections: [
      {
        title: "Nouvelle procédure d’entrée",
        body: [
          "Depuis le 1er janvier 2025, une procédure d’autorisation électronique d’entrée en Israël est mise en place pour certains voyageurs.",
          "Elle concerne notamment les personnes qui ne disposent pas d’un numéro d’identité israélien ou d’un visa étudiant valide.",
        ],
      },
      {
        title: "Qui doit effectuer une demande ?",
        bullets: [
          "Les personnes venant en Israël avec un passeport étranger.",
          "Les personnes qui ne possèdent pas encore de Mispar Zehout.",
          "Les étudiants qui n’ont pas encore obtenu leur visa étudiant avant l’arrivée.",
        ],
      },
      {
        title: "Pourquoi faire cette demande ?",
        body: [
          "L’ETA-IL est nécessaire pour voyager vers Israël. Elle ne remplace pas un visa étudiant et ne donne pas un statut d’étudiant en Israël.",
          "Elle permet uniquement d’obtenir une autorisation de voyage avant l’arrivée sur le territoire israélien.",
        ],
      },
      {
        title: "Coût et validité",
        body: [
          "La demande d’ETA-IL est soumise à des frais administratifs de 25 NIS.",
          "L’autorisation est valable pendant deux ans, ou jusqu’à l’expiration du passeport selon la première échéance.",
        ],
      },
      {
        title: "Délais de réponse",
        body: [
          "La majorité des demandes reçoivent une réponse rapidement. Dans certains cas, le traitement peut prendre jusqu’à 72 heures.",
        ],
      },
      {
        title: "Pour les mineurs",
        body: [
          "Les personnes âgées de moins de 18 ans ne peuvent pas effectuer seules une demande d’ETA-IL. La demande doit être réalisée par un adulte responsable.",
        ],
      },
    ],
  },
];

export function getServiceDetail(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
