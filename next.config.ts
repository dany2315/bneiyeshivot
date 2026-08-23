import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  experimental: {
    serverActions: {
      // Les images d'evenement sont uploadees via server action : la limite
      // par defaut de 1 Mo faisait echouer la creation avec photos.
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // L'optimiseur facture chaque combinaison source x largeur x qualite x
    // format. Les reglages ci-dessous bornent explicitement cet espace.
    //
    // 1 an de cache. Les images dynamiques (evenements, galerie) passent par
    // /api/files/<cle> et la cle contient un timestamp + un UUID : leur URL
    // change des que le contenu change (cf. createS3Key dans lib/uploads.ts).
    // Attention : un fichier de /public remplace en gardant le meme nom garde
    // aussi la meme URL. Dans ce cas, renommer le fichier ou purger le cache
    // image (`vercel cache invalidate --srcimg /mon-image.jpg`).
    minimumCacheTTL: 31536000,
    // Largeurs reellement utiles au CSS du projet (ruptures 640/720/768/980/
    // 1024/1280 + ecrans haute densite). On retire seulement des paliers
    // intermediaires (750, 1200) : le navigateur choisit toujours le palier
    // superieur, donc aucune image n'est servie en resolution plus basse.
    deviceSizes: [640, 828, 1080, 1920, 2048, 3840],
    // Paliers pour les vignettes. Les valeurs 32/48/64/96 ne sont jamais
    // demandees ici : la plus petite image affichee fait 120 px (grille de
    // logos de ben-hazmanim-france-map), qui retombe sur 128.
    imageSizes: [128, 256, 384],
    // Sans cette liste, chaque valeur de q creerait une variante de plus.
    // 75 est la qualite deja utilisee par defaut : rendu inchange.
    qualities: [75],
    // WebP seul. Ajouter AVIF doublerait le nombre de transformations.
    formats: ["image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/demandes",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
