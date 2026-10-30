import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Cloudinary ya entrega las imágenes optimizadas; next/image solo resuelve el layout.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/inicio", destination: "/login", permanent: true },
      { source: "/vendedor-dashboard", destination: "/vendedor", permanent: true },
      { source: "/order-confirmation", destination: "/pedido", permanent: false },
    ];
  },
};

export default nextConfig;
