/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mistral.ai",
      },
    ],
  },
};

module.exports = nextConfig;
