/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bloemenvandegier.nl',
      },
      {
        protocol: 'https',
        hostname: '**.bloemenvandegier.nl',
      },
      {
        protocol: 'https',
        hostname: 'www.flowerchimp.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
