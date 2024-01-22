/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: `/api/:path*`,
        },
      ],
    }
  },
};

export default nextConfig;
