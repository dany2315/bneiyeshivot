export const services = [
  {
    title: "Visa étudiant",
    description:
      "Depot de dossier, documents, suivi des statuts et messages entre le Bahour et l'équipe.",
    href: "/demandes/visa",
    code: "VISA",
  },
  {
    title: "Koupat Holim",
    description:
      "Demande d'accompagnement pour l'assurance maladie israélienne, avec pièces jointes et suivi.",
    href: "/demandes/koupat-holim",
    code: "HEALTH",
  },
  {
    title: "ETA-IL",
    description:
      "Redirection vers la procédure officielle. Aucun dossier n'est gere dans l'admin pour ce service.",
    href: "https://israel-entry.piba.gov.il/apply-for-an-eta-il-1",
    code: "ETA",
  },
  {
    title: "Boutique literie",
    description:
      "Packs d'installation pour les étudiants qui arrivent en Israël, avec paiement et suivi commande.",
    href: "/boutique",
    code: "STORE",
  },
];

export const impactStats = [
  ["1 500+", "jeunes accompagnes"],
  ["300+", "demandes administratives"],
  ["400+", "kits de lit distribues"],
  ["300+", "participants aux yeshivot Ben Hazmanim"],
];

export const adminMetrics = [
  ["Demandes en attente", "18", "Visa, koupat holim et contacts"],
  ["Dons ce mois", "12 840 EUR", "Stripe branche en Phase 1"],
  ["Inscriptions événements", "94", "Prochains rendez-vous"],
  ["Documents manquants", "7", "Pièces ? relancer"],
];

export const requestRows = [
  ["David Cohen", "Visa étudiant", "Documents manquants", "Aujourd'hui"],
  ["Sarah Levy", "Koupat Holim", "En verification", "Hier"],
  ["Yonathan Amar", "Contact", "Nouveau", "12 juillet"],
  ["Raphael Benhamou", "Visa étudiant", "Valide", "10 juillet"],
];

export const clientItems = [
  ["Demande visa", "Documents manquants", "Ajouter les pièces demandées"],
  ["Inscription mivhan", "Confirmee", "Session de juillet"],
  ["Don", "Reçu disponible", "180 EUR - Stripe"],
  ["Commande boutique", "En preparation", "Pack literie complet"],
];

export const bahourRequests = [
  ["Visa étudiant", "Documents manquants", "Passéport + certificat yeshiva"],
  ["Koupat Holim", "En verification", "Dossier envoy? à l'équipe"],
  ["Contact conseiller", "Termine", "Reponse envoy?e par email"],
];

export const bahourMivhanim = [
  ["Tamouz", "Confirme", "Note en attente"],
  ["Sivan", "Publi?", "87 / 100"],
  ["Iyar", "Publi?", "91 / 100"],
];

export const bahourDonations = [
  ["180 EUR", "Reçu disponible", "Stripe"],
  ["52 EUR", "Sans reçu", "Stripe"],
];

export const adminQueue = [
  ["Visa", "David Cohen", "Passéport manquant", "Haute"],
  ["Koupat Holim", "Sarah Levy", "A verifier", "Normale"],
  ["Don", "Famille Amar", "Reçu ? g?n?rer", "Normale"],
  ["Mivhan", "Raphael Benhamou", "Note ? saisir", "Haute"],
];

export const adminPipelines = [
  ["Nouvelles demandes", "6", "A qualifier aujourd'hui"],
  ["Documents reçus", "11", "Controle pièces jointes"],
  ["En attente Bahour", "7", "Relance automatique prevue"],
  ["Finalises", "24", "Ce mois-ci"],
];

export const donationRows = [
  ["Famille Amar", "360 EUR", "Stripe", "Reçu CERFA demande"],
  ["David Cohen", "180 EUR", "Stripe", "Reçu disponible"],
  ["M. Levy", "520 ILS", "Nedarim Plus", "A rapprocher"],
];

export const bahourDocuments = [
  ["Passéport", "Manquant", "À ajouter au dossier visa"],
  ["Certificat yeshiva", "Reçu", "En verification par l'équipe"],
  ["Photo d'identité", "Manquant", "Sera demande si nécessaire"],
];

export const bahourTimeline = [
  ["Aujourd'hui", "Demande visa créée", "Dossier ouvert dans le suivi"],
  ["Hier", "Inscription mivhan confirmee", "Session Tamouz"],
  ["Cette semaine", "Reçu Stripe genere", "Disponible dans dons"],
];

export const storePacks = [
  ["Pack essentiel", "Oreiller, couette, drap-housse", "49 EUR"],
  ["Pack complet", "Essentiel + housse + protege-matelas", "79 EUR"],
  ["Pack premium", "Complet + livraison prioritaire", "109 EUR"],
];
