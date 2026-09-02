/**
 * Static export for GitHub Pages.
 *
 * Pages serves the site from a subdirectory (/metal-guitar-academy), so every
 * URL needs that prefix. Next rewrites the ones it generates itself; paths we
 * build at runtime have to go through `lib/base-path.ts`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Pages resolves /session/ to session/index.html; without this it 404s.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
