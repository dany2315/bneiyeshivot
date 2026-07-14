export const services = [
  {
    title: "Visa etudiant",
    description:
      "Depot de dossier, documents, suivi des statuts et messages entre le Bahour et l'equipe.",
    href: "/demandes/visa",
    code: "VISA",
  },
  {
    title: "Koupat Holim",
    description:
      "Demande d'accompagnement pour l'assurance maladie israelienne, avec pieces jointes et suivi.",
    href: "/demandes/koupat-holim",
    code: "HEALTH",
  },
  {
    title: "ETA-IL",
    description:
      "Redirection vers la procedure officielle. Aucun dossier n'est gere dans l'admin pour ce service.",
    href: "https://israel-entry.piba.gov.il/",
    code: "ETA",
  },
  {
    title: "Boutique literie",
    description:
      "Packs d'installation pour les etudiants qui arrivent en Israel, avec paiement et suivi commande.",
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
  ["Inscriptions evenements", "94", "Prochains rendez-vous"],
  ["Documents manquants", "7", "Pieces a relancer"],
];

export const requestRows = [
  ["David Cohen", "Visa etudiant", "Documents manquants", "Aujourd'hui"],
  ["Sarah Levy", "Koupat Holim", "En verification", "Hier"],
  ["Yonathan Amar", "Contact", "Nouveau", "12 juillet"],
  ["Raphael Benhamou", "Visa etudiant", "Valide", "10 juillet"],
];

export const clientItems = [
  ["Demande visa", "Documents manquants", "Ajouter les pieces demandees"],
  ["Inscription mivhan", "Confirmee", "Session de juillet"],
  ["Don", "Recu disponible", "180 EUR - Stripe"],
  ["Commande boutique", "En preparation", "Pack literie complet"],
];

export const bahourRequests = [
  ["Visa etudiant", "Documents manquants", "Passeport + certificat yeshiva"],
  ["Koupat Holim", "En verification", "Dossier envoye a l'equipe"],
  ["Contact conseiller", "Termine", "Reponse envoyee par email"],
];

export const bahourMivhanim = [
  ["Tamouz", "Confirme", "Note en attente"],
  ["Sivan", "Publie", "87 / 100"],
  ["Iyar", "Publie", "91 / 100"],
];

export const bahourDonations = [
  ["180 EUR", "Recu disponible", "Stripe"],
  ["52 EUR", "Sans recu", "Stripe"],
];

export const adminQueue = [
  ["Visa", "David Cohen", "Passeport manquant", "Haute"],
  ["Koupat Holim", "Sarah Levy", "A verifier", "Normale"],
  ["Don", "Famille Amar", "Recu a generer", "Normale"],
  ["Mivhan", "Raphael Benhamou", "Note a saisir", "Haute"],
];

export const adminPipelines = [
  ["Nouvelles demandes", "6", "A qualifier aujourd'hui"],
  ["Documents recus", "11", "Controle pieces jointes"],
  ["En attente Bahour", "7", "Relance automatique prevue"],
  ["Finalises", "24", "Ce mois-ci"],
];

export const donationRows = [
  ["Famille Amar", "360 EUR", "Stripe", "Recu CERFA demande"],
  ["David Cohen", "180 EUR", "Stripe", "Recu disponible"],
  ["M. Levy", "520 ILS", "Nedarim Plus", "A rapprocher"],
];

export const bahourDocuments = [
  ["Passeport", "Manquant", "A ajouter au dossier visa"],
  ["Certificat yeshiva", "Recu", "En verification par l'equipe"],
  ["Photo d'identite", "Manquant", "Sera demande si necessaire"],
];

export const bahourTimeline = [
  ["Aujourd'hui", "Demande visa creee", "Dossier ouvert dans le suivi"],
  ["Hier", "Inscription mivhan confirmee", "Session Tamouz"],
  ["Cette semaine", "Recu Stripe genere", "Disponible dans dons"],
];

export const storePacks = [
  ["Pack essentiel", "Oreiller, couette, drap-housse", "49 EUR"],
  ["Pack complet", "Essentiel + housse + protege-matelas", "79 EUR"],
  ["Pack premium", "Complet + livraison prioritaire", "109 EUR"],
];
