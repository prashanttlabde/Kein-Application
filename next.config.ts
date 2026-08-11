import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', 'lucide-react'],
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Enhanced image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'kein.in' },
      { protocol: 'https', hostname: 'www.kein.in' },
      { protocol: 'https', hostname: 'kein.com' },
      { protocol: 'https', hostname: 'eafxupeakpgpypxczvxk.supabase.co' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    qualities: [75, 85, 90], // Support multiple quality levels
  },

  // Turbopack configuration (default bundler)
  turbopack: {
    resolveAlias: {
      // Handle Node.js modules for client-side (matching webpack config)
      fs: { browser: './lib/empty.ts' },
      net: { browser: './lib/empty.ts' },
      tls: { browser: './lib/empty.ts' },
    },
  },

  // Enhanced webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle 100ms SDK for SSR - completely exclude from server bundle
    if (isServer) {
      // Mark HMS SDK as external to prevent bundling on server
      const externals = config.externals || [];
      config.externals = [
        ...( Array.isArray(externals) ? externals : [externals]),
        /@100mslive\/.*/,
      ];
    }

    // Don't split HMS SDK into vendor chunk since it's client-only
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          hms: {
            test: /[\\/]node_modules[\\/]@100mslive[\\/]/,
            name: 'hms-sdk',
            chunks: 'async',
            priority: 10,
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/](?!@100mslive)/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 1,
          },
        },
      };
    }

    return config
  },

  // Performance settings
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // swcMinify is now the default and removed from config
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Use standalone output for Docker deployments
  // Commented out for local Windows builds to avoid path issues
  // output: 'standalone',
};

export default nextConfig;
