/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add output configuration for Vercel
  output: 'standalone',
  // Add experimental features
  experimental: {
    // List all packages that should be treated as external
    serverComponentsExternalPackages: [
      'sequelize',
      'sqlite3',
      'pg',
      'pg-hstore',
      'mysql2',
      'tedious',
      'mariadb',
      'better-sqlite3'
    ],
  },
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Handle client-side specifically
    if (!isServer) {
      // These modules should never be bundled on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        pg: false,
        'pg-hstore': false,
        tedious: false,
        sqlite3: false,
        'better-sqlite3': false,
        mysql2: false,
        mariadb: false,
        oracledb: false,
        'node-pre-gyp': false,
        // Add any Node.js native modules your app might try to import
      };
    }
    
    // On server side, properly externalize modules
    if (isServer) {
      // Handle Node.js native modules that shouldn't be bundled
      if (!config.externals) {
        config.externals = [];
      } else if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      
      // Add database drivers to externals to prevent bundling issues
      config.externals.push(
        'sqlite3',
        'better-sqlite3',
        'tedious',
        'pg',
        'pg-hstore',
        'mysql2',
        'mariadb'
      );
    }
    
    // Ignore webpack warnings from Sequelize
    config.ignoreWarnings = [
      { module: /node_modules[\\/]sequelize/ },
      { module: /node_modules[\\/]sqlite3/ }
    ];
    
    return config;
  },
  // Add security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
  // Add poweredByHeader
  poweredByHeader: false,
  // Ensure serverless compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 