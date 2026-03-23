/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/register',
        destination: '/auth/register',
      },
    ];
  },
};

export default nextConfig;
