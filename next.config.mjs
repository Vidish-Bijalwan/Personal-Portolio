let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Canonical host: www.tryetch.online → tryetch.online (301, path + query
  // preserved). This repo has no middleware/proxy.ts, so config redirects
  // are the right place. Duplicates (www) would split index equity.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tryetch.online" }],
        destination: "https://tryetch.online/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // PGlite (WASM Postgres) must NOT be webpack-bundled: bundling mangles
  // its internal file-URL resolution ("path argument ... Received an
  // instance of URL"). Keep it as a runtime require from node_modules.
  serverExternalPackages: ['@electric-sql/pglite'],
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
