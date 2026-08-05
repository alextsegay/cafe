/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: /(?:node_modules|\.next|swapfile\.sys|hiberfil\.sys|pagefile\.sys)/,
      }
    }
    return config
  },
}

module.exports = nextConfig
