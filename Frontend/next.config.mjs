/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for development speed
  swcMinify: true,
  experimental: {
    // Enable faster builds
    optimizeCss: false,
    // Reduce memory usage
    memoryBasedWorkersCount: true,
  },
  // Reduce bundle size
  webpack: (config, { dev }) => {
    if (dev) {
      // Faster development builds
      config.optimization.minimize = false;
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }
    return config;
  },
}

export default nextConfig
