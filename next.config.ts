import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'prueba-tecnica-api-tienda-moviles.onrender.com' },
      { protocol: 'https', hostname: 'prueba-tecnica-api-tienda-moviles.onrender.com' },
    ],
  },
  sassOptions: {
    loadPaths: ['./src/styles'],
  },
};

export default nextConfig;
