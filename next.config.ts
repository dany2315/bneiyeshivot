import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
