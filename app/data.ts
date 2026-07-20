export const services = [
  {
    title: "Visa étudiant",
    description:
      "Dépôt de dossier, documents, suivi des statuts et messages entre le Bahour et l’équipe.",
    href: "/demandes/visa",
    code: "VISA",
  },
  {
    title: "Koupat Holim",
    description:
      "Demande d’accompagnement pour l’assurance maladie israélienne, avec pièces jointes et suivi.",
    href: "/demandes/koupat-holim",
    code: "HEALTH",
  },
  {
    title: "ETA-IL",
    description:
      "Accès direct à la procédure officielle d’autorisation d’entrée en Israël.",
    href: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    code: "ETA",
  },
  {
    title: "Boutique literie",
    description:
      "Packs d’installation pour les étudiants qui arrivent en Israël, avec réservation sans paiement.",
    href: "/boutique",
    code: "STORE",
  },
];

export const impactStats = [
  ["5 000+", "Jeunes accompagnés depuis notre création"],
  ["300+", "Événements & programmes organisés"],
  ["120 000+", "Heures de Torah étudiées chaque année"],
  ["100 %", "Accompagnement gratuit et personnalisé"],
];

export const adminMetrics = [
  ["Demandes en attente", "18", "Visa, koupat holim et contacts"],
  ["Dons ce mois", "12 840 EUR", "Stripe branche en Phase 1"],
  ["Inscriptions événements", "94", "Prochains rendez-vous"],
  ["Documents manquants", "7", "Pièces à relancer"],
];

export const requestRows = [
  ["David Cohen", "Visa étudiant", "Documents manquants", "Aujourd’hui"],
  ["Sarah Levy", "Koupat Holim", "En vérification", "Hier"],
  ["Yonathan Amar", "Contact", "Nouveau", "12 juillet"],
  ["Raphael Benhamou", "Visa étudiant", "Validé", "10 juillet"],
];

export const clientItems = [
  ["Demande visa", "Documents manquants", "Ajouter les pièces demandées"],
  ["Inscription mivhan", "Confirmée", "Session de juillet"],
  ["Don", "Reçu disponible", "180 EUR - Stripe"],
  ["Réservation boutique", "En préparation", "Pack literie complet"],
];

export const bahourRequests = [
  ["Visa étudiant", "Documents manquants", "Passeport + certificat yeshiva"],
  ["Koupat Holim", "En vérification", "Dossier envoyé à l’équipe"],
  ["Contact conseiller", "Terminé", "Réponse envoyée par email"],
];

export const bahourMivhanim = [
  ["Tamouz", "Confirmé", "Note en attente"],
  ["Sivan", "Publié", "87 / 100"],
  ["Iyar", "Publié", "91 / 100"],
];

export const bahourDonations = [
  ["180 EUR", "Reçu disponible", "Stripe"],
  ["52 EUR", "Sans reçu", "Stripe"],
];

export const adminQueue = [
  ["Visa", "David Cohen", "Passeport manquant", "Haute"],
  ["Koupat Holim", "Sarah Levy", "À vérifier", "Normale"],
  ["Don", "Famille Amar", "Reçu à générer", "Normale"],
  ["Mivhan", "Raphael Benhamou", "Note à saisir", "Haute"],
];

export const adminPipelines = [
  ["Nouvelles demandes", "6", "À qualifier aujourd’hui"],
  ["Documents reçus", "11", "Contrôle pièces jointes"],
  ["En attente Bahour", "7", "Relance automatique prévue"],
  ["Finalisés", "24", "Ce mois-ci"],
];

export const donationRows = [
  ["Famille Amar", "360 EUR", "Stripe", "Reçu CERFA demandé"],
  ["David Cohen", "180 EUR", "Stripe", "Reçu disponible"],
  ["M. Levy", "520 ILS", "Nedarim Plus", "À rapprocher"],
];

export const bahourDocuments = [
  ["Passeport", "Manquant", "À ajouter au dossier visa"],
  ["Certificat yeshiva", "Reçu", "En vérification par l’équipe"],
  ["Photo d’identité", "Manquant", "Sera demandé si nécessaire"],
];

export const bahourTimeline = [
  ["Aujourd’hui", "Demande visa créée", "Dossier ouvert dans le suivi"],
  ["Hier", "Inscription mivhan confirmée", "Session Tamouz"],
  ["Cette semaine", "Reçu Stripe généré", "Disponible dans dons"],
];

export const storePacks = [
  ["Pack essentiel", "Oreiller, couette, drap-housse", "49 EUR"],
  ["Pack complet", "Essentiel + housse + protège-matelas", "79 EUR"],
  ["Pack premium", "Complet + livraison prioritaire", "109 EUR"],
];
