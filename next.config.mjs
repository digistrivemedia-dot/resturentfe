/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local backend (development)
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/uploads/**" },
      // Production VPS
      { protocol: "https", hostname: "sriishacafe.in", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
