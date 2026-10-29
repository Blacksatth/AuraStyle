const nextConfig = {
  output: 'standalone', // en lugar de 'export'
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
