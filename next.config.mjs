/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/before-after-maker",
  assetPrefix: "/before-after-maker",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
