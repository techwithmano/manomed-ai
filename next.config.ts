import type { NextConfig } from 'next';

// Toggle the Coming Soon redirect on/off
const enableComingSoonRedirect = false;

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Conditionally include redirects if feature flag is true
  ...(enableComingSoonRedirect
    ? {
        async redirects() {
          return [
            {
              // Match everything except /coming-soon, _next, and favicon.ico
              source: '/:path((?!coming-soon|_next|favicon\.ico).*)',
              destination: '/coming-soon',
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
