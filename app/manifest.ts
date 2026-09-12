import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OyaMarket Dashboard",
    short_name: "OyaMarket",
    description: "Tableau de bord de gestion des commandes OyaMarket COD Bénin",
    start_url: "/orders",
    scope: "/",
    id: "oyamarket-dashboard",
    display: "standalone",
    orientation: "any",
    background_color: "#0B0F17",
    theme_color: "#0C9653",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Commandes",
        short_name: "Commandes",
        description: "Accéder directement à la liste des commandes",
        url: "/orders",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Produits",
        short_name: "Produits",
        description: "Gérer le catalogue de produits",
        url: "/products",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}

