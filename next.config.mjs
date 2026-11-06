const nextConfig = {
  reactStrictMode: true,
  // As imagens já são otimizadas no `npm run assets` (WebP), então não há
  // ganho em passar pelo otimizador do Next — e isso também prepara o
  // `output: 'export'` da Etapa 5.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.valorant-api.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;
