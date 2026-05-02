/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['172.23.1.105'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
