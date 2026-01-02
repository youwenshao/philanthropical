/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  images: {
    domains: ["ipfs.io", "gateway.pinata.cloud"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  // Webpack optimizations
  webpack: (config, { isServer, webpack }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Replace React Native async-storage with a stub for both server and client
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'lib/stubs/async-storage.js'),
    };
    
    // Ignore React Native dependencies during SSR
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native': false,
        'react-native': false,
      };
      
      // Force MetaMask SDK to use browser version during SSR
      config.resolve.alias = {
        ...config.resolve.alias,
        '@metamask/sdk/dist/node/cjs/metamask-sdk.js': '@metamask/sdk/dist/browser/es/metamask-sdk.js',
        '@metamask/sdk/dist/node': '@metamask/sdk/dist/browser',
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: ipfs.io gateway.pinata.cloud",
              "font-src 'self'",
              "connect-src 'self' https://*.alchemy.com https://*.infura.io wss://*.alchemy.com wss://*.infura.io https://*.supabase.co",
            ].join("; "),
          },
          // Cache control headers
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

