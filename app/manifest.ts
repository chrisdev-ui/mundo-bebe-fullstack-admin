import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pañalera Mundo Bebé",
    short_name: "Mundo Bebé",
    description: "Pañalera Mundo Bebé",
    start_url: "/",
    display: "standalone",
    theme_color: "#FFFFFF",
    background_color: "#006FDD",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
