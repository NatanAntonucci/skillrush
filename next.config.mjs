const nextConfig = {
  reactStrictMode: true,
  // Site 100% estático: `next build` gera `out/` para subir no cPanel.
  ...(process.env.NODE_ENV === 'production'
    ? { output: 'export' }
    : {}),
  // No Apache cada rota vira pasta/index.html — evita 404 em /maps/bind.
  trailingSlash: true,
  // As imagens já são otimizadas no `npm run assets` (WebP).
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
