/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This will ignore all ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will ignore TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
