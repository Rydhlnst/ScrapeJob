/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // isomorphic-dompurify pulls in jsdom on the server; jsdom does a
  // fs.readFileSync of ../browser/default-stylesheet.css at module-init.
  // Webpack can't inline that asset — external it and let Node resolve it
  // from node_modules at runtime.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = nextConfig
