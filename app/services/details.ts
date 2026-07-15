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
      "Bnei Yeshivot accompagne gratuitement les etudiants francophones dans leurs demarches d'inscription aupres d'une caisse d'assurance maladie israelienne, afin de beneficier d'une couverture sante des l'arrivee en Israel.",
    actionLabel: "Faire ma demande d'assurance maladie",
    actionHref: "/demandes/koupat-holim",
    sections: [
      {
        title: "Notre accompagnement",
        body: [
          "Nous travaillons actuellement principalement avec Meuhedet pour les etudiants majeurs et avec Maccabi pour certaines situations concernant les etudiants mineurs.",
          "Notre equipe vous guide dans les demarches administratives, repond a vos questions et assure un suivi personnalise de votre dossier, sans frais d'accompagnement.",
        ],
      },
      {
        title: "Qui peut beneficier de ce service ?",
        body: [
          "Ce service est destine aux etudiants francophones venant etudier en Israel.",
          "Pour les personnes de 18 ans et plus, nous proposons un accompagnement pour l'inscription a Meuhedet. La demande peut etre effectuee avant l'arrivee en Israel.",
          "Pour les moins de 18 ans, nous pouvons accompagner certaines inscriptions a Maccabi. Les delais sont generalement plus longs.",
        ],
      },
      {
        title: "Documents a preparer",
        bullets: [
          "Formulaire d'inscription complete et signe.",
          "Ichour Limoudim, certificat d'etudes delivre par la yeshiva.",
          "Photocopie lisible du passeport, page d'identite.",
        ],
      },
      {
        title: "Cout et delais",
        body: [
          "La cotisation est actuellement de 135 NIS par mois, a regler directement aupres de la caisse d'assurance maladie. Lors de l'inscription, 6 mois de cotisation sont demandes a l'avance.",
          "En regle generale, le traitement d'un dossier prend entre 48 heures et une semaine. En debut d'annee, les delais peuvent etre plus longs.",
        ],
      },
      {
        title: "Validation de votre assurance",
        body: [
          "Une fois votre inscription validee, vous recevez un email de confirmation. Vous pourrez ensuite recuperer votre carte d'assurance maladie dans nos locaux : Bnei Yeshivot, 17 Rehov HaPisga, Bayit Vagan, Jerusalem.",
        ],
      },
      {
        title: "Bon a savoir",
        body: [
          "L'accompagnement propose par Bnei Yeshivot est entierement gratuit. Vous ne reglez aucun frais d'accompagnement a Bnei Yeshivot.",
        ],
      },
    ],
  },
  {
    slug: "visa-etudiant",
    eyebrow: "Visa etudiant",
    title: "Accompagnement pour une demande de visa etudiant",
    intro:
      "Bnei Yeshivot accompagne gratuitement les etudiants francophones dans leurs demarches de demande ou de renouvellement de visa etudiant en Israel.",
    actionLabel: "Faire ma demande de visa",
    actionHref: "/demandes/visa",
    sections: [
      {
        title: "Notre role",
        body: [
          "Nous vous aidons a preparer votre dossier, a comprendre les etapes de la procedure et a suivre votre demande.",
          "Aucun frais d'accompagnement n'est demande par Bnei Yeshivot.",
        ],
      },
      {
        title: "Qui peut beneficier de cet accompagnement ?",
        body: [
          "Ce service concerne actuellement les Bahourim et jeunes etudiants inscrits dans une yeshiva en Israel.",
          "Pour le moment, il concerne uniquement les etudiants venant etudier en yeshiva et n'est pas ouvert aux personnes mariees.",
        ],
      },
      {
        title: "Conditions generales",
        bullets: [
          "Etre age de 18 ans ou plus.",
          "Etre present sur le territoire israelien au moment de la demande.",
          "Etre inscrit ou en cours d'inscription dans une yeshiva reconnue.",
          "Ne pas relever d'une autre procedure administrative liee a la nationalite israelienne.",
        ],
      },
      {
        title: "Documents necessaires",
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
          "Les delais varient selon les autorites competentes et la situation de chaque dossier. A titre indicatif, il faut generalement compter environ un mois.",
          "Bnei Yeshivot accompagne la preparation et le suivi du dossier, mais ne peut garantir ni le delai ni la decision finale.",
        ],
      },
      {
        title: "Avant de deposer votre demande",
        body: [
          "Si vous prevoyez de quitter Israel prochainement, il peut etre preferable d'attendre votre retour avant d'entamer la procedure.",
        ],
      },
    ],
  },
  {
    slug: "eta-il",
    eyebrow: "ETA-IL",
    title: "Autorisation electronique d'entree en Israel",
    intro:
      "L'ETA-IL est une autorisation de voyage electronique a obtenir avant le depart pour pouvoir embarquer vers Israel dans certaines situations.",
    actionLabel: "Faire ma demande ETA-IL",
    actionHref: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    external: true,
    sections: [
      {
        title: "Nouvelle procedure d'entree",
        body: [
          "Depuis le 1er janvier 2025, une procedure d'autorisation electronique d'entree en Israel est mise en place pour certains voyageurs.",
          "Elle concerne notamment les personnes qui ne disposent pas d'un numero d'identite israelien ou d'un visa etudiant valide.",
        ],
      },
      {
        title: "Qui doit effectuer une demande ?",
        bullets: [
          "Les personnes venant en Israel avec un passeport etranger.",
          "Les personnes qui ne possedent pas encore de Mispar Zehout.",
          "Les etudiants qui n'ont pas encore obtenu leur visa etudiant avant l'arrivee.",
        ],
      },
      {
        title: "Pourquoi faire cette demande ?",
        body: [
          "L'ETA-IL est necessaire pour voyager vers Israel. Elle ne remplace pas un visa etudiant et ne donne pas un statut d'etudiant en Israel.",
          "Elle permet uniquement d'obtenir une autorisation de voyage avant l'arrivee sur le territoire israelien.",
        ],
      },
      {
        title: "Cout et validite",
        body: [
          "La demande d'ETA-IL est soumise a des frais administratifs de 25 NIS.",
          "L'autorisation est valable pendant deux ans, ou jusqu'a l'expiration du passeport selon la premiere echeance.",
        ],
      },
      {
        title: "Delais de reponse",
        body: [
          "La majorite des demandes recoivent une reponse rapidement. Dans certains cas, le traitement peut prendre jusqu'a 72 heures.",
        ],
      },
      {
        title: "Pour les mineurs",
        body: [
          "Les personnes agees de moins de 18 ans ne peuvent pas effectuer seules une demande d'ETA-IL. La demande doit etre realisee par un adulte responsable.",
        ],
      },
    ],
  },
];

export function getServiceDetail(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
